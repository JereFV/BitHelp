<?php
class ticket
{

    public function index()
    {
        try {
            $response = new Response();
            $ticketModel = new TicketModel();

            // Llama al modelo para obtener todos los tickets
            $tickets = $ticketModel->getAll();

            // Devuelve los resultados en formato JSON
            $response->toJson($tickets);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }

    //Obtener los tiquetes según el rol del usuario en sesión.
    public function getAllByRolUser($idRole, $idUser)
    {
        try {
            $response = new Response();
            $ticketModel = new TicketModel();

            //Obtiene los tiquetes y los devuelve en una estructura JSON como respuesta.
            $tickets = $ticketModel->getAllByRolUser($idRole, $idUser);

            if ($tickets)
                $response->toJson($tickets);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }

    //Obtener el tiquete especifico a partir del parámetro enviado.
    public function get($id)
    {
        try {
            $response = new Response();
            $ticketModel = new TicketModel();

            //Obtiene el tiquete y lo devuelve en una estructura JSON como respuesta.
            $ticket = $ticketModel->get($id);

            $response->toJson($ticket);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }

    // método para obtener SOLAMENTE los detalles de SLA
    public function getSlaDetails($id)
    {
        try {
            $response = new Response();
            $ticketModel = new TicketModel();

            // Llama al nuevo método para obtener la información de SLA con cálculos.
            $slaDetails = $ticketModel->getSlaDetails($id);

            // Devuelve los detalles del SLA en una estructura JSON.
            $response->toJson($slaDetails);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }

    public function getDetails($idTicket)
    {
        try {
            $response = new Response();
            $ticketModel = new TicketModel();

            // Llama al método del modelo que obtendrá los datos del tiquete con sus detalles.
            $ticketDetails = $ticketModel->getTicketDetailsForManualAssignment($idTicket);

            // Devuelve el resultado (el objeto tiquete o null si no se encuentra)
            $response->toJson($ticketDetails);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }

    //Creación de un nuevo tiquete.
    public function create()
    {
        try {
            $response = new Response();
            $request = new Request();
            $ticketModel = new TicketModel();

            //Armado de la estructura de entrada, decodificando la estructura JSON enviada como un objeto.
            $decodedRequest = $request->getJson();

            // Crear el ticket (puede incluir autotriage)
            $idTicket = $ticketModel->create($decodedRequest);

            // ***** Obtener información actualizada del ticket *****
            $queryTicketInfo = "SELECT idEstado, idTecnicoAsignado, titulo FROM tiquete WHERE idTiquete = $idTicket";
            $ticketInfo = $ticketModel->connection->ExecuteSQL($queryTicketInfo)[0];

            $notificationModel = new NotificationModel();

            // Obtener información del usuario que creó el ticket
            $userModel = new UserModel();
            $user = $userModel->get($decodedRequest->idRequestUser);
            $nombreUsuario = $user->nombre . ' ' . $user->primerApellido;

            // 1. Notificar al usuario creador
            $notificationModel->createNotification(
                1,
                $decodedRequest->idRequestUser,
                $decodedRequest->idRequestUser,
                "Tu ticket #$idTicket '{$ticketInfo->titulo}' fue creado exitosamente",
                $idTicket
            );

            // 2. Notificar a administradores
            $administrators = $notificationModel->getAllAdministrators();
            foreach ($administrators as $idAdmin) {
                $notificationModel->createNotification(
                    1,
                    $decodedRequest->idRequestUser,
                    $idAdmin,
                    "Nuevo ticket #$idTicket '{$ticketInfo->titulo}' creado por $nombreUsuario",
                    $idTicket
                );
            }

            // 3. Si fue asignado automáticamente, crear notificaciones de asignación
            if ($ticketInfo->idEstado == 2 && $ticketInfo->idTecnicoAsignado) {
                // Obtener nombre del técnico
                $techUser = $userModel->get($ticketInfo->idTecnicoAsignado);
                $nombreTecnico = $techUser->nombre . ' ' . $techUser->primerApellido;

                // Notificar al cliente sobre la asignación
                $notificationModel->createNotification(
                    1,
                    11, // Sistema
                    $decodedRequest->idRequestUser,
                    "Ticket #$idTicket fue asignado automáticamente al técnico $nombreTecnico",
                    $idTicket
                );

                // Notificar al técnico
                $notificationModel->createNotification(
                    1,
                    11, // Sistema
                    $ticketInfo->idTecnicoAsignado,
                    "Ticket #$idTicket '{$ticketInfo->titulo}' te fue asignado automáticamente",
                    $idTicket
                );
            }

            $response->toJson($idTicket);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }



    public function assignManually($id)
    {
        error_log("DEBUG DEL CONTROLADOR: Solicitud de Asignación Manual recibida para Ticket $id.");
        function get_request_data()
        {
            error_log("DEBUG DEL CONTROLADOR: Solicitud entro a la función get request data.");
            // Leer el contenido crudo (raw) del cuerpo de la solicitud (php://input)
            $json_data = file_get_contents('php://input');

            // Intentar decodificar el JSON. El 'true' convierte el objeto JSON a un array asociativo de PHP.
            if ($json_data) {
                return json_decode($json_data, true);
            }

            // Retorna null o un array vacío si no hay datos
            return [];
        }
        error_log("DEBUG (Controller): Entro al controller assignManually: ");
        // Obtener el cuerpo de la petición PUT
        $requestData = get_request_data(); // Asumiendo que tienes una función para esto
        error_log("DEBUG (Controller): Datos de asignación recibidos: " . print_r($requestData, true));
        // Instanciar modelos y handler
        $ticketModel = new TicketModel();
        $assignmentHandler = new TicketAssignmentHandler();

        try {
            // Ejecutar la lógica de negocio
            $result = $assignmentHandler->handleManualAssignment(
                $id,
                (object)$requestData,
                $ticketModel
            );

            if ($result) {
                // Responder con éxito (200 OK)
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Tiquete asignado correctamente.']);
            } else {
                // Poco probable si el handler lanza excepciones, pero es una protección
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Fallo la asignación por una razón desconocida.']);
            }
        } catch (Exception $e) {
            // Capturar la excepción del handler y devolver el 500
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Error en la asignación: ' . $e->getMessage()
            ]);
        }
    }


    //Actualización del tiquete a partir del nuevo estado definido.
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $ticketModel = new TicketModel();

            //Armado de la estructura de entrada, decodificando la estructura JSON enviada como un objeto.
            $decodedRequest = $request->getJson();

            //Actualiza y obtiene el tiquete con sus valores actualizados hacia la interfaz.
            $ticket = $ticketModel->update_2($decodedRequest);

            $response->toJson($ticket);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }
}

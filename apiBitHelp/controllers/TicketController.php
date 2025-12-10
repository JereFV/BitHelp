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

            //Obtener información actualizada del ticket 
            $queryTicketInfo = "SELECT idEstado, idTecnicoAsignado, titulo FROM tiquete WHERE idTiquete = $idTicket";
            $ticketInfo = $ticketModel->connection->ExecuteSQL($queryTicketInfo)[0];

            $notificationModel = new NotificationModel();

            // Obtener información del usuario que creó el ticket
            $userModel = new UserModel();
            $user = $userModel->get($decodedRequest->idRequestUser);
            $nombreUsuario = $user->nombre . ' ' . $user->primerApellido;

            // Notificar al usuario creador
            $notificationModel->createNotification(
                1,
                $decodedRequest->idRequestUser,
                $decodedRequest->idRequestUser,
                "Tu ticket #$idTicket '{$ticketInfo->titulo}' fue creado exitosamente",
                $idTicket
            );

            // Notifica a administradores
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

            // Si fue asignado automáticamente, crear notificaciones de asignación
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
            $json_data = file_get_contents('php://input');
            if ($json_data) {
                return json_decode($json_data, true);
            }
            return [];
        }
        
        error_log("DEBUG (Controller): Entro al controller assignManually: ");
        
        $requestData = get_request_data();
        error_log("DEBUG (Controller): Datos de asignación recibidos: " . print_r($requestData, true));
        
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
                // Crear notificaciones de asignación manual
                $notificationModel = new NotificationModel();
                $userModel = new UserModel();
                
                // Obtener información del ticket
                $queryTicketInfo = "SELECT titulo, idUsuarioSolicita FROM tiquete WHERE idTiquete = $id";
                $ticketInfo = $ticketModel->connection->ExecuteSQL($queryTicketInfo)[0];
                
                // Obtener nombre del técnico asignado
                $techUser = $userModel->get($requestData['idTecnicoAsignado']);
                $nombreTecnico = $techUser->nombre . ' ' . $techUser->primerApellido;
                
                // Notificar al usuario solicitante
                $notificationModel->createNotification(
                    1, // Tipo: Cambio de Estado
                    $requestData['idUsuarioAdmin'], // Remitente: admin que asignó
                    $ticketInfo->idUsuarioSolicita, // Destinatario: cliente
                    "Ticket #$id '{$ticketInfo->titulo}' fue asignado manualmente al técnico $nombreTecnico",
                    $id
                );
                
                // Notificar al técnico asignado
                $notificationModel->createNotification(
                    1, // Tipo: Cambio de Estado
                    $requestData['idUsuarioAdmin'], // Remitente: admin que asignó
                    $requestData['idTecnicoAsignado'], // Destinatario: técnico
                    "Ticket #$id '{$ticketInfo->titulo}' te fue asignado manualmente",
                    $id
                );                
                // Responder con éxito (200 OK)
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Tiquete asignado correctamente.']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Fallo la asignación por una razón desconocida.']);
            }
        } catch (Exception $e) {
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

    /**
     * Endpoint: GET /ticket/getIndicatorsData
     * Obtiene todos los datos consolidados para generar los gráficos de los indicadores.
     * Requiere que TicketModel y TechnicianModel estén disponibles.
     */
    public function getIndicatorsData()
    {
        try {
            $response = new Response();
            $ticketModel = new TicketModel();
            $technicianModel = new TechnicianModel(); 
            
            // 1. Tickets Creados por Mes
            $ticketsByMonth = $ticketModel->getTicketsCreatedByMonth();
            
            // 2. Promedio de Valoraciones
            $generalRating = $ticketModel->getGeneralRatingAverage();
            
            // 3. y 4. Cumplimiento SLA (Respuesta y Resolución)
            $slaComplianceData = $ticketModel->getSlaComplianceIndicators();
            
            // 5. Ranking de Técnicos
            $technicianRanking = $technicianModel->getTechnicianRanking();
            
            // 6. Categorías con más Incumplimientos (Top 5)
            $categoriesBreaches = $ticketModel->getCategoriesWithMostSlaBreaches(5);
            
            // Consolidar, formatear y devolver los resultados
            $indicatorsData = [
                'tickets_by_month' => $ticketsByMonth,
                'general_rating_average' => $generalRating ? (float)$generalRating->promedio_general : 0.0,
                // Llama a una función auxiliar para calcular porcentajes de SLA
                'sla_compliance' => $this->formatSlaCompliance($slaComplianceData),
                'technician_ranking' => $technicianRanking,
                'categories_breaches' => $categoriesBreaches,
            ];

            $response->toJson($indicatorsData);
            
        } catch (Exception $ex) {
            $response = new Response(); 
            $response->error(500, 'Error al obtener datos de indicadores: ' . $ex->getMessage());
            handleException($ex);
        }
    }
    
    /**
     * [FUNCIÓN AUXILIAR] Calcula y formatea los porcentajes de cumplimiento de SLA.
     * Se puede agregar este método como privado dentro de la clase 'ticket'.
     */
    private function formatSlaCompliance($data)
    {
        if (!$data) {
            return [
                'respuesta' => ['cumplido' => 0.0, 'incumplido' => 0.0, 'total' => 0],
                'resolucion' => ['cumplido' => 0.0, 'incumplido' => 0.0, 'total' => 0]
            ];
        }

        $totalRespuesta = (int)$data->respuesta_cumplida + (int)$data->respuesta_incumplida;
        $totalResolucion = (int)$data->resolucion_cumplida + (int)$data->resolucion_incumplida;

        // Calcula porcentajes de respuesta
        $respCumplido = $totalRespuesta > 0 ? (round(((int)$data->respuesta_cumplida / $totalRespuesta) * 100, 2)) : 0.0;
        $respIncumplido = $totalRespuesta > 0 ? (round(((int)$data->respuesta_incumplida / $totalRespuesta) * 100, 2)) : 0.0;

        // Calcula porcentajes de resolución
        $resCumplido = $totalResolucion > 0 ? (round(((int)$data->resolucion_cumplida / $totalResolucion) * 100, 2)) : 0.0;
        $resIncumplido = $totalResolucion > 0 ? (round(((int)$data->resolucion_incumplida / $totalResolucion) * 100, 2)) : 0.0;

        return [
            'respuesta' => [
                'cumplido' => $respCumplido,
                'incumplido' => $respIncumplido,
                'total' => $totalRespuesta
            ],
            'resolucion' => [
                'cumplido' => $resCumplido,
                'incumplido' => $resIncumplido,
                'total' => $totalResolucion
            ]
        ];
    }

    //Actualización del tiquete a partir del nuevo estado definido.
    public function saveRating()
    {
        try {
            $request = new Request();
            $response = new Response();
            $ticketModel = new TicketModel();

            //Armado de la estructura de entrada, decodificando la estructura JSON enviada como un objeto.
            $decodedRequest = $request->getJson();

            //Almacena la califiación del servicio y devuelve el tiquete con sus valores actualizados hacia la interfaz.
            $ticket = $ticketModel->saveRating($decodedRequest);

            $response->toJson($ticket);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }
}

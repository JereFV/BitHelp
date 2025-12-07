<?php

require_once 'TicketAsignationModel.php';
require_once 'TicketAssignmentHandler.php';

class TicketModel
{
    public $connection;

    //Estado de tiquete Resuelto.
    public const ID_RESOLVED_STATE = 4;
    //Estado de tiquete Cerrado.
    public const ID_CLOSED_STATE = 5;
    //Estado de tiquete Devuelto.
    public const ID_RETURNED_STATE = 6;  

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    public function getAll()
    {
        try {
            // Consulta SQL estructurada con joins y cálculo de tiempo restante (horas)
            $query = "
                SELECT 
                    t.idTiquete AS id,
                    t.idTiquete AS numero,
                    COALESCE(t.titulo, '') AS titulo,
                    COALESCE(t.descripcion, '') AS descripcion,
                    COALESCE(e.nombre, 'Sin estado') AS estado,
                    COALESCE(p.nombre, 'Sin prioridad') AS prioridad,
                    CONCAT(COALESCE(u.nombre,''), ' ', COALESCE(u.primerApellido,''), ' ', COALESCE(u.segundoApellido,'')) AS tecnico,
                    TIMESTAMPDIFF(HOUR, NOW(), t.slaResolucion) AS tiempoRestante                  
                FROM tiquete t
                LEFT JOIN estado_tiquete e ON t.idEstado = e.idEstadoTiquete
                LEFT JOIN prioridad_tiquete p ON t.idPrioridad = p.idPrioridadTiquete
                LEFT JOIN tecnico tec ON t.idTecnicoAsignado = tec.idTecnico
                LEFT JOIN usuario u ON tec.idUsuario = u.idUsuario               
                ORDER BY t.idTiquete DESC
            ";

            // Ejecuta la consulta y obtiene todos los resultados.
            $tickets = $this->connection->ExecuteSQL($query);

            // Retorna la lista de tiquetes.
            return $tickets;
        } catch (Exception $ex) {
            handleException($ex);
        }
    }


    //Obtiene los tiquetes según el rol del usuario en sesión, donde:
    // Rol 1-Cliente: Tiquetes reportados por el usuario.
    // Rol 2-Técnico: Tiquetes que le han sido asignados.
    // Rol 3-Administrador: Todos los tiquetes existentes sin filtro alguno.
    public function getAllByRolUser($idRole, $idUser)
    {
        try 
        {            
            $query = "
                SELECT 
                    t.idTiquete AS id,
                    t.idTiquete AS numero,
                    COALESCE(t.titulo, '') AS titulo,
                    COALESCE(t.descripcion, '') AS descripcion,
                    COALESCE(e.nombre, 'Sin estado') AS estado,
                    COALESCE(p.nombre, 'Sin prioridad') AS prioridad,
                    CONCAT(COALESCE(u.nombre,''), ' ', COALESCE(u.primerApellido,''), ' ', COALESCE(u.segundoApellido,'')) AS tecnico,
                    TIMESTAMPDIFF(HOUR, NOW(), DATE_ADD(T.fechaCreacion, INTERVAL TIME_TO_SEC(s.tiempoMaxResolucion) SECOND)) AS tiempoRestante,
                    (SELECT h.fecha FROM historial_tiquete h 
                    WHERE h.idTiquete = t.idTiquete AND h.idEstado = 2 
                    ORDER BY h.fecha ASC LIMIT 1) as fechaAsignacion,
                    c.nombre as categoria,
                    t.slaResolucion
                FROM tiquete t
                LEFT JOIN estado_tiquete e ON t.idEstado = e.idEstadoTiquete
                LEFT JOIN prioridad_tiquete p ON t.idPrioridad = p.idPrioridadTiquete
                LEFT JOIN tecnico tec ON t.idTecnicoAsignado = tec.idTecnico
                LEFT JOIN usuario u ON tec.idUsuario = u.idUsuario
                INNER JOIN categoria c ON t.idCategoria = c.idCategoria
                INNER JOIN sla s ON c.idSla = s.idSla";

            $whereClause = "";

            if ($idRole == 1) 
            {
                $whereClause = "WHERE t.idUsuarioSolicita = $idUser";
            }
            else if ($idRole == 2) 
            {
                $idTecnicoQuery = "SELECT idTecnico FROM tecnico WHERE idUsuario = $idUser LIMIT 1";
                $result = $this->connection->ExecuteSQL($idTecnicoQuery);
                $idTecnico = $result[0]->idTecnico ?? 0;
                $whereClause = "WHERE t.idTecnicoAsignado = $idTecnico";
            }

            $query .= " " . $whereClause . " ORDER BY t.idTiquete DESC";

            $tickets = $this->connection->executeSQL($query);

            return $tickets ?? [];
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    public function get( $id )
    {
        try
        {
            $userModel = new UserModel();
            $ticketStatusModel = new TicketStatusModel();
            $ticketPriorityModel = new TicketPriorityModel();
            $specialtyModel = new SpecialtyModel();
            $ticketHistoryModel = new TicketHistoryModel();
            $categorieModel = new CategorieModel();      
            $ticketAsignationModel = new TicketAsignationModel();
            $query = "SELECT * FROM tiquete
                      WHERE idTiquete = $id";

            $ticket = $this->connection->executeSQL($query);

            //Sobreescribe su valor sacando el resultado del arreglo.
            $ticket = $ticket[0];
           
            //Usuario que ingresó el tiquete.
            $ticket->usuarioSolicita = $userModel->get($ticket->idUsuarioSolicita);

            //Estado del tiquete a partir del catálogo.
            $ticket->estadoTiquete = $ticketStatusModel->get($ticket->idEstado)[0];  

            //Prioridad del tiquete a partir del catálogo.
            $ticket->prioridad = $ticketPriorityModel->get($ticket->idPrioridad)[0];

            //Categoría del tiquete a partir del catálogo.
            $ticket->categoria = $categorieModel->getById($ticket->idCategoria);

            //Método de asignación del tiquete a partir del catálogo.
             if($ticket->idMetodoAsignacion)
                $ticket->metodoAsignacion = $ticketAsignationModel->get($ticket->idMetodoAsignacion)[0];

            //Técnico asignado al tiquete.
            if($ticket->idTecnicoAsignado)
                $ticket->tecnicoAsignado = $userModel->get($ticket->idTecnicoAsignado);

            //Especialidad del tiquete a partir del catálogo.
            if($ticket->idEspecialidad)
                $ticket->especialidad = $specialtyModel->get($ticket->idEspecialidad)[0];

            //Historial o movimientos del tiquete.
            $ticket->historialTiquete = $ticketHistoryModel->get($ticket->idTiquete);

            //Elimina las propiedades que ya están contenidas en otras estructuras.
            unset($ticket->idUsuarioSolicita);
            unset($ticket->idEstado);
            unset($ticket->idPrioridad);
            unset($ticket->idTecnicoAsignado);
            unset($ticket->idEspecialidad);
            unset($ticket->idCategoria);

            return $ticket;
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }


    public function getTicketDetailsForManualAssignment($id)
    {
        try 
        {           

            $query = "SELECT 
                        t.idTiquete,
                        t.titulo,
                        t.descripcion,
                        et.nombre AS estado,
                        pt.nombre AS prioridad,
                        t.idCategoria,
                        c.nombre AS categoria,                       
                        t.slaResolucion,
                        TIMESTAMPDIFF(HOUR, NOW(), t.slaResolucion) AS tiempoRestante,
                        -- 🚨 CAMPOS AGREGADOS PARA EL TÉCNICO
                        CONCAT(COALESCE(u.nombre,''), ' ', COALESCE(u.primerApellido,''), ' ', COALESCE(u.segundoApellido,'')) AS tecnico
                      FROM tiquete t
                      INNER JOIN estado_tiquete et ON t.idEstado = et.idEstadoTiquete
                      INNER JOIN prioridad_tiquete pt ON t.idPrioridad = pt.idPrioridadTiquete
                      INNER JOIN categoria c ON t.idCategoria = c.idCategoria
                      -- 🚨 JOINS AGREGADOS PARA EL TÉCNICO
                      LEFT JOIN tecnico tec ON t.idTecnicoAsignado = tec.idTecnico
                      LEFT JOIN usuario u ON tec.idUsuario = u.idUsuario
                      WHERE t.idTiquete = ?"; 

            // Usamos executeSQL_SelectQuery con parámetros para evitar la inyección
            $result = $this->connection->executeSQL_prepared($query, [$id]);
            
            
            // Si no se encuentra el tiquete, devuelve null o un array vacío
            if (empty($result)) {
                return null;
            }

            // Devolvemos solo el primer elemento (el tiquete)
            return $result[0];
        } 
        catch (Exception $ex) {
            handleException($ex);
            return null; 
        }
    }

    public function getSlaDetails($id)
    {
        try 
        {
            // Consulta SQL optimizada para obtener todos los datos necesarios
            // para el bloque de cumplimiento de SLA en una sola llamada.
            $query = "
                SELECT
                    T.idTiquete,
                    T.fechaCreacion,
                    -- 1. Fechas Reales de Acción 
                    T.slaRespuesta AS FechaRespuestaReal, 
                    T.slaResolucion AS FechaResolucionReal, 
                    
                    -- 2. Estado de Cumplimiento (0 = No Cumplido, 1 = Cumplido)
                    T.cumplimientoSlaRespuesta,
                    T.cumplimientoSlaResolucion,
                    
                    -- 3. Tiempos Máximos (de la tabla SLA) para mostrar y calcular
                    S.tiempoMaxRespuesta,  
                    S.tiempoMaxResolucion, 

                    -- 4. Cálculo del Momento Límite de Respuesta (SLA Límite)
                    DATE_ADD(T.fechaCreacion, INTERVAL TIME_TO_SEC(S.tiempoMaxRespuesta) SECOND) AS SLARespuestaLimite,
                    
                    -- 5. Cálculo del Momento Límite de Resolución (SLA Límite)
                    DATE_ADD(T.fechaCreacion, INTERVAL TIME_TO_SEC(S.tiempoMaxResolucion) SECOND) AS SLAResolucionLimite
                FROM
                    tiquete AS T
                -- INNER JOIN especialidad AS E ON T.idEspecialidad = E.idEspecialidad
                -- INNER JOIN categoria_especialidad AS CE ON E.idEspecialidad = CE.idEspecialidad
                INNER JOIN categoria AS C ON T.idCategoria = C.idCategoria
                INNER JOIN sla AS S ON C.idSla = S.idSla
                WHERE
                    T.idTiquete = $id
            ";

            $slaDetails = $this->connection->executeSQL($query);

            return $slaDetails[0] ?? null;

        } catch (Exception $ex) {
            handleException($ex);
            return null;
        }
    }

    public function create($ticket)
    {
        try
        {
            //Inicialmente inserta el tiquete en la entidad respectiva.
            $query = "INSERT INTO tiquete (idUsuarioSolicita, 
                                           titulo, 
                                           descripcion, 
                                           idEstado, 
                                           idPrioridad, 
                                           idCategoria,
                                           fechaCreacion)
                                   VALUES ($ticket->idRequestUser,
                                           '$ticket->title',
                                           '$ticket->description',
                                           1, -- Pendiente
                                           $ticket->idPriority,
                                           $ticket->idCategorie,
                                           NOW())";

            //Ejecuta la instrucción y obtiene el id de registro insertado.
            $idTicket = $this->connection->executeSQL_DML_last($query);

            //Sobreescribe el query para la inserción de un registro en el historial de tiquetes.
            $query = "INSERT INTO historial_tiquete (idHistorialTiquete,
                                                    idTiquete,
                                                    fecha,
                                                    idUsuario,
                                                    observacion,
                                                    idEstado)
                                            VALUES (1, -- Es el primer movimiento del tiquete
                                                    $idTicket,
                                                    NOW(),
                                                    $ticket->idRequestUser,
                                                    'Tiquete registrado con un estado de Pendiente a la espera de ser asignado al personal técnico.',
                                                    1)";
                                                    
            $this->connection->executeSQL_DML($query);
            //Obtiene el método de asignación de la categoría. Ahora getById retorna un solo objeto o null.
            $categorieModel = new CategorieModel();
            $categoriaObject = $categorieModel->getByIdCategorie($ticket->idCategorie);
            
            error_log("ID de Tiquete Creado: " . $idTicket);
            error_log("ID de Categoría Enviado: " . $ticket->idCategorie);
            
            if (is_object($categoriaObject)) {
                error_log("Objeto de Categoría encontrado. idMetodoAsignacion: " . $categoriaObject->idMetodoAsignacion);
            } else {
                // Si entra aquí, significa que la categoría con ese ID no existe.
                error_log("Objeto de Categoría NO encontrado o NO es objeto. Autotriage OMITIDO.");
            }

            // ID 2 es 'Automático'
            // COMRPOBACIÓN FINAL: Verificamos que $categoriaObjeto sea realmente un objeto 
            // y tenga la propiedad idMetodoAsignacion antes de usarla.
            if (is_object($categoriaObject) && 
                isset($categoriaObject->idMetodoAsignacion) && 
                $categoriaObject->idMetodoAsignacion == 2) 
            {
                $assignmentHandler = new TicketAssignmentHandler();
                // Llama al Handler para el Autotriage
                $assignmentHandler->handlePostCreationAssignment(
                    $idTicket,
                    $ticket->idPriority,
                    $categoriaObject->idCategoria ,
                    $this
                );
            }

            //Retorna el código de tiquete registrado con el objetivo de mostrarlo en pantalla.
            return $idTicket;
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    /**
     * Obtiene el listado de especialidades asociadas a una categoría (N:M).
     * @param int $idCategoria ID de la Categoría.
     */
    public function getSpecialtiesByCategorieId($idCategoria) 
    {
        try 
        {
            $query = "
                SELECT 
                    e.idEspecialidad, 
                    e.nombre 
                FROM especialidad e
                INNER JOIN categoria_especialidad ce ON e.idEspecialidad = ce.idEspecialidad
                WHERE ce.idCategoria = $idCategoria
            ";
            return $this->connection->executeSQL($query) ?? [];
        } 
        catch (Exception $ex) {
            handleException($ex);
            return [];
        }
    }


   /**
     * Actualiza los campos de un tiquete existente.
     * @param int $id ID del tiquete a actualizar.
     * @param object $data Objeto con las propiedades a actualizar.
     * @return bool Retorna verdadero si la actualización fue exitosa.
     */
    public function update($id, $data)
    {
        try 
        {
            // Nota de Seguridad: Este código NO utiliza sentencias preparadas 
            // y es vulnerable si los datos no son validados correctamente.
            
            $setClauses = [];
            
            // Construir dinámicamente la cláusula SET, asegurando casteo de enteros
            // y comillas para strings.

            if (isset($data->idTecnicoAsignado)) {
                // Se asume que es un entero
                $setClauses[] = "idTecnicoAsignado = " . (int)$data->idTecnicoAsignado;
            }
            if (isset($data->idEstado)) {
                // Se asume que es un entero
                $setClauses[] = "idEstado = " . (int)$data->idEstado;
            }
            if (isset($data->slaResolucion)) {
                // Se asume que es una string con formato de fecha/hora
                $sla = $data->slaResolucion; 
                $setClauses[] = "slaResolucion = '$sla'"; 
            }
            if (isset($data->idMetodoAsignacion)) {
                $setClauses[] = "idMetodoAsignacion = " . (int)$data->idMetodoAsignacion;
            }
            // Agrega aquí cualquier otro campo que necesites actualizar (ej. titulo, descripcion, etc.)

            if (empty($setClauses)) {
                error_log("ADVERTENCIA: No se proporcionaron campos para actualizar el tiquete $id.");
                return true;
            }

            $setStatement = implode(', ', $setClauses);
            $query = "UPDATE tiquete SET $setStatement WHERE idTiquete = " . (int)$id;

            error_log("DEBUG (Model-Update): Ejecutando query: " . $query);
            
            $this->connection->executeSQL_DML($query);

            return true;
        } 
        catch (Exception $ex) {
            handleException($ex);
            return false;
        }
    }

    //Actualiza el tiquete según el nuevo estado seleccionado, guardando el movimiento en el historial.
    public function update_2($ticket)
    {
        try 
        {
            $ticketHistoryModel = new TicketHistoryModel();
            $notificationModel = new NotificationModel();
            $technicianModel = new TechnicianModel();

            // Obtener estado anterior antes de actualizar
            $queryEstadoAnterior = "SELECT idEstado, titulo, idUsuarioSolicita, idTecnicoAsignado, idCategoria 
                                FROM tiquete WHERE idTiquete = $ticket->idTicket";
            $resultEstadoAnterior = $this->connection->executeSQL($queryEstadoAnterior);
            $estadoAnterior = $resultEstadoAnterior[0]->idEstado;
            $tituloTicket = $resultEstadoAnterior[0]->titulo;
            $idUsuarioSolicita = $resultEstadoAnterior[0]->idUsuarioSolicita;
            $idTecnicoAsignado = $resultEstadoAnterior[0]->idTecnicoAsignado;

            //Inicialmente actualiza el tiquete según el nuevo estado.
            $query = "UPDATE tiquete SET idUsuarioCierra = " . ($ticket->idNewState == self::ID_CLOSED_STATE ? $ticket->idSessionUser : "NULL")
                                        . ",idEstado = $ticket->idNewState"
                                        . ",fechaCierre = " . ($ticket->idNewState == self::ID_CLOSED_STATE ? "NOW()" : "NULL")
                                        . ",slaResolucion = " . ($ticket->idNewState == self::ID_RESOLVED_STATE ? "NOW()" : "NULL")
                                        . " WHERE idTiquete = $ticket->idTicket";

            $this->connection->executeSQL_DML($query);

            //Almacena un nuevo movimiento en el historial del tiquete.
            $ticketHistoryModel->create($ticket);

            //Si el nuevo estado del tiquete es resuelto o devuelto, actualiza la carga de trabajo del técnico asignado.
            if ($ticket->idNewState == self::ID_RESOLVED_STATE || $ticket->idNewState == self::ID_RETURNED_STATE)
            {
                //Determina dinámicamente el operador a utilizar en el cálculo de la carga de trabajo del técnico.
                //Si el tiquete pasa a resuelto disminuye la carga de trabajo, si pasa a devuelto más bien aumenta la carga original del tiquete.
                $operator = $ticket->idNewState == self::ID_RESOLVED_STATE ? "-" : "+";

                $technicianModel->updateWorkCharge($idTecnicoAsignado, $resultEstadoAnterior[0]->idCategoria, $operator);
            }      

            // Crear notificaciones según el cambio de estado
            $descripcionBase = "Ticket #$ticket->idTicket '$tituloTicket' cambió de estado";
            
            // Asignado (2) → En Progreso (3): Cliente + Técnico
            if ($estadoAnterior == 2 && $ticket->idNewState == 3) {
                // Notificar al cliente
                $notificationModel->createNotification(
                    1, 
                    $ticket->idSessionUser, 
                    $idUsuarioSolicita,
                    "$descripcionBase a 'En Proceso'. El técnico está trabajando en tu solicitud.",
                    $ticket->idTicket
                );
                
                // Notificar al técnico
                if ($idTecnicoAsignado) {
                    $notificationModel->createNotification(
                        1,
                        $ticket->idSessionUser,
                        $idTecnicoAsignado,
                        "$descripcionBase a 'En Proceso'. Comenzaste a trabajar en este ticket.",
                        $ticket->idTicket
                    );
                }
            }
            // En Progreso (3) → Resuelto (4): Solo Cliente
            elseif ($estadoAnterior == 3 && $ticket->idNewState == 4) {
                $notificationModel->createNotification(
                    1,
                    $ticket->idSessionUser,
                    $idUsuarioSolicita,
                    "$descripcionBase a 'Resuelto'. Por favor verifica que tu problema fue solucionado.",
                    $ticket->idTicket
                );
            }
            // Resuelto (4) → Cerrado (5): Solo Técnico
            elseif ($estadoAnterior == 4 && $ticket->idNewState == 5) {
                if ($idTecnicoAsignado) {
                    $notificationModel->createNotification(
                        1,
                        $ticket->idSessionUser,
                        $idTecnicoAsignado,
                        "$descripcionBase a 'Cerrado'. El cliente confirmó la solución.",
                        $ticket->idTicket
                    );
                }
            }
            // Resuelto (4) → Devuelto (6): Cliente + Técnico
            elseif ($estadoAnterior == 4 && $ticket->idNewState == 6) {
                // Notificar al cliente
                $notificationModel->createNotification(
                    1,
                    $ticket->idSessionUser,
                    $idUsuarioSolicita,
                    "$descripcionBase a 'Devuelto'. El problema será revisado nuevamente.",
                    $ticket->idTicket
                );
                
                // Notificar al técnico
                if ($idTecnicoAsignado) {
                    $notificationModel->createNotification(
                        1,
                        $ticket->idSessionUser,
                        $idTecnicoAsignado,
                        "$descripcionBase a 'Devuelto'. El cliente reporta que el problema persiste.",
                        $ticket->idTicket
                    );
                }
            }
            // Devuelto (6) → En Progreso (3): Cliente + Técnico
            elseif ($estadoAnterior == 6 && $ticket->idNewState == 3) {
                // Notificar al cliente
                $notificationModel->createNotification(
                    1,
                    $ticket->idSessionUser,
                    $idUsuarioSolicita,
                    "$descripcionBase a 'En Proceso'. El técnico está revisando nuevamente tu solicitud.",
                    $ticket->idTicket
                );
                
                // Notificar al técnico
                if ($idTecnicoAsignado) {
                    $notificationModel->createNotification(
                        1,
                        $ticket->idSessionUser,
                        $idTecnicoAsignado,
                        "$descripcionBase a 'En Proceso'. Continúas trabajando en este ticket.",
                        $ticket->idTicket
                    );
                }
            }

            //Obtiene y retorna el tiquete con sus valores actualizados junto con el historial de movimientos.
            $ticket = $this->get($ticket->idTicket);

            return $ticket;
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    /**
     * Indicador 1: Obtiene el conteo de tickets creados por mes.
     * @return array Lista de objetos {anio, mes, total_tickets}.
     */
    public function getTicketsCreatedByMonth()
    {
        try {
            $query = "
                SELECT
                    YEAR(fechaCreacion) AS anio,
                    MONTH(fechaCreacion) AS mes,
                    COUNT(idTiquete) AS total_tickets
                FROM tiquete
                GROUP BY anio, mes
                ORDER BY anio ASC, mes ASC
            ";
            return $this->connection->executeSQL($query) ?? [];
        } catch (Exception $ex) {
            handleException($ex);
            return [];
        }
    }

    /**
     * Indicador 2: Obtiene el promedio general de las valoraciones de tickets.
     * Se asume que solo se valora un ticket después de estar Cerrado (estado 5).
     * @return object|null Objeto con la propiedad promedio_general.
     */
    public function getGeneralRatingAverage()
    {
        try {
            // Utilizamos la constante de estado Cerrado (ID_CLOSED_STATE = 5)
            $closedState = self::ID_CLOSED_STATE;

            $query = "
                SELECT 
                    AVG(t.valoracion) AS promedio_general 
                FROM tiquete t
                WHERE t.idEstado = $closedState
            ";
            $result = $this->connection->executeSQL($query);
            return $result[0] ?? null;
        } catch (Exception $ex) {
            handleException($ex);
            return null;
        }
    }

    /**
     * Indicadores 3 y 4: Obtiene los conteos de cumplimiento e incumplimiento de SLA 
     * (Respuesta y Resolución).
     * @return object|null Objeto con los conteos brutos.
     */
    public function getSlaComplianceIndicators()
    {
        try {
            $query = "
                SELECT
                    COUNT(CASE WHEN cumplimientoSlaRespuesta = 1 THEN 1 END) AS respuesta_cumplida,
                    COUNT(CASE WHEN cumplimientoSlaRespuesta = 0 THEN 1 END) AS respuesta_incumplida,
                    COUNT(CASE WHEN cumplimientoSlaResolucion = 1 THEN 1 END) AS resolucion_cumplida,
                    COUNT(CASE WHEN cumplimientoSlaResolucion = 0 THEN 1 END) AS resolucion_incumplida
                FROM tiquete
                -- Se filtran solo los tickets que ya tienen un resultado de cumplimiento (no NULL)
                WHERE cumplimientoSlaRespuesta IS NOT NULL OR cumplimientoSlaResolucion IS NOT NULL
            ";
            $result = $this->connection->executeSQL($query);
            return $result[0] ?? null;
        } catch (Exception $ex) {
            handleException($ex);
            return null;
        }
    }

    /**
     * Indicador 6: Obtiene las categorías con la mayor cantidad de incumplimientos de SLA.
     * @param int $limit Número de categorías a mostrar (ej. top 5).
     * @return array Lista de objetos {categoria_nombre, total_incumplimientos}.
     */
    public function getCategoriesWithMostSlaBreaches($limit = 5)
    {
        try {
            $query = "
                SELECT
                    c.nombre AS categoria_nombre,
                    COUNT(t.idTiquete) AS total_incumplimientos
                FROM tiquete t
                INNER JOIN categoria c ON t.idCategoria = c.idCategoria
                -- Donde el cumplimiento de Respuesta O el de Resolución fue 0 (Incumplido)
                WHERE t.cumplimientoSlaRespuesta = 0 OR t.cumplimientoSlaResolucion = 0
                GROUP BY c.nombre
                ORDER BY total_incumplimientos DESC
                LIMIT ?
            ";
            // Usamos prepared statements para el límite
            $params = [(int)$limit];
            return $this->connection->executeSQL_prepared($query, $params) ?? [];
        } catch (Exception $ex) {
            handleException($ex);
            return [];
        }
    }

}
?>
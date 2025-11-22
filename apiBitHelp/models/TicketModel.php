<?php
require_once 'TicketAsignationModel.php';
class TicketModel
{
    public $connection;

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
                    -- 1. Fechas Reales de Acción (Ahora contienen la fecha de respuesta/resolución real)
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

            //Retorna el código de tiquete registrado con el objetivo de mostrarlo en pantalla.
            return $idTicket;
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}
?>

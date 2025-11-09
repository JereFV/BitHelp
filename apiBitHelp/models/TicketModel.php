<?php
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
                    TIMESTAMPDIFF(HOUR, NOW(), t.slaResolucion) AS tiempoRestante,                  
                FROM tiquete t
                LEFT JOIN estado_tiquete e ON t.idEstado = e.idEstadoTiquete
                LEFT JOIN prioridad_tiquete p ON t.idPrioridad = p.idPrioridadTiquete
                LEFT JOIN tecnico tec ON t.idTecnicoAsignado = tec.idTecnico
                LEFT JOIN usuario u ON tec.idUsuario = u.idUsuario               
                ORDER BY t.idTiquete DESC
            ";

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
            // 1. Construir la consulta base (la misma de getAll())
            // Esta consulta ya trae los nombres (estado, prioridad, tecnico) y calcula el tiempo.

            $query = "
                SELECT 
                    t.idTiquete AS id,
                    t.idTiquete AS numero,
                    COALESCE(t.titulo, '') AS titulo,
                    COALESCE(t.descripcion, '') AS descripcion,
                    COALESCE(e.nombre, 'Sin estado') AS estado,
                    COALESCE(p.nombre, 'Sin prioridad') AS prioridad,
                    CONCAT(COALESCE(u.nombre,''), ' ', COALESCE(u.primerApellido,''), ' ', COALESCE(u.segundoApellido,'')) AS tecnico,
                    TIMESTAMPDIFF(HOUR, NOW(), t.slaResolucion) AS tiempoRestante,
                    h.fecha as fechaAsignacion,
                    c.nombre as categoria,
                    slaResolucion
                FROM tiquete t
                LEFT JOIN estado_tiquete e ON t.idEstado = e.idEstadoTiquete
                LEFT JOIN prioridad_tiquete p ON t.idPrioridad = p.idPrioridadTiquete
                LEFT JOIN tecnico tec ON t.idTecnicoAsignado = tec.idTecnico
                LEFT JOIN usuario u ON tec.idUsuario = u.idUsuario
                LEFT JOIN historial_tiquete h ON t.idTiquete = h.idTiquete
                INNER JOIN especialidad esp ON t.idEspecialidad = esp.idEspecialidad
                INNER JOIN categoria c ON esp.idCategoria = c.idCategoria               
            ";

            // 2. Añadir el filtro (WHERE) según el ROL
            $whereClause = "";

            if ($idRole == 1) // Cliente
            {
                // Filtra por el idUsuario que solicitó el tiquete
                $whereClause = "WHERE t.idUsuarioSolicita = $idUser";
            }
            else if ($idRole == 2) // Técnico
            {
                // CORRECCIÓN IMPORTANTE:
                // El $idUser es el id de la tabla 'usuario'.
                // Necesitamos encontrar el 'idTecnico' que corresponde a ese 'idUser'.
                
                $idTecnicoQuery = "SELECT idTecnico FROM tecnico WHERE idUsuario = $idUser LIMIT 1";
                $result = $this->connection->ExecuteSQL($idTecnicoQuery);
                
                // Si encontramos al técnico, usamos su ID para filtrar.
                // Si no, usamos 0 para no devolver tiquetes (ya que no es un técnico válido).
                $idTecnico = $result[0]->idTecnico ?? 0;
                
                $whereClause = "WHERE t.idTecnicoAsignado = $idTecnico";
            }
            // Si es Rol 3 (Admin), $whereClause queda vacío y trae todo.

            // 3. Unir la consulta
            // Filtra el historial del tiquete para obtener el registro donde fue asignado al técnico.
            $query .= " " . $whereClause . " AND h.idEstado = 2   
                                            ORDER BY t.idTiquete DESC";

            // 4. Ejecutar la consulta ÚNICA
            $tickets = $this->connection->executeSQL($query);

            return $tickets ?? [];
            
            // --- FIN DE LA CORRECCIÓN ---

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
            $log = new Logger();

            $query = "SELECT * FROM tiquete
                      WHERE idTiquete = $id";

            $ticket = $this->connection->executeSQL($query);

            //Sobreescribe su valor sacando el resultado del arreglo.
            $ticket = $ticket[0];
           
            //Usuario que ingresó el tiquete.
            $ticket->usuarioSolicita = $userModel->get($ticket->idUsuarioSolicita);

            //Estado del tiquete a partir del catálogo.
            $ticket->estadoTiquete = $ticketStatusModel->get($ticket->idEstado)[0];  

            //Estado del tiquete a partir del catálogo.
            $ticket->prioridad = $ticketPriorityModel->get($ticket->idPrioridad)[0];

            //Técnico asignado al tiquete.
            $ticket->tecnicoAsignado = $userModel->get($ticket->idTecnicoAsignado);

            //Especilidad del tiquete a partir del catálogo.
            $ticket->especialidad = $specialtyModel->get($ticket->idEspecialidad)[0];

            //Historial o movimientos del tiquete.
            $ticket->historialTiquete = $ticketHistoryModel->get($ticket->idTiquete);

            //Elimina las propiedades que ya están contenidas en otras estructuras.
            unset($ticket->idUsuarioSolicita);
            unset($ticket->idEstado);
            unset($ticket->idPrioridad);
            unset($ticket->idTecnicoAsignado);
            unset($ticket->idEspecialidad);

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
                INNER JOIN especialidad AS E ON T.idEspecialidad = E.idEspecialidad
                INNER JOIN categoria AS C ON E.idCategoria = C.idCategoria
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
    }
?>

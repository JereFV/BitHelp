<?php

class TicketAssignmentHandler
{
    public $connection;
    public $technicianModel;
    public $priorityModel;
    public $historyModel;
    
    // Constantes de IDs basadas en la estructura de BitHelp
    const ID_METODO_ASIGNACION_AUTOMATICO = 2; 
    const ID_ESTADO_PENDIENTE = 1; 
    const ID_ESTADO_ASIGNADO = 2;  
    const ID_USUARIO_SISTEMA = 0;  // ID de Usuario para acciones automáticas

    public function __construct()
    {
        $this->connection = new MySqlConnect();
        $this->technicianModel = new TechnicianModel(); 
        $this->priorityModel = new TicketPriorityModel(); 
        $this->historyModel = new TicketHistoryModel();
    }

    /**
     * Ejecuta la lógica del Autotriage si la categoría lo requiere.
     * Si se encuentra un técnico, lo asigna transaccionalmente.
     * Si falla, el tiquete permanece en estado 'Pendiente' (1).
     * @param int $idTicket ID del tiquete recién creado.
     * @param int $idPrioridad ID de la prioridad del tiquete.
     * @param int $idCategoria ID de la categoría (usado para buscar especialidades N:M).
     */
    public function handlePostCreationAssignment($idTicket, $idPrioridad, $idCategoria, TicketModel $ticketModel)
    {
        try {
            // 1. Obtener la lista de especialidades requeridas por la categoría (N:M)
            // Se asume que TicketModel::getSpecialtiesByCategorieId existe y retorna IDs de especialidad
            $specialtyObjects = $ticketModel->getSpecialtiesByCategorieId($idCategoria);
            
            // Extraer solo los IDs de especialidad
            $idEspecialidades = array_map(function($obj) {
                return $obj->idEspecialidad;
            }, $specialtyObjects);
            
            // Regla de Negocio: Si no hay especialidades, no se puede asignar automáticamente.
            if (empty($idEspecialidades)) {
                $this->logAction($idTicket, self::ID_ESTADO_PENDIENTE, 'Autotriage fallido. Categoría sin especialidades asociadas. Permanece Pendiente.', self::ID_USUARIO_SISTEMA);
                return; 
            }

            // 2. Obtener datos del ticket para el cálculo del puntaje
            // Se asume que TicketModel::getDetails retorna un array con el SLA (slaResolucion)
            $ticketData = $ticketModel->getSlaDetails($idTicket);
            if (!$ticketData) throw new Exception("Detalles del tiquete no encontrados para cálculo de SLA.");
            $ticketData = $ticketData[0];

            // 3. Cálculo de Puntaje de Urgencia (Autotriage)
            // Se asume que TicketPriorityModel::getScore retorna el valor numérico de la prioridad
            $puntajePrioridad = $this->priorityModel->getScore($idPrioridad); 
            $tiempoRestanteSLA = $this->calculateSlaRemainingHours($ticketData->slaResolucion); 
            // Fórmula de Autotriage (se favorece la urgencia y el tiempo restante negativo/bajo)
            $puntajeFinal = ($puntajePrioridad * 1000) - $tiempoRestanteSLA; 

            // 4. Búsqueda del Técnico más Adecuado (Filtrado por ESPECIALIDAD y menor CARGA)
            // Se asume que TechnicianModel::getAvailableTechnicianBySpecialties existe
            $bestTechnician = $this->technicianModel->getAvailableTechnicianBySpecialties($idEspecialidades); 

            if ($bestTechnician) {
                // 5. Asignación Automática Exitosa (Transacción)
                $idTecnico = $bestTechnician->idTecnico;
                $justificacion = "Asignación Automática (Autotriage). Puntaje de Urgencia: $puntajeFinal. Técnico seleccionado por menor Carga de Trabajo y especialidad compatible.";
                
                $this->executeAssignmentTransaction(
                    $idTicket, 
                    $idTecnico, 
                    $bestTechnician->cargaTrabajo, 
                    $justificacion, 
                    self::ID_ESTADO_ASIGNADO // Asigna el estado 2: Asignado
                );
            } else {
                // 6. Fallo: Queda en PENDIENTE (Estado 1)
                $this->logAction($idTicket, self::ID_ESTADO_PENDIENTE, 'Autotriage fallido. No se encontró técnico activo y disponible con especialidades compatibles. Permanece Pendiente (1).', self::ID_USUARIO_SISTEMA);
            }

        } catch (Exception $ex) {
            // Si hay un error de sistema, se registra y el tiquete permanece Pendiente
            $this->logAction($idTicket, self::ID_ESTADO_PENDIENTE, 'Error de sistema durante el Autotriage: El tiquete permanece Pendiente (1). Detalle: ' . $ex->getMessage(), self::ID_USUARIO_SISTEMA);
        }
    }
    
    /**
     * Realiza el cálculo de las horas restantes para el SLA.
     * @param string $slaResolucion Fecha y hora de resolución del SLA (formato Y-m-d H:i:s).
     * @return int Horas restantes (puede ser negativo si ya pasó el SLA).
     */
    private function calculateSlaRemainingHours($slaResolucion)
    {
        try {
            $future = new DateTime($slaResolucion);
            $now = new DateTime();
            
            // Calcula la diferencia en segundos
            $diffSeconds = $future->getTimestamp() - $now->getTimestamp();
            
            // Convierte la diferencia a horas
            $hours = round($diffSeconds / 3600);
            
            return $hours;
        } catch (Exception $e) {
            // Si la fecha es inválida, retorna un valor negativo grande para un puntaje de urgencia alto (crítico)
            return -99999; 
        }
    }
    
    /**
     * Ejecuta una transacción para asignar el tiquete: actualiza tiquete, técnico e historial.
     * @param int $idTicket
     * @param int $idTecnico
     * @param int $cargaActual Carga actual del técnico.
     * @param string $justificacion
     * @param int $idNuevoEstado Estado final del tiquete (debe ser Asignado: 2).
     */
    private function executeAssignmentTransaction($idTicket, $idTecnico, $cargaActual, $justificacion, $idNuevoEstado)
    {
        $conn = null;
        try {
            $this->connection->connect();
            $conn = $this->connection->link; // Obtiene la conexión raw (mysqli)
            
            // Iniciar transacción
            $conn->begin_transaction();

            // 1. Aumentar la carga de trabajo del Técnico (+1)
            $nuevaCarga = $cargaActual + 1;
            $stmtTec = $conn->prepare("UPDATE tecnico SET cargaTrabajo = ? WHERE idTecnico = ?");
            $stmtTec->bind_param("ii", $nuevaCarga, $idTecnico);
            if (!$stmtTec->execute()) throw new Exception("Error al actualizar la carga del técnico.");
            $stmtTec->close();

            // 2. Actualizar el Tiquete (idEstado e idTecnicoAsignado)
            $stmtTicket = $conn->prepare("UPDATE tiquete SET idEstado = ?, idTecnicoAsignado = ? WHERE idTiquete = ?");
            $stmtTicket->bind_param("iii", $idNuevoEstado, $idTecnico, $idTicket);
            if (!$stmtTicket->execute()) throw new Exception("Error al actualizar el tiquete.");
            $stmtTicket->close();
            
            // 3. Registrar el movimiento en el Historial del Tiquete
            // Se asume la función getNextId en TicketHistoryModel
            $result = $this->historyModel->getNextId($idTicket);
            $nextHistoryId = $this->historyModel->getNextId($idTicket); 
            if (is_array($result) && count($result) > 0) {
                $nextHistoryId = is_object($result[0]) ? $result[0]->idHistorialTiquete : $result[0]['idHistorialTiquete'];
            } else {
                // Manejar caso donde no hay historial previo (ej: id = 1)
                $nextHistoryId = 1; 
            }
            $stmtHist = $conn->prepare("INSERT INTO historial_tiquete (idHistorialTiquete, idTiquete, fecha, idUsuario, observacion, idEstado) 
                                        VALUES (?, ?, NOW(), ?, ?, ?)");
            $stmtHist->bind_param("iissi", $nextHistoryId, $idTicket, self::ID_USUARIO_SISTEMA, $justificacion, $idNuevoEstado);
            if (!$stmtHist->execute()) throw new Exception("Error al registrar el historial.");
            $stmtHist->close();

            // Confirmar transacción
            $conn->commit();
            
        } catch (Exception $ex) {
            if ($conn) {
                $conn->rollback();
            }
            // Propagar la excepción para que sea logueada y el tiquete quede en Pendiente
            throw new Exception("Transacción de asignación fallida: " . $ex->getMessage());
        } finally {
            if ($conn) {
                // Se cierra la conexión si fue abierta
                // En tu estructura, esto podría variar. Asegúrate de cerrar la conexión correctamente.
                // $conn->close(); 
            }
        }
    }
    
    /**
     * Registra un movimiento en el historial usando el ID de usuario del Sistema (0).
     */
    private function logAction($idTicket, $idEstado, $observation, $idUsuario)
    {
        $conn = null;
        try {
            $this->connection->connect();
            $conn = $this->connection->link;
            
            $nextHistoryId = $this->historyModel->getNextId($idTicket); 
            
            // Usar Prepared Statements para seguridad
            $stmt = $conn->prepare("INSERT INTO historial_tiquete (idHistorialTiquete, idTiquete, fecha, idUsuario, observacion, idEstado) 
                                    VALUES (?, ?, NOW(), ?, ?, ?)");
            $stmt->bind_param("iissi", $nextHistoryId, $idTicket, $idUsuario, $observation, $idEstado);
            $stmt->execute();
            $stmt->close();
        } catch (Exception $ex) {
            // Manejar un posible fallo en el registro de log, no es crítico.
        } finally {
            if ($conn) {
                // $conn->close();
            }
        }
    }
}
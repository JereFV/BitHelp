<?php

class TicketAssignmentHandler
{
    public $connection;
    public $technicianModel;
    public $priorityModel;
    public $historyModel;
    
    // Constantes de IDs basadas en la estructura de BitHelp
    const ID_METODO_ASIGNACION_MANUAL = 1;
    const ID_METODO_ASIGNACION_AUTOMATICO = 2; 
    const ID_ESTADO_PENDIENTE = 1; 
    const ID_ESTADO_ASIGNADO = 2;  
    const ID_USUARIO_SISTEMA = 11;  // ID de Usuario para acciones automáticas

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
            error_log("DEBUG: Iniciando asignación.");
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
            
            // 3. Cálculo de Puntaje de Urgencia (Autotriage)
          
            $puntajePrioridad = $this->priorityModel->getScore($idPrioridad); 
            $tiempoRestanteSLA = $this->calculateSlaRemainingMinutes($ticketData->SLAResolucionLimite);
            // Fórmula de Autotriage (se favorece la urgencia y el tiempo restante negativo/bajo)
            $puntajeFinal = ($puntajePrioridad * 1000) - $tiempoRestanteSLA; 

            // 4. Búsqueda del Técnico más Adecuado (Filtrado por ESPECIALIDAD y menor CARGA)
            // Se asume que TechnicianModel::getAvailableTechnicianBySpecialties existe
            $bestTechnician = $this->technicianModel->getAvailableTechnicianBySpecialties($idEspecialidades); 
            error_log("DEBUG: Técnico encontrado o nulo. Pasando a transacción.");
            if ($bestTechnician) {
                // 5. Asignación Automática Exitosa (Transacción)
                $idTecnico = $bestTechnician->idTecnico;
                $justificacion = "Asignación Automática (Autotriage). Puntaje de Urgencia: $puntajeFinal. Técnico seleccionado por menor Carga de Trabajo y especialidad compatible.";
                
                $this->executeAssignmentTransaction(
                    $idTicket, 
                    $idTecnico, 
                    $bestTechnician->cargaTrabajo, 
                    $justificacion, 
                    self::ID_ESTADO_ASIGNADO, // Asigna el estado 2: Asignado
                    $idCategoria
                );
                return;
            } 
            // Si no se encuentra un técnico, se fuerza  la excepción para caer al fallback de asignación manual.
            error_log("DEBUG: Autotriage no encontró un técnico. Iniciando Fallback a Asignación Manual.");
            throw new \Exception("No se encontró técnico compatible para la asignación automática.");

        } catch (Exception $ex) {
        // --- INICIO DEL FALLBACK (CATCH BLOCK) ---
        
        // Si el Autotriage o la transacción fallan, pasa a Asignación Manual.
        $motivoFallo = $ex->getMessage();
        $justificacionFallback = "Fallo en Asignación Automática: " . $motivoFallo . ". Moviendo a Pendiente (1) para Asignación Manual.";
        
        // 1. Loguear la acción como Asignación Manual, usando el estado PENDIENTE (1)
        $this->logActionFallback(
            $idTicket, 
            self::ID_ESTADO_PENDIENTE,        // Estado 1: Pendiente
            $justificacionFallback, 
            self::ID_METODO_ASIGNACION_MANUAL // Método 1: Manual
        );
        
        error_log("DEBUG: Fallback a Asignación Manual completado. Ticket $idTicket en Estado " . self::ID_ESTADO_PENDIENTE);

    }
    }

    /**
     * Maneja la asignación manual o reasignación de un tiquete.
     * Esta función debe ser llamada por el controlador (TicketController)
     * al recibir la petición PUT /ticket/assignManually/{id}.
     * * @param int $idTicket ID del tiquete.
     * @param object $data Datos de asignación (idTecnicoAsignado, justificacion, idUsuarioAdmin, slaResolucion).
     * @param TicketModel $ticketModel Instancia de TicketModel.
     * @return bool Retorna verdadero si la asignación fue exitosa.
     */
    public function handleManualAssignment($idTicket, $data, $ticketModel)
    {
        try 
        {
            // 1. Preparar los datos para la actualización del tiquete.
            $updateData = (object) [
                'idTecnicoAsignado' => $data->idTecnicoAsignado,
                // El estado debe pasar a 'Asignado' (2)
                'idEstado' => self::ID_ESTADO_ASIGNADO, 
                // Asumiendo que el SLA de resolución se recalcula o se envía desde el frontend en $data
                'slaResolucion' => $data->slaResolucion ?? null, // Asegúrate de que este campo venga del frontend si es necesario.
                'idMetodoAsignacion' => self::ID_METODO_ASIGNACION_MANUAL
            ];

            // 2. Actualizar la tabla tiquete.
            $updateResult = $ticketModel->update($idTicket, $updateData);

            if (!$updateResult) {
                throw new Exception("Error al actualizar el tiquete en la base de datos.");
            }
            
            // 3. Registrar el movimiento en el Historial del Tiquete.
            // Se asume que $this->historyModel es una instancia de TicketHistoryModel
            
            $observacion = "Asignación manual al técnico ID {$data->idTecnicoAsignado}. Razón: {$data->justificacion}";
            
            // Usamos $data->idUsuarioAdmin (el usuario que realiza la asignación)
            $historyData = (object) [
                'idTicket' => $idTicket,
                'idUser' => $data->idUsuarioAdmin,
                'comment' => $observacion,
                'idNewState' => self::ID_ESTADO_ASIGNADO
            ];

            // Usamos el método 'create' de TicketHistoryModel para registrar el movimiento.
            $this->historyModel->create($historyData); 

            error_log("INFO: Tiquete $idTicket asignado/reasignado manualmente con éxito.");
            return true;

        } catch (Exception $ex) {
            error_log("ERROR: Falló la asignación manual del tiquete $idTicket. Detalle: " . $ex->getMessage());
            // El error debe ser relanzado para que el controlador lo capture y devuelva el 500
            throw $ex; 
        }
    }
    
    /**
     * Realiza el cálculo de las horas restantes para el SLA.
     * @param string $slaResolucion Fecha y hora de resolución del SLA (formato Y-m-d H:i:s).
     * @return int Horas restantes (puede ser negativo si ya pasó el SLA).
     */
    private function calculateSlaRemainingMinutes($slaResolucion)
    {
        try {
            $future = new DateTime($slaResolucion);
            $now = new DateTime();
            
            // Calcula la diferencia en segundos
            $diffSeconds = $future->getTimestamp() - $now->getTimestamp();
            
            // Convierte la diferencia a minutos
            $minutes = round($diffSeconds / 60);
            
            return $minutes;
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
    private function executeAssignmentTransaction($idTicket, $idTecnico, $cargaActual, $justificacion, $idNuevoEstado,$idCategoria)
    {
        $conn = null;
        try {
            $this->connection->connect();
            $conn = $this->connection->link; // Obtiene la conexión raw (mysqli)
            
            // Iniciar transacción
            $conn->begin_transaction();
            error_log("DEBUG: Transacción Iniciada para Ticket $idTicket.");

            // 1. Aumentar la carga de trabajo del Técnico (Sumando la duración TOTAL del SLA con SQL)
            $stmtTec = $conn->prepare("
                UPDATE tecnico t
                -- Hacemos JOIN con categoria y SLA para obtener el tiempoMaxResolucion asociado al tiquete
                JOIN categoria c ON c.idCategoria = ? 
                JOIN sla s ON s.idSla = c.idSla
                SET t.cargaTrabajo = SEC_TO_TIME(
                    -- Sumamos: (Carga Actual en Segundos) + (SLA Max. Resolución en Segundos)
                    TIME_TO_SEC(t.cargaTrabajo) + TIME_TO_SEC(s.tiempoMaxResolucion)
                )
                WHERE t.idTecnico = ?
            ");
            // Bindeamos: idCategoria (para el JOIN) y idTecnico (para el WHERE)
            $stmtTec->bind_param("ii", $idCategoria, $idTecnico);
            
            if (!$stmtTec->execute()) throw new Exception("Error al actualizar la carga del técnico (SLA).");
            $stmtTec->close();
            error_log("DEBUG: 1. Carga de Técnico $idTecnico actualizada sumando la duración total del SLA (con TIME_TO_SEC).");

            // 2. Actualizar el Tiquete (idEstado e idTecnicoAsignado)
            $idMetodoAsignacion = self::ID_METODO_ASIGNACION_AUTOMATICO;
            $stmtTicket = $conn->prepare("UPDATE tiquete SET idEstado = ?, idTecnicoAsignado = ?, idMetodoAsignacion = ? WHERE idTiquete = ?");
            $stmtTicket->bind_param("iiii", $idNuevoEstado, $idTecnico, $idMetodoAsignacion, $idTicket);
            if (!$stmtTicket->execute()) throw new Exception("Error al actualizar el tiquete.");
            $stmtTicket->close();
            error_log("DEBUG: 2. Tiquete $idTicket actualizado a Estado $idNuevoEstado y Método $idMetodoAsignacion.");

           // 3. Registrar el movimiento en el Historial del Tiquete
            // CORREGIDO: Pasar $conn para que getNextId use la conexión de la transacción
            $result = $this->historyModel->getNextId($idTicket, $conn);
            
            if (is_array($result) && count($result) > 0 && is_object($result[0])) {
                $nextHistoryId = (int)$result[0]->maxId + 1;
            } else {
                $nextHistoryId = 1; 
            }
            error_log("DEBUG: 3. Siguiente ID de Historial determinado: $nextHistoryId.");
            $idUsuarioSistema = self::ID_USUARIO_SISTEMA;
            $observacionHistorial = $justificacion;
            
            $stmtHist = $conn->prepare("INSERT INTO historial_tiquete (idHistorialTiquete, idTiquete, fecha, idUsuario, observacion, idEstado) 
                                         VALUES (?, ?, NOW(), ?, ?, ?)");
            $stmtHist->bind_param("iissi", $nextHistoryId, $idTicket, $idUsuarioSistema, $observacionHistorial, $idNuevoEstado);
            if (!$stmtHist->execute()) throw new Exception("Error al registrar el historial.");
            $stmtHist->close();
            error_log("DEBUG: 4. Historial Insertado correctamente.");
            // Confirmar transacción
            $conn->commit();
            error_log("DEBUG: COMMIT exitoso. Transacción finalizada.");
            
        } catch (Exception $ex) {
            if ($conn) {
                $conn->rollback();
            }
            error_log("ERROR CRÍTICO (ROLLBACK): Transacción de asignación fallida para Ticket $idTicket. Detalle: " . $ex->getMessage());
            // Propagar la excepción para que sea logueada y el tiquete quede en Pendiente
            throw new Exception("Transacción de asignación fallida: " . $ex->getMessage());
        } finally {
            if ($conn) {
                // Se cierra la conexión si fue abierta
                // En tu estructura, esto podría variar. Asegúrate de cerrar la conexión correctamente.
                 $conn->close(); 
                 error_log("DEBUG: Conexión cerrada.");
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

            $conn->begin_transaction();

            $result = $this->historyModel->getNextId($idTicket, $conn); 
            
            if (is_array($result) && count($result) > 0 && is_object($result[0])) {
                $nextHistoryId = (int)$result[0]->maxId + 1;
            } else {
                $nextHistoryId = 1; 
            }
            
            $stmt = $conn->prepare("INSERT INTO historial_tiquete (idHistorialTiquete, idTiquete, fecha, idUsuario, observacion, idEstado) 
                                     VALUES (?, ?, NOW(), ?, ?, ?)");
            $stmt->bind_param("iissi", $nextHistoryId, $idTicket, $idUsuario, $observation, $idEstado);
            $stmt->execute();
            $stmt->close();

            $conn->commit(); // Confirmar el registro de historial
        } catch (Exception $ex) {
            if ($conn) {
                $conn->rollback(); // Revertir el log si falla
            }
        } finally {
            if ($conn) {
                 $conn->close();
            }
        }
    }

    private function logActionFallback($idTicket, $idNuevoEstado, $observation, $idMetodoAsignacion)
    {
        $conn = null;
        try {
            $this->connection->connect();
            $conn = $this->connection->link;

            $conn->begin_transaction();

            // 1. Actualizar el Tiquete al estado PENDIENTE (1) y método Manual (1)
            // idTecnicoAsignado se establece a NULL
            $stmtTicket = $conn->prepare("UPDATE tiquete SET idEstado = ?, idTecnicoAsignado = NULL, idMetodoAsignacion = ? WHERE idTiquete = ?");
            $stmtTicket->bind_param("iii", $idNuevoEstado, $idMetodoAsignacion, $idTicket);
            if (!$stmtTicket->execute()) throw new Exception("Error al actualizar el tiquete en fallback.");
            $stmtTicket->close();
            
            // 2. Registrar el movimiento en el Historial del Tiquete
            $result = $this->historyModel->getNextId($idTicket, $conn); 
            $nextHistoryId = (is_array($result) && count($result) > 0 && is_object($result[0])) ? ((int)$result[0]->maxId + 1) : 1;
            
            $idUsuarioSistema = self::ID_USUARIO_SISTEMA;
            
            $stmtHist = $conn->prepare("INSERT INTO historial_tiquete (idHistorialTiquete, idTiquete, fecha, idUsuario, observacion, idEstado) 
                                        VALUES (?, ?, NOW(), ?, ?, ?)");
            $stmtHist->bind_param("iissi", $nextHistoryId, $idTicket, $idUsuarioSistema, $observation, $idNuevoEstado);
            
            if (!$stmtHist->execute()) throw new Exception("Error al registrar el historial en fallback.");
            $stmtHist->close();

            $conn->commit(); 
        } catch (Exception $ex) {
            if ($conn) {
                $conn->rollback(); 
            }
            error_log("ERROR: Fallback a Asignación Manual falló. El ticket permanece en su estado original. Detalle: " . $ex->getMessage());
        } finally {
            if ($conn) {
                $conn->close();
            }
        }
    }
}
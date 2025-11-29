<?php

class NotificationModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    /**
     * Crea una nueva notificación.
     * @param int $idTipoNotificacion Tipo de notificación (1: Cambio Estado Ticket, 2: Inicio Sesión)
     * @param int $idUsuarioRemitente Usuario que genera la acción
     * @param int $idUsuarioDestinatario Usuario que recibe la notificación
     * @param string $descripcion Mensaje de la notificación
     * @param int|null $idTiquete ID del ticket relacionado (null si no aplica)
     * @return bool True si se creó exitosamente
     */
    public function createNotification(
        int $idTipoNotificacion,
        int $idUsuarioRemitente,
        int $idUsuarioDestinatario,
        string $descripcion,
        ?int $idTiquete = null
    ) {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;

            // Obtener el siguiente ID
            $queryMaxId = "SELECT COALESCE(MAX(idNotificacion), 0) + 1 as nextId FROM notificacion";
            $resultId = $conn->query($queryMaxId);
            $nextId = $resultId->fetch_assoc()['nextId'];

            // Estado inicial: No Leída (1)
            $idEstadoNotificacion = 1;

            // Configurar zona horaria de Costa Rica
            date_default_timezone_set('America/Costa_Rica');
            $fecha = date('Y-m-d H:i:s');

            // Manejar idTiquete nullable correctamente
            if ($idTiquete === null) {
                $stmt = $conn->prepare(
                    "INSERT INTO notificacion 
                    (idNotificacion, idTipoNotificacion, idUsuarioRemitente, idUsuarioDestinatario, 
                    fecha, descripcion, idEstadoNotificacion, idTiquete) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NULL)"
                );

                $stmt->bind_param(
                    "iiiissi",
                    $nextId,
                    $idTipoNotificacion,
                    $idUsuarioRemitente,
                    $idUsuarioDestinatario,
                    $fecha,
                    $descripcion,
                    $idEstadoNotificacion
                );
            } else {
                $stmt = $conn->prepare(
                    "INSERT INTO notificacion 
                    (idNotificacion, idTipoNotificacion, idUsuarioRemitente, idUsuarioDestinatario, 
                    fecha, descripcion, idEstadoNotificacion, idTiquete) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                );

                $stmt->bind_param(
                    "iiiissii",
                    $nextId,
                    $idTipoNotificacion,
                    $idUsuarioRemitente,
                    $idUsuarioDestinatario,
                    $fecha,
                    $descripcion,
                    $idEstadoNotificacion,
                    $idTiquete
                );
            }

            $result = $stmt->execute();
            $stmt->close();
            $conn->close();

            return $result;
        } catch (Exception $ex) {
            handleException($ex);
            return false;
        }
    }

    /**
     * Obtiene todas las notificaciones de un usuario.
     * @param int $idUsuario ID del usuario
     * @return array Notificaciones del usuario
     */
    public function getNotificationsByUser(int $idUsuario)
    {
        try {
            $query = "SELECT 
                        n.idNotificacion,
                        n.idTipoNotificacion,
                        tn.nombre as tipoNotificacion,
                        n.idUsuarioRemitente,
                        CONCAT(ur.nombre, ' ', ur.primerApellido) as usuarioRemitente,
                        n.fecha,
                        n.descripcion,
                        n.idEstadoNotificacion,
                        en.nombre as estadoNotificacion,
                        n.idTiquete
                    FROM notificacion n
                    INNER JOIN tipo_notificacion tn ON n.idTipoNotificacion = tn.idTipoNotificacion
                    INNER JOIN usuario ur ON n.idUsuarioRemitente = ur.idUsuario
                    INNER JOIN estado_notificacion en ON n.idEstadoNotificacion = en.idEstadoNotificacion
                    WHERE n.idUsuarioDestinatario = $idUsuario
                    ORDER BY n.fecha DESC";

            $result = $this->connection->ExecuteSQL($query);
            return is_array($result) ? $result : [];
        } catch (Exception $ex) {
            handleException($ex);
            return [];
        }
    }

    /**
     * Obtiene notificaciones no leídas de un usuario.
     * @param int $idUsuario ID del usuario
     * @return array Notificaciones no leídas
     */
    public function getUnreadNotificationsByUser(int $idUsuario)
    {
        try {
            $query = "SELECT 
                        n.idNotificacion,
                        n.idTipoNotificacion,
                        tn.nombre as tipoNotificacion,
                        n.idUsuarioRemitente,
                        CONCAT(ur.nombre, ' ', ur.primerApellido) as usuarioRemitente,
                        n.fecha,
                        n.descripcion,
                        n.idEstadoNotificacion,
                        en.nombre as estadoNotificacion,
                        n.idTiquete
                    FROM notificacion n
                    INNER JOIN tipo_notificacion tn ON n.idTipoNotificacion = tn.idTipoNotificacion
                    INNER JOIN usuario ur ON n.idUsuarioRemitente = ur.idUsuario
                    INNER JOIN estado_notificacion en ON n.idEstadoNotificacion = en.idEstadoNotificacion
                    WHERE n.idUsuarioDestinatario = $idUsuario
                    AND n.idEstadoNotificacion = 1
                    ORDER BY n.fecha DESC";

            $result = $this->connection->ExecuteSQL($query);
            return is_array($result) ? $result : [];
        } catch (Exception $ex) {
            handleException($ex);
            return [];
        }
    }

    /**
     * Cuenta las notificaciones no leídas de un usuario.
     * @param int $idUsuario ID del usuario
     * @return int Cantidad de notificaciones no leídas
     */
    public function countUnreadNotifications(int $idUsuario)
    {
        try {
            $query = "SELECT COUNT(*) as total 
                     FROM notificacion 
                     WHERE idUsuarioDestinatario = $idUsuario 
                     AND idEstadoNotificacion = 1";

            $result = $this->connection->ExecuteSQL($query);
            return $result[0]->total ?? 0;
        } catch (Exception $ex) {
            handleException($ex);
            return 0;
        }
    }

    /**
     * Marca una notificación como leída.
     * @param int $idNotificacion ID de la notificación
     * @param int $idUsuario ID del usuario (para validación)
     * @return bool True si se actualizó exitosamente
     */
    public function markAsRead(int $idNotificacion, int $idUsuario)
    {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;

            // Validar que la notificación pertenece al usuario
            $stmt = $conn->prepare(
                "UPDATE notificacion 
                SET idEstadoNotificacion = 2 
                WHERE idNotificacion = ? 
                AND idUsuarioDestinatario = ?"
            );

            $stmt->bind_param("ii", $idNotificacion, $idUsuario);
            $result = $stmt->execute();
            $stmt->close();
            $conn->close();

            return $result;
        } catch (Exception $ex) {
            handleException($ex);
            return false;
        }
    }

    /**
     * Obtiene todos los administradores activos.
     * @return array IDs de los administradores
     */
    public function getAllAdministrators()
    {
        try {
            $query = "SELECT idUsuario FROM usuario WHERE idRol = 3 AND estado = 1";
            $result = $this->connection->ExecuteSQL($query);

            // Validación defensiva: verificar que sea array antes de usar array_map
            if (!is_array($result) || empty($result)) {
                return [];
            }

            return array_map(function ($admin) {
                return $admin->idUsuario;
            }, $result);
        } catch (Exception $ex) {
            handleException($ex);
            return [];
        }
    }

    /**
     * Crea notificación de inicio de sesión.
     * Notifica únicamente al usuario que inició sesión.
     * @param int $idUsuario ID del usuario que inició sesión
     * @param string $nombreUsuario Nombre completo del usuario
     * @return bool True si se creó la notificación
     */
    public function createLoginNotification(int $idUsuario, string $nombreUsuario)
    {
        try {
            $descripcion = "Inicio de sesión detectado para: $nombreUsuario";
            $idTipoNotificacion = 2; // Tipo: Inicio de Sesión

            // Notificar solo al mismo usuario
            $this->createNotification($idTipoNotificacion, $idUsuario, $idUsuario, $descripcion);

            return true;
        } catch (Exception $ex) {
            handleException($ex);
            return false;
        }
    }


    /**
     * MÉTODO PARA QUE LO LLAMEN AL CAMBIAR ESTADO DE TICKET
     * 
     * Crea notificaciones según el flujo de cambio de estado.
     * IMPORTANTE: Llamar este método después de actualizar el estado del ticket.
     * 
     * @param int $idTiquete ID del ticket
     * @param int $estadoAnterior ID del estado anterior (1-6)
     * @param int $estadoNuevo ID del nuevo estado (1-6)
     * @param int $idUsuarioResponsable Usuario que realiza el cambio
     * @param string $motivo Razón del cambio de estado
     * @return bool True si se crearon las notificaciones
     * 
     * EJEMPLO DE USO:
     * $notificationModel = new NotificationModel();
     * $notificationModel->createTicketStatusNotification(40, 1, 2, 2, "Ticket asignado automáticamente");
     */
    public function createTicketStatusNotification(
        int $idTiquete,
        int $estadoAnterior,
        int $estadoNuevo,
        int $idUsuarioResponsable,
        string $motivo
    ) {
        try {
            // Obtener información del ticket
            $query = "SELECT 
                    t.idUsuarioSolicita,
                    t.idTecnicoAsignado,
                    t.titulo,
                    ea.nombre as estadoAnteriorNombre,
                    en.nombre as estadoNuevoNombre
                FROM tiquete t
                INNER JOIN estado_tiquete ea ON ea.idEstadoTiquete = $estadoAnterior
                INNER JOIN estado_tiquete en ON en.idEstadoTiquete = $estadoNuevo
                WHERE t.idTiquete = $idTiquete";

            $result = $this->connection->ExecuteSQL($query);

            if (empty($result)) {
                return false;
            }

            $ticket = $result[0];
            $idTipoNotificacion = 1; // Tipo: Cambio de Estado de Ticket

            $descripcion = "Ticket #$idTiquete '$ticket->titulo' cambió de '$ticket->estadoAnteriorNombre' a '$ticket->estadoNuevoNombre'. Motivo: $motivo";

            // Determinar destinatarios según el flujo
            $destinatarios = [];

            // Nuevo ticket creado (NULL -> Pendiente) -> Administradores
            if ($estadoAnterior == 0 || $estadoNuevo == 1) {
                $destinatarios = $this->getAllAdministrators();
            }
            // Pendiente -> Asignado: Cliente + Técnico
            else if ($estadoAnterior == 1 && $estadoNuevo == 2) {
                $destinatarios[] = $ticket->idUsuarioSolicita;
                if ($ticket->idTecnicoAsignado) {
                    $destinatarios[] = $ticket->idTecnicoAsignado;
                }
            }
            // Asignado -> En Progreso: Cliente + Técnico
            else if ($estadoAnterior == 2 && $estadoNuevo == 3) {
                $destinatarios[] = $ticket->idUsuarioSolicita;
                if ($ticket->idTecnicoAsignado) {
                    $destinatarios[] = $ticket->idTecnicoAsignado;
                }
            }
            // En Progreso -> Resuelto: Solo Cliente
            else if ($estadoAnterior == 3 && $estadoNuevo == 4) {
                $destinatarios[] = $ticket->idUsuarioSolicita;
            }
            // Resuelto -> Cerrado: Solo Técnico
            else if ($estadoAnterior == 4 && $estadoNuevo == 5) {
                if ($ticket->idTecnicoAsignado) {
                    $destinatarios[] = $ticket->idTecnicoAsignado;
                }
            }
            // Resuelto -> Devuelto o Devuelto -> En Progreso: Cliente + Técnico
            else if (($estadoAnterior == 4 && $estadoNuevo == 6) ||
                ($estadoAnterior == 6 && $estadoNuevo == 3)
            ) {
                $destinatarios[] = $ticket->idUsuarioSolicita;
                if ($ticket->idTecnicoAsignado) {
                    $destinatarios[] = $ticket->idTecnicoAsignado;
                }
            }

            // Crear notificaciones para cada destinatario
            $destinatarios = array_unique($destinatarios); // Evitar duplicados
            foreach ($destinatarios as $idDestinatario) {
                $this->createNotification(
                    $idTipoNotificacion,
                    $idUsuarioResponsable,
                    $idDestinatario,
                    $descripcion,
                    $idTiquete
                );
            }

            return true;
        } catch (Exception $ex) {
            handleException($ex);
            return false;
        }
    }
}

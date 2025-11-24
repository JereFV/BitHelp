<?php

class NotificationController
{
    private $notificationModel;
    private $request;
    private $response;

    public function __construct()
    {
        $this->notificationModel = new NotificationModel();
        $this->request = new Request();
        $this->response = new Response();
    }

    /**
     * GET /NotificationController
     * Obtiene todas las notificaciones del usuario autenticado
     */
    public function index()
    {
        try {
            $token = $this->getBearerToken();
            if (!$token) {
                $this->response->error(401, 'No autenticado');
                return;
            }

            $payload = JWT::decode($token);
            $notifications = $this->notificationModel->getNotificationsByUser($payload->idUsuario);

            $this->response->status(200)->toJSON([
                'status' => 200,
                'result' => 'Notificaciones obtenidas',
                'data' => $notifications
            ]);
        } catch (Exception $e) {
            $this->response->error(500, 'Error al obtener notificaciones: ' . $e->getMessage());
        }
    }

    /**
     * GET /NotificationController/unread
     * Obtiene solo las notificaciones no leídas del usuario
     */
    public function unread()
    {
        try {
            $token = $this->getBearerToken();
            if (!$token) {
                $this->response->error(401, 'No autenticado');
                return;
            }

            $payload = JWT::decode($token);
            $notifications = $this->notificationModel->getUnreadNotificationsByUser($payload->idUsuario);

            $this->response->status(200)->toJSON([
                'status' => 200,
                'result' => 'Notificaciones no leídas obtenidas',
                'data' => $notifications
            ]);
        } catch (Exception $e) {
            $this->response->error(500, 'Error al obtener notificaciones: ' . $e->getMessage());
        }
    }

    /**
     * GET /NotificationController/count
     * Obtiene el contador de notificaciones no leídas
     */
    public function count()
    {
        try {
            $token = $this->getBearerToken();
            if (!$token) {
                $this->response->error(401, 'No autenticado');
                return;
            }

            $payload = JWT::decode($token);
            $count = $this->notificationModel->countUnreadNotifications($payload->idUsuario);

            $this->response->status(200)->toJSON([
                'status' => 200,
                'result' => 'Contador obtenido',
                'data' => ['count' => $count]
            ]);
        } catch (Exception $e) {
            $this->response->error(500, 'Error al contar notificaciones: ' . $e->getMessage());
        }
    }

    /**
     * PUT /NotificationController/{id}/read
     * Marca una notificación como leída
     */
    public function update($idNotificacion)
    {
        try {
            $token = $this->getBearerToken();
            if (!$token) {
                $this->response->error(401, 'No autenticado');
                return;
            }

            $payload = JWT::decode($token);
            $result = $this->notificationModel->markAsRead($idNotificacion, $payload->idUsuario);

            if ($result) {
                $this->response->status(200)->toJSON([
                    'status' => 200,
                    'result' => 'Notificación marcada como leída'
                ]);
            } else {
                $this->response->error(400, 'No se pudo marcar la notificación');
            }
        } catch (Exception $e) {
            $this->response->error(500, 'Error al marcar notificación: ' . $e->getMessage());
        }
    }

    /**
     * Obtener token del header Authorization
     */
    private function getBearerToken()
    {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $matches = [];
            preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches);
            return isset($matches[1]) ? $matches[1] : null;
        }
        
        return null;
    }
}
<?php
class AuthController {
    private $userModel;
    private $request;
    private $response;

    public function __construct() {
        $this->userModel = new UserModel();
        $this->request = new Request();
        $this->response = new Response();
    }

    /**
 * POST /auth/login
 * Body: { "credential": "usuario o correo", "password": "contraseña" }
 */
public function login() {
    try {
        $data = $this->request->getJSON();

        // Validar datos
        if (empty($data->credential) || empty($data->password)) {
            $this->response->error(400, 'Credencial y contraseña son requeridos');
            return;
        }

        // Buscar usuario
        $user = $this->userModel->getUserByCredential($data->credential);

        if (!$user) {
            $this->response->error(401, 'Credenciales inválidas');
            return;
        }

        // Verificar contraseña
        if (!password_verify($data->password, $user->contrasenna)) {
            $this->response->error(401, 'Credenciales inválidas');
            return;
        }

        // Verificar estado activo
        if ($user->estado != 1) {
            $this->response->error(403, 'Usuario inactivo');
            return;
        }

        //Crear notificación de inicio de sesión
        $notificationModel = new NotificationModel();
        $nombreCompleto = $user->nombre . ' ' . $user->primerApellido . ' ' . $user->segundoApellido;
        $notificationModel->createLoginNotification($user->idUsuario, $nombreCompleto);

        // Generar token JWT
        $payload = [
            'idUsuario' => $user->idUsuario,
            'usuario' => $user->usuario,
            'nombre' => $user->nombre,
            'primerApellido' => $user->primerApellido,
            'segundoApellido' => $user->segundoApellido,
            'idRol' => $user->idRol,
            'correo'=> $user->correo,
        ];

        $token = JWT::encode($payload);

        // Respuesta exitosa
        $this->response->status(200)->toJSON([
            'status' => 200,
            'result' => 'Login exitoso',
            'data' => [
                'token' => $token,
                'user' => $payload
            ]
        ]);

    } catch (Exception $e) {
        $this->response->error(500, 'Error en el servidor: ' . $e->getMessage());
    }
}

    /**
     * POST /auth/logout
     * Header: Authorization: Bearer {token}
     */
    public function logout() {
        try {
            $token = $this->getBearerToken();

            if (!$token) {
                $this->response->error(401, 'Token no proporcionado');
                return;
            }

            JWT::decode($token); // Validar token

            $this->response->status(200)->toJSON([
                'status' => 200,
                'result' => 'Logout exitoso'
            ]);

        } catch (Exception $e) {
            $this->response->error(401, 'Token inválido: ' . $e->getMessage());
        }
    }

    /**
     * GET /auth/check
     * Header: Authorization: Bearer {token}
     */
    public function checkAuth() {
        try {
            $token = $this->getBearerToken();

            if (!$token) {
                $this->response->error(401, 'No autenticado');
                return;
            }

            $payload = JWT::decode($token);

            $this->response->status(200)->toJSON([
                'status' => 200,
                'result' => 'Sesión activa',
                'data' => [
                    'user' => [
                        'idUsuario' => $payload->idUsuario,
                        'usuario' => $payload->usuario,
                        'nombre' => $payload->nombre,
                        'primerApellido' => $payload->primerApellido,
                        'segundoApellido' => $payload->segundoApellido,
                        'idRol' => $payload->idRol
                    ]
                ]
            ]);

        } catch (Exception $e) {
            $this->response->error(401, 'Sesión inválida: ' . $e->getMessage());
        }
    }

    /**
     * Obtener token del header Authorization
     */
    private function getBearerToken() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $matches = [];
            preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches);
            return isset($matches[1]) ? $matches[1] : null;
        }
        
        return null;
    }
}
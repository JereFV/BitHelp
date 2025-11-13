<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";


class user
{
    private $secret_key = 'e0d17975bc9bd57eee132eecb6da6f11048e8a88506cc3bffc7249078cf2a77a';
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $usuario = new UserModel();
        $result = $usuario->all();
        //Dar respuesta
        $response->toJSON($result);
    }
    public function get($param)
    {
        $response = new Response();
        $usuario = new UserModel();
        $result = $usuario->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
    public function getAllUsers()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $usuario = new UserModel();
        $result = $usuario->getAllUsers();
        //Dar respuesta
        $response->toJSON($result);
    }
    /*
    public function customerbyShopRental($idShopRental)
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $usuario = new UserModel();
        $result = $usuario->customerbyShopRental($idShopRental);
        //Dar respuesta
        $response->toJSON($result);
    }
    */
    public function login()
    {
        $response = new Response();
        $request = new Request();
        //Obtener json enviado
        $inputJSON = $request->getJSON();
        $usuario = new UserModel();
        $result = $usuario->login($inputJSON);
        if (isset($result) && !empty($result) && $result != false) {
            $response->toJSON($result);
        } else {
            $response->toJSON($response, "Usuario no valido");
        }
    }
    public function create()
    {
        $response = new Response();
        $request = new Request();
        
        // Obtener json enviado
        $inputJSON = $request->getJSON();
        $usuario = new UserModel();
        
        // Llama al modelo. El modelo se encarga de usar los campos: nombre, correo, contrasenna, idRol, etc.
        $result = $usuario->create($inputJSON); 
        
        // Dar respuesta
        $response->toJSON($result);
    }

   // UserModel.php - Método update
    public function update($param) 
    {
        $response = new Response();
        $request = new Request();
        
        // Obtener JSON enviado
        $inputJSON = $request->getJSON();
        
        // Asignar el ID de la URL al objeto de datos
        $inputJSON->idUsuario = $param; 
        
        $usuario = new UserModel();
        
        try {
            // Ejecutar la actualización en el Modelo
            $result = $usuario->update($inputJSON);
            
            // Verificar si se encontró y actualizó el usuario
            if (is_null($result)) {
                // Si el Modelo devuelve null (ej: el ID no existe en DB)
                $response->error(404, "Usuario no encontrado para el ID: " . $param);
            } else {
                // Dar respuesta con éxito (200 OK)
                $response->toJSON($result);
            }
        } catch (\Exception $e) {
            // Capturar cualquier error lanzado desde el Modelo (ej: duplicidad de correo)
            // handleException debería devolver un código 400 o 500
            handleException($e); 
        }
    }

    public function updatePassword($id)
    {
        $response = new Response(); // Asume que tienes una clase Response para JSON

        try {
            // 1. Obtener JSON enviado
            $request = new Request();
            // Asume que getJSON() utiliza file_get_contents('php://input') y json_decode
            $objeto = $request->getJSON(); 
            
            // 2. Verificar que la contraseña esté presente (usando la clave del frontend)
            if (!isset($objeto->contrasenna) || empty($objeto->contrasenna)) {
                $response->toJSON(['message' => 'Contraseña nueva requerida.'], 400); // Bad Request
                return;
            }
            
            // 3. Llamar al modelo
            $model = new UserModel();
            // Le pasamos el ID de la URL y la contraseña del payload
            $result = $model->updatePassword($id, $objeto->contrasenna); 
            
            // 4. Verificar si el modelo encontró y actualizó el usuario
            if ($result === null) {
                $response->toJSON(['message' => "Usuario con ID $id no encontrado."], 404); // Not Found
                return;
            }

            // 5. Respuesta de éxito
            $response->toJSON([
                'message' => 'Contraseña actualizada correctamente.',
                'user' => $result // Opcionalmente, puedes retornar el usuario
            ], 200);

        } catch (Exception $e) {
            // Captura cualquier excepción lanzada desde el Model (validación o fallo DB)
            $response->toJSON(['message' => $e->getMessage()], 500); // Internal Server Error
        }
    }

    public function delete($param) // $param es el ID del usuario
    {
        $response = new Response();
        $usuario = new UserModel();
        
        $result = $usuario->delete($param); 
        
        // Si el resultado es > 0, significa que la operación fue exitosa
        if ($result > 0) {
             $response->toJSON(['message' => 'Usuario eliminado correctamente'], 200);
        } else {
             $response->toJSON(['message' => 'Error al eliminar usuario o ID no encontrado'], 404);
        }
    }
}

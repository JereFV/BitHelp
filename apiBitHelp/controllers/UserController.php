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
    public function allCustomer()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $usuario = new UserModel();
        $result = $usuario->allCustomer();
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

    public function update($param) // $param es el ID del usuario
    {
        $response = new Response();
        $request = new Request();
        
        // Obtener JSON enviado (datos actualizados del frontend)
        $inputJSON = $request->getJSON();
        
        // Asignar el ID de la URL al objeto de datos para que el Modelo sepa qué fila actualizar
        $inputJSON->idUsuario = $param; 
        
        $usuario = new UserModel();
        $result = $usuario->update($inputJSON);
        
        // Dar respuesta
        $response->toJSON($result);
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

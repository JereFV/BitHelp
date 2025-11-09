<?php

class Response
{
    private $status = 200;

    /**
     * Establece el código de estado HTTP para la respuesta. Permite encadenamiento.
     * @param int $code El código de estado HTTP.
     * @return Response La instancia actual de Response.
     */
    public function status(int $code)
    {
        $this->status = $code;
        return $this;
    }
    
    /**
     * Devuelve una respuesta JSON. Idealmente para respuestas de éxito (2xx).
     *
     * @param mixed $data Los datos a devolver.
     */
    public function toJSON($data = [])
    {
        // 1. Establece el código de respuesta HTTP.
        http_response_code($this->status); 
        
        // 2. Establece el encabezado JSON.
        header('Content-Type: application/json');
        
        // 3. Imprime la respuesta JSON.
        echo json_encode($data);
        
        // Finaliza la ejecución.
        exit;
    }

    /**
     * Devuelve una respuesta JSON para errores, estableciendo el código HTTP.
     *
     * @param int $statusCode El código de estado HTTP (ej. 400, 404, 500).
     * @param string $message El mensaje de error o el resultado detallado.
     */
    public function error(int $statusCode, string $message)
    {
        // 1. Establece el código de respuesta HTTP.
        http_response_code($statusCode); 
        
        // 2. Crea la estructura JSON de error/resultado.
        $json = array(
            'status' => $statusCode,
            'result' => $message
        );

        // 3. Imprime la respuesta JSON.
        header('Content-Type: application/json');
        echo json_encode($json);
        
        // Finaliza la ejecución.
        exit;
    }
}
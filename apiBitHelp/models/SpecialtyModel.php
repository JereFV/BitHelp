<?php
class SpecialtyModel
{
    public $connection;

    public function __construct() 
    {
        $this->connection = new MySqlConnect();
    }

    //Obtiene la prioridad del tiquete en la tabla de catálogo a partir del código enviado.
    public function get($id)
    {
        try
        {
            $query = "SELECT idEspecialidad, nombre
                     FROM especialidad
                     WHERE idEspecialidad = $id";

            $specialty = $this->connection->executeSQL($query);

            return $specialty;
        }
        catch (Exception $ex){
            handleException($ex);
        }    
    }
}
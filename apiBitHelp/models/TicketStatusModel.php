<?php
class TicketStatusModel
{
    public $connection;

    public function __construct() 
    {
        $this->connection = new MySqlConnect();
    }

    //Obtiene el estado del tiquete en la tabla de catálogo a partir del código enviado.
    public function get($id)
    {
        try
        {
            $query = "SELECT idEstadoTiquete, nombre
                  FROM estado_tiquete
                  WHERE idEstadoTiquete = $id";

            $statusTicket = $this->connection->executeSQL($query);

            return $statusTicket;
        }
        catch (Exception $ex){
            handleException($ex);
        }    
    }
}
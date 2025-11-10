<?php
class TicketPriorityModel
{
    public $connection;

    public function __construct() 
    {
        $this->connection = new MySqlConnect();
    }

    //Obtiene todas las prioridades de tiquete existentes en el catálogo interno.
    public function getAll()
    {
        try
        {
            $query = "SELECT *
                      FROM prioridad_tiquete";

            $ticketPriority = $this->connection->executeSQL($query);

            return $ticketPriority;
        }
        catch (Exception $ex){
            handleException($ex);
        }    
    }

    //Obtiene la prioridad del tiquete en la tabla de catálogo a partir del código enviado.
    public function get($id)
    {
        try
        {
            $query = "SELECT idPrioridadTiquete, nombre
                  FROM prioridad_tiquete
                  WHERE idPrioridadTiquete = $id";

            $ticketPriority = $this->connection->executeSQL($query);

            return $ticketPriority;
        }
        catch (Exception $ex){
            handleException($ex);
        }    
    }
}
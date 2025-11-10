<?php
class TicketTagModel
{
    public $connection;

    public function __construct() 
    {
        $this->connection = new MySqlConnect();
    }

    //Obtiene todas las etiquetas de tiquetes existentes en el catálogo interno.
    public function getAll()
    {
        try
        {
            $query = "SELECT *
                      FROM etiqueta";

            $tags = $this->connection->executeSQL($query);

            return $tags;
        }
        catch (Exception $ex){
            handleException($ex);
        }    
    }
}
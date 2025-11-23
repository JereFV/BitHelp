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
    /**
     * Obtiene el puntaje numérico de la prioridad para el cálculo de Autotriage.
     * @param int $id ID de la prioridad del tiquete.
     * @return int Puntaje numérico asociado a la prioridad.
     */
    public function getScore($id)
    {
        try
        {

            $query = "SELECT COALESCE(puntaje, 1) as puntaje 
                    FROM prioridad_tiquete
                    WHERE idPrioridadTiquete = $id";

            $result = $this->connection->executeSQL($query);

            $result = $result ?: [];
            return $result[0]->puntaje ?? 1;
        }
        catch (Exception $ex){
            handleException($ex);
            return 1; // Prioridad por defecto
        }
    }
    
}
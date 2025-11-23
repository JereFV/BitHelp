<?php

class TicketStatusFlowModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }
    
    //Obtiene los estados a los cuales se puede mover el tiquete según el estado actual.
    public function get($id)
    {
        try
        {
            $query = "SELECT a.idNuevoEstado, b.nombre
                      FROM flujo_estado_tiquete a
                      INNER JOIN estado_tiquete b
                      ON a.idNuevoEstado = b.idEstadoTiquete
                      WHERE a.idEstadoActual = $id";

            $ticketStates = $this->connection->executeSQL($query);

            return $ticketStates;
        }
        catch (Exception $ex){
            handleException($ex);
        }
    }
}
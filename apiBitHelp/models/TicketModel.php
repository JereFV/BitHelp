<?php
class TicketModel
{
    public $conexion;

    public function _construct()
    {
        $this->$connection = new MySqlConnect();
    }

    public function getAll()
    {
        try {
            //Consulta.
            $query = "SELECT * FROM tiquete
            INNER JOIN especialidad ON tiquete";

            //Ejecucción de la consulta.
            $tickets = this->$conexion->ExecuteSQL($query);

            return $tickets;
        } 
        catch (Exception $ex)
        {
            handleException(ex);
        }
    }
} 
<?php
class TicketAsignationModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    // Obtiene los detalles de un método de asignación (catálogo) a partir de su ID.
    public function get($id)
    {
        try
        {
            $query = "SELECT idMetodoAsignacion, nombre
                      FROM metodo_asignacion
                      WHERE idMetodoAsignacion = $id";

            $method = $this->connection->executeSQL($query);

            return $method; // Debe retornar un array de objetos
        }
        catch (Exception $ex){           
            handleException($ex);
            return []; // Retorna un array vacío si falla, para evitar un crash.
        }
    }
}
?>
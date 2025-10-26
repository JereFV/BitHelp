<?php
// Sustituye CategorieModel por TechnicianModel
class TechnicianModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    /**
     * Obtiene todos los técnicos, incluyendo la información de su usuario.
     * @return array|null Los técnicos encontrados.
     */
    public function getAllTechnicians()
    {
        try {
            // Consulta SQL para obtener los técnicos y combinar con la tabla 'usuario'.
            $query = "SELECT 
                        t.idTecnico,
                        t.idUsuario,
                        t.idDisponibilidad,
                        t.cargaTrabajo,
                        t.estado,
                        u.nombre,
                        u.primerApellido,
                        u.segundoApellido,
                        u.correo,
                        u.telefono
                      FROM 
                        tecnico t
                      INNER JOIN 
                        usuario u ON t.idUsuario = u.idUsuario";

            // Ejecución de la consulta.
            $technicians = $this->connection->ExecuteSQL($query);

            return $technicians;
        } 
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }
    
    // Aquí puedes añadir otros métodos como getById, create, update, etc.
}
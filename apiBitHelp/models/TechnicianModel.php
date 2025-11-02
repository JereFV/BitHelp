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
 * Obtiene todos los técnicos, incluyendo la información de su usuario y sus especialidades.
 * @return array|null Los técnicos encontrados.
 */
public function getAllTechnicians()
{
    try {
        // Consulta SQL para obtener los técnicos, especialidades y combinar con la tabla 'usuario'.
        $query = "SELECT
                    t.idTecnico,
                    t.idUsuario,
                    dt.nombre AS disponibilidad, 
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
                    usuario u ON t.idUsuario = u.idUsuario
                INNER JOIN
                    disponibilidad_tecnico dt ON t.idDisponibilidad = dt.idDisponibilidad;";
        // Ejecución de la consulta.
        $technicians = $this->connection->ExecuteSQL($query);

        // Iterar sobre cada técnico para añadir sus especialidades
        foreach ($technicians as $tech) {
            
            // Query secundario para obtener las especialidades de ESTE técnico
            $specialtyQuery = "SELECT e.nombre 
                               FROM tecnico_especialidad te
                               INNER JOIN especialidad e ON te.idEspecialidad = e.idEspecialidad
                               WHERE te.idTecnico = " . $tech->idTecnico;
            
            $specialtiesResult = $this->connection->ExecuteSQL($specialtyQuery);
            
            // Mapear los resultados (objetos) a un array simple de strings (nombres)
            // Esto creará el array [ "Soporte Redes", "Hardware", ... ]
            $tech->especialidades = array_map(function($spec) {
                return $spec->nombre;
            }, $specialtiesResult);
        }
        return $technicians;
    } catch (Exception $ex) {
        handleException($ex);
    }
}

    // Aquí puedes añadir otros métodos como getById, create, update, etc.
}

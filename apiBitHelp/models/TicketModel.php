<?php
class TicketModel
{
    public $conexion;

    public function __construct()
    {
        // Inicializa la conexión a la base de datos.
        $this->conexion = new MySqlConnect();
    }

    public function getAll()
    {
        try {
            // Consulta SQL estructurada con joins y cálculo de tiempo restante (horas)
            $query = "
                SELECT 
                    t.idTiquete AS id,
                    t.idTiquete AS numero,
                    COALESCE(t.titulo, '') AS titulo,
                    COALESCE(t.descripcion, '') AS descripcion,
                    COALESCE(e.nombre, 'Sin estado') AS estado,
                    COALESCE(p.nombre, 'Sin prioridad') AS prioridad,
                    CONCAT(COALESCE(u.nombre,''), ' ', COALESCE(u.primerApellido,''), ' ', COALESCE(u.segundoApellido,'')) AS tecnico,
                    TIMESTAMPDIFF(HOUR, NOW(), t.slaResolucion) AS tiempoRestante
                FROM tiquete t
                LEFT JOIN estado_tiquete e ON t.idEstado = e.idEstadoTiquete
                LEFT JOIN prioridad_tiquete p ON t.idPrioridad = p.idPrioridadTiquete
                LEFT JOIN tecnico tec ON t.idTecnicoAsignado = tec.idTecnico
                LEFT JOIN usuario u ON tec.idUsuario = u.idUsuario
                ORDER BY t.idTiquete DESC
            ";

            // Ejecuta la consulta y obtiene todos los resultados.
            $tickets = $this->conexion->ExecuteSQL($query);

            // Retorna la lista de tiquetes.
            return $tickets;
        } catch (Exception $ex) {
            handleException($ex);
        }
    }
}
?>

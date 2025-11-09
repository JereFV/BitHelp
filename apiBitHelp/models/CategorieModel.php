<?php
class CategorieModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    public function getAllCategories()
{
    try {
        $query = "
        SELECT 
            c.idCategoria,
            c.nombre AS nombreCategoria,
            c.estado AS estadoCategoria,
            c.idSla,
            s.tiempoMaxRespuesta,
            s.tiempoMaxResolucion,
            GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR '|||') AS especialidades_concatenadas,
            GROUP_CONCAT(DISTINCT et.nombre ORDER BY et.nombre SEPARATOR '|||') AS etiquetas_concatenadas
        FROM
            categoria c
        INNER JOIN 
            sla s ON c.idSla = s.idSla
        LEFT JOIN
            categoria_especialidad ce ON c.idCategoria = ce.idCategoria
        LEFT JOIN
            especialidad e ON ce.idEspecialidad = e.idEspecialidad
        LEFT JOIN
            etiqueta_categoria ec ON c.idCategoria = ec.idCategoria
        LEFT JOIN
            etiqueta et ON ec.idEtiqueta = et.idEtiqueta
        GROUP BY
            c.idCategoria, c.nombre, c.estado, c.idSla, s.tiempoMaxRespuesta, s.tiempoMaxResolucion
        ORDER BY
            c.idCategoria;
        ";

        $categorie = $this->connection->ExecuteSQL($query);
        return $categorie;
    } 
    catch (Exception $ex) {
        handleException($ex);
    }
}


    //Obtiene la categoría de un tiquete a partir de la especialidad del mismo.
    public function getBySpecialty($idSpecialty)
{
    try {
        $query = "
        SELECT c.idCategoria, c.nombre
        FROM categoria c
        INNER JOIN categoria_especialidad ce ON c.idCategoria = ce.idCategoria
        INNER JOIN especialidad e ON ce.idEspecialidad = e.idEspecialidad
        WHERE e.idEspecialidad = $idSpecialty
        ";

        $categorie = $this->connection->executeSQL($query);
        return $categorie;
    } 
    catch (Exception $ex) {
        handleException($ex);
    }
}

} 
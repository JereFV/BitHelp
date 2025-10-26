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
            //Consulta.
            $query = "SELECT * FROM categoria";

            //Ejecucción de la consulta.
            $categorie = $this->connection->ExecuteSQL($query);

            return $categorie;
        } 
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }

    //Obtiene la categoría de un tiquete a partir de la especialidad del mismo.
    public function getBySpecialty($idSpecialty)
    {
        try
        {
            $query = "SELECT a.idCategoria, a.nombre
                      FROM  categoria a
                      INNER JOIN especialidad b 
                      ON a.idCategoria = b.IdCategoria
                      WHERE b.idEspeciliad = $idSpecialty";

            $categorie = $this->connection->executeSQL($query);

            //Devuelve el nombre y id de la categoria en una estructura.
            return $categorie;
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }
} 
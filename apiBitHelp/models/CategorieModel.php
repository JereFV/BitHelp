<?php
class CategorieModel
{
    public $connection;

    public function _construct()
    {
        $this->$connection = new MySqlConnect();
    }

    public function getAll()
    {
        try {
            //Consulta.
            $query = "SELECT * FROM categoria";

            //Ejecucción de la consulta.
            $tickets = $this->$connection->ExecuteSQL($query);

            return $tickets;
        } 
        catch (Exception $ex)
        {
            handleException(ex);
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

            $categorie = $this->$connection->ExecuteSQL($query);

            //Devuelve el nombre y id de la categoria en una estructura.
            return $categorie;
        } 
        catch (Exception $ex) {
            handleException(ex);
        }
    }
} 
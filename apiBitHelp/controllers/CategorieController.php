<?php
class categorie
{
    public function index()
    {
        try { 
            $response = new Response();
            $categorieModel = new categorieModel();

            //Obtiene las categorías y los devuelve en una estructura JSON como respuesta.
            $categorie = $categorieModel->getAllCategories();
            $response->toJson($categorie);           
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }
}
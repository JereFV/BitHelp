<?php
// Sustituye categorie por technician
class technician
{
    public function index()
    {
        try { 
            // Asume que la clase Response y la función handleException están definidas.
            $response = new Response();
            $technicianModel = new TechnicianModel(); // Usa el nuevo modelo

            // Obtiene los técnicos y los devuelve en una estructura JSON como respuesta.
            $technicians = $technicianModel->getAllTechnicians();
            $response->toJson($technicians);            
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }
}
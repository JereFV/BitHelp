<?php
class categorie
{
    public function index()
    {
        try { 
            $response = new Response();
            $ticketModel = new TicketModel();

            //Obtiene los tiquetes y los devuelve en una estructura JSON como respuesta.
            $tickets = $ticketModel->getAll();
            $response.toJson($tickets);           
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }
}
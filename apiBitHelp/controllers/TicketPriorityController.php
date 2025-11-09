<?php

class TicketPriority 
{
    //Obtener el catálogo de prioridades de tiquetes.
    public function index()
    {
        try 
        { 
            $response = new Response();
            $ticketPriorityModel = new TicketPriorityModel();

            //Obtiene el listado de prioridades y lo devuelve en una estructura JSON como respuesta.
            $ticketPriorities = $ticketPriorityModel->getAll();
            
            $response->toJson($ticketPriorities);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}

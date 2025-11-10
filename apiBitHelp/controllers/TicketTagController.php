<?php

class TicketTag 
{
    //Obtener el catálogo de etiquetas de tiquetes.
    public function index()
    {
        try 
        { 
            $response = new Response();
            $ticketTagModel = new TicketTagModel();

            $ticketTags = $ticketTagModel->getAll();
            
            $response->toJson($ticketTags);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}
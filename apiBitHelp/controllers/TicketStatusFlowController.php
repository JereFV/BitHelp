<?php

class TicketStatusFlow
{
    //Obtener los estados a seleccionar para un nuevo movimiento según el estado actual del tiquete.
    public function get($id)
    {
        try 
        { 
            $response = new Response();
            $ticketTagModel = new TicketStatusFlowModel();

            $ticketStates = $ticketTagModel->get($id);
            
            $response->toJson($ticketStates);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}
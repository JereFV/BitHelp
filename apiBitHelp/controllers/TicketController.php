<?php
class Ticket
{
    public function index()
    {
        try {
            $response = new Response();
            $ticketModel = new TicketModel();

            // Llama al modelo para obtener todos los tickets
            $tickets = $ticketModel->getAll();

            // Devuelve los resultados en formato JSON
            $response->toJson($tickets);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }


    //Obtener los tiquetes según el rol del usuario en sesión.
    public function getAllByRolUser($user)
    {
        try 
        { 
            $response = new Response();
            $ticketModel = new TicketModel();

            //Obtiene los tiquetes y los devuelve en una estructura JSON como respuesta.
            $tickets = $ticketModel->getAllByRolUser($user);
            
            $response->toJson($tickets);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}
?>
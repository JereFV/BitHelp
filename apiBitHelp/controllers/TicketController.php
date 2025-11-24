<?php
class ticket
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
    public function getAllByRolUser($idRole, $idUser)
    {
        try 
        { 
            $response = new Response();
            $ticketModel = new TicketModel();

            //Obtiene los tiquetes y los devuelve en una estructura JSON como respuesta.
            $tickets = $ticketModel->getAllByRolUser($idRole, $idUser);
            
            if ($tickets) 
                $response->toJson($tickets);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    //Obtener el tiquete especifico a partir del parámetro enviado.
    public function get($id)
    {
        try 
        { 
            $response = new Response();
            $ticketModel = new TicketModel();

            //Obtiene el tiquete y lo devuelve en una estructura JSON como respuesta.
            $ticket = $ticketModel->get($id);
            
            $response->toJson($ticket);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    // método para obtener SOLAMENTE los detalles de SLA
    public function getSlaDetails($id)
    {
        try 
        { 
            $response = new Response();
            $ticketModel = new TicketModel();

            // Llama al nuevo método para obtener la información de SLA con cálculos.
            $slaDetails = $ticketModel->getSlaDetails($id);
            
            // Devuelve los detalles del SLA en una estructura JSON.
            $response->toJson($slaDetails);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    //Creación de un nuevo tiquete.
    public function create()
    {
        try 
        { 
            $response = new Response();
            $request = new Request();
            $ticketModel = new TicketModel();

            //Armado de la estructura de entrada, decodificando la estructura JSON enviada como un objeto.
            $decodedRequest = $request->getJson();

            //Agrega el tiquete y obtiene el id creado.
            $ticket = $ticketModel->create($decodedRequest);
            
            $response->toJson($ticket);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    //Actualización del tiquete a partir del nuevo estado definido.
    public function update()
    {
        try 
        {
            $request = new Request();
            $response = new Response();
            $ticketModel = new TicketModel();

            //Armado de la estructura de entrada, decodificando la estructura JSON enviada como un objeto.
            $decodedRequest = $request->getJson();

            //Actualiza y obtiene el tiquete con sus valores actualizados hacia la interfaz.
            $ticket = $ticketModel->update($decodedRequest);   
            
            $response->toJson($ticket);      
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}

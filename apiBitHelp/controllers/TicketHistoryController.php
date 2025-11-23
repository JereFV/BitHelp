<?php
class TicketHistory
{
    //Creación de un nuevo registro en el historial de tiquetes.
    public function create()
    {
        try 
        { 
            $response = new Response();
            $request = new Request();
            $tickeHistoryModel = new TicketModel();

            //Armado de la estructura de entrada, decodificando la estructura JSON enviada como un objeto.
            $decodedRequest = $request->getJson();

            //Agrega el registro y obtiene el historial actualizado del tiquete.
            $ticketHistory = $tickeHistoryModel->create($decodedRequest);
            
            $response->toJson($ticketHistory);           
        }
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}

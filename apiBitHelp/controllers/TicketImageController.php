<?php
class ticketImage
{
    //Almacenamiento de imágenes para un registro específico del historial para determinado tiquete. (Ruta física del archivo)
    public function create()
    {
        try 
        {
            $request = new Request();
            $response = new Response();            
            $ticketImageModel = new TicketImageModel();

            //Obtiene las imágenes a partir de la estructura enviada en la petición.
            $images = $request->getBody();
            
            //Almacenamiento de imágenes, retornando el historial actualizado del tiquete.
            $ticketHistory = $ticketImageModel->uploadImages($images);

            $response->toJSON($ticketHistory);
        } 
        catch (Exception $e) {
            handleException($e);
        }
    }
}
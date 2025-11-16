<?php
class ticketImage
{
    public function create()
    {
        try 
        {
            $request = new Request();            
            $ticketImageModel = new TicketImageModel();

            //Obtiene las imágenes a partir de la estructura enviada en la petición.
            $images = $request->getBody();
            
            //Almacenamiento de imágenes.
            $ticketImageModel->uploadImages($images);
        } 
        catch (Exception $e) {
            handleException($e);
        }
    }
}
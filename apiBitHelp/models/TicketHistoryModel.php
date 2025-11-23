<?php
class TicketHistoryModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    //Obtiene el historial de movimientos para determinado tiquete segun el valor enviado como parámetro.
    public function get($id)
    {
        try
        {
            $userModel = new UserModel();
            $ticketStatusModel = new TicketStatusModel;

            $query = "SELECT * FROM historial_tiquete
                      WHERE idTiquete = $id";

            $ticketHistory = $this->connection->executeSQL($query);

            foreach ($ticketHistory as $ticketHistoryRow)
            {
                //Usuario que registró el movimiento.
                $ticketHistoryRow->usuario = $userModel->get($ticketHistoryRow->idUsuario);

                //Estado del tiquete en ese movimiento a partir del catálogo.
                $ticketHistoryRow->estado = $ticketStatusModel->get($ticketHistoryRow->idEstado)[0];

                //Obtiene las imagenes asociadas a cada movimiento del historial.
                $ticketHistoryRow->imagenes = $this->getImages($ticketHistoryRow->idHistorialTiquete, $ticketHistoryRow->idTiquete);

                //Elimina las propiedades que ya están contenidas en otras estructuras.
                unset($ticketHistoryRow->idUsuario);
                unset($ticket->idEstado);
            }
           
            return $ticketHistory;
        }
        catch(Exception $ex) {
            handleException($ex);
        }
    }

    //Obtiene las imagenes asociadas a determinado tiquete e historial del mismo a partir del valor enviado.
    public function getImages($idTicketHistory, $idTicket)
    {
        try
        {
            $query = "SELECT * FROM imagen_historial_tiquete
                      WHERE idHistorialTiquete = $idTicketHistory
                      AND idTiquete = $idTicket";

            $images = $this->connection->executeSQL($query);

            return $images;
        }
        catch (Exception $ex){
            handleException($ex);
        } 
    }

    /**
     * Obtiene el siguiente ID consecutivo para un nuevo movimiento de historial para un ticket.
     */
    public function getNextId($idTicket)
    {
        try {
            $query = "SELECT COALESCE(MAX(idHistorialTiquete), 0) + 1 AS nextId FROM historial_tiquete WHERE idTiquete = $idTicket";
            $result = $this->connection->executeSQL($query);
            // Retorna 1 si no hay registros, o el siguiente ID.
            return $result[0]->nextId;
        } catch (Exception $ex) {
            handleException($ex);
            return 1;
        }
    }
}
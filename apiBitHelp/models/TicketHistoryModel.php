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
                      WHERE idTiquete = $id
                      ORDER BY idHistorialTiquete DESC";

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

    
    public function getNextId($id, $conn = null) 
    {
        try 
        {
            // 1. Determinar la conexión a usar
            $isTransaction = ($conn !== null);
            
            if (!$isTransaction) {
                // Si no estamos en una transacción, abrimos la conexión de forma normal
                $this->connection->connect();
                $conn = $this->connection->link;
            }

            // Esta consulta no necesita Prepared Statements si el $id se maneja correctamente,
            // pero vamos a usar la conexión $conn para la ejecución.
            $query = "SELECT MAX(idHistorialTiquete) AS maxId FROM historial_tiquete WHERE idTiquete = ?";
            
            // Usar Prepared Statements con la conexión pasada/abierta
            if (!$stmt = $conn->prepare($query)) { 
                throw new \Exception('Error al preparar la sentencia en HistoryModel: ' . $conn->error);
            }

            $stmt->bind_param("i", $id);
            
            if (!$stmt->execute()) {
                throw new \Exception('Error al ejecutar la sentencia en HistoryModel: ' . $stmt->error);
            }

            $result = $stmt->get_result();
            $lista = $result->fetch_all(MYSQLI_ASSOC); // Obtenemos el resultado como array asociativo
            
            $stmt->close();

            // Devolver el resultado (la función que lo llama espera un array de objetos o un objeto)
            // Convertimos el resultado a objeto para compatibilidad con el Handler
            $resultObject = (object) $lista[0];
            
            return [$resultObject] ?? null; // Devolver un array que contiene el objeto, como antes.

        } catch (Exception $ex) {
            handleException($ex);
            return null;
        } finally {
            // Solo cerramos la conexión si NO estamos dentro de una transacción (si $isTransaction es false)
            if (!$isTransaction && isset($conn)) {
                $conn->close();
            }
        }
    }

    //Creación de un nuevo registro en el historial para un tiquete en específico.
    public function create($newTicketHistory)
    {
        try 
        {
            //Obtiene el siguiente secuencial en el historial para el tiquete.
            $idTicketHistory = $this->getNextId($newTicketHistory->idTicket)[0]->maxId + 1;

            $query = "INSERT INTO historial_tiquete VALUES ($idTicketHistory,
                                                            $newTicketHistory->idTicket,
                                                            NOW(),
                                                            $newTicketHistory->idSessionUser,
                                                            '$newTicketHistory->comment',
                                                            $newTicketHistory->idNewState)";
            
            //Inserta el registro.
            $this->connection->executeSQL_DML($query);
        }
        catch(Exception $ex) {
            handleException($ex);
            throw $ex;
        }
    }
}
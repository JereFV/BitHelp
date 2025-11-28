<?php
class TicketImageModel
{
    public $upload_path;

    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
        $this->upload_path = "uploads/";
    }

    //Almacena las imágenes adjuntas en una ruta física y esa misma ruta en base de datos.
    public function uploadImages($object)
    {
        try 
        {
            // Verifica que la clave 'file' exista y que sea un array o un objeto
            // Si no existe o no es un array (por ejemplo, si es un string vacío como "" o null), salimos.
            if (!isset($object["files"]) || !is_array($object["files"]) || empty($object["files"])) {
                return; 
            }

            $ticketHistoryModel = new TicketHistoryModel();
            //Contador auxiliar.
            $counter = 0;

            $images = $object["files"];
            $idTicket = $object["idTicket"];

            foreach ($images as $image)
            {
                //Extraer información de la imagen iterada.
                $fileName = $image['name'];
                $tempPath = $image['tmp_name'];

                //Extraer extensión de la imagen.
                $separatedFileName = explode('.', $fileName);
                $fileExt =  end($separatedFileName);
                               
                //Obtiene el último secuencial registrado en el historial del tiquete.
                $idTicketHistory = $ticketHistoryModel->getNextId($idTicket)[0]->maxId;

                //Aumenta el contador previo a su utilización.
                ++$counter;

                //Ruta del directorio a partir del número de tiquete y último movimiento del historial.
                $directory = "{$this->upload_path}ticket {$idTicket}/idHistory {$idTicketHistory}";

                //Valida la existencia del directorio para crearlo.
                if (!is_dir($directory))
                    mkdir($directory,0777, true);
                
                //Ruta final del archivo añadiendo el directorio, número de imagen en iteración más la extensión del archivo.
                $fileName = "{$directory}/image {$counter}.{$fileExt}";
                
                //Valida si el archivo fue guardado previamente y de ser así lo elimina. (Error durante la inserción en base de datos.)
                if(file_exists($fileName))
                    unlink($fileName);
                
                //Almacena la imagen en la ruta física definida.
                if (move_uploaded_file($tempPath, $fileName)) 
                {       
                    //Al almacenar la imagen física correctamente, ejecuta la inserción en base de datos.         
                    $query = "INSERT INTO imagen_historial_tiquete VALUES ($counter,
                                                                           $idTicketHistory,
                                                                           $idTicket,
                                                                           '$fileName')";
                    $this->connection->executeSQL_DML($query);                   
                }                                                   
            }    
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}

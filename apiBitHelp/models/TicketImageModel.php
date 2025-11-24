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
            if (!isset($object["file"]) || !is_array($object["file"]) || empty($object["file"])) {
                return; 
            }

            $ticketHistoryModel = new TicketHistoryModel();
            //Contador auxiliar.
            $counter = 0;

            $image = $object["file"];
            $idTicket = $object["idTicket"];

            //foreach ($images as $image)
            //{
                //Extraer información de la imagen iterada.
                $fileName = $image['name'];
                $tempPath = $image['tmp_name'];
                $fileSize = $image['size'];
                $fileError = $image['error'];

                //Extraer extensión de la imagen.
                $separatedFileName = explode('.', $fileName);
                $fileExt =  end($separatedFileName);
                
                //Obtiene el último registro en el historial del tiquete con el objetivo de extraer el id en el armado de la ruta.
                $ticketHsitory = $ticketHistoryModel->get($idTicket);               
                $lastTicketHistory = end($ticketHsitory);

                //Aumenta el contador previo a su utilización.
                ++$counter;

                //Ruta del directorio a partir del número de tiquete y último movimiento del historial.
                $directory = "{$this->upload_path}ticket {$idTicket}/idHistory {$lastTicketHistory->idHistorialTiquete}";

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
                                                                           $lastTicketHistory->idHistorialTiquete,
                                                                           $idTicket,
                                                                           '$fileName')";
                    $this->connection->executeSQL_DML($query);                   
                }                                                   
            //}    
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }
}

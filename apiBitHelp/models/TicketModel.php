<?php
class TicketModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    //Obtiene los tiquetes según el rol del usuario en sesión, donde:
    // Rol 1-Cliente: Tiquetes reportados por el usuario.
    // Rol 2-Técnico: Tiquetes que le han sido asignados.
    // Rol 3-Administrador: Todos los tiquetes existentes sin filtro alguno.
    public function getAllByRolUser($user)
    {
        try 
        {
            $categorieModel = new CategorieModel();
            $ticketStatusModel = new TicketStatusModel();
            $ticketHistoryModel = new TicketHistoryModel();

            //Construcción inicial de la consulta.
            $query = "SELECT * FROM tiquete";

            //Construye la consulta según el rol del usuario en sesión
            if ($user->idRol == 1) //Cliente
                $query += "WHERE idUsuarioSolicita = $user->idUsuario";
            else if ($user->idRol == 2) //Técnico
                $query += "WHERE idTecnicoAsignado = $user->idUsuario";

            //Ejecucción de la consulta, obtiendo los tiquetes respectivos.
            $tickets = $this->connection->executeSQL($query);

            //Iteración de elementos para la obtención de valores y estructuras adicionales sobre cada uno de ellos.
            foreach ($tickets as $ticket)
            {
                //Obtiene la categoría de cada tiquete a partir de la especialidad asociada.
                $ticket->categoria = $categorieModel->getBySpecialty($ticket->idEspecialidad)[0];
                
                //Obtiene la estructura completa del estado del tiquete desde el catálogo existente.
                $ticket->estadoTiquete = $ticketStatusModel->get($ticket->idEstadoTiquete)[0];

                //Elimina la propiedad del id estado tiquete, dado que ya se encuentra almacenado en una estructura.
                unset($ticket->idEstadoTiquete);

                //Obtiene el historial de movimientos para cada tiquete.
                $ticket->historial_tiquete = $ticketHistoryModel->get($ticket->idTiquete);
            }

            return $tickets;
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }
} 
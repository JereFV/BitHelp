import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_BASE_URL}ticket`; //cadena interpolada

class TicketService 
{
    getTicketsByRolUser(user)
    {
        //Realiza la petición utilizando axios como cliente y retorna la respuesta.
        let tickets = axios.get(`${BASE_URL}/getAllByRolUser/${user.idRole}/${user.idUser}`, {          
        });

        return tickets;
    }
}

export default new TicketService();
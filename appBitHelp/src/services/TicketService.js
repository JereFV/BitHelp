import axios from "axios";
const BASE_URL = `${import.meta.env.BASE_URL}ticket`; //cadena interpolada

class TicketService 
{
    getTickets()
    {
        //Realiza la petición utilizando axios como cliente y retorna la respuesta.
        let tickets = axios.get(BASE_URL);
        return tickets;
    }
}

export default new TicketService();
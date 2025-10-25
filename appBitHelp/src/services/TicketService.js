import axios from "axios";
const BASE_URL = `${import.meta.env.BASE_URL}ticket`; //cadena interpolada

class TicketService 
{
    getTicketsByRolUser(user)
    {
        //Realiza la petición utilizando axios como cliente y retorna la respuesta.
        let tickets = axios.get(`${BASE_URL}/getAllByRolUser`, {
            params: { //
                user
            }
        });

        return tickets;
    }
}

export default new TicketService();
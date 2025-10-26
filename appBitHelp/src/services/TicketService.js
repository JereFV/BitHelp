import axios from "axios";
const BASE_URL = `${import.meta.env.BASE_URL}ticket`; //cadena interpolada

class TicketService 
{
    getTickets() {
    return axios.get(`${BASE_URL}ticket`);
  }

  // Si más adelante querés /ticket/5 -> getTicketById
  getTicketById(id) {
    return axios.get(`${BASE_URL}ticket/${id}`);
  }

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

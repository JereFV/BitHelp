import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_BASE_URL}ticket`; //cadena interpolada

class TicketService 
{
  getTickets() {
    // CAMBIO APLICADO: Solo llama a la BASE_URL
    return axios.get(BASE_URL);
  }

  getTicketById(id) {
    return axios.get(`${BASE_URL}/get/${id}`);
  }

  getTicketsByRolUser(user) 
  {
    //Realiza la petición utilizando axios como cliente y retorna la respuesta.
    let tickets = axios.get(`${BASE_URL}/getAllByRolUser/${user.idRol}/${user.idUsuario}`);

    return tickets;
  }

  //Obtiene los detalles del SLA por ID de ticket
  getSlaDetailsById(id) {
    return axios.get(`${BASE_URL}/getSlaDetails/${id}`); 
  }

  createTicket(ticket) {
    return axios.post(BASE_URL, ticket);
  }

}

export default new TicketService();

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

  getTicketDetailsForAssignment(id) {
    return axios.get(`${BASE_URL}/getDetails/${id}`); 
  }

  /**
   * Realiza la asignación manual de un tiquete a un técnico.
   * @param {number} idTicket ID del tiquete a asignar.
   * @param {number} idTechnician ID del técnico seleccionado.
   * @param {string} justification Justificación de la asignación.
   * @param {number} idAdminUser ID del usuario administrador logueado.
   * @returns {Promise<axios.Response>} Promesa con la respuesta de la API.
   */
  assignTicketManually(idTicket, idTechnician, justification, idAdminUser) {
    const payload = {
        idTecnicoAsignado: idTechnician,
        justificacion: justification,
        idUsuarioAdmin: idAdminUser // Se envía el ID del administrador que realiza la acción
    };
    
    return axios.put(`${BASE_URL}/assignManually/${idTicket}`, payload); 
  }

  updateTicket(ticket) {
    return axios.put(BASE_URL, ticket);
  }

}

export default new TicketService();

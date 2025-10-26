import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL; // ej: http://localhost:81/BitHelp/apiBitHelp/

class TicketService {
  // GET http://localhost:81/BitHelp/apiBitHelp/ticket
  getTickets() {
    return axios.get(`${BASE_URL}ticket`);
  }

  // Si más adelante querés /ticket/5 -> getTicketById
  getTicketById(id) {
    return axios.get(`${BASE_URL}ticket/${id}`);
  }
}

export default new TicketService();

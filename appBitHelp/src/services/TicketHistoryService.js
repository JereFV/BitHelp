import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_BASE_URL}TicketHistory`;

class TicketHistoryService 
{
  createTicketHistory(ticketHistory) {
    return axios.post(BASE_URL, ticketHistory);
  }
}

export default new TicketHistoryService();
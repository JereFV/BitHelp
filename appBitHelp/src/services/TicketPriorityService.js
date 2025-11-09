import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_BASE_URL}TicketPriority`; //cadena interpolada

class TicketPriorityService 
{
  getTicketPriorities() {
    return axios.get(BASE_URL);
  }
}

export default new TicketPriorityService();
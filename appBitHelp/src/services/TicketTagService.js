import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_BASE_URL}TicketTag`; //cadena interpolada

class TicketTagService 
{
  getTicketTags() {
    return axios.get(BASE_URL);
  }
}

export default new TicketTagService();
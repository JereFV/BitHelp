import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_BASE_URL}TicketStatusFlow`;

class TicketStatusFlowService 
{
  //Obtiene los posibles estados de movimiento del tiquete a partir del estado actual.
  getStates(idActualStatus) {
    return axios.get(`${BASE_URL}/${idActualStatus}`);
  }
}

export default new TicketStatusFlowService();
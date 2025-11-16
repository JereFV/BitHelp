import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_BASE_URL}ticketImage`;

class TicketImageService 
{
    uploadImages(formData)
    {
        //Envía la petición POST, especificando el formato de los headers conteniendo "form-data"
        return axios.post(BASE_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data;",
            Accept: "multipart/form-data",
          },
        });
    } 
}

export default new TicketImageService();
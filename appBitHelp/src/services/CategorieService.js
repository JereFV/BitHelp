import axios from "axios";
const BASE_URL = `${import.meta.env.BASE_URL}categorie`; //cadena interpolada

class CategorieService 
{
    getTickets()
    {
        //Realiza la petición utilizando axios como cliente y retorna la respuesta.
        let categories = axios.get(BASE_URL);
        return categories;
    }
}

export default new CategorieService();
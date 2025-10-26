import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL +'categorie';

class CategorieService 
{
    getAllCategories()
    {
        //Realiza la petición utilizando axios como cliente y retorna la respuesta.
        let categories = axios.get(BASE_URL);
        return categories;
    }
}

export default new CategorieService();
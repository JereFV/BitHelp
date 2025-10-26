import axios from 'axios';
// Cambia 'categorie' por 'technician' en la URL base.
const BASE_URL = import.meta.env.VITE_BASE_URL + 'technician';

class TechnicianService 
{
    /**
     * Obtiene todos los técnicos del backend.
     * @returns {Promise<axios.Response>} La promesa de la respuesta de axios.
     */
    getAllTechnicians()
    {
        // Realiza la petición GET al endpoint /technician
        let technicians = axios.get(BASE_URL);
        return technicians;
    }
}

// Se exporta una instancia de la clase para uso directo.
export default new TechnicianService();
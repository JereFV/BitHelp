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
    getTechnicianById(id)
    {
        return axios.get(`${BASE_URL}/${id}`);
    }

    /**
     * Obtiene todos los usuarios que son candidatos para ser técnicos.
     * GET /technician/getCandidates 
     * @returns {Promise<axios.Response>} La promesa de la respuesta de axios.
     */
    getTechnicianCandidates()
    {
        // Realiza la petición GET al endpoint /technician/getCandidates
        return axios.get(`${BASE_URL}/getCandidates`); 
    }

    /**
     * Promueve un usuario existente a técnico.
     * POST /technicians
     * @param {object} technicianData {idUsuario: 5, especialidades: [1, 2], ...}
     */
    createTechnician(technicianData)
    {
        return axios.post(BASE_URL, technicianData);
    }

    /**
     * Actualiza la configuración de un técnico existente (Disponibilidad, Carga, Especialidades).
     * PUT /technicians/{id}
     * @param {number} id El idTecnico a actualizar.
     * @param {object} technicianData {idDisponibilidad: 2, cargaTrabajo: "05:30:00", especialidades: [...]}
     */
    updateTechnician(id, technicianData)
    {
        return axios.put(`${BASE_URL}/${id}`, technicianData);
    }

    /**
     * Obtiene la lista de opciones de disponibilidad (ej. Disponible, Ocupado, Ausente).
     * GET /technicians/getDisponibilities (Asumiendo que esta ruta existe en tu API)
     */
    getDisponibilities() 
    {
        return axios.get(`${BASE_URL}/getDisponibilities`);
    }

    /**
     * Obtiene la lista de especialidades disponibles para asignación.
     * GET /technicians/getSpecialties (Usando la misma convención que CategorieService)
     */
    getSpecialties()
    {
        return axios.get(`${BASE_URL}/getSpecialties`);
    }
    
    // Si implementamos la funcionalidad de "despedir" al técnico:
    
    /**
     * Despromueve un técnico (cambia su rol a Cliente y borra el registro de la tabla tecnico).
     * DELETE /technicians/{id}
     */
    deleteTechnician(id)
    {
        return axios.delete(`${BASE_URL}/${id}`);
    }
}

// Se exporta una instancia de la clase para uso directo.
export default new TechnicianService();
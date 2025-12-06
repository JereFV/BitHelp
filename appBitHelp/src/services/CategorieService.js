import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'categorie';

class CategorieService 
{
    getAllCategories()
    {
        return axios.get(BASE_URL);
    }

    getCategoryById(id)
    {
        return axios.get(`${BASE_URL}/${id}`);
    }

    getSpecialties()
    {
        return axios.get(`${BASE_URL}/getSpecialties`);
    }

    getTags()
    {
        return axios.get(`${BASE_URL}/getTags`);
    }

    getSlas()
    {
        return axios.get(`${BASE_URL}/getSlas`);
    }

    getSpecialtyMapping()
    {
        return axios.get(`${BASE_URL}/getSpecialtyMapping`);
    }

    getCategoryByTag(idTag)
    {
        return axios.get(`${BASE_URL}/getByTag/${idTag}`);
    }

    createCategory(categoryData)
    {
        return axios.post(BASE_URL, categoryData);
    }

    updateCategory(id, categoryData)
    {
        return axios.put(`${BASE_URL}/${id}`, categoryData);
    }

    deleteCategory(id)
    {
        return axios.delete(`${BASE_URL}/${id}`);
    }
}

export default new CategorieService();
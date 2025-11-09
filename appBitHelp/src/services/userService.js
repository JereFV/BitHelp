import axios from 'axios';
const BASE_URL = `${import.meta.env.VITE_BASE_URL}user`;

class UserService {
  getUsers() {
    return axios.get(BASE_URL);
  }
  getUserById(UserId) {
    return axios.get(BASE_URL + '/' + UserId);
  }
  
  createUser(User) {
     
      return axios.post(BASE_URL, User); 
  }
    
  // Actualiza un usuario existente (asume PUT)
  updateUser(userId, UserData) {
      // La API necesita el ID para saber qué actualizar
      return axios.put(`${BASE_URL}/${userId}`, UserData); 
  }

  // Elimina un usuario
  deleteUser(userId) {
      return axios.delete(`${BASE_URL}/${userId}`);
  }
  loginUser(User) {
    return axios.post(BASE_URL + '/login/', JSON.stringify(User));
  }
}

export default new UserService();


import axios from 'axios';
const BASE_URL = `${import.meta.env.VITE_BASE_URL}user`;

class UserService {
  getUsers() {
    return axios.get(BASE_URL);
  }
  getUserById(UserId) {
    return axios.get(BASE_URL + '/' + UserId);
  }
  
  getAllUsers() {
    return axios.get(BASE_URL + '/getAllUsers');
  }
  createUser(User) {
     
      return axios.post(BASE_URL, User); 
  }
    
  updateUser(userId, UserData) {
      return axios.put(`${BASE_URL}/${userId}`, UserData); 
  }

  updatePassword(userId, newPassword) {
    return axios.put(`${BASE_URL}/${userId}/password`, { 
        contrasenna: newPassword 
    });
 }

  deleteUser(userId) {
      return axios.delete(`${BASE_URL}/${userId}`);
  }
  loginUser(User) {
    return axios.post(BASE_URL + '/login/', JSON.stringify(User));
  }
}

export default new UserService();


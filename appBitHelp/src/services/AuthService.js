import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'AuthController';

const AuthService = {
  /**
   * Login de usuario
   * @param {string} credential - Usuario o correo
   * @param {string} password - Contraseña
   */
  login: async (credential, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        credential,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { result: 'Error de conexión' };
    }
  },

  /**
   * Logout de usuario
   * @param {string} token - JWT token
   */
  logout: async (token) => {
    try {
      const response = await axios.post(`${BASE_URL}/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { result: 'Error de conexión' };
    }
  },

  /**
   * Verificar si hay sesión activa
   * @param {string} token - JWT token
   */
  checkAuth: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/checkAuth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { result: 'Error de conexión' };
    }
  }
};

export default AuthService;
import { createContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar sesión al cargar la app
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Verificar si hay sesión activa
   */
  const checkSession = async () => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userSession');

      if (storedToken && storedUser) {
        // Verificar con el backend si el token sigue siendo válido
        const response = await AuthService.checkAuth(storedToken);
        
        if (response.status === 200) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          // Token inválido, limpiar
          clearSession();
        }
      }
    } catch (error) {
      // Si falla la verificación, limpiar sesión
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login
   */
  const login = async (credential, password) => {
    try {
      const response = await AuthService.login(credential, password);

      if (response.status === 200) {
        const { token: newToken, user: userData } = response.data;

        // Guardar en localStorage
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userSession', JSON.stringify(userData));

        // Actualizar estado
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, message: response.result };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.result || 'Error al iniciar sesión' 
      };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      if (token) {
        await AuthService.logout(token);
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      clearSession();
    }
  };

  /**
   * Limpiar sesión
   */
  const clearSession = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSession');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    checkSession
  };

  return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
};
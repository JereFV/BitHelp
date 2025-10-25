import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext }  from '../../context/UserContext';
import UserService from '../../services/userService'; 


export default function UserProvider({ children }) {
 const [user, setUser] = useState(null);
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [isLoading, setIsLoading] = useState(true); // Nuevo estado para manejo de carga
    
    useEffect(() => {
        const storedUser = localStorage.getItem('Usuario');
        const TEST_USER_ID = 1;
            if (storedUser) 
            {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
                setIsLoading(false);
            } else {
            // NO HAY LOGIN, CARGAMOS USUARIO DE PRUEBA
            // Define el ID del usuario que quieres forzar a cargar
            console.log(`Cargando usuario de prueba (ID: ${TEST_USER_ID}) desde la DB...`);

            UserService.getUserById(TEST_USER_ID)
                .then(response => {
                    const testUser = response.data;
                    
                    if (testUser) {
                        // 💡 Almacenar el objeto de usuario de la DB directamente en el estado
                        setUser(testUser); 
                        setIsAuthenticated(true);
                        console.log("Usuario de prueba cargado:", testUser.nombre);
                    } else {
                        console.error("Usuario de prueba no encontrado.");
                    }
                })
                .catch(error => {
                    console.error("Error al cargar usuario de prueba:", error);                
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
 }, []);
    
 const saveUser = (user) => {
  setUser(user);
  localStorage.setItem('user', JSON.stringify(user));
  setIsAuthenticated(true);
 };

 const clearUser = () => {
  setUser({});
  localStorage.removeItem('user');
  setIsAuthenticated(false);
 };
    
    const decodeToken = () => {
        // Esta función ahora solo decodifica si el 'user' en el estado es una cadena (JWT)
        if (typeof user === 'string' && Object.keys(user).length > 0) {
            try {
                const decodedToken = jwtDecode(user);
                return decodedToken;
            } catch (e) {
                console.error("Token inválido:", e);
                return {};
            }
        }
        return {};
    };
    
    //Esta función ahora maneja ambos casos: JWT y Objeto de Prueba
    const getUserName = () => {
        if (!user) {
            return 'Invitado';
        }
        
        if (typeof user === 'object' && user !== null && user.nombre) {
            // Caso Objeto de Prueba (cargado desde la DB)
            return user.nombre || 'Usuario (DB Encontrado)';
        }

        if (typeof user === 'string' && user.length > 0) {
            // Caso JWT (sesión real)
            const userData = decodeToken();
            return userData.name || user.nombre || 'Usuario (Token)';
        }
        return 'Invitado';
    };
    
 //requiredRoles=['Administrador','Cliente']
 const autorize = ({ requiredRoles }) => {
  const userData = decodeToken();
  if (userData && requiredRoles) {
   console.log(
    userData && userData.rol && requiredRoles.includes(userData.rol.name),
   );
   return (
    userData && userData.rol && requiredRoles.includes(userData.rol.name)
   );
  }
  return false;
 };

 UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
 };
    
 return (
  <UserContext.Provider
   value={{
    user,
    isAuthenticated,
    isLoading,
    saveUser,
    clearUser,
    autorize,
    decodeToken,        
    getUserName, 
   }}
  >
   {children}
  </UserContext.Provider>
 );
}
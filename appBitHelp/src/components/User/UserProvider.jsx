import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// Asegúrate de que esta ruta sea correcta para tu UserContext
import { UserContext } from '../../UserContext'; 
import UserService from '../../services/UserService';

export default function UserProvider({ children }) {
 const [user, setUser] = useState(null);
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [isLoading, setIsLoading] = useState(true); // Nuevo estado para manejo de carga
    
 useEffect(() => {
  const storedUser = localStorage.getItem('Usuario');
  if (storedUser) {
   setUser(JSON.parse(storedUser));
   setIsAuthenticated(true);
   setIsLoading(false);
  } else {
            // NO HAY LOGIN, CARGAMOS USUARIO DE PRUEBA
            // Define el ID del usuario que quieres forzar a cargar
            const TEST_USER_ID = 1; // 

            UserService.getUserById(TEST_USER_ID)
                .then(response => {
                    const testUser = response.data;
                    
                    // Necesitas generar un token JWT dummy que contenga el nombre 
                    // para que el decodeToken() en getUserName() funcione.
                    // Generaremos un objeto simple con la información clave:
                    const dummyToken = {
                        name: testUser.nombre, // Asumiendo que el campo es 'name'
                        id: testUser.id,
                        email: testUser.email
                        // NOTA: Esto no es un JWT real, pero si tu getUserName
                        // solo usa jwtDecode(user), deberías simular el token.
                        // SI TU UserProvider ESPERA UN JWT REAL: DEBES CREARLO AQUÍ O SALTÉATE ESTE PASO.
                    };

                    // Opción simple: Guardar el nombre directamente en el estado, 
                    // si puedes modificar cómogetUserName() accede a los datos.
                    // Si no puedes modificar getUserName, pasaremos al Plan B.
                    
                    // --- PLAN B: Simular una sesión válida ---
                    // Para que tu lógica actual de JWT funcione sin un token real,
                    // necesitas inyectar un token simulado en localStorage.
                    
                    // Por simplicidad y para no romper la lógica existente:
                    // 1. Cargamos el usuario de la DB.
                    // 2. Generamos un token dummy (con jwt.io) y lo guardamos.
                    // 3. Recargamos el estado (simulando un login).
                    
                    // 🛑 DADO QUE NO QUEREMOS COMPLICARNOS CON EL JWT:
                    // Usaremos un estado directo para el nombre y modificaremos ligeramente getUserName.
                    
                    // **Opción más LIMPIA y TEMPORAL:**
                    saveUser(testUser.name); // Simula que el token es solo el nombre.
                    
                })
                .catch(error => {
                    console.error("Error al cargar usuario de prueba:", error);
                    clearUser(); 
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
  if (user && Object.keys(user).length > 0) {
   // 'user' debe ser la cadena del token JWT
   const decodedToken = jwtDecode(user); 
   return decodedToken;
  } else {
   return {};
  }
 };
    
    //Extrae y retorna el nombre de usuario del token decodificado.
  const getUserName = () => {


    /*const userData = decodeToken();
    // ⚠️ Importante: Cambia 'name' por la clave correcta si en tu JWT es diferente (ej. 'nombre')
    return userData.nombre || 'Invitado'; 
    */
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
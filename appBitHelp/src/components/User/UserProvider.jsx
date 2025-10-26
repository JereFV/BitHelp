import PropTypes from 'prop-types';
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const useUser = () => {
    // 💡 IMPORTANTE: Si el contexto es null, lanzamos un error claro, 
    // pero el error que ves es de tu Home.jsx.
    const context = useContext(UserContext);
    if (context === null) {
        throw new Error('useUser debe ser usado dentro de un UserProvider');
    }
    return context;
};

const LOCAL_STORAGE_KEY = 'bithelpUser';

// 💡 DATOS DE USUARIO QUEMADOS BASADOS EN TU DB
const FAKE_USER_DATA = {
    idUsuario: 1,
    usuario: 'jfuentes',
    nombre: 'Jeremy', // <-- Clave para mostrar el nombre
    primerApellido: 'Fuentes',
    segundoApellido: 'Venegas',
    idRol: 2
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Función de Decodificación de Token (Mantenida por si acaso)
    const decodeToken = () => {
        // Lógica de decodificación de JWT, si aplica.
        // Como estamos usando datos quemados, esta función podría simplificarse o omitirse si no la usas.
        return { nombre: 'Usuario Token Simulado' }; 
    };

    // ----------------------------------------------------
    // LÓGICA DE SIMULACIÓN DE SESIÓN EN useEffect
    // ----------------------------------------------------
    useEffect(() => {
        // 1. INTENTAR CARGAR DATOS DEL LOCAL STORAGE
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (storedUser) {
            // Si hay datos, los cargamos (sesión simulada ya establecida)
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error al parsear el usuario de localStorage:", error);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        } else {
            // 2. SI NO HAY DATOS (PRIMERA CARGA), QUEMAMOS EL USUARIO DE PRUEBA
            
            // Guardar en localStorage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(FAKE_USER_DATA));

            // Establecer el estado
            setUser(FAKE_USER_DATA);
            setIsAuthenticated(true);

            console.log("✅ Usuario de prueba 'Jeremy' cargado y quemado en localStorage.");
        }
    }, []); 

    // ----------------------------------------------------
    // FUNCIONES DE MANEJO DE ESTADO (Adaptadas)
    // ----------------------------------------------------
    const saveUser = (userData) => {
        // Esta función se usaría para un login real (guardaría el JWT o el objeto)
        // Aquí solo la adaptamos para guardar el objeto si se llama.
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const clearUser = () => {
        setUser(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setIsAuthenticated(false);
    };

    // ----------------------------------------------------
    // FUNCIÓN CRÍTICA PARA MOSTRAR EL NOMBRE
    // ----------------------------------------------------
    const getUserName = () => {
        if (!user) {
            // Esto solo debería ocurrir muy brevemente durante la inicialización
            return 'Invitado';
        }
        
        // Acceso seguro a la propiedad 'nombre' (minúsculas)
        // Ya que el estado 'user' siempre es un objeto (o null) en esta implementación.
        if (typeof user === 'object' && user !== null) {
            return user.nombre || 'Usuario Desconocido'; 
        }

        // Caso alternativo si user fuera una cadena (JWT), aunque aquí se simula con objeto
        if (typeof user === 'string') {
            const userData = decodeToken();
            return userData.nombre || 'Usuario (Token)'; 
        }

        return 'Invitado';
    };

    return (
        <UserContext.Provider value={{
            user,
            isAuthenticated,
            getUserName,
            saveUser,
            clearUser
        }}>
            {children}
        </UserContext.Provider>
    );
};
UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
export default UserProvider;
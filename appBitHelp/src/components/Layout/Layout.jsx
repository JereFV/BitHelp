// eslint-disable-next-line no-unused-vars
import * as React from 'react';
import PropTypes from 'prop-types'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider, DashboardLayout, PageContainer } from '@toolpad/core'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { extendTheme } from '@mui/material/styles';
import Header from './Header';
import { useColorScheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';

Layout.propTypes = { children: PropTypes.node.isRequired }; 

// --- CONFIGURACIÓN DE ROLES ---
const ROLE_ID_USER = 1;
const ROLE_ID_TECHNICIAN = 2;
const ROLE_ID_ADMIN = 3;

function getUserRoleId() {
  const sessionData = localStorage.getItem('userSession');
  if (sessionData) {
    try {
      const userData = JSON.parse(sessionData);
      return userData.idRol || null;
    } catch (error) {
      console.error('Error al parsear userSession de localStorage:', error);
      return null;
    }
  }
  return null;
}

export function Layout({ children }) { 
 // 1. Obtener el rol actual del usuario desde localStorage
 const userRoleId = getUserRoleId();
 
 // Determina si el usuario tiene el rol de Técnico
 const isTechnician = userRoleId === ROLE_ID_TECHNICIAN; 

 // Hooks de React Router
 const location = useLocation();
 const navigate = useNavigate();

 // 2. Generación dinámica del objeto de navegación (basado en el rol)
 const dynamicNavigation = React.useMemo(() => {
  // Definición base de los hijos de 'Tiquetes'
  const ticketChildren = [
   {
    segment: 'ticketsList',   
    title: 'Lista de Tiquetes',  
   },
  ];

  // Lógica Condicional: Agregar 'Asignaciones' solo si es Técnico
  if (isTechnician) {
   ticketChildren.push({
    segment: 'assignments',
    title: 'Asignaciones',    
   });
  }
  //Muestra la opción de Agregar Tiquete únicamente si el rol es Cliente. 
  else if (userRoleId === ROLE_ID_USER) {
    ticketChildren.push({
      segment: 'createTicket',
      title: 'Crear Tiquete',    
    });
  }

 // Estructura completa de la navegación
  return [
   { kind: 'header', title: 'Menú Principal' },
   { segment: 'Home', title: 'Inicio', icon: <DashboardIcon /> },
   {
    segment: 'tickets',
    title: 'Tiquetes',
    icon: <AssignmentIcon />,
    children: ticketChildren, // Usamos la lista condicional
  },
   { kind: 'divider' },
   { kind: 'header', title: 'Técnicos' },
   { segment: 'technician', title: 'Técnicos', icon: <GroupIcon /> },
   { kind: 'divider' },
   { segment: 'categories', title: 'Categorias', icon: <ViewListIcon/> },
  ];
 }, [isTechnician]); // Regenerar la navegación si el rol cambia
  
  // Objeto 'router' que Toolpad necesita
  const router = React.useMemo(() => {
    return {
      pathname: location.pathname, // URL actual
     searchParams: new URLSearchParams(location.search),
      navigate: (path) => navigate(path), // Función para navegar
    };
  }, [location.pathname, location.search, navigate]);
 
 return ( 
  <AppProvider
   navigation ={dynamicNavigation} // <-- Usando la navegación dinámica
   router ={router}
   theme={demoTheme}
   branding={{
   logo :<LogoSwitcher/>,
   title: '', 
   }}
  >   <DashboardLayout header={<Header/>}>
    <PageContainer title='' breadcrumbs={[]} maxWidth={false}>
     {children}
   </PageContainer>     
   </DashboardLayout>
  </AppProvider>
 ); 
} 

/**
 * @returns Función que permite evaluar si está en modo claro u oscuro y base a eso cambar el logo de app
 */
function LogoSwitcher() {
 const { mode } = useColorScheme(); // Detecta si está en 'light' o 'dark'

 const logoSrc = mode === 'dark'
  ? '/src/assets/BitHelpSinFondoDarkmode2.png'  // versión oscura del logo
  : '/src/assets/BitHelpSinFondo.png'; // versión clara del logo

 return (
  <img
   src={logoSrc}
   alt="BitHelp Logo"
  />
 );
}

const demoTheme = extendTheme({
 colorSchemes: {
  light: {
   palette: {
    background: {
     default: '#f9f9f9',
    },
   },
  },
  dark: {
      palette: {
        background: {
          default: '#121212',
        paper: '#1c1c1c',
        },
     },
    },
  },
  colorSchemeSelector: 'class',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900, 
      lg: 1200,
      xl: 1536,
    },
  },
});




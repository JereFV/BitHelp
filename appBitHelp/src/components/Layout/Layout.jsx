// eslint-disable-next-line no-unused-vars
import * as React from 'react';
import PropTypes from 'prop-types'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider, DashboardLayout, PageContainer } from '@toolpad/core'; 
import { useHref, useLocation, useNavigate } from 'react-router-dom';
import { extendTheme } from '@mui/material/styles';
import Header from './Header';
import { useColorScheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';

Layout.propTypes = { children: PropTypes.node.isRequired }; 
 
export function Layout({ children }) { 
  // Hooks de React Router para obtener la ubicación real
  const location = useLocation();
  const navigate = useNavigate();
     // Cbjeto 'router' que Toolpad necesita
    const router = React.useMemo(() => {
        return {
            pathname: location.pathname, // URL actual
            searchParams: new URLSearchParams(location.search),
            navigate: (path) => navigate(path), // Función para navegar
        };
    }, [location.pathname, location.search, navigate]);
  return ( 
    <AppProvider
      navigation ={NAVIGATION}
      router ={router}
      theme={demoTheme}
      branding={{
      logo :<LogoSwitcher/>,
      title: '',      
      }}
    >      <DashboardLayout  header={<Header/>}>
        <PageContainer title='' breadcrumbs={[]}>
            {children}
        </PageContainer>         
      </DashboardLayout>
    </AppProvider>
  ); 
} 

/**
 * 
 * @returns Funcioón que permite evaluar si está en modo claro u oscuro y base a eso cambar el logo de app
 */
function LogoSwitcher() {
  const { mode } = useColorScheme(); // Detecta si está en 'light' o 'dark'

  const logoSrc = mode === 'dark'
    ? '/src/assets/BitHelpSinFondoDarkmode2.png'   //  versión oscura del logo
    : '/src/assets/BitHelpSinFondo.png'; // versión clara del logo

  return (
    <img
      src={logoSrc}
      alt="BitHelp Logo"
    />
  );
}


const NAVIGATION = [
  {
    kind: 'header',
    title: 'Menú Principal',
  },
  {
    // IMPORTANTE: El 'href' dirige la navegación. Usa '/' para tu ruta raíz.
    segment: 'Home', // Segmento interno de Toolpad (puede ser cualquiera)
    title: 'Inicio',
    icon: <DashboardIcon />
  },
  {
    segment: 'tickets',
    title: 'Tiquetes',
    icon: <AssignmentIcon />,
    children: [
      {
        segment: 'ticketsList',      // Identificador único (en minúsculas es buena práctica)
        title: 'Lista de Tiquetes',     // El texto visible en el menú
      },
      {
        segment: 'assignments',
        title: 'Asignaciones',       
      },
      {
        segment: 'ticketDetail',
        title: 'Detalle',       
      },
    ],
  },
  {
    kind: 'divider',
  },
  // Adapta el resto de tu NAVIGATION a tus rutas...
  {
    kind: 'header',
    title: 'Técnicos',
  },
  {
    segment: 'technician',
    title: 'Técnicos',
    icon: <GroupIcon />,
    children: [

      {
        segment: 'technicianList',      // Identificador único (en minúsculas es buena práctica)
        title: 'Lista de Técnicos',     // El texto visible en el menú
      },
      {
        segment: 'technicianDetail',      // Identificador único (en minúsculas es buena práctica)
        title: 'Detalle de Técnicos',     // El texto visible en el menú
      },
      // ...
    ],
  },
  {
    kind: 'divider',
  },
  {
    // Ejemplo de otra ruta
    segment: 'categories', 
    title: 'Categorias',
    icon: <ViewListIcon/>
  },
];

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
      md: 900, // 👈 corregido, antes md = sm
      lg: 1200,
      xl: 1536,
    },
  },
});




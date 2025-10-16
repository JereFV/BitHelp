// eslint-disable-next-line no-unused-vars
import * as React from 'react';
import PropTypes from 'prop-types'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import { AppProvider, DashboardLayout, PageContainer } from '@toolpad/core'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { extendTheme } from '@mui/material/styles';
import Header from './Header';
import { useColorScheme } from '@mui/material/styles';


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
        <PageContainer>
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
    segment: 'inicio', // Segmento interno de Toolpad (puede ser cualquiera)
    title: 'Inicio',
    icon: <DashboardIcon />,
    href: '/inicio', 
  },
  {
    // Ejemplo de otra ruta
    segment: 'pedidos', 
    title: 'Pedidos',
    icon: <ShoppingCartIcon />,
    href: '/pedidos', 
  },
  {
    kind: 'divider',
  },
  // Adapta el resto de tu NAVIGATION a tus rutas...
  {
    kind: 'header',
    title: 'Analytics',
  },
  {
    segment: 'reports',
    title: 'Reports',
    icon: <BarChartIcon />,
    children: [
      {
        segment: 'sales',
        title: 'Sales',
        icon: <DescriptionIcon />,
        href: '/reports/sales'
      },
      // ...
    ],
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




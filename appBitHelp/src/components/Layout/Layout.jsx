// eslint-disable-next-line no-unused-vars
import * as React from 'react';
import PropTypes from 'prop-types'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider, DashboardLayout, PageContainer } from '@toolpad/core'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { extendTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';
import Header from './Header';
import { GlobalStyles } from '@mui/material'; 

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
      logo: <img src="\src\assets\BitHelpSinFondo.png" alt="BitHelpLogo"/>,
      title: '',
      
      }}
    >
      <GlobalStyles 
            styles={{
                '.MuiToolpadBranding-root': { display: 'none !important' },
            }}
        />

      <DashboardLayout  header={<Header/>}>
        <PageContainer>
            {children}
        </PageContainer>         
      </DashboardLayout>
    </AppProvider>
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
    href: '/', 
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
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: 'class',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});




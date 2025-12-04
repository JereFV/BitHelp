// eslint-disable-next-line no-unused-vars
import * as React from 'react';
import { useContext } from 'react';
import PropTypes from 'prop-types'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider, DashboardLayout, PageContainer } from '@toolpad/core'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { extendTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import NotificationBadge from '../Notifications/NotificationBadge';
import NotificationPanel from '../Notifications/NotificationPanel';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const [notificationPanelOpen, setNotificationPanelOpen] = React.useState(false);
  const [refreshCountCallback, setRefreshCountCallback] = React.useState(null);
  
  // 1. Obtener el rol actual del usuario desde localStorage
  const userRoleId = getUserRoleId();
  
  // Determina si el usuario tiene el rol de Técnico
  const isTechnician = userRoleId == ROLE_ID_TECHNICIAN; 

  // Hooks de React Router
  const location = useLocation();
  const navigate = useNavigate();

  //  Generación dinámica del objeto de navegación (basado en el rol)
  const dynamicNavigation = React.useMemo(() => {
    // Definición base de los hijos de 'Tiquetes'
    const ticketChildren = [
      {
        segment: 'ticketsList',   
        title: t('navigation.ticketsList'),  
      },
    ];

    // Lógica Condicional para 'Tiquetes'
    if (isTechnician) {
      // Agrega 'Asignaciones' para Técnicos y Administradores
      ticketChildren.push({
        segment: 'assignments',
        title: t('navigation.assignments'),    
      });
    } else if (userRoleId == ROLE_ID_USER) {
      // Agrega 'Crear Tiquete' solo para Usuarios/Clientes
      ticketChildren.push({
        segment: 'createTicket',
        title: t('navigation.createTicket'),    
      });
    }

    // Estructura base de la navegación
    const baseNavigation = [
      { kind: 'header', title: t('navigation.mainMenu') },
      { segment: 'Home', title: t('navigation.home'), icon: <DashboardIcon /> },
      {
        segment: 'tickets',
        title: t('navigation.tickets'),
        icon: <AssignmentIcon />,
        children: ticketChildren,
      },
      { kind: 'divider' },
      { kind: 'header', title: t('navigation.administration') },
      { segment: 'technician', title: t('navigation.technicians'), icon: <GroupIcon /> },
      { kind: 'divider' },
      { segment: 'categories', title: t('navigation.categories'), icon: <ViewListIcon/> },
      { kind: 'divider' },
    ];
    
    // Lógica Condicional: Agregar 'Usuarios' solo si es Administrador
    if (userRoleId == ROLE_ID_ADMIN) {
      baseNavigation.push(
        { segment: 'users', title: t('navigation.users'), icon: <GroupIcon /> }
      );
    }
    
    return baseNavigation;

  }, [isTechnician, userRoleId, t]);
  
  // Objeto 'router' que Toolpad necesita
  const router = React.useMemo(() => {
    return {
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path) => navigate(path),
    };
  }, [location.pathname, location.search, navigate]);

  const handleLogout = () => {
    logout();
  };

  return ( 
    <AppProvider
      navigation={dynamicNavigation}
      router={router}
      theme={demoTheme}
      branding={{
        logo: <LogoSwitcher/>,
        title: '', 
      }}
    >
      {/*Se implementa la librería hot-toast sobre el layout con el objetivo de ser accesible desde cualquier parte del sistema.*/}
      <Toaster/>

      <DashboardLayout>
        {/* Barra superior con notificaciones y logout */}
        <Box sx={{ 
          position: 'fixed', 
          top: 2, 
          right: 75, 
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'background.paper',
          padding: '5px 16px',
          borderRadius: 2,
          boxShadow: 2
        }}>
          {/* Icono de notificaciones */}
          <NotificationBadge 
            onOpen={(refreshFn) => {
              setRefreshCountCallback(() => refreshFn);
              setNotificationPanelOpen(true);
            }} 
          />
          {/* Selector de idioma */}
          <LanguageSwitcher />
          {user && (
            <>
              <AccountCircleIcon color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.nombre} {user.primerApellido}
              </Typography>
              <Tooltip title={t('auth.logoutTooltip')}>
                <IconButton 
                  onClick={handleLogout}
                  size="small"
                  color="error"
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        {/* Panel de notificaciones */}
        <NotificationPanel 
          open={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
          onRefreshCount={refreshCountCallback}
        />

        <PageContainer title='' breadcrumbs={[]} maxWidth={false}>
          {children}
        </PageContainer>
        {/* Footer */}
        <Box sx={{ 
          borderTop: 1, 
          borderColor: 'divider',
          py: 2,
          px: 3,
          mt: 'auto',
          textAlign: 'center',
          backgroundColor: 'background.paper'
        }}>
          <Typography variant="caption" color="text.secondary">
            ISW-613 PROGRAMACIÓN EN AMBIENTE WEB I
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Jeyson Alfaro Ríos • Jeremy Fuentes Venegas • Rodrigo Herrera Castillo
          </Typography>
        </Box>
      </DashboardLayout>
    </AppProvider>
  ); 
} 

/**
 * @returns Función que permite evaluar si está en modo claro u oscuro y base a eso cambiar el logo de app
 */
function LogoSwitcher() {
  const { mode } = useColorScheme();

  const logoSrc = mode === 'dark'
    ? '/src/assets/BitHelpSinFondoDarkmode2.png'
    : '/src/assets/BitHelpSinFondoDarkmode2.png';

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
import * as React from 'react';
import PropTypes from 'prop-types'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';

// Componentes de Toolpad Core y MUI
import { AppProvider, PageContainer } from '@toolpad/core'; 
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { 
    Account, 
    AccountPreview, 
    SignOutButton,
    AccountPopoverFooter // Necesario para el pie del popover
} from '@toolpad/core/Account';
import { useLocation, useNavigate } from 'react-router-dom';
import { extendTheme } from '@mui/material/styles';
import { 
    useColorScheme, Box, Stack, Typography, Divider, 
    MenuList, MenuItem, ListItemText, ListItemIcon, Avatar
} from '@mui/material';

import Header from './Header'; // El componente Header se mantiene importado (pero ya no en el slot header)


// --- CONFIGURACIÓN DE SESIÓN Y ROLES ---
const FAKE_USER_DATA = {
    idUsuario: 1,
    usuario: 'jfuentes',
    nombre: 'Jeremy', 
    primerApellido: 'Fuentes',
    segundoApellido: 'Venegas',
    correo:'jeremyfvcr15@gmail.com',
    telefono:'85192737',
    idRol: 2,
    imagenPerfil:'https://scontent.fsyq2-1.fna.fbcdn.net/v/t39.30808-6/474044965_3585059618458297_2078973696367605123_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=JHk-BpEymxsQ7kNvwGIqEFA&_nc_oc=AdlGmn5rD_rLIzqaFoCg5d1YMKKH__CveeWikGJxv-JbXEoDT6WldW1TL92AyHlUjU&_nc_zt=23&_nc_ht=scontent.fsyq2-1.fna&_nc_gid=amil2dynRGPPmEhBA_KDbg&oh=00_Afh7Z-8v54ZaVXgVJupV1MC_IHyrX5PpiVGTFo6G49yLuw&oe=6915D0EF',
  };

// 2. Sesión construida para Toolpad (requiere 'name', 'email', 'image')
const FAKE_USER_SESSION = {
user: {
 idUsuario: FAKE_USER_DATA.idUsuario,
 usuario: FAKE_USER_DATA.usuario,
 // Combinar nombre y apellido para el campo 'name' de Toolpad
 name: `${FAKE_USER_DATA.nombre} ${FAKE_USER_DATA.primerApellido}`, 
 email: FAKE_USER_DATA.correo, 
 idRol: FAKE_USER_DATA.idRol, // Usar el rol definido en FAKE_USER_DATA
 image: FAKE_USER_DATA.imagenPerfil, // Usar la imagen de perfil definida
},
};

const ROLE_ID_TECHNICIAN = 2; 


// --- COMPONENTES PARA SLOTS DEL DASHBOARDLAYOUT ---

/**
 * Slot para las acciones de la barra superior derecha (ThemeSwitcher)
 */
function CustomToolbarActions() {
 return (
  <Stack direction="row" alignItems="center">
   <ThemeSwitcher /> {/* Icono de luna/sol */}
  </Stack>
 );
}

/**
 * Define cómo se ve el usuario en el pie de la barra lateral (preview).
 * Adaptado del ejemplo de la documentación.
 */
function AccountSidebarPreview(props) {
 const { handleClick, mini } = props;
 return (
  <Stack direction="column" p={0}>
   <Divider />
   <AccountPreview
    variant={mini ? 'condensed' : 'expanded'}
    handleClick={handleClick}
   />
  </Stack>
 );
}

AccountSidebarPreview.propTypes = {
 handleClick: PropTypes.func,
 mini: PropTypes.bool.isRequired,
};

/**
 * Define el contenido del popover que aparece al hacer clic en el usuario.
 * Simplificado para solo mostrar el botón de SignOut.
 */
function SidebarFooterAccountPopover() {
 return (
  <Stack direction="column">
   {/* Puedes añadir más información del usuario aquí si lo deseas */}
   <AccountPopoverFooter>
    <SignOutButton />
   </AccountPopoverFooter>
  </Stack>
 );
}

/**
 * Componente que se inyecta en el slot 'sidebarFooter'.
 */
function SidebarFooterAccount({ mini }) {
 const PreviewComponent = React.useCallback(
  (props) => <AccountSidebarPreview {...props} mini={mini} />,
  [mini]
 );
 return (
  <Account
   slots={{
    preview: PreviewComponent,
    popoverContent: SidebarFooterAccountPopover,
   }}
  />
 );
}

SidebarFooterAccount.propTypes = { mini: PropTypes.bool.isRequired };


// --- COMPONENTE LOGOSWITCHER ---

function LogoSwitcher() {
 const { mode } = useColorScheme();

 const logoSrc = mode === 'dark'
  ? '/src/assets/BitHelpSinFondoDarkmode2.png'
  : '/src/assets/BitHelpSinFondo.png';

 return (
  <img
   src={logoSrc}
   alt="BitHelp Logo"
   style={{ height: '32px' }}
  />
 );
}


// --- COMPONENTE PRINCIPAL DEL LAYOUT ---

Layout.propTypes = { children: PropTypes.node.isRequired }; 

export function Layout({ children }) { 
 const location = useLocation();
 const navigate = useNavigate();

 // Manejo de la Sesión y Autenticación
 const [session, setSession] = React.useState(FAKE_USER_SESSION);
 
 const userRoleId = session?.idRol || null;
 const isTechnician = userRoleId === ROLE_ID_TECHNICIAN; 

 const authentication = React.useMemo(() => {
  return {
   signIn: () => { /* Lógica de login */ }, 
   signOut: () => {
    setSession(null); 
    localStorage.removeItem('userSession'); 
    navigate('/'); 
   },
  };
 }, [navigate]);

 const router = React.useMemo(() => {
    return {
      pathname: location.pathname, 
      searchParams: new URLSearchParams(location.search),
      navigate: (path) => navigate(path), 
    };
  }, [location.pathname, location.search, navigate]);

 // Generación dinámica de la navegación (basado en el rol)
 const dynamicNavigation = React.useMemo(() => {
  const ticketChildren = [
   { segment: 'ticketsList', title: 'Lista de Tiquetes' },
  ];

  if (isTechnician) {
   ticketChildren.push({ segment: 'assignments', title: 'Asignaciones' });
  }

  return [
   { kind: 'header', title: 'Menú Principal' },
   { segment: 'Home', title: 'Inicio', icon: <DashboardIcon /> },
   { segment: 'tickets', title: 'Tiquetes', icon: <AssignmentIcon />, children: ticketChildren },
   { kind: 'divider' },
   { kind: 'header', title: 'Técnicos' },
   { segment: 'technician', title: 'Técnicos', icon: <GroupIcon /> },
   { kind: 'divider' },
   { segment: 'categories', title: 'Categorias', icon: <ViewListIcon/> },
  ];
 }, [isTechnician]); 
  
 return ( 
  <AppProvider
   navigation ={dynamicNavigation}
   router ={router}
   theme={demoTheme}
   branding={{
    logo :<LogoSwitcher/>,
    title: '',   
   }}
   authentication={authentication}
   session={session} 
  >   
   <DashboardLayout 
    slots={{
     toolbarActions: CustomToolbarActions, 
     sidebarFooter: SidebarFooterAccount, 
    }}
   >
    <PageContainer title='' breadcrumbs={[]} maxWidth={false}>
      {children}
    </PageContainer>     
   </DashboardLayout>
  </AppProvider>
 ); 
} 



const demoTheme = extendTheme({
 colorSchemes: {
  light: {
   palette: {
    background: { default: '#f9f9f9' },
   },
  },
  dark: {
   palette: {
    background: { default: '#121212', paper: '#1c1c1c' },
   },
  },
 },
 colorSchemeSelector: 'class',
 breakpoints: {
  values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
 },
});
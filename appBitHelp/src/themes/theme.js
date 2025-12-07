import { createTheme, extendTheme } from '@mui/material/styles'; 
export const appTheme= createTheme  ({ 
  palette: { 
    mode: 'light', 
    primary: { 
      main: '#468B97', 
    }, 
    secondary: { 
      main: '#1D5B79', 
    }, 
    primaryLight: { 
        main: "#EF6262", 
        contrastText: "#F3AA60"  
      } 
  }, 
});

export const botTheme = extendTheme({
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
import React, { useContext } from 'react';
import Container from '@mui/material/Container'; 
import Typography from '@mui/material/Typography'; 
import { UserContext } from '../../context/UserContext';

export function Home() { 
  // Valor por defecto mientras se realiza el login
  const { getUserName } = useContext(UserContext)
  const username = getUserName(); // Obtiene el nombre del token decodificado o 'Invitado'.
  return ( 
    <Container sx={{ p: 2 }} maxWidth="sm"> 
      <Typography 
        component="h1" 
        variant="h2" 
        align="center" 
        color="text.primary" 
        gutterBottom  
        fontFamily={'-apple-system'}
        marginBottom={1}
      > 
        <span style={{ fontSize: '70%' }}>Bienvenid@ {username}</span>
        <br />
        BitHelp 
        </Typography> 
      <Typography variant="h5" align="center" color="text.secondary" fontFamily={'-apple-system'}> 
        <font> Soluciones desde el origen.</font>  
      </Typography> 
    </Container> 
  ); 
} 
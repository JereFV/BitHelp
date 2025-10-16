import React from 'react'; 
import Container from '@mui/material/Container'; 
import Typography from '@mui/material/Typography'; 
export function Home() { 
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
        BitHelp 
        </Typography> 
      <Typography variant="h5" align="center" color="text.secondary" fontFamily={'-apple-system'}> 
        <font> Soluciones desde el origen.</font>  
      </Typography> 
    </Container> 
  ); 
} 
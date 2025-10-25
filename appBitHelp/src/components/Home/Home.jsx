import React from 'react';
import Container from '@mui/material/Container'; 
import Typography from '@mui/material/Typography'; 
import { useUser } from '../User/UserProvider';
import Box from '@mui/material/Box';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';



const itemData = [
  {
    img: '/src/images/hardwareSupport.png',
    title: 'Hardware ',
    rows: 2,
    cols: 2,
    featured: true,
  },
  {
    img: '/src/images/softwareSupport.png',
    title: 'Software',
  },
  {
    img: '/src/images/accountAdministrator.jpg',
    title: 'Administración de cuentas',
  },
  {
    img: '/src/images/networkAdministrator.jpeg',
    title: 'Adminsitración de redes',
    cols: 2,
  },
];

function ImageGrid() {
   return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
    <ImageList sx={{ width: '80%', height: '50%' }}>
      <ImageListItem key="Subheader" cols={2}>
        <ListSubheader component="div" sx={{
            backgroundColor: 'transparent'
        }}>
          <Typography variant="h5" align="center" color="text.secondary" fontFamily={'-apple-system'} sx={{ 
              textDecoration: 'underline' 
            }}> 
              <font > Nuestras soluciones</font>  
          </Typography>
        </ListSubheader>
      </ImageListItem>
      {itemData.map((item) => (
        <ImageListItem key={item.img}>
          <img
            srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
            src={`${item.img}?w=248&fit=crop&auto=format`}
            alt={item.title}
            loading="lazy"
          />
          <ImageListItemBar
            title={item.title}
            subtitle={item.author}  
            sx={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 2%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)',
            }}          
          />
        </ImageListItem>
      ))}
    </ImageList>
    </Box>
  );
}


export function Home() { 
  // Valor por defecto mientras se realiza el login
  const { getUserName } = useUser();
  const username = getUserName(); // Obtiene el nombre del token decodificado o 'Invitado'.
  return ( 
    <Container sx={{ p: 1 }} maxWidth="lg"> 
      <Typography 
        component="h1" 
        variant="h2" 
        align="center" 
        color="text.primary" 
        gutterBottom  
        fontFamily={'-apple-system'}
        marginBottom={2}
      > 
        <span style={{ fontSize: '70%' }}>Bienvenid@ {username}</span>
        <br />
        BitHelp 
        </Typography> 
      <Typography variant="h5" align="center" color="text.secondary" fontFamily={'-apple-system'}> 
        <font> Soluciones desde el origen.</font>  
      </Typography> 
      <ImageGrid />
     

    </Container> 
  ); 
} 
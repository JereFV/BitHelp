import React, { useContext } from 'react';
import Container from '@mui/material/Container'; 
import Typography from '@mui/material/Typography'; 
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

function ImageGrid() {
  const { t } = useTranslation();

  const itemData = [
    {
      img: '/src/images/hardwareSupport.png',
      title: t('home.hardware'),
      rows: 2,
      cols: 2,
      featured: true,
    },
    {
      img: '/src/images/softwareSupport.png',
      title: t('home.software'),
    },
    {
      img: '/src/images/accountAdministrator.jpg',
      title: t('home.accountManagement'),
    },
    {
      img: '/src/images/networkAdministrator.jpeg',
      title: t('home.networkManagement'),
      cols: 2,
    },
  ];

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
              <font>{t('home.ourSolutions')}</font>  
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
  const { t } = useTranslation();
  const { user } = useContext(AuthContext); 
  
  const username = user ? user.nombre || user.usuario : t('home.guest');

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
        <span style={{ fontSize: '70%' }}>{t('home.welcome')} {username}</span>
        <br />
        BitHelp 
      </Typography> 
      <Typography variant="h5" align="center" color="text.secondary" fontFamily={'-apple-system'}> 
        <font>{t('home.tagline')}</font>  
      </Typography> 
      <ImageGrid />
    </Container> 
  ); 
}
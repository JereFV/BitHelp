// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, Typography } from '@mui/material'; 

// El componente de tu nueva pantalla
function TicketsList() {
  return (
    // Usa Box para contenedores y sx para estilos de Material UI
    <Box sx={{ padding: 4, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" color="primary" gutterBottom>
        Listado de [Tiquetes]
      </Typography>
      <Typography variant="body1">
        Este contenido se muestra dentro del Layout (con Header y Footer) 
        gracias al Router. ¡Ya puedes empezar a diseñar!
      </Typography>
      {/* ... Añade aquí el resto de tu diseño JSX ... */}
    </Box>
  );
}

export default TicketsList;

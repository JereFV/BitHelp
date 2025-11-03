// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import TicketService from '../../services/TicketService';
import { ListCardTickets } from './ListCardTickets.jsx'; // Ojo con esta ruta

function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Constante temporal para pruebas.
  const FAKE_USER_DATA = {
    idUsuario: 1,
    usuario: 'jfuentes',
    nombre: 'Jeremy', // <-- Clave para mostrar el nombre
    primerApellido: 'Fuentes',
    segundoApellido: 'Venegas',
    idRol: 1
  };

  localStorage.setItem('userSession', JSON.stringify(FAKE_USER_DATA));

  useEffect(() => {
    // Carga inicial de tiquetes
    TicketService.getTicketsByRolUser(JSON.parse(localStorage.getItem('userSession')))
      .then((res) => {
        setTickets(res?.data || []);
      })
      .catch((err) => {
        console.error('Error cargando tickets:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    // Contenedor principal de la página
    <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
      
      {/* Título de la página */}
      <Typography
        variant="h4" 
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 600, 
          color: 'text.primary', // Usar color de texto estándar
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          pb: 1.5,
          mb: 3, 
        }}
      >
        Listado de Tiquetes
      </Typography>

      {/* Control de estados de carga */}
      {loading && <Typography>Cargando...</Typography>}
      {error && <Typography color="error">Error cargando tiquetes</Typography>}
      {!loading && !error && <ListCardTickets data={tickets} />}
    </Box>
  );
}

export default TicketsList;
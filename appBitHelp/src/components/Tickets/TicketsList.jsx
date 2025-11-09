// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import TicketService from '../../services/TicketService';
import { ListCardTickets } from './ListCardTickets.jsx'; // Ojo con esta ruta
import { TicketSummaryDashboard } from './TicketSummaryDashboard.jsx';

function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para saber qué filtro de estado está activo. 'Total' por defecto.
  const [filtroActivo, setFiltroActivo] = useState('Total');

  //Constante temporal para pruebas.
  const FAKE_USER_DATA = {
    idUsuario: 1,
    usuario: 'jfuentes',
    nombre: 'Jeremy',
    primerApellido: 'Fuentes',
    segundoApellido: 'Venegas',
    idRol: 3
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

  // Usamos useMemo para calcular la lista de tiquetes filtrados.
  // Esto se recalcula solo si la lista 'tickets' o el 'filtroActivo' cambian.
  const tiquetesFiltrados = useMemo(() => {
    // Si el filtro es 'Total', devolver todos los tiquetes
    if (filtroActivo === 'Total') {
      return tickets;
    }
    // Si no, filtrar por el estado que coincida con el filtro activo
    return tickets.filter(ticket => ticket.estado === filtroActivo);
  }, [tickets, filtroActivo]);

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
      
      {!loading && !error && (
        <>
          {/* Pasamos TODOS los tiquetes al dashboard (para los conteos) */}
          {/* Pasamos el filtro activo y la función para cambiarlo */}
          <TicketSummaryDashboard 
            tickets={tickets} 
            filtroActivo={filtroActivo}
            onFiltroChange={setFiltroActivo}
          />
          {/* Pasamos solo los tiquetes FILTRADOS a la lista de tarjetas */}
          <ListCardTickets data={tiquetesFiltrados} />
        </>
      )}
    </Box>
  );
}

export default TicketsList;
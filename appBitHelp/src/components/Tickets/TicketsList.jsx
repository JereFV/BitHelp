// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import TicketService from '../../services/TicketService';
import { ListCardTickets } from './ListCardTickets.jsx';

function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    TicketService.getTickets()
      .then((res) => {
        setTickets(res.data || []);
      })
      .catch((err) => {
        console.error('Error cargando tickets:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h3" component="h1" color="primary" gutterBottom>
        Listado de Tiquetes
      </Typography>

      {loading && <Typography>Cargando...</Typography>}
      {error && <Typography color="error">Error cargando tiquetes</Typography>}
      {!loading && !error && <ListCardTickets data={tickets} />}
    </Box>
  );
}

export default TicketsList;

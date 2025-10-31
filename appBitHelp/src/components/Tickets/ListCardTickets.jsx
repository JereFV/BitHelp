// eslint-disable-next-line no-unused-vars
import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Info } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Chip, Box } from '@mui/material';

ListCardTickets.propTypes = {
  data: PropTypes.array,
};

// Asignación de colores para los chips
const getPriorityColor = (prioridad) => {
  switch (prioridad) {
    case 'Crítica':
      return 'error';
    case 'Alta':
      return 'warning';
    case 'Media':
      return 'info';
    case 'Baja':
      return 'success';
    default:
      return 'default';
  }
};

const getStateColor = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'warning';
    case 'Asignado':
      return 'info';
    case 'En Proceso':
      return 'primary';
    case 'Resuelto':
      return 'success';
    case 'Cerrado':
      return 'default';
    default:
      return 'default';
  }
};

export function ListCardTickets({ data = [] }) {
  return (
    // Contenedor principal de la grilla
    <Box
      sx={{
        p: 2,
        display: 'grid',
        gap: 3, // Espaciado entre tarjetas
        
        // Layout responsivo de la grilla
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)', // movil
          sm: 'repeat(2, 1fr)', // tablet
          md: 'repeat(3, 1fr)', // desktop
          lg: 'repeat(4, 1fr)', // desktop grande
        },
      }}
    >
      {data.map((item) => (
        <Card
          key={item.id}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <CardHeader
            sx={{
              p: 2,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
            title={`#${item.numero ?? item.id} — ${item.titulo ?? ''}`}
            titleTypographyProps={{ variant: 'h6', fontWeight: 300 }}
          />
          
          <CardContent sx={{ flexGrow: 1 }}>
            {/* Chips de Estado y Prioridad */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={item.estado ?? 'N/A'}
                color={getStateColor(item.estado)}
                size="small"
                variant="filled"
              />
              <Chip
                label={item.prioridad ?? 'N/A'}
                color={getPriorityColor(item.prioridad)}
                size="small"
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              <strong>Tiempo restante:</strong>{' '}
              {item.tiempoRestante ?? '—'} {item.tiempoRestante ? 'horas' : ''}
            </Typography>
          </CardContent>

          <CardActions
            disableSpacing
            sx={{
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              p: 0,
              maxHeight: '30px',
            }}
          >
            <IconButton
              aria-label="Detalle"
              sx={{ ml: 'auto' }}
              to={`/ticket/${item.id}`}
              component={Link}
              color="primary"
            >
              <Info />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
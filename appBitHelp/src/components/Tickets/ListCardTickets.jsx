// eslint-disable-next-line no-unused-vars
import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Info } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Chip, Box } from '@mui/material'; // Usar Chip y Box para etiquetas y layout

ListCardTickets.propTypes = {
  data: PropTypes.array,
};

// --- Colores de Prioridad (Mapeo) ---
/**
 * Asigna color de Material-UI basado en el texto de prioridad.
 * @param {string} prioridad
 */
const getPriorityColor = (prioridad) => {
  switch (prioridad) {
    case 'Crítica':
      return 'error'; // Rojo, ¡atención!
    case 'Alta':
      return 'warning'; // Naranja, importante
    case 'Media':
      return 'info'; // Azul, estándar
    case 'Baja':
      return 'success'; // Verde, tranquilo
    default:
      return 'default';
  }
};

// --- Colores de Estado (Mapeo) ---
/**
 * Asigna color de Material-UI basado en el texto del estado.
 * @param {string} estado
 */
const getStateColor = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'warning'; // Naranja: por empezar
    case 'Asignado':
      return 'info'; // Azul claro: en cola
    case 'En Proceso':
      return 'primary'; // Azul: activo
    case 'Resuelto':
      return 'success'; // Verde: terminado
    case 'Cerrado':
      return 'default'; // Gris: archivado
    default:
      return 'default';
  }
};
// --- Fin de funciones helper ---

export function ListCardTickets({ data = [] }) {
  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data.map((item) => (
        // Grid responsive: 12 en mobile, 6 en tablet, 4 en desktop
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column', // Necesario para pegar el CardActions abajo
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)' // Sombra para profundidad
            }}
          >
            <CardHeader
              sx={{
                p: 2,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`, // Separador de header
              }}
              title={`#${item.numero ?? item.id} — ${item.titulo ?? ''}`}
              titleTypographyProps={{ variant: 'h6', fontWeight: 500 }}
              subheader={`Técnico: ${item.tecnico ?? 'Sin asignar'}`}
            />

            {/* Content debe crecer para empujar Actions al final */}
            <CardContent sx={{ flexGrow: 1 }}>

              {/* Contenedor de Chips */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={item.estado ?? 'N/A'}
                  color={getStateColor(item.estado)}
                  size="small"
                  variant="filled" // Estado: relleno
                />
                <Chip
                  label={item.prioridad ?? 'N/A'}
                  color={getPriorityColor(item.prioridad)}
                  size="small"
                  variant="outlined" // Prioridad: borde (para diferenciar)
                />
              </Box>

              {item.descripcion && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {/* Truncar descripción larga si es necesario */}
                  {item.descripcion.length > 120
                    ? `${item.descripcion.substring(0, 120)}...`
                    : item.descripcion}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary">
                <strong>Tiempo restante:</strong>{' '}
                {item.tiempoRestante ?? '—'} {item.tiempoRestante ? 'horas' : ''}
              </Typography>

            </CardContent>

            {/* Footer de la tarjeta */}
            <CardActions
              disableSpacing
              sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`, // Separador de footer
                backgroundColor: (theme) => theme.palette.grey[50], // Fondo suave
              }}
            >
              <IconButton
                aria-label="Detalle"
                sx={{ ml: 'auto' }} // Icono a la derecha
                to={`/ticket/${item.id}`} // Enlace al detalle
                component={Link}
                color="primary"
              >
                <Info />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
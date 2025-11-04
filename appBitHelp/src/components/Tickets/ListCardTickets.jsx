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
import { alpha } from '@mui/material/styles';

ListCardTickets.propTypes = {
  data: PropTypes.array,
};

// Asignación de colores para los chips de PRIORIDAD
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

// Asignación de colores para los chips de ESTADO
const getStateColor = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'error';
    case 'Asignado':
      return 'warning';
    case 'En Proceso':
      return 'info';
    case 'Resuelto':
      return 'success';
    case 'Cerrado':
      return 'default';
    default:
      return 'default';
  }
};
// --- FIN DE LA MODIFICACIÓN ---

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
            borderRadius: 3,
          }}
        >
          <CardHeader
            sx={{
              p: 2,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              '& .MuiCardHeader-content': { 
                overflow: 'hidden' 
              }, 
            }}
            title={item.titulo ?? ''} 
            titleTypographyProps={{ 
              variant: 'h6', 
              fontWeight: 300,
              noWrap: true, 
            }}
            action={
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1.5,
                }}
              >
                #{item.numero ?? item.id}
              </Typography>
            }
          />
          
          <CardContent sx={{ pt: 1, pb: 1.5 }}>
            {/* Chips de Estado y Prioridad */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={item.estado ?? 'N/A'} 
                size="small"
                sx={(theme) => {
                  const colorName = getStateColor(item.estado); // 'error', 'warning', 'default', etc.
                  
                  if (colorName === 'default') {
                    // Lógica especial para "Cerrado" (modo oscuro/claro)
                    return (theme.palette.mode === 'light'
                      // MODO CLARO: Fondo Negro, Fuente Blanca
                      ? {
                          fontWeight: 'bold',
                          backgroundColor: '#1c1c1c', 
                          color: '#ffffff',
                        }
                      // MODO OSCURO: Fondo Blanco, Fuente Negra
                      : {
                          fontWeight: 'bold',
                          backgroundColor: '#ffffff',
                          color: '#1c1c1c',
                        }
                    );
                  }

                  // Lógica para los otros chips (Pendiente, Asignado, etc.)
                  return {
                    fontWeight: 'bold',
                    color: theme.palette[colorName].main,
                    backgroundColor: alpha(theme.palette[colorName].main, 0.15),
                  };
                }}
              />
              <Chip
                label={item.prioridad ?? 'N/A'}
                color={getPriorityColor(item.prioridad)}
                size="small"
                variant="outlined"
              />
            </Box>

            {/* Contenedor Flex para el Tiempo Restante y el Botón de Detalles */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pr: 1, 
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    <strong>Tiempo restante:</strong>{' '}
                    {item.tiempoRestante ?? '—'} {item.tiempoRestante ? 'horas' : ''}
                </Typography>

                <IconButton
                    aria-label="Detalle"
                    to={`/ticket/${item.id}`}
                    component={Link}
                    color="primary"
                    size="small" 
                >
                    <Info fontSize="small" />
                </IconButton>
            </Box>
          </CardContent>

          <CardActions
            disableSpacing
            sx={{
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              p: 0,
              maxHeight: '30px',
            }}
          >
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
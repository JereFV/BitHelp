// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Info } from '@mui/icons-material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Chip, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import ManualAssignmentModal from './ManualAssignmentModal';

ListCardTickets.propTypes = {
  data: PropTypes.array,
  onTicketAssigned: PropTypes.func, 
  currentUser: PropTypes.object,
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

export function ListCardTickets({ data = [], onTicketAssigned, currentUser }) {
  // 1. Estado para controlar la visibilidad del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 2. Estado para saber qué tiquete se va a asignar
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // 3. Función para abrir el modal
  // 3. Función para abrir el modal
const handleOpenModal = (ticketId) => {
    // 💡 CORRECCIÓN ROBUSTA: Usar parseInt(value, 10) para garantizar
    // que el valor es un número entero de JavaScript.
    const numericId = parseInt(ticketId, 10);
    
    // Verificamos que sea un número válido y positivo.
    if (!isNaN(numericId) && numericId > 0) {
        setSelectedTicketId(numericId);
        setIsModalOpen(true);
    } else {
        // En caso de que item.id sea inválido (p. ej., null o "N/A")
        console.error("Intento de abrir modal con ID de tiquete inválido:", ticketId);
        setSelectedTicketId(null);
    }
};

  // 4. Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
    // Si se pasa una función para refrescar los tickets, se invoca aquí
    if (onTicketAssigned) {
      onTicketAssigned();
    }
  };

  return (
    // Contenedor principal 
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
                  
                  if (item.estado === 'Cerrado') { // Lógica especial para "Cerrado"
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
                
                {/* 5. Botón de Asignación Manual con Invocación */}
                <Tooltip title="Asignación Manual" placement="bottom-end" >
                    <IconButton
                        aria-label="Asignación Manual"
                        color='warning' 
                        // 👇 Aquí se invoca la función para abrir el modal con el ID del tiquete
                        onClick={() => handleOpenModal(item.id)}
                        size="small"
                        sx={{marginLeft:"7%"}}
                    >
                        <ManageAccountsIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
                
                <Tooltip title="Ver detalle" placement="bottom-start">
                  <IconButton
                      aria-label="Detalle"
                      to={`/ticket/${item.id}`}
                      component={Link}
                      color="primary"
                      size="small" 
                      sx={{marginLeft:"-2%"}}
                  >
                      <Info fontSize="small" />                    
                  </IconButton>
                </Tooltip> 
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

      {/* 6. Renderizar el Modal de Asignación Manual */}
      {selectedTicketId && (
        <ManualAssignmentModal
          open={isModalOpen}
          // El modal se cierra y notifica la recarga de la lista
          onClose={handleCloseModal} 
          idTicket={selectedTicketId}
          currentUser={currentUser} // Se pasa el objeto del administrador
        />
      )}
    </Box>
  );
}
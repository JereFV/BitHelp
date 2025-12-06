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
import { useTranslation } from 'react-i18next';

ListCardTickets.propTypes = {
  data: PropTypes.array,
  onTicketAssigned: PropTypes.func, 
  currentUser: PropTypes.object,
};

export function ListCardTickets({ data = [], onTicketAssigned, currentUser }) {
  const { t } = useTranslation();
  // 1. Estado para controlar la visibilidad del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 2. Estado para saber qué tiquete se va a asignar
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const ADMIN_ROL_ID = 3;

  const getPriorityColor = (prioridad) => {
    const priorityMap = {
      'Crítica': 'error',
      'Critical': 'error',
      'Alta': 'warning',
      'High': 'warning',
      'Media': 'info',
      'Medium': 'info',
      'Baja': 'success',
      'Low': 'success',
    };
    return priorityMap[prioridad] || 'default';
  };

  const getStateColor = (estado) => {
    const stateMap = {
      'Pendiente': 'error',
      'Pending': 'error',
      'Asignado': 'warning',
      'Assigned': 'warning',
      'En Proceso': 'info',
      'In Progress': 'info',
      'Resuelto': 'success',
      'Resolved': 'success',
      'Cerrado': 'default',
      'Closed': 'default',
      'Devuelto': 'secondary',
      'Returned': 'secondary',
    };
    return stateMap[estado] || 'default';
  };

  const translateStatus = (status) => {
    const statusMap = {
      'Pendiente': t('tickets.pending'),
      'Pending': t('tickets.pending'),
      'Asignado': t('tickets.assigned'),
      'Assigned': t('tickets.assigned'),
      'En Proceso': t('tickets.inProgress'),
      'In Progress': t('tickets.inProgress'),
      'Resuelto': t('tickets.resolved'),
      'Resolved': t('tickets.resolved'),
      'Cerrado': t('tickets.closed'),
      'Closed': t('tickets.closed'),
      'Devuelto': t('tickets.returned'),
      'Returned': t('tickets.returned'),
    };
    return statusMap[status] || status;
  };

  const translatePriority = (priority) => {
    const priorityMap = {
      'Crítica': t('common.critical'),
      'Critical': t('common.critical'),
      'Alta': t('common.high'),
      'High': t('common.high'),
      'Media': t('common.medium'),
      'Medium': t('common.medium'),
      'Baja': t('common.low'),
      'Low': t('common.low'),
    };
    return priorityMap[priority] || priority;
  };

  // 3. Función para abrir el modal
  const handleOpenModal = (ticketId) => {
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
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
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
                label={translateStatus(item.estado ?? 'N/A')} 
                size="small"
                sx={(theme) => {
                  const colorName = getStateColor(item.estado);
                  
                  if (item.estado === 'Cerrado' || item.estado === 'Closed') {
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
                label={translatePriority(item.prioridad ?? 'N/A')}
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
                <strong>{t('tickets.timeRemaining')}:</strong>{' '}
                {item.tiempoRestante ?? '—'} {item.tiempoRestante ? t('tickets.hours') : ''}
              </Typography>
              
              {(currentUser && currentUser.idRol == ADMIN_ROL_ID) && (
                <Tooltip title={t('tickets.manualAssignment')} placement="bottom-end">
                  <IconButton
                    aria-label={t('tickets.manualAssignment')}
                    color='warning' 
                    onClick={() => handleOpenModal(item.id)}
                    size="small"
                    sx={{marginLeft:"7%"}}
                  >
                    <ManageAccountsIcon fontSize="small"/>
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title={t('common.view') + ' ' + t('tickets.ticketDetail')} placement="bottom-start">
                <IconButton
                  aria-label={t('tickets.ticketDetail')}
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
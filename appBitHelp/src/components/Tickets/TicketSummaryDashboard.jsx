// Este componente es el dashboard de resumen que muestra el conteo de tiquetes por estado.
// También actúa como el control de filtro para la lista de abajo.

// Importaciones base de React
// useMemo: Lo usamos para que los conteos de tiquetes solo se recalculen si la lista de tiquetes cambia (por eficiencia).
// eslint-disable-next-line no-unused-vars
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// Componentes de Material-UI para el layout y la interacción
import { Grid, Paper, Typography, Box, ButtonBase, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Importamos los iconos de Iconoir que representan cada estado y el total
import {
  RefreshCircle,      // Icono para Pendiente (como si estuviera recargando)
  UserBadgeCheck,    // Icono para Asignado (como un usuario verificado)
  Settings,          // Icono para En Proceso (como si estuviera configurando/trabajando)
  ClipboardCheck,    // Icono para Resuelto (como un check en una nota)
  Archive,           // Icono para Cerrado (como un archivo)
  DatabaseStats,     // Icono para Total (como una base de datos de estadísticas)
} from 'iconoir-react';


// Definimos la estructura y los colores de las tarjetas del dashboard.
// El 'title' DEBE COINCIDIR EXACTAMENTE con el string de estado que viene del backend.
const statItems = [
  {
    title: 'Total',
    icon: DatabaseStats,
    color: 'primary.main', // Color principal de la app para el Total
  },
  {
    title: 'Pendiente',
    icon: RefreshCircle,
    color: 'error.main', // Color rojo (error) porque necesita atención inmediata
  },
  {
    title: 'Asignado',
    icon: UserBadgeCheck,
    color: 'warning.main', // Color naranja (warning) porque está esperando ser tomado
  },
  {
    title: 'En Proceso',
    icon: Settings,
    color: 'info.main', // Color celeste (info) para indicar actividad
  },
  {
    title: 'Resuelto',
    icon: ClipboardCheck,
    color: 'success.main', // Color verde (success) porque ya está terminado
  },
  {
    title: 'Cerrado',
    icon: Archive,
    color: 'text.secondary', // Gris (color secundario) para estados archivados
  },
];


// Este componente renderiza una sola tarjeta de estadística y la hace clicable
function StatCard({ title, count, Icon, color, isActive, onClick }) {
  
  // Define estilos extra para cuando esta tarjeta está activa (seleccionada como filtro)
  const activeStyle = isActive ? {
    // Le pone un borde azul fuerte y un efecto de escala sutil
    boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}`,
    transform: 'scale(1.03)',
  } : {
    // Sombra normal si no está activa
    boxShadow: (theme) => theme.shadows[2], 
  };

  return (
    // ButtonBase envuelve todo para manejar el efecto de clic y la accesibilidad
    <ButtonBase
      onClick={onClick} // Llama a la función de filtro que viene del padre
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 2,
        textAlign: 'left',
        transition: 'transform 0.2s, box-shadow 0.2s', // Transición suave para el efecto
        ...activeStyle, // Aplica el estilo activo/inactivo
      }}
    >
      <Paper
        elevation={0} // La sombra se la dimos al ButtonBase, no a este Paper
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          width: '100%',
          height: '100%',
          // Hacemos la tarjeta ligeramente transparente si no es el filtro activo
          opacity: isActive ? 1 : 0.75, 
        }}
      >
        <Box>
          <Chip
            label={title}
            size="small"
            sx={(theme) => ({
              fontWeight: 'bold',
              mb: 0.5,
              ...(color === 'text.secondary'
                ? {
                    backgroundColor: theme.palette.text.primary,
                    color: theme.palette.background.paper,
                  }
                : {
                    // Son los otros chips (Pendiente, Resuelto, etc.)
                    color: color,
                    backgroundColor: alpha(theme.palette[color.split('.')[0]].main, 0.15),
                  }),
            })}
          />

          <Typography variant="h4" fontWeight="bold">
            {count} {/* El número de tiquetes */}
          </Typography>
        </Box>
        {/* Renderizamos el icono de Iconoir */}
        <Icon 
          height={38} 
          width={38} 
          strokeWidth={1.5} 
          color={color} 
          style={{ opacity: 0.6 }} 
        />
      </Paper>
    </ButtonBase>
  );
}

// Prop-types para StatCard (Validación de tipos de datos)
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  Icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};


// Componente Principal: Recibe todos los tiquetes y el estado de filtro del padre
export function TicketSummaryDashboard({ tickets = [], filtroActivo, onFiltroChange }) {

  // useMemo: Calcula los conteos de tiquetes por estado de forma eficiente
  const counts = useMemo(() => {
    // Contadores iniciales
    const initialCounts = {
      Pendiente: 0,
      Asignado: 0,
      'En Proceso': 0,
      Resuelto: 0,
      Cerrado: 0,
    };
    
    // Recorremos los tiquetes una sola vez (reduce) para contarlos
    const stateCounts = tickets.reduce((acc, ticket) => {
      const estado = ticket.estado;
      // Chequeamos si el estado existe antes de sumar para evitar errores
      // eslint-disable-next-line no-prototype-builtins
      if (acc.hasOwnProperty(estado)) {
        acc[estado]++;
      }
      return acc;
    }, initialCounts);

    // Devolvemos el conteo individual + el total
    return {
      ...stateCounts,
      Total: tickets.length,
    };
  }, [tickets]); // Solo se ejecuta si la lista de tiquetes cambia

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        {/* Mapeamos la lista fija de statItems para crear la grilla de tarjetas */}
        {statItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={item.title}>
            <StatCard
              title={item.title}
              count={counts[item.title] || 0} // Usamos el conteo calculado
              Icon={item.icon}
              color={item.color}
              isActive={filtroActivo === item.title} // Comprueba si esta tarjeta es el filtro activo
              onClick={() => onFiltroChange(item.title)} // Define la acción al hacer clic
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Prop-types para el Dashboard
TicketSummaryDashboard.propTypes = {
  tickets: PropTypes.array,
  filtroActivo: PropTypes.string.isRequired,
  onFiltroChange: PropTypes.func.isRequired,
};
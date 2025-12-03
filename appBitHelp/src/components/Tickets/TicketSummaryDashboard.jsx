import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper, Typography, Box, ButtonBase, Chip, TextField, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Cancel } from '@mui/icons-material';
import {
  RefreshCircle,
  UserBadgeCheck,
  Settings,
  ClipboardCheck,
  Archive,
  DatabaseStats,
} from 'iconoir-react';
import { useTranslation } from 'react-i18next';

function StatCard({ title, count, Icon, color, isActive, onClick }) {
  const activeStyle = isActive ? {
    boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}`,
    transform: 'scale(1.03)',
  } : {
    boxShadow: (theme) => theme.shadows[2], 
  };

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 2,
        textAlign: 'left',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ...activeStyle,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          width: '100%',
          height: '100%',
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
                    color: color,
                    backgroundColor: alpha(theme.palette[color.split('.')[0]].main, 0.15),
                  }),
            })}
          />

          <Typography variant="h4" fontWeight="bold">
            {count}
          </Typography>
        </Box>
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

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  Icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export function TicketSummaryDashboard({ tickets = [], filtroActivo, onFiltroChange, searchId, onSearchIdChange }) {
  const { t } = useTranslation();

  const statItems = useMemo(() => [
    {
      title: t('tickets.total'),
      key: 'Total',
      icon: DatabaseStats,
      color: 'primary.main',
    },
    {
      title: t('tickets.pending'),
      key: 'Pendiente',
      icon: RefreshCircle,
      color: 'error.main',
    },
    {
      title: t('tickets.assigned'),
      key: 'Asignado',
      icon: UserBadgeCheck,
      color: 'warning.main',
    },
    {
      title: t('tickets.inProgress'),
      key: 'En Proceso',
      icon: Settings,
      color: 'info.main',
    },
    {
      title: t('tickets.resolved'),
      key: 'Resuelto',
      icon: ClipboardCheck,
      color: 'success.main',
    },
    {
      title: t('tickets.returned'),
      key: 'Devuelto',
      icon: RefreshCircle,
      color: 'secondary.main',
    },
    {
      title: t('tickets.closed'),
      key: 'Cerrado',
      icon: Archive,
      color: 'text.secondary',
    },
  ], [t]);

  const counts = useMemo(() => {
    const initialCounts = {
      Pendiente: 0,
      Asignado: 0,
      'En Proceso': 0,
      Resuelto: 0,
      Devuelto: 0,
      Cerrado: 0,
    };
    
    const stateCounts = tickets.reduce((acc, ticket) => {
      const estado = ticket.estado;
      if (acc.hasOwnProperty(estado)) {
        acc[estado]++;
      }
      return acc;
    }, initialCounts);

    return {
      ...stateCounts,
      Total: tickets.length,
    };
  }, [tickets]);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label={t('tickets.searchById')}
          placeholder={t('tickets.enterTicketId')}
          value={searchId}
          onChange={(e) => onSearchIdChange(e.target.value)}
          sx={{ maxWidth: 300 }}
          InputProps={{
            endAdornment: searchId && (
              <IconButton size="small" onClick={() => onSearchIdChange('')}>
                <Cancel />
              </IconButton>
            ),
          }}
        />
      </Box>

      <Grid container spacing={2}>
        {statItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={item.key}>
            <StatCard
              title={item.title}
              count={counts[item.key] || 0}
              Icon={item.icon}
              color={item.color}
              isActive={filtroActivo === item.key}
              onClick={() => onFiltroChange(item.key)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

TicketSummaryDashboard.propTypes = {
  tickets: PropTypes.array,
  filtroActivo: PropTypes.string.isRequired,
  onFiltroChange: PropTypes.func.isRequired,
  searchId: PropTypes.string.isRequired,
  onSearchIdChange: PropTypes.func.isRequired,
};
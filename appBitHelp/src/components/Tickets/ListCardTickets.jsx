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

ListCardTickets.propTypes = {
  data: PropTypes.array,
};

export function ListCardTickets({ data = [] }) {
  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data.map((item) => (
        <Grid size={4} key={item.id}>
          <Card>
            <CardHeader
              sx={{
                p: 1,
                backgroundColor: (theme) => theme.palette.secondary.main,
                color: (theme) => theme.palette.common.white,
              }}
              title={`#${item.numero ?? item.id} — ${item.titulo ?? ''}`}
              subheader={`Técnico: ${item.tecnico ?? 'Sin asignar'}`}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                <strong>Estado:</strong> {item.estado ?? 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Prioridad:</strong> {item.prioridad ?? 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Tiempo restante:</strong>{' '}
                {item.tiempoRestante ?? '—'} {item.tiempoRestante ? 'horas' : ''}
              </Typography>

              {/* Si tu query devuelve "descripcion" */}
              {item.descripcion && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {item.descripcion}
                </Typography>
              )}
            </CardContent>

            <CardActions
              disableSpacing
              sx={{
                backgroundColor: (theme) => theme.palette.action.focus,
                color: (theme) => theme.palette.common.white,
              }}
            >
              <IconButton
                aria-label="Detalle"
                sx={{ ml: 'auto' }}
                // si usás rutas, podés reemplazar por Link a: /ticket/{id}
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

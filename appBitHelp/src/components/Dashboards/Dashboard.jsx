import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, CircularProgress, Box } from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
// 1. IMPORTACIÓN CLAVE: Importar useTranslation
import { useTranslation } from 'react-i18next'; 

// Importación del servicio (asegúrese de que la ruta sea correcta)
import TicketService from '../../services/TicketService'; // Ajuste la ruta si es necesario

// Importaciones de MUI X React Charts
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Gauge } from '@mui/x-charts/Gauge';

// Definición de colores base para los gráficos
const COLOR_TICKETS = '#00A896';    // Verde Teal
const COLOR_RANKING = '#673AB7';    // Púrpura Oscuro
const COLOR_RATING = '#FFC107';     // Amarillo Ámbar (Valoración)
const COLOR_SLA_RESPONSE = '#64C944'; // Verde Brillante (SLA Respuesta éxito)
const COLOR_SLA_RESOLUTION = '#64C944'; // Verde  Brillante (SLA Resolución éxito)
const COLOR_SLA_WARNING = '#FF9800'; // Naranja para advertencias
const COLOR_BREACH_FAIL = '#F44336'; // Rojo estándar para fallos

// Paleta de colores más variada y brillante para el PieChart
const PIE_CHART_PALETTE = ['#FF6E40', '#448AFF', '#26A69A', '#E91E63', '#9C27B0', '#9C9C9C'];

// Gráfico 1 Indicador de tickets creados por mes (Gráfico de Barras o Líneas)
const TicketsByMonthChart = ({ data }) => {
    // 2. USO DE TRADUCCIÓN
    const { t } = useTranslation();
    
    // Transformación de los datos para el gráfico
    const months = data.map(item => {
        const date = new Date(item.anio, item.mes - 1); // mes - 1 porque es 0-index
        return date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
    });
    const ticketData = data.map(item => item.total_tickets);

    return (
        <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
                {t('dashboard.ticketsByMonthTitle')}
            </Typography>
            {data.length > 0 ? (
                <BarChart
                    height={280}
                    colors={[COLOR_TICKETS]}
                    // 3. TRADUCCIÓN DE LABEL
                    series={[{ data: ticketData, label: t('dashboard.ticketsLabel') }]}
                    xAxis={[{ data: months, scaleType: 'band' }]}
                />
            ) : (
                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* 3. TRADUCCIÓN DE MENSAJE SIN DATOS */}
                    <Typography color="text.secondary">{t('dashboard.noTicketsData')}</Typography>
                </Box>
            )}
        </Paper>
    );
};


// Gráficos 3, 4, 5. Promedio de valoraciones, Cumplimiento SLA (Gráfico de Medidor/Gauge)
// Este componente no necesita useTranslation si solo recibe el 'title' ya traducido.
const ComplianceGauge = ({ title, value, valueMax, unit, color, statusText }) => (
  <Paper sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Typography variant="h6" gutterBottom textAlign="center">
      {title} 
    </Typography>
    {/* Muestra el estado formal aquí */}
    {statusText && (
      <Typography variant="subtitle1" component="div" sx={{ mb: 1, fontWeight: 'bold', color: color }}>
        {statusText}
      </Typography>
    )}
    <div style={{ width: '90%', height: '90%', display: 'flex', justifyContent: 'center' }}>
      <Gauge 
        key={color}
        value={value} 
        startAngle={-110}
        endAngle={110}
        cornerRadius="50%"
        valueMin={0}
        valueMax={valueMax}
        sx={{
          [`& .MuiGauge-valueText`]: {
            fontSize: 40,
            transform: 'translate(0px, -5px)',
          },
          [`& .MuiGauge-valueArc`]: {
            fill: color,
          },
        }}
        text={({ value }) => `${value.toFixed(1)}${unit}`}
        series={[{ data: [{ value: value, color: color }] }]}
      />
    </div>
  </Paper>
);


// Gráfico 2 Ranking de técnicos (Gráfico de Barras - idealmente horizontal)
const TechnicianRankingChart = ({ data }) => {
    // 2. USO DE TRADUCCIÓN
    const { t } = useTranslation();

    // Transformación de los datos para el gráfico
    const names = data.map(t => t.tecnico_nombre);
    const completions = data.map(t => t.tickets_resueltos_cerrados);

    return (
        <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
                {t('dashboard.technicianRankingTitle')}
            </Typography>
            {data.length > 0 ? (
                <BarChart
                    height={280}
                    colors={[COLOR_RANKING]}
                    layout="horizontal" 
                    // Se revierte el orden para que el Top 1 quede arriba
                    yAxis={[{ data: names.reverse(), scaleType: 'band' }]}
                    // 3. TRADUCCIÓN DE LABEL
                    series={[{ data: completions.reverse(), label: t('dashboard.resolvedTicketsLabel') }]}
                />
            ) : (
                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* 3. TRADUCCIÓN DE MENSAJE SIN DATOS */}
                    <Typography color="text.secondary">{t('dashboard.noRankingData')}</Typography>
                </Box>
            )}
        </Paper>
    );
};


// Gráfico 6 Categorías con más incumplimientos (Gráfico Circular/Pie Chart)
const NonComplianceCategoriesChart = ({ data }) => {
    // 2. USO DE TRADUCCIÓN
    const { t } = useTranslation();

    // Transformación de los datos para el gráfico de torta
    const pieData = data.map((item, index) => ({
        id: index,
        value: item.total_incumplimientos,
        label: item.categoria_nombre,
        color: PIE_CHART_PALETTE[index % PIE_CHART_PALETTE.length],
    }));

    return (
        <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
                {t('dashboard.nonComplianceCategoriesTitle')}
            </Typography>
            {data.length > 0 ? (
                <PieChart
                    series={[
                        {
                            data: pieData,
                            colors: PIE_CHART_PALETTE,
                            innerRadius: 30, 
                            outerRadius: 100,
                            paddingAngle: 5,
                            cornerRadius: 5,
                        },
                    ]}
                    height={220} // Altura ajustada para que quepa la leyenda en móvil
                    slotProps={{
                        legend: {
                            direction: 'horizontal', 
                            position: { 
                                vertical: 'bottom', 
                                horizontal: 'center' 
                            },
                        },
                    }}
                />
            ) : (
                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* 3. TRADUCCIÓN DE MENSAJE SIN DATOS */}
                    <Typography color="text.secondary" >{t('dashboard.noBreachesData')}</Typography>
                </Box>
            )}
        </Paper>
    );
};



// Componente principal del Dashboard
const Dashboard = () => {
    // USO DE TRADUCCIÓN
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        tickets_by_month: [],
        general_rating_average: 0.0,
        sla_compliance: {
            respuesta: { cumplido: 0.0, total: 0 },
            resolucion: { cumplido: 0.0, total: 0 }
        },
        technician_ranking: [],
        categories_breaches: [],
    });

    // Función auxiliar para determinar el estado textual (Óptimo/Riesgo/Crítico)
    const getComplianceStatus = (value, goodThreshold, warningThreshold) => {
        if (value >= goodThreshold) {
            // Se usa 'optimal' en lugar de 'good'
            return t('status.optimal'); 
        } else if (value >= warningThreshold) {
            // Se usa 'acceptable' en lugar de 'warning'
            return t('status.acceptable');
        } else {
            // Se usa 'critical' en lugar de 'bad'
            return t('status.critical');
        }
    };

    // Función para obtener los datos del backend
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await TicketService.getIndicatorsData();
            setDashboardData(response.data); 
        } catch (error) {
            console.error("Error al cargar los datos del dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar los datos al montar el componente
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Muestra un indicador de carga mientras se obtienen los datos
    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <CircularProgress size={80} sx={{ mt: 10 }} />
                {/* 3. TRADUCCIÓN DE MENSAJE DE CARGA */}
                <Typography variant="h6" sx={{ mt: 2 }}>{t('dashboard.loadingData')}</Typography>
            </Container>
        );
    }
    
    // Extracción de datos para simplificar el JSX
    // Extracción y cálculo de datos
    const { 
        tickets_by_month, 
        general_rating_average, 
        sla_compliance, 
        technician_ranking, 
        categories_breaches 
    } = dashboardData;

    // Calcular los estados de cumplimiento usando los umbrales definidos
    const statusSlaResponse = getComplianceStatus(
        sla_compliance.respuesta.cumplido, 
        90, // Óptimo: >= 90%
        70  // Riesgo: 70% - 89.9%
    );

    const statusSlaResolution = getComplianceStatus(
        sla_compliance.resolucion.cumplido, 
        90, // Óptimo: >= 90%
        70  // Riesgo: 70% - 90%
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Título y Cabecera */}
            <Typography variant="h4" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <AssessmentIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
                {/*TRADUCCIÓN DEL TÍTULO PRINCIPAL */}
                {t('dashboard.title')}
            </Typography>

            <Grid container spacing={3}>
                {/* 1. Indicador de tickets creados por mes */}
                <Grid xs={12} md={3} >
                    <TicketsByMonthChart data={tickets_by_month} />
                </Grid>
                
                {/* 2. Ranking de técnicos */}
                <Grid xs={12} md={12} >
                    <TechnicianRankingChart data={technician_ranking} />
                </Grid>

                {/* 3. Promedio de valoraciones general */}
                <Grid xs={12} md={3} >
                    <ComplianceGauge 
                        // 3. TRADUCCIÓN DE TÍTULO ESTÁTICO
                        title={t('dashboard.generalRatingTitle')} 
                        value={general_rating_average} 
                        valueMax={5}
                        unit="/5" // Etiqueta /5 para el valor
                        color={COLOR_RATING}
                    />
                </Grid>

                {/* 4. Indicadores de cumplimiento SLA respuesta (Valor es el porcentaje cumplido)  */}
                <Grid xs={12} md={4}>
                    <ComplianceGauge 
                        //  TRADUCCIÓN DE TÍTULO DINÁMICO con interpolación
                        title={t('dashboard.slaResponseTitle', { total: sla_compliance.respuesta.total })} 
                        value={sla_compliance.respuesta.cumplido} 
                        valueMax={100}
                        unit="%"
                        color={sla_compliance.respuesta.cumplido >= 90 // Verde si > 90%  
                            ? COLOR_SLA_RESPONSE : (sla_compliance.respuesta.cumplido >=70  // Alerta si > 70%  
                                ? COLOR_SLA_WARNING : COLOR_BREACH_FAIL)  // Rojo si es menos de 70%
                        }          
                        statusText={statusSlaResponse}              
                    />
                </Grid>

                {/* 5. Indicadores de cumplimiento SLA resolución (Valor es el porcentaje cumplido)  */}
                <Grid xs={12} md={4}>
                    <ComplianceGauge 
                        // 4. TRADUCCIÓN DE TÍTULO DINÁMICO con interpolación
                        title={t('dashboard.slaResolutionTitle', { total: sla_compliance.resolucion.total })} 
                        value={sla_compliance.resolucion.cumplido} 
                        valueMax={100}
                        unit="%"
                        color={sla_compliance.resolucion.cumplido >= 90 // Verde si > 90%  
                            ? COLOR_SLA_RESOLUTION : (sla_compliance.resolucion.cumplido >=70  // Alerta si es 90%< && >70%   
                                ? COLOR_SLA_WARNING : COLOR_BREACH_FAIL)  // Rojo si es menos de 70%
                        }
                        statusText={statusSlaResolution}
                    />
                </Grid>

                {/* 6. Categorías con más incumplimientos  */}
                <Grid xs={12}>
                    <NonComplianceCategoriesChart data={categories_breaches} />
                </Grid>

            </Grid>
        </Container>
    );
};

export default Dashboard;
import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';

// Importaciones de MUI X React Charts
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Gauge } from '@mui/x-charts/Gauge';
import { LineChart } from '@mui/x-charts/LineChart';

// =========================================================================
// 1. Indicador de tickets creados por mes (Gráfico de Barras o Líneas)
// =========================================================================
const TicketsByMonthChart = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const ticketData = [120, 155, 180, 140, 210, 195];

    return (
        <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
                Tickets creados por mes
            </Typography>
            <BarChart
                height={280}
                series={[{ data: ticketData, label: 'Tickets' }]}
                xAxis={[{ data: months, scaleType: 'band' }]}
            />
        </Paper>
    );
};

// =========================================================================
// 2, 3, 4. Promedio de valoraciones, Cumplimiento SLA (Gráfico de Medidor/Gauge)
// =========================================================================
const ComplianceGauge = ({ title, value, color }) => (
    <Paper sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>
            {title}
        </Typography>
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
            <Gauge 
                value={value} 
                startAngle={-110}
                endAngle={110}
                cornerRadius="50%"
                valueMin={0}
                valueMax={100}
                sx={{
                    [`& .MuiGauge-valueText`]: {
                        fontSize: 40,
                        transform: 'translate(0px, -5px)',
                    },
                }}
                text={({ value, valueMax }) => `${value.toFixed(1)}%`}
                // Personaliza el color de la aguja y la barra
                series={[{ data: [{ value: value, color: color }] }]}
            />
        </div>
    </Paper>
);

// =========================================================================
// 5. Ranking de técnicos (Gráfico de Barras - idealmente horizontal)
// =========================================================================
const TechnicianRankingChart = () => {
    const technicianData = [
        { name: 'Juan C.', completions: 180, color: '#4CAF50' },
        { name: 'Maria F.', completions: 155, color: '#FFC107' },
        { name: 'Pedro A.', completions: 120, color: '#2196F3' },
    ];

    return (
        <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
                Ranking de técnicos (Tickets Resueltos)
            </Typography>
            <BarChart
                height={280}
                layout="horizontal" // Gráfico horizontal para un mejor ranking
                series={[{ data: technicianData.map(t => t.completions), label: 'Tickets' }]}
                yAxis={[{ data: technicianData.map(t => t.name), scaleType: 'band' }]}
            />
        </Paper>
    );
};

// =========================================================================
// 6. Categorías con más incumplimientos (Gráfico Circular/Pie Chart)
// =========================================================================
const NonComplianceCategoriesChart = () => {
    const pieData = [
        { id: 0, value: 35, label: 'Software' },
        { id: 1, value: 25, label: 'Hardware' },
        { id: 2, value: 15, label: 'Redes' },
        { id: 3, value: 10, label: 'Otros' },
    ];

    return (
        <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
                Categorías con más incumplimientos
            </Typography>
            <PieChart
                series={[
                    {
                        data: pieData,
                        innerRadius: 30, // Gráfico de Donut
                        outerRadius: 100,
                        paddingAngle: 5,
                        cornerRadius: 5,
                    },
                ]}
                height={280}
                slotProps={{
                    legend: {
                        direction: 'column',
                        position: { vertical: 'middle', horizontal: 'right' },
                    },
                }}
            />
        </Paper>
    );
};


// =========================================================================
// Componente principal del Dashboard
// =========================================================================
const Dashboard = () => {
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Título y Cabecera */}
            <Typography variant="h4" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <AssessmentIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
                Panel de Control (Dashboard)
            </Typography>

            <Grid container spacing={3}>
                {/* 1. Indicador de tickets creados por mes */}
                <Grid item xs={12} md={6}>
                    <TicketsByMonthChart />
                </Grid>
                
                {/* 2. Ranking de técnicos */}
                <Grid item xs={12} md={6}>
                    <TechnicianRankingChart />
                </Grid>

                {/* 3. Promedio de valoraciones general */}
                {/* NOTA: Usamos el mismo componente Gauge, ajustando el valor a un promedio de 5 puntos */}
                <Grid item xs={12} md={4}>
                    <ComplianceGauge 
                        title="Promedio de valoraciones general (sobre 5)" 
                        value={4.3} 
                        valueMax={5}
                        color="#FF9800" 
                    />
                </Grid>

                {/* 4. Indicadores de cumplimiento SLA respuesta */}
                <Grid item xs={12} md={4}>
                    <ComplianceGauge 
                        title="Cumplimiento SLA Respuesta" 
                        value={92.5} 
                        valueMax={100}
                        color="#4CAF50" // Verde para buen cumplimiento
                    />
                </Grid>

                {/* 5. Indicadores de cumplimiento SLA resolución */}
                <Grid item xs={12} md={4}>
                    <ComplianceGauge 
                        title="Cumplimiento SLA Resolución" 
                        value={88.1} 
                        valueMax={100}
                        color="#2196F3" 
                    />
                </Grid>

                {/* 6. Categorías con más incumplimientos */}
                <Grid item xs={12}>
                    <NonComplianceCategoriesChart />
                </Grid>

            </Grid>
        </Container>
    );
};

export default Dashboard;
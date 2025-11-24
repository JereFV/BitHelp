// TicketsList.jsx - Archivo completo y modificado
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import TicketService from '../../services/TicketService';
import { ListCardTickets } from './ListCardTickets.jsx';
import { TicketSummaryDashboard } from './TicketSummaryDashboard.jsx';

function TicketsList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 💡 1. Nuevo estado para almacenar el usuario logueado
    const [currentUser, setCurrentUser] = useState(null); 

    // Estado para saber qué filtro de estado está activo. 'Total' por defecto.
    const [filtroActivo, setFiltroActivo] = useState('Total');
    const [searchId, setSearchId] = useState(''); // Nuevo estado para búsqueda por ID

    // 💡 2. Función unificada para cargar tickets
    const loadTickets = () => {
        setLoading(true);
        // Obtener el objeto de usuario directamente de localStorage
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        
        // Guardar el usuario en un estado para pasarlo al componente hijo
        setCurrentUser(userSession); 

        // Cargar los tiquetes usando el objeto de sesión
        TicketService.getTicketsByRolUser(userSession)
            .then((res) => {
                setTickets(res?.data || []);
            })
            .catch((err) => {
                console.error('Error cargando tickets:', err);
                setError(err);
            })
            .finally(() => setLoading(false));
    };

    // 💡 3. Función para recargar la lista después de una asignación exitosa
    const handleTicketAssigned = () => {
        // Esta función se pasa a ListCardTickets, que a su vez la llama
        // cuando el modal de asignación se cierra exitosamente.
        loadTickets(); 
    };


    useEffect(() => {
        loadTickets(); // Carga inicial
    }, []);

    // Usamos useMemo para calcular la lista de tiquetes filtrados.
    const tiquetesFiltrados = useMemo(() => {
        // Si hay búsqueda por ID, tiene prioridad sobre los filtros de estado
        if (searchId.trim() !== '') {
            // Convertimos a string para la comparación
            return tickets.filter(ticket => ticket.id.toString() === searchId.trim());
        }
        
        // Si no hay búsqueda, aplica el filtro de estado normal
        if (filtroActivo === 'Total') {
            return tickets;
        }
        // Si no, filtrar por el estado que coincida con el filtro activo
        return tickets.filter(ticket => ticket.estado === filtroActivo);
    }, [tickets, filtroActivo, searchId]);

    return (
        // Contenedor principal de la página
        <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
            
            {/* Título de la página */}
            <Typography
                variant="h4" 
                component="h1"
                gutterBottom
                sx={{
                    fontWeight: 600, 
                    color: 'text.primary', 
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    pb: 1.5,
                    mb: 3, 
                }}
            >
                Listado de Tiquetes
            </Typography>

            {/* Control de estados de carga */}
            {loading && <Typography>Cargando...</Typography>}
            {error && <Typography color="error">Error cargando tiquetes</Typography>}
            
            {!loading && !error && (
                <>
                    {/* Pasamos TODOS los tiquetes al dashboard (para los conteos) */}
                    <TicketSummaryDashboard 
                        tickets={tickets} 
                        filtroActivo={filtroActivo}
                        onFiltroChange={setFiltroActivo}
                        searchId={searchId}
                        onSearchIdChange={setSearchId}
                    />
                    
                    {/* 💡 4. Pasamos las dos nuevas props requeridas: */}
                    <ListCardTickets 
                        data={tiquetesFiltrados} 
                        onTicketAssigned={handleTicketAssigned} 
                        currentUser={currentUser} // <-- ¡Soluciona el Warning!
                    />
                </>
            )}
        </Box>
    );
}

export default TicketsList;
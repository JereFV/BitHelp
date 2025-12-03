import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import TicketService from '../../services/TicketService';
import { ListCardTickets } from './ListCardTickets.jsx';
import { TicketSummaryDashboard } from './TicketSummaryDashboard.jsx';
import { useTranslation } from 'react-i18next';

function TicketsList() {
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); 
    const [filtroActivo, setFiltroActivo] = useState('Total');
    const [searchId, setSearchId] = useState('');

    const loadTickets = () => {
        setLoading(true);
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        setCurrentUser(userSession); 

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

    const handleTicketAssigned = () => {
        loadTickets(); 
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const tiquetesFiltrados = useMemo(() => {
        if (searchId.trim() !== '') {
            return tickets.filter(ticket => ticket.id.toString() === searchId.trim());
        }
        
        if (filtroActivo === 'Total') {
            return tickets;
        }
        return tickets.filter(ticket => ticket.estado === filtroActivo);
    }, [tickets, filtroActivo, searchId]);

    return (
        <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
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
                {t('tickets.ticketsList')}
            </Typography>

            {loading && <Typography>{t('tickets.loading')}</Typography>}
            {error && <Typography color="error">{t('tickets.errorLoadingTickets')}</Typography>}
            
            {!loading && !error && (
                <>
                    <TicketSummaryDashboard 
                        tickets={tickets} 
                        filtroActivo={filtroActivo}
                        onFiltroChange={setFiltroActivo}
                        searchId={searchId}
                        onSearchIdChange={setSearchId}
                    />
                    
                    <ListCardTickets 
                        data={tiquetesFiltrados} 
                        onTicketAssigned={handleTicketAssigned} 
                        currentUser={currentUser}
                    />
                </>
            )}
        </Box>
    );
}

export default TicketsList;
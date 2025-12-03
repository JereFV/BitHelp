import React, { useState, useEffect, useCallback } from 'react';
import {Modal,Box,Typography,TextField,Button,Grid,CircularProgress,
    Alert,FormControl,InputLabel,Select,MenuItem,Card,CardContent,
    Chip,Stack,Tooltip,Divider
} from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PropTypes from 'prop-types';
import TicketService from '../../services/TicketService';
import TechnicianService from '../../services/TechnicianService';
import { Person, Category, PriorityHigh, AccessAlarm, Work, Info,SupportAgent } from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ManualAssignmentModal = ({ open, onClose, idTicket, currentUser }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [justification, setJustification] = useState('');
    const [localError, setLocalError] = useState(null);

    const idAdminUser = currentUser?.idUsuario;

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

    const getAvailabilityColor = (disponibilidad) => {
        const availMap = {
            'Disponible': 'success',
            'Available': 'success',
            'Ocupado': 'warning',
            'Busy': 'warning',
            'Ausente': 'error',
            'Offline': 'error',
        };
        return availMap[disponibilidad] || 'default';
    };

    const translateAvailability = (disp) => {
        if (disp === 'Disponible' || disp === 'Available') return t('technicians.available');
        if (disp === 'Ocupado' || disp === 'Busy') return t('technicians.busy');
        if (disp === 'Ausente' || disp === 'Offline') return t('technicians.offline');
        return disp;
    };

    const translateStatus = (status) => {
        const statusMap = {
            'Pendiente': t('tickets.pending'),
            'Pending': t('tickets.pending'),
            'Asignado': t('tickets.assigned'),
            'Assigned': t('tickets.assigned'),
        };
        return statusMap[status] || status;
    };

    const fetchAssignmentData = useCallback(async () => {
        if (!idTicket) return;

        setLoading(true);
        setLocalError(null);

        try {
            const [ticketRes, techRes] = await Promise.all([
                TicketService.getTicketDetailsForAssignment(idTicket), 
                TechnicianService.getAllTechnicians(),
            ]);
           
            const ticketData = ticketRes.data || null; 
            const allTechnicians = techRes.data.result || techRes.data || [];

            if (!ticketData) {
                throw new Error(t('messages.ticketNotFound'));
            }
               
            setTicket(ticketData);
         
            // 🎯 Validación Obligatoria 1: Solo estado “Pendiente”
            if (ticketData.estado !== 'Pendiente') {
                const errorMessage = t('messages.ticketCannotBeAssigned') + ' ' + ticketData.estado;
                toast.error(errorMessage);
                setLocalError(errorMessage);
                setTechnicians([]);
                setLoading(false);
                return;
            }

            // La validación de especialidad (Obligatoria 2) se deja en el Backend (TicketAssignmentHandler)
            // para asegurar la integridad de los datos. Aquí solo filtramos técnicos activos (asumiendo estado=1).
            const activeTechnicians = allTechnicians.filter(tech => tech.estado == 1);            
            setTechnicians(activeTechnicians);
            
        } catch (err) {
            console.error('Error al cargar datos de asignación:', err);
            const errorMessage = err.message || t('messages.errorLoadingAssignmentData');
            toast.error(errorMessage);
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [idTicket, t]);

    useEffect(() => {
        if (open && idTicket) {
            fetchAssignmentData();
        }
    }, [open, idTicket, fetchAssignmentData]);

    const handleAssignment = async (e) => {
        e.preventDefault();
        setLocalError(null);

        if (!selectedTechnicianId) {
            const errorMessage = t('messages.mustSelectTechnician');
            toast.error(errorMessage);
            setLocalError(errorMessage);
            return;
        }

        if (justification.length < 10) {
            const errorMessage = t('messages.justificationMinLength');
            toast.error(errorMessage);
            setLocalError(errorMessage);
            return;
        }

        setSubmitting(true);
        const loadingToastId = toast.loading(t('tickets.assigning') + '...');

        try {
            const numericIdAdminUser = +idAdminUser;
            await TicketService.assignTicketManually(
                idTicket,
                selectedTechnicianId,
                justification,
                numericIdAdminUser
            );

            toast.success(t('messages.manualAssignmentSuccess'), { id: loadingToastId });
            setTimeout(onClose, 1000); 
            
        } catch (err) {
            console.error('Error en la asignación manual:', err);
            const message = err.response?.data?.error || err.message || t('messages.errorManualAssignment');
            const errorMessage = message.replace('Validación fallida: ', '');
            
            toast.error(errorMessage, { id: loadingToastId });
            setLocalError(errorMessage);
            
        } finally {
            setSubmitting(false);
        }
    };
    
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 650, md: 800 },
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 2,
    };

    if (!open) return null;

    return (
        <>
            <Toaster />
            
            <Modal open={open} onClose={onClose} aria-labelledby="manual-assignment-modal-title">
                <Box sx={style}>
                    <Typography id="manual-assignment-modal-title" textAlign={"center"} variant="h5" component="h2" sx={{ mb: 3 }}>
                        <ManageAccountsIcon sx={{ verticalAlign: 'middle', mr: 1  }} />
                        {t('tickets.manualAssignmentOf')} #{idTicket}
                    </Typography>
                    
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>{t('tickets.loadingInfo')}</Typography>
                        </Box>
                    ) : (
                        <form onSubmit={handleAssignment}>                 
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={5}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {t('tickets.ticketDetails')}
                                            </Typography>
                                            
                                            {ticket ? (
                                                <Stack spacing={1}>
                                                    <Typography variant="body1">
                                                        <strong>{t('tickets.title')}:</strong> {ticket.titulo || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body1" component="div">
                                                        <strong>{t('tickets.assignedTechnician')}:</strong>{' '}
                                                        {ticket.tecnico && ticket.tecnico.trim() !== '' && ticket.tecnico.trim() !== 'Sin técnico' ? (
                                                            <Chip
                                                                icon={<SupportAgent />}
                                                                label={ticket.tecnico}
                                                                color="primary"
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ ml: 1, fontWeight: 'bold' }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                label={t('tickets.unassigned')}
                                                                color="default"
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ ml: 1 }}
                                                            />
                                                        )}
                                                    </Typography>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Chip 
                                                        icon={<Category />} 
                                                        label={`${t('categories.category')}: ${ticket.categoria || 'N/A'}`} 
                                                        size="small"
                                                    />
                                                    <Chip 
                                                        icon={<PriorityHigh />} 
                                                        label={`${t('common.priority')}: ${ticket.prioridad || 'N/A'}`} 
                                                        color={getPriorityColor(ticket.prioridad?.nombre)}
                                                        size="small"
                                                    />
                                                    <Chip 
                                                        icon={<AccessAlarm />} 
                                                        label={`SLA: ${ticket.slaResolucion ? `${ticket.tiempoRestante} ${t('tickets.hours')}` : 'N/A'}`} 
                                                        size="small"
                                                    />
                                                    <Chip 
                                                        icon={<Info />} 
                                                        label={`${t('common.status')}: ${translateStatus(ticket.estado || 'N/A')}`} 
                                                        color={ticket.estadoTiquete?.nombre === 'Pendiente' ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                    <Typography variant="caption" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                         {ticket.estado !== 'Pendiente' && t('tickets.attention') + ' "' + t('tickets.pending') + '".'}
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Alert severity="error">{t('messages.errorLoadingAssignmentData')}</Alert>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={7}>
                                    <Stack spacing={3}>
                                        <Typography variant="h6">
                                            {t('tickets.manualTechnicianSelection')}
                                        </Typography>

                                        <FormControl fullWidth required error={!selectedTechnicianId && !loading && !localError}>
                                            <InputLabel id="technician-select-label">{t('tickets.technicianToAssign')}</InputLabel>
                                            <Select
                                                labelId="technician-select-label"
                                                id="technician-select"
                                                value={selectedTechnicianId}
                                                label={t('tickets.technicianToAssign')}
                                                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                            >
                                                <MenuItem value="" disabled>
                                                    {t('tickets.selectTechnician')}
                                                </MenuItem>
                                                {technicians.map((tech) => (
                                                    <MenuItem key={tech.idTecnico} value={tech.idTecnico} sx={{ py: 1.5, height: 'auto' }}>
                                                        <Stack direction="column" spacing={0.5} sx={{ width: '100%' }}>
                                                            <Grid container alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                                                                    <Typography component="span" variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                        {`${tech.nombre} ${tech.primerApellido}`}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                    <Tooltip title={`${t('technicians.availability')}: ${translateAvailability(tech.disponibilidad)}`}>
                                                                        <Chip
                                                                            label={translateAvailability(tech.disponibilidad)}
                                                                            color={getAvailabilityColor(tech.disponibilidad)}
                                                                            size="small"
                                                                        />
                                                                    </Tooltip>
                                                                </Grid>
                                                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                    <Tooltip title={`${t('technicians.workload')}: ${tech.cargaTrabajo}`}>
                                                                        <Chip
                                                                            icon={<Work fontSize="small" />}
                                                                            label={tech.cargaTrabajo || '0'}
                                                                            size="small"
                                                                            color={tech.cargaTrabajo > 10 ? 'error' : (tech.cargaTrabajo > 5 ? 'warning' : 'default')}
                                                                        />
                                                                    </Tooltip>
                                                                </Grid>
                                                            </Grid>

                                                            <Box sx={{ pl: 4, pt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                                    {t('technicians.specialties')}:
                                                                </Typography>
                                                                {Array.isArray(tech.especialidades) && tech.especialidades.length > 0 ? (
                                                                    tech.especialidades.map((esp) => (
                                                                        <Chip 
                                                                            key={esp} 
                                                                            label={esp} 
                                                                            size="small" 
                                                                            variant="outlined" 
                                                                            color="secondary"
                                                                            sx={{ height: '20px' }}
                                                                        />
                                                                    ))
                                                                ) : (
                                                                    <Chip label={t('tickets.none')} size="small" color="default" sx={{ height: '20px' }}/>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <Typography variant="caption" sx={{ mt: 1 }}>
                                                {t('tickets.validationSpecialty')}
                                            </Typography>
                                        </FormControl>

                                        <TextField
                                            label={t('tickets.assignmentJustification')}
                                            multiline
                                            rows={4}
                                            fullWidth
                                            required
                                            value={justification}
                                            onChange={(e) => setJustification(e.target.value)}
                                            helperText={`${t('tickets.minimumCharacters')} ${justification.length}`}
                                            error={justification.length > 0 && justification.length < 10}
                                        />

                                        {localError && (
                                            <Alert severity="error" onClose={() => setLocalError(null)} sx={{mt: 2}}>
                                                {localError}
                                            </Alert>
                                        )}

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                                            <Button 
                                                onClick={onClose} 
                                                color="inherit"
                                                disabled={submitting}
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                variant="contained" 
                                                color="primary"
                                                disabled={submitting || !selectedTechnicianId || justification.length < 10 || localError}
                                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ManageAccountsIcon />}
                                            >
                                                {submitting ? t('tickets.assigning') : t('tickets.assignTicket')}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </Box>
            </Modal>
        </>
    );
};

ManualAssignmentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    idTicket: PropTypes.number,
    currentUser: PropTypes.object,
};

export default ManualAssignmentModal;
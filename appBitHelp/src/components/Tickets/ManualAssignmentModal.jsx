import React, { useState, useEffect, useCallback } from 'react';
import {Modal,Box,Typography,TextField,Button,Grid,CircularProgress,
    Alert,FormControl,InputLabel,Select,MenuItem,Card,CardContent,
    Chip,Stack,Tooltip,Divider
} from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PropTypes from 'prop-types';
import TicketService from '../../services/TicketService'; // Ajusta la ruta si es necesario
import TechnicianService from '../../services/TechnicianService'; // Ajusta la ruta si es necesario
import { Person, Category, PriorityHigh, AccessAlarm, Work, Info,SupportAgent } from '@mui/icons-material';

// --- Funciones Auxiliares para colores de Chips ---

const getPriorityColor = (prioridad) => {
    switch (prioridad) {
        case 'Crítica': return 'error';
        case 'Alta': return 'warning';
        case 'Media': return 'info';
        case 'Baja': return 'success';
        default: return 'default';
    }
};

const getAvailabilityColor = (disponibilidad) => {
    switch (disponibilidad) {
        case 'Disponible': return 'success';
        case 'Ocupado': return 'warning';
        case 'Ausente': return 'error';
        default: return 'default';
    }
};

// --- Componente Principal ---

/**
 * Modal para la asignación manual de un tiquete.
 * @param {boolean} open Estado de apertura del modal.
 * @param {function} onClose Función para cerrar el modal.
 * @param {number} idTicket ID del tiquete a asignar.
 * @param {object} currentUser Objeto con la información del usuario logueado (admin) - Debe tener idUsuario.
 */
const ManualAssignmentModal = ({ open, onClose, idTicket, currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [justification, setJustification] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // REVISAR VALIDAR QUE SEA USUARIO ADMIN
    const idAdminUser = currentUser?.idUsuario// Usar 11 como fallback si no hay usuario

    const fetchAssignmentData = useCallback(async () => {
        if (!idTicket) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. Obtener detalles del Tiquete y lista de Técnicos
            const [ticketRes, techRes] = await Promise.all([
            // Asegúrate de que no haya typos aquí
            TicketService.getTicketDetailsForAssignment(idTicket), 
            TechnicianService.getAllTechnicians(),
            ]);
           
            // Asumimos que la respuesta es un array con un objeto
            // Esta lógica es segura ahora gracias a la corrección en el Modelo PHP
            const ticketData = ticketRes.data || null; 
            const allTechnicians = techRes.data.result || techRes.data || [];

            if (!ticketData) {
                // Ahora, si el backend devuelve 'null' (tiquete no encontrado), el error es limpio.
                throw new Error('No se encontró el tiquete o la respuesta está vacía.');
            }
               
            setTicket(ticketData);
         
            // 🎯 Validación Obligatoria 1: Solo estado “Pendiente”
            if (ticketData.estado !== 'Pendiente') {
                setError('El tiquete no puede ser asignado. Su estado actual es: ' + ticketData.estado);
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
            // Mostrar error amigable al usuario
            setError(err.message || 'Error al cargar los datos necesarios para la asignación.');
        } finally {
            setLoading(false);
        }
    }, [idTicket]);

    useEffect(() => {
  
        if (open && idTicket) {
            fetchAssignmentData();
        }
    }, [open, idTicket, fetchAssignmentData]);

    const handleAssignment = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!selectedTechnicianId) {
            setError('Debe seleccionar un técnico.');
            return;
        }
        // 🎯 Requisito: Justificación correspondiente (validación de longitud mínima)
        if (justification.length < 10) {
            setError('La justificación debe tener al menos 10 caracteres.');
            return;
        }

        setSubmitting(true);

        try {
            const numericIdAdminUSer= +idAdminUser;
            await TicketService.assignTicketManually(
                idTicket,
                selectedTechnicianId,
                justification,
                numericIdAdminUSer
            );

            setSuccess(true);
            // Opcional: Llamar a una función de actualización de la lista de tickets aquí
            // setTimeout(onClose, 2000); 
            
        } catch (err) {
            console.error('Error en la asignación manual:', err);
            // Captura el mensaje de error personalizado del backend (Validación de especialidad o estado)
            const message = err.response?.data?.error || err.message || 'Ocurrió un error al intentar asignar el tiquete.';
            setError(message.replace('Validación fallida: ', ''));
        } finally {
            setSubmitting(false);
        }
    };
    
    // Estilo para centrar el modal
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
        <Modal open={open} onClose={onClose} aria-labelledby="manual-assignment-modal-title">
            <Box sx={style}>
                <Typography id="manual-assignment-modal-title" textAlign={"center"} variant="h5" component="h2" sx={{ mb: 3 }}>
                    <ManageAccountsIcon sx={{ verticalAlign: 'middle', mr: 1  }} />
                    Asignación Manual de Tiquete #{idTicket}
                </Typography>
                
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Cargando información y técnicos...</Typography>
                    </Box>
                ) : (
                    <form onSubmit={handleAssignment}>
                        {/* ADVERTENCIA: Grid item y xs/sm fueron deprecados en MUI v5 para Grid. Reemplaza 'item' y usa la sintaxis sin él. */}
                        <Grid container spacing={3}>
                            
                            {/* Vista Clara y Organizada: Información del Ticket */}
                            <Grid item xs={12} md={5}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Detalles del Tiquete
                                        </Typography>
                                        
                                        {ticket ? (
                                            <Stack spacing={1}>
                                                <Typography variant="body1">
                                                    <strong>Título:</strong> {ticket.titulo || 'N/A'}
                                                </Typography>
                                                {/* 🚨 NUEVO CAMPO: Técnico Asignado Actual */}
                                            <Typography variant="body1" component="div">
                                                    <strong>Técnico Asignado:</strong>{' '}
                                                    {/* Verificamos si la propiedad 'tecnico' existe y no es una cadena vacía o nula */}
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
                                                            label="Sin Asignar"
                                                            color="default"
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    )}
                                                </Typography>
                                                
                                                <Divider sx={{ my: 1 }} />
                                            {/* FIN NUEVO CAMPO */}
                                                {/* 🎯 Requisito: Información del ticket (categoría, prioridad, SLA) */}
                                                <Chip 
                                                    icon={<Category />} 
                                                    label={`Categoría: ${ticket.categoria || 'N/A'}`} 
                                                    size="small"
                                                />
                                                <Chip 
                                                    icon={<PriorityHigh />} 
                                                    label={`Prioridad: ${ticket.prioridad || 'N/A'}`} 
                                                    color={getPriorityColor(ticket.prioridad?.nombre)}
                                                    size="small"
                                                />
                                                <Chip 
                                                    icon={<AccessAlarm />} 
                                                    label={`SLA: ${ticket.slaResolucion ? `${ticket.tiempoRestante} horas` : 'N/A'}`} 
                                                    size="small"
                                                />
                                                <Chip 
                                                    icon={<Info />} 
                                                    label={`Estado: ${ticket.estado || 'N/A'}`} 
                                                    color={ticket.estadoTiquete?.nombre === 'Pendiente' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                                <Typography variant="caption" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                     {ticket.estado !== 'Pendiente' && '¡ATENCIÓN! El tiquete no está en estado "Pendiente".'}
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            <Alert severity="error">No se pudo cargar la información del tiquete.</Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Columna Derecha: Selección y Justificación */}
                            <Grid item xs={12} md={7}>
                                <Stack spacing={3}>
                                    <Typography variant="h6">
                                        Selección Manual del Técnico
                                    </Typography>

                                    {/* Selector de Técnico con Carga, Disponibilidad y Especialidad (implícita) */}
                                    <FormControl fullWidth required error={!selectedTechnicianId && !loading && !error}>
                                        <InputLabel id="technician-select-label">Técnico a Asignar</InputLabel>
                                        <Select
                                            labelId="technician-select-label"
                                            id="technician-select"
                                            value={selectedTechnicianId}
                                            label="Técnico a Asignar"
                                            onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                        >
                                            <MenuItem value="" disabled>
                                                Seleccione un técnico
                                            </MenuItem>
                                            {/* 🎯 Requisito: Lista de técnicos con carga de trabajo, disponibilidad y especialidad */}
                                            {technicians.map((tech) => (
                        <MenuItem key={tech.idTecnico} value={tech.idTecnico} sx={{ py: 1.5, height: 'auto' }}>
                                                    {/* Usamos un Stack vertical para agrupar la información */}
                                                    <Stack direction="column" spacing={0.5} sx={{ width: '100%' }}>
                                                        
                                                        {/* Fila 1: Nombre, Disponibilidad y Carga */}
                                                        <Grid container alignItems="center">
                                                            <Grid item xs={6}> {/* Más espacio para el nombre */}
                                                                <Person sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                                                                <Typography component="span" variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                    {`${tech.nombre} ${tech.primerApellido}`}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                <Tooltip title={`Disponibilidad: ${tech.disponibilidad}`}>
                                                                    <Chip
                                                                        label={tech.disponibilidad}
                                                                        color={getAvailabilityColor(tech.disponibilidad)}
                                                                        size="small"
                                                                    />
                                                                </Tooltip>
                                                            </Grid>
                                                            <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <Tooltip title={`Carga de Trabajo: ${tech.cargaTrabajo}`}>
                                                                    <Chip
                                                                        icon={<Work fontSize="small" />}
                                                                        label={tech.cargaTrabajo || '0'}
                                                                        size="small"
                                                                        color={tech.cargaTrabajo > 10 ? 'error' : (tech.cargaTrabajo > 5 ? 'warning' : 'default')}
                                                                    />
                                                                </Tooltip>
                                                            </Grid>
                                                        </Grid>

                                                        {/* Fila 2: Especialidades */}
                                                        <Box sx={{ pl: 4, pt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                                Especialidades:
                                                            </Typography>
                                                            {/* Convertimos el string a array (si no lo hizo PHP) o mapeamos el array */}
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
                                                                <Chip label="Ninguna" size="small" color="default" sx={{ height: '20px' }}/>
                                                            )}
                                                        </Box>
                                                    </Stack>
                        </MenuItem>
                      ))}
                                        </Select>
                                        <Typography variant="caption" sx={{ mt: 1 }}>
                                            **Validación de Especialidad:** El sistema verificará que el técnico posea la especialidad requerida por la categoría.
                                        </Typography>
                                    </FormControl>

                                    {/* Justificación (Requisito de Asignación) */}
                                    <TextField
                                        label="Justificación de la Asignación Manual"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        required
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        helperText={`Mínimo 10 caracteres. Actual: ${justification.length}`}
                                        error={justification.length > 0 && justification.length < 10}
                                    />

                                    {/* Mensajes de Validación y Error */}
                                    {error && (
                                        <Alert severity="error" onClose={() => setError(null)} sx={{mt: 2}}>
                                            {error}
                                        </Alert>
                                    )}

                                    {success && (
                                        <Alert severity="success" onClose={onClose} sx={{mt: 2}}>
                                            ¡Asignación Manual registrada correctamente! Método: **Manual**.
                                        </Alert>
                                    )}

                                    {/* Botones de Acción */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                                        <Button 
                                            onClick={onClose} 
                                            color="inherit"
                                            disabled={submitting}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            variant="contained" 
                                            color="primary"
                                            // Deshabilitar si está enviando, no hay técnico o la justificación es muy corta
                                            disabled={submitting || !selectedTechnicianId || justification.length < 10}
                                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ManageAccountsIcon />}
                                        >
                                            {submitting ? 'Asignando...' : 'Asignar Tiquete'}
                                        </Button>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Box>
        </Modal>
    );
};

ManualAssignmentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    idTicket: PropTypes.number,
    currentUser: PropTypes.object,
};

export default ManualAssignmentModal;
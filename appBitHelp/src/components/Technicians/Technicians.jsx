import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid'; 
import { 
    Button, Modal, Box, Typography, Chip, Divider, Paper, Stack, Alert,
    TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput,
    FormControlLabel, Switch, IconButton,
    // Importaciones para el nuevo Diálogo de Confirmación
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material'; 
import { esES } from '@mui/x-data-grid/locales'; 
import TechnicianService from '../../services/TechnicianService'; 
import { AccountCircle, Mail, Phone, Work, Verified } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UserService from '../../services/userService'; 

// Estilo del modal para centrarlo
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450, 
    bgcolor: 'background.paper',
    borderRadius: 2, 
    boxShadow: 12, 
    p: 4,
};

// Helper para renderizar el Chip de estado
const getStatusChip = (estado) => {
    const isActive = estado === '1' || estado === 1;
    return (
        <Chip
            label={isActive ? 'Activo' : 'Inactivo'}
            color={isActive ? 'success' : 'error'}
            variant="outlined"
            size="small"
        />
    );
};

// Helper 2: Disponibilidad (Disponible/Ocupado)
const getAvailabilityChip = (disponibilidad) => {
    const isAvailable = disponibilidad === 'Disponible';
    return (
        <Chip
            label={disponibilidad}
            color={isAvailable ? 'info' : 'warning'}
            variant="filled"
            size="small"
        />
    );
};

export const TechniciansDataGridWithModal = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openFormModal, setOpenFormModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [usersList, setUsersList] = useState([]);
    const [specialtiesList, setSpecialtiesList] = useState([]); 
    const [availabilityList, setAvailabilityList] = useState([]);

    const [formData, setFormData] = useState({
        idTecnico: null, 
        idUsuario: '',
        idDisponibilidad: 1,
        estado: 1,
        cargaTrabajo: 0,
        especialidades: [] 
    });
    
    const [formErrors, setFormErrors] = useState({}); // Nuevo estado para errores de formulario

    // Mensajes
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // ESTADO PARA EL DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [technicianToDeleteId, setTechnicianToDeleteId] = useState(null);
    
    // Lista de IDs de usuario que ya son técnicos
    const technicianUserIds = useMemo(() => rows.map(r => r.idUsuario), [rows]);

    // Usuarios que no son técnicos (disponibles para ser creados como técnicos)
    const availableUsers = useMemo(() => {
        return usersList.filter(user => !technicianUserIds.includes(user.idUsuario));
    }, [usersList, technicianUserIds]);

    // Usuario que se está editando actualmente (SOLUCIÓN AL PROBLEMA #2)
    const currentTechnicianUser = useMemo(() => {
        if (isEditMode && formData.idUsuario && usersList.length > 0) {
            return usersList.find(u => u.idUsuario === formData.idUsuario);
        }
        return null;
    }, [isEditMode, formData.idUsuario, usersList]);

    // Función para obtener datos externos (Usuarios, Especialidades, Disponibilidad)
    const fetchExternalData = async () => {
        try {
            // OBTENER USUARIOS (SOLUCIÓN AL PROBLEMA #1)
            const usersResponse = await UserService.getUsers();
            // Ajuste para manejar diferentes formatos de respuesta API
            const usersData = usersResponse.data.result || usersResponse.data;
            setUsersList(Array.isArray(usersData) ? usersData : []); 

            // OBTENER ESPECIALIDADES
            const specialtiesResponse = await TechnicianService.getSpecialties();
            setSpecialtiesList(specialtiesResponse.data.result || specialtiesResponse.data || []);

            // OBTENER DISPONIBILIDAD
            const availabilityResponse = await TechnicianService.getDisponibilities();
            setAvailabilityList(availabilityResponse.data.result || availabilityResponse.data || []);
        } catch (error) {
            console.error("Error al cargar datos externos:", error.response?.data?.message || error.message);
            showAlert('error', 'Error al cargar listas de selección. Revise la consola.');
        }
    };

    // Carga inicial de técnicos
    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const response = await TechnicianService.getAllTechnicians();
            let apiData = response.data;

            if (apiData && apiData.result && Array.isArray(apiData.result)) {
                apiData = apiData.result;
            }

            if (!Array.isArray(apiData)) {
                console.error("Respuesta de la API no es un array:", apiData);
                showAlert('error', 'Formato de datos de técnicos inesperado.');
                apiData = [];
            }

            // Mapeo de datos (Ajustado para asegurar 'id' y 'disponibilidad' con nombre)
            const techniciansData = apiData.map(item => ({
                id: item.idTecnico || item.id, 
                idUsuario: item.idUsuario,
                disponibilidad: item.disponibilidad || 'Desconocida', 
                idDisponibilidad: item.idDisponibilidad, 
                cargaTrabajo: item.cargaTrabajo,
                nombreCompleto: `${item.nombre} ${item.primerApellido} ${item.segundoApellido}`,
                correo: item.correo,
                telefono: item.telefono,
                estado: String(item.estado),
                // Aseguramos que especialidades es un array de strings (nombres) para el modal de detalle
                especialidades: item.especialidades && Array.isArray(item.especialidades) 
                    ? item.especialidades.map(e => typeof e === 'string' ? e : (e.nombre || 'N/A')) 
                    : [],
            }));

            setRows(techniciansData);
        } catch (error) {
            console.error("Error al obtener los técnicos:", error.response?.data?.message || error.message);
            showAlert('error', 'Error al cargar los técnicos desde la API.');
        } finally {
            setLoading(false);
        }
    };

    // Carga inicial
    useEffect(() => {
        fetchTechnicians();
        fetchExternalData();
    }, []);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
    };

    // Validación del formulario
    const validateForm = () => {
        let errors = {};
        let isValid = true;

        if (!isEditMode && !formData.idUsuario) {
            errors.idUsuario = 'Debe seleccionar un usuario.';
            isValid = false;
        }

        if (formData.especialidades.length === 0) {
            errors.especialidades = 'Debe seleccionar al menos una especialidad.';
            isValid = false;
        }

        // Carga de trabajo solo debe ser válida si no es modo edición (el sistema la maneja)
        if (!isEditMode && (formData.cargaTrabajo < 0 || formData.cargaTrabajo === undefined || formData.cargaTrabajo === null)) {
             errors.cargaTrabajo = 'La carga de trabajo inicial no puede ser negativa.';
             isValid = false;
        }
        
        setFormErrors(errors);
        return isValid;
    };


    const handleOpenModal = (row) => {
        setSelectedRow(row);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRow(null);
    };

    const handleOpenFormModal = (editMode = false, row = null) => {
        setIsEditMode(editMode);
        setFormErrors({}); // Limpiar errores al abrir
        
        if (editMode && row) {
            // Cargar datos para editar
            TechnicianService.getTechnicianById(row.id).then(response => {
                const data = response.data.result || response.data;
                
                if (!data || !data.idTecnico) {
                    showAlert('error', 'No se pudieron cargar los datos del técnico para edición.');
                    return;
                }

                // Obtener ID de Disponibilidad (lo hacemos dentro de la promesa por si availabilityList no se ha cargado)
                const availabilityName = data.disponibilidad;
                const foundAvailability = availabilityList.find(
                    (item) => item.nombre === availabilityName
                );
                const defaultAvailabilityId = 1; // 'Disponible' por defecto
                const finalIdDisponibilidad = foundAvailability ? foundAvailability.idDisponibilidad : defaultAvailabilityId;

                // *** LÓGICA DE PRECARGA DE ESPECIALIDADES: Mapear Nombres (API) a IDs (Formulario) ***
                const techSpecialtyNames = data.especialidades && Array.isArray(data.especialidades) 
                    ? data.especialidades 
                    : [];

                const selectedSpecialtyIds = techSpecialtyNames
                    .map(name => {
                        const specialty = specialtiesList.find(s => s.nombre === name);
                        return specialty ? specialty.idEspecialidad : null;
                    })
                    .filter(id => id !== null); 
                
                // Asignar los valores al estado del formulario
                setFormData({
                    idTecnico: data.idTecnico, 
                    idUsuario: data.idUsuario || '', 
                    estado: data.estado === 1 || data.estado === '1' ? 1 : 0, 
                    idDisponibilidad: finalIdDisponibilidad,
                    cargaTrabajo: data.cargaTrabajo ? parseInt(data.cargaTrabajo, 10) || 0 : 0,      
                    especialidades: selectedSpecialtyIds, // Array de IDs precargado
                });

            }).catch(error => {
                console.error("Error al obtener el técnico para edición:", error);
                showAlert('error', 'Error al cargar los detalles del técnico para edición.');
            });

        } else {
            // Modo Creación
            setFormData({
                idTecnico: null,
                idUsuario: '',
                idDisponibilidad: 1, // Por defecto 'Disponible'
                estado: 1, // Por defecto 'Activo'
                cargaTrabajo: 0, // Por defecto 0
                especialidades: []
            });
        }
        setOpenFormModal(true);
    };

    const handleCloseFormModal = () => {
        setOpenFormModal(false);
        setFormErrors({});
        // Limpiar formData al cerrar
        setFormData({
            idTecnico: null,
            idUsuario: '',
            idDisponibilidad: 1,
            estado: 1,
            cargaTrabajo: 0,
            especialidades: []
        });
    };

    const handleInputChange = (field, value) => {
        setFormErrors(prev => ({ ...prev, [field]: undefined })); // Limpiar error al cambiar

        if (field === 'estado') {
            setFormData(prev => ({ ...prev, [field]: value ? 1 : 0 }));
        } else if (field === 'cargaTrabajo') {
            // Asegurar que sea un número no negativo
            const numValue = parseInt(value, 10);
            setFormData(prev => ({ ...prev, [field]: isNaN(numValue) || numValue < 0 ? 0 : numValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showAlert('error', 'Por favor, corrija los errores en el formulario.');
            return;
        }
        
        let payload = { ...formData };
        
        // Ajuste de Payload
        if (!isEditMode) {
            delete payload.idTecnico; 
        } else {
            // En edición, solo enviamos los campos que se pueden modificar.
            // Los campos que el sistema actualiza (como cargaTrabajo y idUsuario) los eliminamos del payload de la edición
            payload = {
                idDisponibilidad: payload.idDisponibilidad,
                estado: payload.estado,
                especialidades: payload.especialidades,
            }
        }

        try {
            if (isEditMode) {
                await TechnicianService.updateTechnician(formData.idTecnico, payload);
                showAlert('success', 'Técnico actualizado exitosamente');
            } else {
                await TechnicianService.createTechnician(payload);
                showAlert('success', 'Técnico creado exitosamente');
            }
            handleCloseFormModal();
            fetchTechnicians(); // Recargar la lista después de la operación
        } catch (error) {
            console.error("Error al guardar:", error.response?.data?.message || error.message);
            showAlert('error', `Error al guardar el técnico: ${error.response?.data?.message || 'Error de conexión'}`);
        }
    };

    // FUNCIÓN PARA ABRIR EL DIÁLOGO DE CONFIRMACIÓN
    const confirmDelete = (id) => {
        setTechnicianToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    // FUNCIÓN PARA CERRAR EL DIÁLOGO DE CONFIRMACIÓN
    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setTechnicianToDeleteId(null);
    };
    
    // FUNCIÓN QUE EJECUTA LA ELIMINACIÓN (Llamada desde el Dialog)
    const executeDelete = async () => {
        setIsDeleteDialogOpen(false); // Cierra el modal primero
        if (!technicianToDeleteId) return;

        try {
            await TechnicianService.deleteTechnician(technicianToDeleteId);
            showAlert('success', 'Técnico despromovido exitosamente');
            fetchTechnicians();
        } catch (error) {
            console.error("Error al despromover:", error.response?.data?.message || error.message);
            showAlert('error', `Error al despromover el técnico: ${error.response?.data?.message || 'Error de conexión'}`);
        } finally {
            setTechnicianToDeleteId(null); // Limpia el ID
        }
    };


    const columns = [
        { field: 'nombreCompleto', headerName: 'Técnico', minWidth: 240, headerAlign: 'center', align: 'center', flex: 0.7, },
        
        { 
            field: 'disponibilidad', 
            headerName: 'Disponibilidad', 
            minWidth: 150, 
            headerAlign: 'center', 
            align: 'center', 
            flex: 1,
            renderCell: (params) => getAvailabilityChip(params.value),
        },

        {
            field: 'estado',
            headerName: 'Estado',
            minWidth: 170,
            headerAlign: 'center',
            align: 'center',
            flex: 0.4,
            renderCell: (params) => getStatusChip(params.value),
        },
        {
            field: 'actions',
            headerName: 'Opciones',
            minWidth: 140,
            headerAlign: 'center',
            align: 'center',
            sortable: false, // Las acciones no son ordenables
            filterable: false, // Las acciones no son filtrables
            flex: 0.6,
            renderCell: (params) => (
                <Stack direction="row" spacing={2} justifyContent="center">
                    <IconButton color="primary" size="small" onClick={() => handleOpenModal(params.row)} aria-label="Ver detalles">
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary" size="small" onClick={() => handleOpenFormModal(true, params.row)} aria-label="Editar">
                        <EditIcon />
                    </IconButton>
                    {/* Llamada al nuevo Diálogo de Confirmación */}
                    <IconButton color="error" size="small" onClick={() => confirmDelete(params.row.id)} aria-label="Eliminar/Despromover">
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
        }, 
    ];

    return (
        <div style={{ height: 600, width: '100%' }}>
            {/* Alertas */}
            {alert.show && (
                <Alert 
                    severity={alert.type} 
                    sx={{ mb: 2 }} 
                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                >
                    {alert.message}
                </Alert>
            )}
            
            {/* Botón de Creación */}
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenFormModal(false)}
                >
                    Crear Técnico
                </Button>
            </Box>
            
            {/* DataGrid */}
            {loading ? (
                <Typography variant="h6">Cargando técnicos...</Typography>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id} 
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } }
                    }}
                    disableRowSelectionOnClick
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 2,
                    }}
                />
            )}

            {/* Modal de Detalles del Técnico (sin cambios) */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="technician-modal-title"
            >
                <Box sx={modalStyle}>
                    <Typography id="technician-modal-title" variant="h5" component="h2" mb={1} color="text.primary" fontWeight={600}>
                        Detalles del Técnico
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {selectedRow && (
                        <Box id="modal-modal-description">
                            {/* Fila de Nombre y ID */}
                            <Box display="flex" alignItems="center" mb={1}>
                                <AccountCircle color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" fontWeight="bold" mr={1}>
                                    {selectedRow.nombreCompleto}
                                </Typography>
                                {/* Estado (con color) */}
                                {getStatusChip(selectedRow.estado)}
                            </Box>

                            {/* Detalle Contacto */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    CONTACTO
                                </Typography>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <Mail color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography variant="body2">{selectedRow.correo}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <Phone color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography variant="body2">{selectedRow.telefono || 'N/A'}</Typography>
                                </Box>
                            </Paper>
                            
                            {/* Detalle Carga/Disponibilidad */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    MÉTRICAS DE TRABAJO
                                </Typography>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <Work color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography variant="body2">Carga de Trabajo: {selectedRow.cargaTrabajo}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                                    {getAvailabilityChip(selectedRow.disponibilidad)}
                                </Box>
                            </Paper>

                            {/* Detalle Especialidades */}
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Box mb={1} display="flex" alignItems="center">
                                    <Verified color="action" sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle'}}/>
                                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                                        ESPECIALIDADES
                                    </Typography>
                                </Box>
                                <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                                    {selectedRow.especialidades && selectedRow.especialidades.length > 0 ? (
                                        selectedRow.especialidades.map((esp, index) => (
                                            <Chip 
                                                key={index} 
                                                label={esp} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined" 
                                            />
                                        ))
                                    ) : (
                                        <Typography fontSize={14} color="text.secondary" sx={{ml: 0.5}}>
                                            No tiene especialidades asignadas.
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>
                        </Box>
                    )}
                    <Button onClick={handleCloseModal} variant="contained" sx={{ mt: 3, float: 'right' }}>Cerrar</Button>
                </Box>
            </Modal>

            {/* Modal de Formulario (Crear/Editar) */}
            <Modal
                open={openFormModal}
                onClose={handleCloseFormModal}
                aria-labelledby="technician-form-modal-title"
            >
                <Box sx={modalStyle} component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <Typography id="technician-form-modal-title" variant="h5" component="h2" mb={1} color="text.primary" fontWeight={600}>
                        {isEditMode ? 'Editar Técnico' : 'Crear Nuevo Técnico'}
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={3}>
                        {/* Campo: Usuario Asociado (SOLUCIÓN PARA EDICIÓN) */}
                        <FormControl 
                            fullWidth 
                            required 
                            error={!!formErrors.idUsuario}
                            disabled={isEditMode} // Mantenemos el campo deshabilitado en edición
                        >
                            <InputLabel id="user-select-label">Usuario</InputLabel>
                            <Select
                                labelId="user-select-label"
                                id="idUsuario"
                                value={formData.idUsuario} 
                                label="Usuario"
                                onChange={(e) => handleInputChange('idUsuario', e.target.value)}
                                // Renderiza el nombre completo del usuario si está en modo edición y lo encontró
                                {...(isEditMode && currentTechnicianUser ? {
                                    renderValue: () => `${currentTechnicianUser.usuario} - ${currentTechnicianUser.nombre} ${currentTechnicianUser.primerApellido}`
                                } : {})}
                            >
                                <MenuItem value="">
                                <em>Seleccione un Usuario</em>
                                </MenuItem>
                                
                                {/* En modo Edición, solo muestra el usuario actual como opción válida */}
                                {isEditMode && currentTechnicianUser && (
                                    <MenuItem key={currentTechnicianUser.idUsuario} value={currentTechnicianUser.idUsuario}>
                                        {`${currentTechnicianUser.usuario} - ${currentTechnicianUser.nombre} ${currentTechnicianUser.primerApellido}`}
                                    </MenuItem>
                                )}
                                
                                {/* En modo Creación, muestra los usuarios disponibles */}
                                {!isEditMode && availableUsers.map((user) => (
                                    <MenuItem key={user.idUsuario} value={user.idUsuario}>
                                        **{user.usuario}** - {`${user.nombre} ${user.primerApellido}`}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrors.idUsuario && <Typography color="error" variant="caption" sx={{ml: 2, mt: 0.5}}>{formErrors.idUsuario}</Typography>}
                            {isEditMode && <Typography variant="caption" color="text.secondary" sx={{ml: 2, mt: 0.5}}>El usuario asociado no puede cambiarse al editar.</Typography>}
                        </FormControl>

                        {/* Campo: Disponibilidad */}
                        <FormControl fullWidth>
                            <InputLabel id="availability-select-label">Disponibilidad</InputLabel>
                            <Select
                                labelId="availability-select-label"
                                id="idDisponibilidad"
                                value={formData.idDisponibilidad}
                                label="Disponibilidad"
                                onChange={(e) => handleInputChange('idDisponibilidad', e.target.value)}
                            >
                                {availabilityList.map((item) => (
                                <MenuItem key={item.idDisponibilidad} value={item.idDisponibilidad}>
                                    {item.nombre}
                                </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Campo: Carga de Trabajo (Solo editable en Creación, es una métrica de sistema) */}
                        <TextField
                            fullWidth
                            label="Carga de Trabajo (Tickets asignados)"
                            type="number"
                            value={formData.cargaTrabajo}
                            onChange={(e) => handleInputChange('cargaTrabajo', e.target.value)}
                            InputProps={{ inputProps: { min: 0 } }}
                            disabled={isEditMode} // Deshabilitado en edición
                            error={!!formErrors.cargaTrabajo}
                            helperText={formErrors.cargaTrabajo || (isEditMode ? 'Esta métrica se actualiza automáticamente por el sistema.' : 'Carga de trabajo inicial.')}
                        />

                        {/* Campo: Especialidades (Select Múltiple) */}
                        <FormControl 
                            fullWidth 
                            required 
                            error={!!formErrors.especialidades}
                        >
                            <InputLabel id="specialty-multiple-label">Especialidades</InputLabel>
                            <Select
                                labelId="specialty-multiple-label"
                                multiple
                                value={formData.especialidades} 
                                onChange={(e) => handleInputChange('especialidades', e.target.value)}
                                input={<OutlinedInput id="select-multiple-chip" label="Especialidades" />}
                                renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                    const specialty = specialtiesList.find(s => s.idEspecialidad === value);
                                    return (
                                        <Chip key={value} label={specialty ? specialty.nombre : `ID: ${value}`} size="small" />
                                    );
                                    })}
                                </Box>
                                )}
                            >
                                {specialtiesList.map((specialty) => (
                                <MenuItem 
                                    key={specialty.idEspecialidad} 
                                    value={specialty.idEspecialidad}
                                >
                                    {specialty.nombre}
                                </MenuItem>
                                ))}
                            </Select>
                            {formErrors.especialidades && <Typography color="error" variant="caption" sx={{ml: 2, mt: 0.5}}>{formErrors.especialidades}</Typography>}
                        </FormControl>

                        {/* Campo: Estado (Switch) */}
                        <FormControlLabel
                            control={
                                <Switch
                                checked={formData.estado === 1}
                                onChange={(e) => handleInputChange('estado', e.target.checked)}
                                name="estado"
                                color="primary"
                                />
                            }
                            label={formData.estado === 1 ? 'Activo' : 'Inactivo'}
                        />
                    </Stack>

                    {/* Botones de acción */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button 
                        onClick={handleCloseFormModal} 
                        variant="outlined" 
                        color="error"
                        >
                        Cancelar
                        </Button>
                        <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        >
                        {isEditMode ? 'Guardar Cambios' : 'Crear Técnico'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Diálogo de Confirmación de Eliminación (NUEVA SOLUCIÓN) */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: 'error.main' }}>
                    {"Confirmar Eliminación"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography variant="body1" sx={{mb: 1}}>
                            ¿Está seguro de eliminar este técnico (despromoverlo)?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Esta acción es irreversible y el usuario dejará de ser considerado técnico.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} variant="outlined" color="primary">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={executeDelete} 
                        variant="contained" 
                        color="error" 
                        autoFocus 
                    >
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};
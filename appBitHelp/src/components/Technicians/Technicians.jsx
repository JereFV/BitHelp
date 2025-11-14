import React, { useState, useEffect, useMemo, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid'; 
import { 
    Button, Modal, Box, Typography, Chip, Divider, Paper, Stack,
    TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput,
    FormControlLabel, Switch, IconButton,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { esES } from '@mui/x-data-grid/locales'; 
import TechnicianService from '../../services/TechnicianService'; 
import { AccountCircle, Mail, Phone, Work, Verified } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UserService from '../../services/userService';
import { AuthContext } from '../../context/AuthContext.jsx';

const ROLE_ID_ADMIN = 3;

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
    const { user } = useContext(AuthContext);
    const isAdmin = user?.idRol === ROLE_ID_ADMIN || user?.idRol === '3';

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
    
    const [formErrors, setFormErrors] = useState({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [technicianToDeleteId, setTechnicianToDeleteId] = useState(null);
    
    const technicianUserIds = useMemo(() => rows.map(r => r.idUsuario), [rows]);

    const availableUsers = useMemo(() => {
        return usersList.filter(user => !technicianUserIds.includes(user.idUsuario));
    }, [usersList, technicianUserIds]);

    const currentTechnicianUser = useMemo(() => {
        if (isEditMode && formData.idUsuario && usersList.length > 0) {
            return usersList.find(u => u.idUsuario === formData.idUsuario);
        }
        return null;
    }, [isEditMode, formData.idUsuario, usersList]);

    const fetchExternalData = async () => {
        try {
            const usersResponse = await UserService.getUsers();
            const usersData = usersResponse.data.result || usersResponse.data;
            setUsersList(Array.isArray(usersData) ? usersData : []); 

            const specialtiesResponse = await TechnicianService.getSpecialties();
            setSpecialtiesList(specialtiesResponse.data.result || specialtiesResponse.data || []);

            const availabilityResponse = await TechnicianService.getDisponibilities();
            setAvailabilityList(availabilityResponse.data.result || availabilityResponse.data || []);
        } catch (error) {
            console.error("Error al cargar datos externos:", error.response?.data?.message || error.message);
            toast.error('Error al cargar listas de selección. Revise la consola.');
        }
    };

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
                toast.error('Formato de datos de técnicos inesperado.');
                apiData = [];
            }

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
                especialidades: item.especialidades && Array.isArray(item.especialidades) 
                    ? item.especialidades.map(e => typeof e === 'string' ? e : (e.nombre || 'N/A')) 
                    : [],
            }));

            setRows(techniciansData);
        } catch (error) {
            console.error("Error al obtener los técnicos:", error.response?.data?.message || error.message);
            toast.error('Error al cargar los técnicos desde la API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechnicians();
        fetchExternalData();
    }, []);

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
        setFormErrors({}); 
        
        if (editMode && row) {
            TechnicianService.getTechnicianById(row.id).then(response => {
                const data = response.data.result || response.data;
                
                if (!data || !data.idTecnico) {
                    toast.error('No se pudieron cargar los datos del técnico para edición.');
                    return;
                }

                const availabilityName = data.disponibilidad;
                const foundAvailability = availabilityList.find(
                    (item) => item.nombre === availabilityName
                );
                const defaultAvailabilityId = 1; 
                const finalIdDisponibilidad = foundAvailability ? foundAvailability.idDisponibilidad : defaultAvailabilityId;

                const techSpecialtyNames = data.especialidades && Array.isArray(data.especialidades) 
                    ? data.especialidades 
                    : [];

                const selectedSpecialtyIds = techSpecialtyNames
                    .map(name => {
                        const specialty = specialtiesList.find(s => s.nombre === name);
                        return specialty ? specialty.idEspecialidad : null;
                    })
                    .filter(id => id !== null); 
                
                setFormData({
                    idTecnico: data.idTecnico, 
                    idUsuario: data.idUsuario || '', 
                    estado: data.estado === 1 || data.estado === '1' ? 1 : 0, 
                    idDisponibilidad: finalIdDisponibilidad,
                    cargaTrabajo: data.cargaTrabajo ? parseInt(data.cargaTrabajo, 10) || 0 : 0,      
                    especialidades: selectedSpecialtyIds, 
                });

            }).catch(error => {
                console.error("Error al obtener el técnico para edición:", error);
                toast.error('Error al cargar los detalles del técnico para edición.');
            });

        } else {
            setFormData({
                idTecnico: null,
                idUsuario: '',
                idDisponibilidad: 1, 
                estado: 1, 
                cargaTrabajo: 0, 
                especialidades: []
            });
        }
        setOpenFormModal(true);
    };

    const handleCloseFormModal = () => {
        setOpenFormModal(false);
        setFormErrors({});
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
        setFormErrors(prev => ({ ...prev, [field]: undefined }));

        if (field === 'estado') {
            setFormData(prev => ({ ...prev, [field]: value ? 1 : 0 }));
        } else if (field === 'cargaTrabajo') {
            const numValue = parseInt(value, 10);
            setFormData(prev => ({ ...prev, [field]: isNaN(numValue) || numValue < 0 ? 0 : numValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Por favor, corrija los errores en el formulario.');
            return;
        }
        
        let payload = { ...formData };
        
        try {
            if (isEditMode) {
                const updatePayload = {
                    idDisponibilidad: Number(payload.idDisponibilidad),
                    cargaTrabajo: '00:00:00', 
                    estado: Number(payload.estado),
                    especialidades: payload.especialidades,
                };

                await TechnicianService.updateTechnician(payload.idTecnico, updatePayload);
                toast.success('Técnico actualizado exitosamente');
                
            } else {
                let creationPayload = {
                    idUsuario: payload.idUsuario,
                    idDisponibilidad: Number(payload.idDisponibilidad),
                    cargaTrabajo: '00:00:00',
                    estado: Number(payload.estado),
                    especialidades: payload.especialidades
                };

                await TechnicianService.createTechnician(creationPayload);
                toast.success('Técnico creado exitosamente');
            }
            
            handleCloseFormModal();
            fetchTechnicians();
        } catch (error) {
            console.error("Error al guardar (payload enviado):", isEditMode ? updatePayload : creationPayload);
            console.error("Detalles del Error:", error.response?.data?.message || error.message);
            toast.error(`Error al guardar: ${error.response?.data?.message || 'Revisar la consola para el payload enviado.'}`);
        }
    };

    const confirmDelete = (id) => {
        setTechnicianToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setTechnicianToDeleteId(null);
    };
    
    const executeDelete = async () => {
        setIsDeleteDialogOpen(false); 
        if (!technicianToDeleteId) return;

        try {
            await TechnicianService.deleteTechnician(technicianToDeleteId);
            toast.success('Técnico despromovido exitosamente');
            fetchTechnicians();
        } catch (error) {
            console.error("Error al despromover:", error.response?.data?.message || error.message);
            toast.error(`Error al despromover el técnico: ${error.response?.data?.message || 'Error de conexión'}`);
        } finally {
            setTechnicianToDeleteId(null); 
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
            sortable: false, 
            filterable: false, 
            flex: 0.6,
            renderCell: (params) => (
                <Stack direction="row" spacing={2} justifyContent="center">
                    <IconButton color="primary" size="small" onClick={() => handleOpenModal(params.row)} aria-label="Ver detalles">
                        <VisibilityIcon />
                    </IconButton>
                    {isAdmin && (
                        <>
                            <IconButton color="primary" size="small" onClick={() => handleOpenFormModal(true, params.row)} aria-label="Editar">
                                <EditIcon />
                            </IconButton>
                            <IconButton color="error" size="small" onClick={() => confirmDelete(params.row.id)} aria-label="Eliminar/Despromover">
                                <DeleteIcon />
                            </IconButton>
                        </>
                    )}
                </Stack>
            ),
        }, 
    ];

    return (
        <div style={{ height: 600, width: '100%' }}>
            <Toaster position="top-center" />
            
            {isAdmin && (
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenFormModal(false)}
                    >
                        Crear Técnico
                    </Button>
                </Box>
            )}
            
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

            {/* Modal de Detalles del Técnico */}
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
                            <Box display="flex" alignItems="center" mb={1}>
                                <AccountCircle color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" fontWeight="bold" mr={1}>
                                    {selectedRow.nombreCompleto}
                                </Typography>
                                {getStatusChip(selectedRow.estado)}
                            </Box>

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

            {/* Modal de Formulario (Crear/Editar) - Solo para Admins */}
            {isAdmin && (
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
                            <FormControl 
                                fullWidth 
                                required 
                                error={!!formErrors.idUsuario}
                                disabled={isEditMode}
                            >
                                <InputLabel id="user-select-label">Usuario</InputLabel>
                                <Select
                                    labelId="user-select-label"
                                    id="idUsuario"
                                    value={formData.idUsuario} 
                                    label="Usuario"
                                    onChange={(e) => handleInputChange('idUsuario', e.target.value)}
                                    {...(isEditMode && currentTechnicianUser ? {
                                        renderValue: () => `${currentTechnicianUser.usuario} - ${currentTechnicianUser.nombre} ${currentTechnicianUser.primerApellido}`
                                    } : {})}
                                >
                                    <MenuItem value="">
                                    <em>Seleccione un Usuario</em>
                                    </MenuItem>
                                    
                                    {isEditMode && currentTechnicianUser && (
                                        <MenuItem key={currentTechnicianUser.idUsuario} value={currentTechnicianUser.idUsuario}>
                                            {`${currentTechnicianUser.usuario} - ${currentTechnicianUser.nombre} ${currentTechnicianUser.primerApellido}`}
                                        </MenuItem>
                                    )}
                                    
                                    {!isEditMode && availableUsers.map((user) => (
                                        <MenuItem key={user.idUsuario} value={user.idUsuario}>
                                            {user.usuario} - {`${user.nombre} ${user.primerApellido}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.idUsuario && <Typography color="error" variant="caption" sx={{ml: 2, mt: 0.5}}>{formErrors.idUsuario}</Typography>}
                                {isEditMode && <Typography variant="caption" color="text.secondary" sx={{ml: 2, mt: 0.5}}>El usuario asociado no puede cambiarse al editar.</Typography>}
                            </FormControl>

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

                            <TextField
                                fullWidth
                                label="Carga de Trabajo (Tickets asignados)"
                                type="number"
                                value={formData.cargaTrabajo}
                                onChange={(e) => handleInputChange('cargaTrabajo', e.target.value)}
                                InputProps={{ inputProps: { min: 0 } }}
                                disabled={true}
                                error={!!formErrors.cargaTrabajo}
                                helperText={formErrors.cargaTrabajo || (isEditMode ? 'Esta métrica se actualiza automáticamente por el sistema.' : 'Carga de trabajo inicial.')}
                            />

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
            )}

            {/* Diálogo de Confirmación de Eliminación - Solo para Admins */}
            {isAdmin && (
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
            )}

        </div>
    );
};
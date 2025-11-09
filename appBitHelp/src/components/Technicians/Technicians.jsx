// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography, Chip, Divider, Paper, Stack,Alert,
        TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput,
         FormControlLabel, Switch, IconButton
 } from '@mui/material'; 
import { esES } from '@mui/x-data-grid/locales';
import TechnicianService from '../../services/TechnicianService';
import { AccountCircle, Mail, Phone, Work, Verified } from '@mui/icons-material'; // Iconos para el modal
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
    width: 450, // Ancho moderado para detalle
    bgcolor: 'background.paper',
    borderRadius: 2, // Bordes redondeados
    boxShadow: 12, // Sombra sutil
    p: 4,
};

// Helper para renderizar el Chip de estado
const getStatusChip = (estado) => {
    // El estado viene como '1' o '0'
    const isActive = estado === '1' || estado === 1;
    return (
        <Chip
            label={isActive ? 'Activo' : 'Inactivo'}
            color={isActive ? 'success' : 'error'} // Verde para activo, rojo para inactivo
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
            color={isAvailable ? 'info' : 'warning'} // Celeste para Disponible, Amarillo/Naranja para Ocupado
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

    const [usersList, setUsersList] = useState([]); // Lista de usuarios para asignar
    const [specialtiesList, setSpecialtiesList] = useState([]); // Lista de especialidades
    const [availabilityList, setAvailabilityList] = useState([]); // Lista de disponibilidades

    const [formData, setFormData] = useState({
            nombreUsuario: '',
            idDisponibilidad: 1,
            estado: 1,
            cargaTrabajo: 0,
            especialidades: []
        });

    // Mensajes
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    
    // Función para obtener datos externos (Usuarios, Especialidades, Disponibilidad)
    const fetchExternalData = async () => {
        try {
        // OBTENER USUARIOS DISPONIBLES (ejemplo: solo usuarios que no son técnicos ya)
        const usersResponse = await UserService.getUsers();
        setUsersList(usersResponse.data.result || []);

        // OBTENER ESPECIALIDADES
        const specialtiesResponse = await TechnicianService.getAllSpecialties();
        setSpecialtiesList(specialtiesResponse.data.result || specialtiesResponse.data || []);

        // OBTENER DISPONIBILIDAD
        const availabilityResponse = await TechnicianService.getAllAvailability();
        setAvailabilityList(availabilityResponse.data.result || availabilityResponse.data || []);
        } catch (error) {
        console.error("Error al cargar datos externos:", error);
        showAlert('error', 'Error al cargar listas de selección');
        }
    };

    // Carga inicial de técnicos
    const fetchTechnicians = async () => { // CAMBIO: Se hizo una función separada para recargar
        setLoading(true);
        try {
        const response = await TechnicianService.getAllTechnicians();
        let apiData = response.data;

        if (apiData && apiData.result && Array.isArray(apiData.result)) {
            apiData = apiData.result;
        }

        if (!Array.isArray(apiData)) {
            console.error("Respuesta de la API no es un array:", apiData);
            apiData = [];
        }

        // Mapeo de datos (Ajustado para asegurar 'id' y 'disponibilidad' con nombre)
        const techniciansData = apiData.map(item => ({
            // Propiedades del técnico:
            id: item.idTecnico || item.id, // ID para DataGrid (DEBE SER idTecnico)
            idUsuario: item.idUsuario,
            disponibilidad: item.disponibilidad || 'Desconocida', // Nombre de la disponibilidad
            idDisponibilidad: item.idDisponibilidad, // ID de la disponibilidad (para el form)
            cargaTrabajo: item.cargaTrabajo,
            // Propiedades combinadas del usuario asociado:
            nombreCompleto: `${item.nombre} ${item.primerApellido} ${item.segundoApellido}`,
            correo: item.correo,
            telefono: item.telefono,
            // Convertir a string para el DataGrid
            estado: String(item.estado),
            // CAMBIO: Asumimos que especialidades viene como un array de strings (nombres) o array de objetos.
            especialidades: item.especialidades && Array.isArray(item.especialidades) ? item.especialidades.map(e => e.nombre || e) : [],
            especialidades_ids: item.especialidades && Array.isArray(item.especialidades) ? item.especialidades.map(e => e.idEspecialidad) : [], // Para cargar en el formulario
        }));

        setRows(techniciansData);
        } catch (error) {
        console.error("Error al obtener los técnicos:", error);
        showAlert('error', 'Error al cargar los técnicos'); // CAMBIO: Corregido de 'las categorías' a 'los técnicos'
        } finally {
        setLoading(false);
        }
    };

    // Carga inicial
    useEffect(() => {
        fetchTechnicians();
        fetchExternalData(); // ADICIÓN: Carga de listas de selectores
    }, []);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
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
        if (editMode && row) {
        // Cargar datos para editar
        // CAMBIO: Se usa el ID del técnico (row.id) para obtener los detalles
        TechnicianService.getTechnicianById(row.id).then(response => {
            const data = response.data.result || response.data;
            setFormData({
            idTecnico: data.idTecnico || data.id, // CAMBIO: Usamos idTecnico para la edición
            idUsuario: data.idUsuario || '',
            estado: data.estado,
            idDisponibilidad: data.idDisponibilidad,
            cargaTrabajo: data.cargaTrabajo,          
            // CAMBIO: Mapeo de especialidades a un array de IDs para el Select Múltiple
            especialidades: data.especialidades && Array.isArray(data.especialidades) ? data.especialidades.map(e => e.idEspecialidad) : [],
            });
        });
        } else {
        setFormData({
            // CAMBIO: Reiniciamos a valores iniciales (sin idTecnico ni idUsuario)
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
        // Limpiar formData al cerrar
        setFormData({
        idUsuario: '',
        idDisponibilidad: 1,
        estado: 1,
        cargaTrabajo: 0,
        especialidades: []
        });
    };

    const handleInputChange = (field, value) => {
        // CAMBIO: Manejo especial para el Switch de estado
        if (field === 'estado') {
        setFormData(prev => ({ ...prev, [field]: value ? 1 : 0 }));
        } else {
        setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
    // Validaciones
    // CAMBIO: Validación de idUsuario (en lugar de nombreUsuario/idSla)
        if (!formData.idUsuario && !isEditMode) {
        showAlert('error', 'Debe seleccionar un usuario para crear el técnico');
        return;
        }
        
        // El objeto a enviar. Quitamos idTecnico si es crear.
        const payload = { ...formData };
        if (!isEditMode) {
        delete payload.idTecnico; // Aseguramos que no se envíe en creación
        }

        try {
        if (isEditMode) {
            // CAMBIO: Llamada a updateTechnician con idTecnico
            await TechnicianService.updateTechnician(payload.idTecnico, payload);
            showAlert('success', 'Técnico actualizado exitosamente'); // CAMBIO: Corregido el mensaje
        } else {
            // CAMBIO: Llamada a createTechnician
            await TechnicianService.createTechnician(payload);
            showAlert('success', 'Técnico creado exitosamente'); // CAMBIO: Corregido el mensaje
        }
        handleCloseFormModal();
        fetchTechnicians(); // CAMBIO: Llamamos a fetchTechnicians para recargar la tabla
        } catch (error) {
        console.error("Error:", error);
        showAlert('error', `Error al guardar el técnico: ${error.response?.data?.message || error.message}`); // CAMBIO: Mejor manejo de errores
        }
    };

    const handleDelete = async (id) => {
        // CAMBIO: Corregido de 'categoría' a 'técnico'
        if (window.confirm('¿Está seguro de eliminar este técnico?')) { 
        try {
            await TechnicianService.deleteTechnician(id);
            showAlert('success', 'Técnico eliminada exitosamente'); // CAMBIO: Corregido el mensaje
            fetchTechnicians(); // CAMBIO: Llamamos a fetchTechnicians para recargar la tabla
        } catch (error) {
            console.error("Error:", error);
            showAlert('error', 'Error al eliminar el técnico'); // CAMBIO: Corregido el mensaje
        }
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
            // Aplicar el Chip de color de disponibilidad
            renderCell: (params) => getAvailabilityChip(params.value),
        },

        {
            field: 'estado',
            headerName: 'Estado',
            minWidth: 170,
            headerAlign: 'center',
            align: 'center',
            flex: 0.4,
            // Aplicar el Chip de color al estado
            renderCell: (params) => getStatusChip(params.value),
        },
        {
            field: 'actions',
            headerName: 'Opciones',
            minWidth: 140,
            headerAlign: 'center',
            align: 'center',
            flex: 0.6,
            renderCell: (params) => (
                <Stack direction="row" spacing={2} justifyContent="center">
                    <IconButton color="primary" size="small" onClick={() => handleOpenModal(params.row)}>
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary" size="small" onClick={() => handleOpenFormModal(true, params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
        },  
    ];

    return (
        <div style={{ height: 400, width: '100%' }}>
            {alert.show && (
                            <Alert severity={alert.type} sx={{ mb: 2 }}>
                                {alert.message}
                            </Alert>
                        )}
            
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenFormModal(false)}
                >
                    Crear Técnico
                </Button>
            </Box>
            
            {loading ? (
                <Typography variant="h6">Cargando técnicos...</Typography>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id} // ID único
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 5 } }
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

            {/* ADICIÓN: Modal de Formulario (Crear/Editar) */}
            <Modal
                open={openFormModal}
                onClose={handleCloseFormModal}
                aria-labelledby="technician-form-modal-title"
            >
                <Box sx={modalStyle} component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Typography id="technician-form-modal-title" variant="h5" component="h2" mb={1} color="text.primary" fontWeight={600}>
                    {isEditMode ? 'Editar Técnico' : 'Crear Técnico'}
                </Typography>
                
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                    {/* Campo: Usuario Asociado (Solo editable en Creación) */}
                    <FormControl fullWidth required>
                    <InputLabel id="user-select-label">Usuario</InputLabel>
                    <Select
                        labelId="user-select-label"
                        id="idUsuario"
                        value={formData.idUsuario}
                        label="Usuario"
                        onChange={(e) => handleInputChange('idUsuario', e.target.value)}
                        disabled={isEditMode} // No permitir cambiar el usuario al editar
                    >
                        <MenuItem value="">
                        <em>Seleccione un Usuario</em>
                        </MenuItem>
                        {usersList.map((user) => (
                        <MenuItem key={user.idUsuario} value={user.idUsuario}>
                            {`${user.nombre} ${user.primerApellido} (${user.correo})`}
                        </MenuItem>
                        ))}
                    </Select>
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

                    {/* Campo: Carga de Trabajo */}
                    <TextField
                    fullWidth
                    label="Carga de Trabajo (Tickets asignados)"
                    type="number"
                    value={formData.cargaTrabajo}
                    onChange={(e) => handleInputChange('cargaTrabajo', parseInt(e.target.value) || 0)}
                    InputProps={{ inputProps: { min: 0 } }}
                    />

                    {/* Campo: Especialidades (Select Múltiple) */}
                    <FormControl fullWidth>
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
                                <Chip key={value} label={specialty ? specialty.nombre : value} size="small" />
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

        </div>
    );
};
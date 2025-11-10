// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
    Button, Modal, Box, Typography, Stack, Chip, Divider, Paper, 
    TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput,
    FormControlLabel, Switch, IconButton,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import CategorieService from '../../services/CategorieService';
import { esES } from '@mui/x-data-grid/locales';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VerifiedIcon from '@mui/icons-material/Verified';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

export const CategoriesDataGridWithModal = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openFormModal, setOpenFormModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Estados para el diálogo de confirmación de eliminación
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);
    
    // Datos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        idSla: '',
        estado: 1,
        especialidades: [],
        etiquetas: []
    });

    // Catálogos
    const [specialties, setSpecialties] = useState([]);
    const [tags, setTags] = useState([]);
    const [slas, setSlas] = useState([]);

    useEffect(() => {
        fetchCategories();
        fetchCatalogs();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await CategorieService.getAllCategories();
            let apiData = response.data;

            if (apiData && apiData.result && Array.isArray(apiData.result)) {
                apiData = apiData.result;
            }
            if (!Array.isArray(apiData)) {
                apiData = [];
            }

            const categoriesData = apiData.map(item => ({
                id: item.idCategoria || item.id,
                nombre: item.nombreCategoria,
                estado: item.estadoCategoria,
                idSla: item.idSla,
                tiempoMaxRespuesta: item.tiempoMaxRespuesta,
                tiempoMaxResolucion: item.tiempoMaxResolucion,
                especialidades: item.especialidades || [],
                etiquetas: item.etiquetas || [],
            }));

            setRows(categoriesData);
        } catch (error) {
            console.error("Error al obtener las categorías:", error);
            toast.error('Error al cargar las categorías');
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogs = async () => {
        try {
            const [respSpec, respTags, respSlas] = await Promise.all([
                CategorieService.getSpecialties(),
                CategorieService.getTags(),
                CategorieService.getSlas()
            ]);

            setSpecialties(respSpec.data.result || respSpec.data || []);
            setTags(respTags.data.result || respTags.data || []);
            setSlas(respSlas.data.result || respSlas.data || []);
        } catch (error) {
            console.error("Error al cargar catálogos:", error);
        }
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
            CategorieService.getCategoryById(row.id).then(response => {
                const data = response.data.result || response.data;
                
                const especialidadesIds = data.especialidades 
                    ? data.especialidades.map(e => e.idEspecialidad) 
                    : [];
                const etiquetasIds = data.etiquetas 
                    ? data.etiquetas.map(e => e.idEtiqueta) 
                    : [];
                
                setFormData({
                    id: data.idCategoria,
                    nombre: data.nombreCategoria,
                    idSla: data.idSla,
                    estado: parseInt(data.estadoCategoria),
                    especialidades: especialidadesIds,
                    etiquetas: etiquetasIds
                });
            });
        } else {
            setFormData({
                nombre: '',
                idSla: '',
                estado: 1,
                especialidades: [],
                etiquetas: []
            });
        }
        setOpenFormModal(true);
    };

    const handleCloseFormModal = () => {
        setOpenFormModal(false);
        setFormData({
            nombre: '',
            idSla: '',
            estado: 1,
            especialidades: [],
            etiquetas: []
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!formData.nombre.trim()) {
            toast.error('El nombre es requerido');
            return;
        }
        if (!formData.idSla) {
            toast.error('El SLA es requerido');
            return;
        }

        try {
            if (isEditMode) {
                await CategorieService.updateCategory(formData.id, formData);
                toast.success('Categoría actualizada exitosamente');
            } else {
                await CategorieService.createCategory(formData);
                toast.success('Categoría creada exitosamente');
            }
            handleCloseFormModal();
            fetchCategories();
        } catch (error) {
            console.error("Error:", error);
            toast.error('Error al guardar la categoría');
        }
    };

    // Función para abrir el diálogo de confirmación
    const confirmDelete = (id) => {
        setCategoryToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    // Función para cerrar el diálogo de confirmación
    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setCategoryToDeleteId(null);
    };

    // Función que ejecuta la eliminación
    const executeDelete = async () => {
        setIsDeleteDialogOpen(false);
        if (!categoryToDeleteId) return;

        try {
            await CategorieService.deleteCategory(categoryToDeleteId);
            toast.success('Categoría eliminada exitosamente');
            fetchCategories();
        } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error('Error al eliminar la categoría');
        } finally {
            setCategoryToDeleteId(null);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 80, headerAlign: 'center', align: 'center' },
        { field: 'nombre', headerName: 'Categoria', flex: 1, minWidth: 200, headerAlign: 'center', align: 'center' },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => getStatusChip(params.value),
        },
        {
            field: 'actions',
            headerName: 'Opciones',
            width: 150,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton color="primary" size="small" onClick={() => handleOpenModal(params.row)} aria-label="Ver detalles">
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary" size="small" onClick={() => handleOpenFormModal(true, params.row)} aria-label="Editar">
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => confirmDelete(params.row.id)} aria-label="Eliminar">
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    return (
        <div style={{ height: 500, width: '100%' }}>
            <Toaster position="top-center" />

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenFormModal(false)}
                >
                    Crear Categoría
                </Button>
            </Box>

            {loading ? (
                <Typography variant="h6">Cargando categorías...</Typography>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } }
                    }}
                    disableRowSelectionOnClick
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    sx={{ borderRadius: 2, boxShadow: 2 }}
                />
            )}

            {/* Modal de Detalles */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 450,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 12,
                    p: 4,
                }}>
                    <Typography variant="h5" component="h2" mb={1} fontWeight={600}>
                        Detalles de la Categoría
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {selectedRow && (
                        <Box>
                            <Box display="flex" alignItems="center" mb={1}>
                                <Typography fontWeight="bold" mr={1} fontSize={16}>
                                    {selectedRow.nombre}
                                </Typography>
                                {getStatusChip(selectedRow.estado)}
                            </Box>

                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    MÉTRICAS DE SERVICIO
                                </Typography>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <WorkHistoryIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography fontSize={14}>
                                        <strong>Tiempo Máximo de Respuesta:</strong> {selectedRow.tiempoMaxRespuesta} h
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <WorkHistoryIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography fontSize={14}>
                                        <strong>Tiempo Máximo de Resolución:</strong> {selectedRow.tiempoMaxResolucion} h
                                    </Typography>
                                </Box>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    ASIGNACIONES
                                </Typography>
                                <Box mb={2}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <VerifiedIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                                        <Typography fontWeight="bold" fontSize={14}>Especialidades:</Typography>
                                    </Box>
                                    <Stack direction="row" flexWrap="wrap" spacing={1}>
                                        {selectedRow.especialidades && selectedRow.especialidades.length > 0 ? (
                                            selectedRow.especialidades.map((esp, index) => (
                                                <Chip key={index} label={esp.nombre} size="small" color="primary" variant="outlined" />
                                            ))
                                        ) : (
                                            <Typography fontSize={14} color="text.secondary" sx={{ml: 0.5}}>
                                                No tiene especialidades asignadas.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>

                                <Box>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <LocalOfferIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                                        <Typography fontWeight="bold" fontSize={14}>Etiquetas:</Typography>
                                    </Box>
                                    <Stack direction="row" flexWrap="wrap" spacing={1}>
                                        {selectedRow.etiquetas && selectedRow.etiquetas.length > 0 ? (
                                            selectedRow.etiquetas.map((eti, index) => (
                                                <Chip key={index} label={eti.nombre} size="small" color="primary" variant="outlined" />
                                            ))
                                        ) : (
                                            <Typography fontSize={14} color="text.secondary" sx={{ml: 0.5}}>
                                                No tiene etiquetas asignadas.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    <Button onClick={handleCloseModal} variant="contained" sx={{ mt: 3, float: 'right' }}>
                        Cerrar
                    </Button>
                </Box>
            </Modal>

            {/* Modal de Formulario Crear/Editar */}
            <Modal open={openFormModal} onClose={handleCloseFormModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 450,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 12,
                    p: 4,
                }}>
                    <Typography variant="h5" component="h2" mb={1} fontWeight={600}>
                        {isEditMode ? 'Editar Categoría' : 'Crear Categoría'}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={3}>
                        <TextField
                            label="Nombre de la Categoría"
                            fullWidth
                            required
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                        />

                        <FormControl fullWidth required>
                            <InputLabel>SLA</InputLabel>
                            <Select
                                value={formData.idSla}
                                label="SLA"
                                onChange={(e) => handleInputChange('idSla', e.target.value)}
                            >
                                {slas.map((sla) => (
                                    <MenuItem key={sla.idSla} value={sla.idSla}>
                                        Respuesta: {sla.tiempoMaxRespuesta} | Resolución: {sla.tiempoMaxResolucion}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Especialidades</InputLabel>
                            <Select
                                multiple
                                value={formData.especialidades}
                                onChange={(e) => handleInputChange('especialidades', e.target.value)}
                                input={<OutlinedInput label="Especialidades" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const specialty = specialties.find(s => s.idEspecialidad === value);
                                            return (
                                                <Chip key={value} label={specialty ? specialty.nombre : `ID: ${value}`} size="small" />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {specialties.map((spec) => (
                                    <MenuItem key={spec.idEspecialidad} value={spec.idEspecialidad}>
                                        {spec.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Etiquetas</InputLabel>
                            <Select
                                multiple
                                value={formData.etiquetas}
                                onChange={(e) => handleInputChange('etiquetas', e.target.value)}
                                input={<OutlinedInput label="Etiquetas" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const tag = tags.find(t => t.idEtiqueta === value);
                                            return (
                                                <Chip key={value} label={tag ? tag.nombre : `ID: ${value}`} size="small" />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {tags.map((tag) => (
                                    <MenuItem key={tag.idEtiqueta} value={tag.idEtiqueta}>
                                        {tag.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.estado === 1}
                                    onChange={(e) => handleInputChange('estado', e.target.checked ? 1 : 0)}
                                />
                            }
                            label={formData.estado === 1 ? 'Activo' : 'Inactivo'}
                        />
                    </Stack>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={handleCloseFormModal} variant="outlined" color="error">
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            {isEditMode ? 'Guardar Cambios' : 'Crear Categoría'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: 'error.main' }}>
                    Confirmar Eliminación
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography variant="body1" sx={{mb: 1}}>
                            ¿Está seguro de eliminar esta categoría?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Esta acción eliminará la categoría y todas sus relaciones con especialidades y etiquetas.
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
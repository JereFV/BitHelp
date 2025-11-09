import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
    Button, Modal, Box, Typography, Stack, Chip, Divider, Paper, 
    TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput,
    FormControlLabel, Switch, Alert, IconButton
} from '@mui/material';
import CategorieService from '../../services/CategorieService';
import { esES } from '@mui/x-data-grid/locales';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VerifiedIcon from '@mui/icons-material/Verified';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
    
    // Mensajes
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

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

            const categoriesData = apiData.map(item => {
                const parseConcatenatedData = (dataString) => {
                    if (!dataString) return [];
                    return dataString.split('|||').filter(s => s.trim() !== '');
                };

                return {
                    id: item.idCategoria || item.id,
                    nombre: item.nombreCategoria,
                    estado: item.estadoCategoria,
                    idSla: item.idSla,
                    tiempoMaxRespuesta: item.tiempoMaxRespuesta,
                    tiempoMaxResolucion: item.tiempoMaxResolucion,
                    especialidades: parseConcatenatedData(item.especialidades_concatenadas),
                    etiquetas: parseConcatenatedData(item.etiquetas_concatenadas),
                };
            });

            setRows(categoriesData);
        } catch (error) {
            console.error("Error al obtener las categorías:", error);
            showAlert('error', 'Error al cargar las categorías');
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
            CategorieService.getCategoryById(row.id).then(response => {
                const data = response.data.result || response.data;
                setFormData({
                    id: data.idCategoria,
                    nombre: data.nombreCategoria,
                    idSla: data.idSla,
                    estado: parseInt(data.estadoCategoria),
                    especialidades: data.especialidades_ids ? data.especialidades_ids.split(',').map(Number) : [],
                    etiquetas: data.etiquetas_ids ? data.etiquetas_ids.split(',').map(Number) : []
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
            showAlert('error', 'El nombre es requerido');
            return;
        }
        if (!formData.idSla) {
            showAlert('error', 'El SLA es requerido');
            return;
        }

        try {
            if (isEditMode) {
                await CategorieService.updateCategory(formData.id, formData);
                showAlert('success', 'Categoría actualizada exitosamente');
            } else {
                await CategorieService.createCategory(formData);
                showAlert('success', 'Categoría creada exitosamente');
            }
            handleCloseFormModal();
            fetchCategories();
        } catch (error) {
            console.error("Error:", error);
            showAlert('error', 'Error al guardar la categoría');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta categoría?')) {
            try {
                await CategorieService.deleteCategory(id);
                showAlert('success', 'Categoría eliminada exitosamente');
                fetchCategories();
            } catch (error) {
                console.error("Error:", error);
                showAlert('error', 'Error al eliminar la categoría');
            }
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
            headerName: 'Detalle',
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Button variant="outlined" size="small" onClick={() => handleOpenModal(params.row)}>
                    Ver detalle
                </Button>
            ),
        },
        {
            field: 'operations',
            headerName: 'Acciones',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
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
        <div style={{ height: 500, width: '100%' }}>
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
                    Crear Categoría
                </Button>
            </Box>

            {loading ? (
                <Typography variant="h6">Cargando categorías...</Typography>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    sx={{ borderRadius: 4, boxShadow: 1 }}
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
                    maxWidth: '90%',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 16,
                    p: 4,
                }}>
                    <Typography variant="h5" component="h2" mb={1} fontWeight={600}>
                        Detalles de la Categoría
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {selectedRow && (
                        <Box>
                            <Box display="flex" mb={1}>
                                <Typography component="span" fontWeight="bold" mr={0.5} fontSize={16}>
                                    {selectedRow.nombre} {getStatusChip(selectedRow.estado)}
                                </Typography>
                            </Box>

                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    MÉTRICAS DE SERVICIO
                                </Typography>
                                <Box display="flex" mb={1}>
                                    <WorkHistoryIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography component="span" fontWeight="bold" mr={0.5} fontSize={16}>
                                        Tiempo Máximo de Respuesta:
                                    </Typography>
                                    <Typography fontSize={16}>{selectedRow.tiempoMaxRespuesta} h</Typography>
                                </Box>
                                <Box display="flex">
                                    <WorkHistoryIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography component="span" fontWeight="bold" mr={0.5} fontSize={16}>
                                        Tiempo Máximo de Resolución:
                                    </Typography>
                                    <Typography fontSize={16}>{selectedRow.tiempoMaxResolucion} h</Typography>
                                </Box>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    ASIGNACIONES
                                </Typography>
                                <Box mb={2}>
                                    <VerifiedIcon color="action" sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
                                    <Typography component="span" fontWeight="bold" fontSize={16}>Especialidades:</Typography>
                                    <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                                        {selectedRow.especialidades && selectedRow.especialidades.length > 0 ? (
                                            selectedRow.especialidades.map((esp, index) => (
                                                <Chip key={index} label={esp} size="small" color="primary" variant="outlined" />
                                            ))
                                        ) : (
                                            <Typography fontSize={14} color="text.secondary">
                                                No tiene especialidades asignadas.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>

                                <Box>
                                    <LocalOfferIcon color="action" sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
                                    <Typography component="span" fontWeight="bold" fontSize={16}>Etiquetas:</Typography>
                                    <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                                        {selectedRow.etiquetas && selectedRow.etiquetas.length > 0 ? (
                                            selectedRow.etiquetas.map((eti, index) => (
                                                <Chip key={index} label={eti} size="small" color="primary" variant="outlined" />
                                            ))
                                        ) : (
                                            <Typography fontSize={14} color="text.secondary">
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
                    width: 600,
                    maxWidth: '90%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 16,
                    p: 4,
                }}>
                    <Typography variant="h5" component="h2" mb={3} fontWeight={600}>
                        {isEditMode ? 'Editar Categoría' : 'Crear Categoría'}
                    </Typography>

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
                                renderValue={(selected) =>
                                    selected.map(id => specialties.find(s => s.idEspecialidad === id)?.nombre).join(', ')
                                }
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
                                renderValue={(selected) =>
                                    selected.map(id => tags.find(t => t.idEtiqueta === id)?.nombre).join(', ')
                                }
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
                            label="Activo"
                        />
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                        <Button onClick={handleCloseFormModal} variant="outlined">
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} variant="contained">
                            {isEditMode ? 'Actualizar' : 'Crear'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </div>
    );
};
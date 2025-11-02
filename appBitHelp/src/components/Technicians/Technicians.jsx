// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography, Chip, Divider, Paper, Stack } from '@mui/material'; // Importar Chip y componentes de diseño
import { esES } from '@mui/x-data-grid/locales';
import TechnicianService from '../../services/TechnicianService';
import { AccountCircle, Mail, Phone, Work, Verified } from '@mui/icons-material'; // Iconos para el modal

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
    const [selectedRow, setSelectedRow] = useState(null);

    // Carga inicial de técnicos
    useEffect(() => {
        const fetchTechnicians = async () => {
            setLoading(true);
            try {
                // Usamos el nombre de función de tu servicio
                const response = await TechnicianService.getAllTechnicians();

                let apiData = response.data;

                if (apiData && apiData.result && Array.isArray(apiData.result)) {
                    apiData = apiData.result;
                }

                if (!Array.isArray(apiData)) {
                    console.error("Respuesta de la API no es un array:", apiData);
                    apiData = [];
                }

                // Mapeo de datos
                const techniciansData = apiData.map(item => ({
                    // Propiedades del técnico:
                    id: item.idTecnico || item.id, // ID para DataGrid
                    idUsuario: item.idUsuario,
                    disponibilidad: item.disponibilidad,
                    cargaTrabajo: item.cargaTrabajo,
                    // Propiedades combinadas del usuario asociado:
                    nombreCompleto: `${item.nombre} ${item.primerApellido} ${item.segundoApellido}`,
                    correo: item.correo,
                    telefono: item.telefono,
                    // Convertir a string para el DataGrid
                    estado: String(item.estado),
                    especialidades: item.especialidades || [],
                }));

                setRows(techniciansData);
            } catch (error) {
                console.error("Error al obtener los técnicos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTechnicians();
    }, []);

    const handleOpenModal = (row) => {
        setSelectedRow(row);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRow(null);
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
            minWidth: 170,
            headerAlign: 'center',
            align: 'center',
            flex: 0.7,
            renderCell: (params) => (
                <Button variant="outlined" size="small" onClick={() => handleOpenModal(params.row)}>
                    Ver Detalles
                </Button>
            ),
        },
    ];

    return (
        <div style={{ height: 400, width: '100%' }}>
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
        </div>
    );
};
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid'; 
import { Button,Chip,Paper,IconButton, Stack, Box, Alert, 
    CircularProgress, Typography, Snackbar, Dialog, DialogTitle, 
    DialogContent, DialogContentText, DialogActions,Modal, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountCircle from '@mui/icons-material/AccountCircle'; // Icono para Nombre
import Mail from '@mui/icons-material/MailOutline'; // Icono para Correo
import Phone from '@mui/icons-material/Phone'; // Icono para Teléfono
import Work from '@mui/icons-material/WorkOutline'; // Icono para Carga
import Verified from '@mui/icons-material/VerifiedUserOutlined'; // Icono para Especialidades
// Asegúrate de que las rutas sean correctas
import UserService from '../../services/userService'; 
import UserFormModal from './UserFormModal'; 

// --- FUNCIONES HELPER ---
// 1. Chip para el Estado (Activo/Inactivo)
const getStatusChip = (estado) => {
    // La data viene como string, por eso usamos '1'
    const isActive = estado === '1' || estado === 1; 
    return (
        <Chip
            label={isActive ? 'Activo' : 'Inactivo'}
            color={isActive ? 'success' : 'error'}
            variant="filled" // Cambiado a filled para mayor visibilidad
            size="small"
            sx={{ ml: 1, verticalAlign: 'middle' }}
        />
    );
};

// 2. Chip para la Disponibilidad del Técnico (Asumiendo 1=Disponible, 2=Ocupado)
const getAvailabilityChip = (idDisponibilidad) => {
    const isAvailable = idDisponibilidad === '1' || idDisponibilidad === 1;
    const label = isAvailable ? 'DISPONIBLE' : 'OCUPADO';
    const color = isAvailable ? 'info' : 'warning';
    
    return (
        <Chip 
            label={label} 
            color={color} 
            size="small" 
            sx={{ fontWeight: 'bold' }} 
        />
    );
};

// --- 1. DEFINICIÓN DE COLUMNAS (CORREGIDO EL PASO DE ARGUMENTOS) ---
// Ahora recibe handleOpenDetailModal como primer argumento
const getColumns = (handleOpenDetailModal, handleEdit, handleDelete) => [
    { field: 'idUsuario', headerName: 'ID', width: 90, headerAlign: 'center', align: 'center'  },
    { 
        field: 'nombreCompleto', headerAlign: 'center', align: 'center' , 
        headerName: 'Nombre Completo', 
        minWidth: 250,
        flex: 1,
        
    },
    { field: 'correo', 
      headerName: 'Correo Electrónico',
      minWidth: 250, 
      flex: 1, 
      headerAlign: 'center', 
      align: 'center' 
    },
    { 
        field: 'nombreRol', headerAlign: 'center', align: 'center' , 
        headerName: 'Rol', 
        minWidth: 150,
        width: 250,
        flex: 0.6,          
    },
    {
        field: 'actions', headerAlign: 'center', align: 'center' ,
        headerName: 'Acciones',
        minWidth: 250,
        sortable: false,
        renderCell: (params) => (
                <Stack direction="row" spacing={2} justifyContent="center">
                    {/* ENLACE CORREGIDO: Llama a handleOpenDetailModal */}
                    <IconButton color="primary" size="small" onClick={() => handleOpenDetailModal(params.row)}>
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)}>
                        <EditIcon />
                    </IconButton>
                    {/* ELIMINAR CORREGIDO: Usar idUsuario */}
                    <IconButton color="error" size="small" onClick={() => handleDelete(params.row.idUsuario)}>
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
    },
];

export default function UserMaintenance() {
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); 

    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // --- ESTILO DEL MODAL ---
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        maxHeight: '90vh', // Para permitir scroll
        overflowY: 'auto',
    };


    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await UserService.getAllUsers(); 
            console.log("Datos de la API recibidos:", response.data);
            setUsers(response.data); 
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            setError("No se pudieron cargar los usuarios. Verifica la conexión a la API.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); 

    // --- MANEJO DE ACCIONES CRUD SIN CAMBIOS ---

    const handleCloseDetailModal = () => {
        setOpenDetailModal(false);
        setSelectedUser(null);
        setDetailLoading(false);
    };

    // Apertura del modal de detalles (NOMBRE DE FUNCIÓN CORREGIDO)
    const handleOpenDetailModal = useCallback(async (user) => { // CORRECCIÓN 1: De handleOpenDatailModal a handleOpenDetailModal
        setSelectedUser(user);
        setOpenDetailModal(true);

        // Si el usuario es un Técnico, podríamos necesitar cargar data adicional (especialidades, carga)
        // Asumiendo que idRol 2 es Técnico
        if (user.idRol === '2' || user.nombreRol === 'Técnico') {
            setDetailLoading(true);
            try {
                // NOTA: NECESITAS UN ENDPOINT QUE OBTENGA LOS DETALLES DEL TÉCNICO
                // Si tienes un servicio para esto, descomenta y ajusta:
                /*
                const technicianDetails = await UserService.getTechnicianDetails(user.idUsuario);
                setSelectedUser(prev => ({ 
                    ...prev, 
                    ...technicianDetails.data, 
                    especialidades: technicianDetails.data.especialidades.split('|||')
                }));
                */
                // Si no se carga data adicional, los campos de métricas/especialidades se basarán en lo que viene en la lista inicial.
                
            } catch (error) {
                console.error("Error al cargar detalles del técnico:", error);
            } finally {
                setDetailLoading(false);
            }
        }
    }, []);

    const handleNewUser = () => {
        setCurrentUser(null); 
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((user) => {
        setCurrentUser(user); 
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((userId) => {
        setUserToDelete(userId);
        setIsConfirmOpen(true); 
    }, []);

    const handleConfirmDelete = async () => {
        setIsConfirmOpen(false);
        if (!userToDelete) return;

        try {
            await UserService.deleteUser(userToDelete); 
            await fetchUsers(); 
            setSuccessMessage(`Usuario ID ${userToDelete} eliminado correctamente.`);
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
            setSuccessMessage(null);
            setError("Hubo un error al intentar eliminar el usuario.");
        } finally {
            setUserToDelete(null);
        }
    };
    
    const handleModalClose = useCallback((refreshNeeded, message) => {
        setIsModalOpen(false);
        setCurrentUser(null);
        if (refreshNeeded) {
            fetchUsers();
        }
        if (message) {
             setSuccessMessage(message);
        }
    }, [fetchUsers]);
    
    const handleCloseSnackbar = () => {
        setSuccessMessage(null);
        setError(null);
    };


    // --- RENDERIZADO ---
    // CORRECCIÓN 5: Se pasa handleOpenDetailModal a getColumns
    const columns = getColumns(handleOpenDetailModal, handleEdit, handleDelete);

    return (
        <Box sx={{ p: 3, height: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#004d40', fontWeight: 'bold' }}>
                👤 Mantenimiento de Usuarios
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNewUser}
                    sx={{ backgroundColor: '#00796b', '&:hover': { backgroundColor: '#004d40' } }}
                >
                    + Crear Nuevo Usuario
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box sx={{ height: 700, width: '100%', backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress sx={{ color: '#00796b' }} />
                    </Box>
                ) : (
                    <DataGrid
                        getRowId={(row) => row.idUsuario} 
                        rows={users}
                        columns={columns}
                        initialState={{ 
                            pagination: { paginationModel: { pageSize: 10 } },
                            sorting: { sortModel: [{ field: 'idUsuario', sort: 'asc' }] } // Ordenación por defecto
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        disableSelectionOnClick
                        localeText={{ noRowsLabel: 'No hay usuarios registrados' }}
                        sx={{ border: 0 }}
                    />
                )}
            </Box>
            
            <UserFormModal 
                open={isModalOpen}
                handleClose={handleModalClose}
                userToEdit={currentUser}
            /> 

            {/* MODAL DE VISUALIZACIÓN DE DETALLES */}
            <Modal
                open={openDetailModal}
                onClose={handleCloseDetailModal}
                aria-labelledby="user-details-modal-title"
            >
                <Box sx={modalStyle}>
                    <Typography id="user-details-modal-title" variant="h5" component="h2" mb={1} sx={{ color: '#00796b', fontWeight: 'bold' }}>
                        👀 Detalles del Usuario
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {detailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : selectedUser && (
                        <Box id="modal-modal-description">
                            
                            {/* Fila de Nombre y Estado */}
                            <Box display="flex" alignItems="center" mb={1}>
                                <AccountCircle color="primary" sx={{ mr: 1, fontSize: 30 }} />
                                <Typography variant="h6" fontWeight="bold" mr={1}>
                                    {selectedUser.nombreCompleto} ({selectedUser.nombreRol})
                                </Typography>
                                {getStatusChip(selectedUser.estado)}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ml: 0.5, mb: 2}}>
                                ID: {selectedUser.idUsuario} | Usuario: {selectedUser.usuario}
                            </Typography>


                            {/* Detalle Contacto */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    CONTACTO
                                </Typography>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <Mail color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography variant="body2">{selectedUser.correo}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <Phone color="action" sx={{ mr: 1, fontSize: 18 }} />
                                    <Typography variant="body2">{selectedUser.telefono || 'N/A'}</Typography>
                                </Box>
                            </Paper>
                            
                            {/* Bloques de Técnico (Solo si es Rol Técnico) */}
                            {(selectedUser.idRol === '2' || selectedUser.nombreRol === 'Técnico') && (
                                <>
                                    {/* Detalle Carga/Disponibilidad */}
                                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                        <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                            MÉTRICAS DE TRABAJO
                                        </Typography>
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <Work color="action" sx={{ mr: 1, fontSize: 18 }} />
                                            <Typography variant="body2">Carga de Trabajo: {selectedUser.cargaTrabajo || '00:00:00'}</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                                            {/* Usamos el idDisponibilidad. Si no viene, será un chip por defecto */}
                                            {getAvailabilityChip(selectedUser.idDisponibilidad)} 
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
                                            {/* NOTA: selectedUser.especialidades DEBE ser un array de strings, si viene como string, debe descomentarse la lógica de split en handleOpenDetailModal */}
                                            {selectedUser.especialidades && selectedUser.especialidades.length > 0 ? (
                                                selectedUser.especialidades.map((esp, index) => (
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
                                </>
                            )}

                        </Box>
                    )}
                    <Button onClick={handleCloseDetailModal} variant="contained" sx={{ mt: 3, float: 'right', backgroundColor: '#00796b' }}>Cerrar</Button>
                </Box>
            </Modal>

            {/* DIALOGO DE CONFIRMACIÓN */}
            <Dialog
                open={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
            >
                <DialogTitle sx={{ color: 'error.main' }}>
                    {"Confirmar Eliminación"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar al usuario con ID **{userToDelete}**? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsConfirmOpen(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* SNACKBAR DE MENSAJES */}
            <Snackbar 
                open={!!successMessage} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
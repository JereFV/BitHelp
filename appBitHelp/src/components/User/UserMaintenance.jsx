import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid'; 
import { Button, Box, Alert, CircularProgress, Typography, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

// Asegúrate de que las rutas sean correctas
import UserService from '../../services/userService'; 
import UserFormModal from './UserFormModal'; 

// --- FUNCIONES HELPER ---

// Función para obtener el nombre legible del rol
const getRoleName = (idRol) => {
    switch (idRol) {
        case 1: return 'Cliente';
        case 2: return 'Técnico';
        case 3: return 'Administrador';
        default: return 'Desconocido';
    }
};

// --- 1. DEFINICIÓN DE COLUMNAS (ADAPTADAS A TUS CAMPOS DE DB Y CON PROTECCIÓN) ---
const getColumns = (handleEdit, handleDelete) => [
    { field: 'idUsuario', headerName: 'ID', width: 90 },
    { 
        field: 'name', 
        headerName: 'Nombre Completo', 
        width: 250,
        valueGetter: (params) => {
            // **CORRECCIÓN CLAVE: Verificación doble contra undefined/null**
            if (!params || !params.row) return ''; 
            return `${params.row.nombre || ''} ${params.row.primer_apellido || ''} ${params.row.segundo_apellido || ''}`.trim();
        }
    },
    { field: 'correo', headerName: 'Correo Electrónico', width: 250 },
    { 
        field: 'rolName', 
        headerName: 'Rol', 
        width: 150,
        valueGetter: (params) => {
            // **CORRECCIÓN CLAVE: Verificación doble contra undefined/null**
            if (!params || !params.row) return ''; 
            return getRoleName(params.row.rol_id);
        }
    },
    {
        field: 'actions',
        headerName: 'Acciones',
        width: 200,
        sortable: false,
        renderCell: (params) => (
            <Box>
                <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => handleEdit(params.row)} 
                    style={{ marginRight: 8, backgroundColor: '#00796b' }}
                >
                    Editar
                </Button>
                <Button 
                    variant="outlined" 
                    color="error" 
                    size="small" 
                    onClick={() => handleDelete(params.row.idUsuario)}
                >
                    Eliminar
                </Button>
            </Box>
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
    
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // --- LÓGICA DE CARGA DE DATOS ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await UserService.getUsers(); 
            setUsers(response.data); 
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            // Verifica si el error de la API es un 404/500 para dar mejor feedback
            setError("No se pudieron cargar los usuarios. Verifica la conexión a la API.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); 

    // --- MANEJO DE ACCIONES CRUD ---

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
    const columns = getColumns(handleEdit, handleDelete);

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
            
            <Box sx={{ height: 600, width: '100%', backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress sx={{ color: '#00796b' }} />
                    </Box>
                ) : (
                    <DataGrid
                        getRowId={(row) => row.idUsuario} 
                        rows={users}
                        columns={columns}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
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
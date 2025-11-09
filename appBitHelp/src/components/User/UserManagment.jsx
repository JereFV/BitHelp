import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid'; // Asume que usas MUI DataGrid
import { Button, Box, Alert, CircularProgress, Typography } from '@mui/material';

// Asegúrate de que la ruta sea correcta
import UserService from './services/UserService'; 
// Asume que tienes un componente Modal similar a 'UserFormModal' para crear/editar
// import UserFormModal from './UserFormModal'; 

// --- 1. DEFINICIÓN DE COLUMNAS (ADAPTADAS A TUS DATOS) ---
const getColumns = (handleEdit, handleDelete) => [
    { field: 'idUsuario', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nombre Completo', width: 250 },
    { field: 'email', headerName: 'Correo Electrónico', width: 250 },
    { field: 'rol_id', headerName: 'Rol ID', width: 120 },
    // Aquí puedes añadir lógica para mostrar el nombre del Rol en lugar del ID
    /* { 
        field: 'rolName', 
        headerName: 'Rol', 
        width: 150,
        valueGetter: (params) => {
            // Lógica para obtener el nombre del rol usando params.row.rol_id
            return params.row.rol_id === 1 ? 'Cliente' : 'Otro'; 
        }
    }, */
    {
        field: 'actions',
        headerName: 'Acciones',
        width: 150,
        sortable: false,
        renderCell: (params) => (
            <Box>
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleEdit(params.row)} 
                    style={{ marginRight: 8 }}
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
    // --- 2. ESTADOS ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // Usuario seleccionado para edición/creación

    // --- 3. LÓGICA DE CARGA DE DATOS (REUTILIZACIÓN DEL SERVICE) ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // **IMPORTANTE: Usar getUsers() como está en tu UserService.js**
            const response = await UserService.getUsers(); 
            // Axios devuelve la data en response.data
            // Si la API devuelve un array directamente en response.data, úsalo:
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
    }, [fetchUsers]); // Usamos useCallback, por lo que fetchUsers es una dependencia estable

    // --- 4. MANEJO DE ACCIONES CRUD ---

    const handleNewUser = () => {
        setCurrentUser(null); // Indica que es una operación de creación
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user); // Carga los datos del usuario para editar
        setIsModalOpen(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${userId}?`)) {
            return;
        }

        try {
            await UserService.deleteUser(userId); // Asume que tienes un deleteUser(id) en tu servicio
            // Recargar la lista de usuarios después de eliminar
            await fetchUsers(); 
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
            alert("Hubo un error al intentar eliminar el usuario.");
        }
    };
    
    // Función que se llama después de guardar en el modal
    const handleModalClose = (refreshNeeded) => {
        setIsModalOpen(false);
        setCurrentUser(null);
        if (refreshNeeded) {
            fetchUsers();
        }
    };

    // --- 5. RENDERIZADO ---
    const columns = getColumns(handleEdit, handleDelete);

    return (
        <Box sx={{ p: 3, height: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                👤 Mantenimiento de Usuarios
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNewUser}
                >
                    + Crear Nuevo Usuario
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box sx={{ height: 600, width: '100%' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <DataGrid
                        // El DataGrid requiere que la ID de la fila sea única. 
                        // Usamos idUsuario si es la llave primaria.
                        getRowId={(row) => row.idUsuario} 
                        rows={users}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        disableSelectionOnClick
                        // Otras propiedades de diseño que uses en Técnicos
                    />
                )}
            </Box>
            
            {/* 6. Modal de Formulario (Necesita ser creado) */}
            {/* <UserFormModal 
                open={isModalOpen}
                handleClose={handleModalClose}
                userToEdit={currentUser}
            /> */}
        </Box>
    );
}
import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress } from '@mui/material';
import UserService from '../../services/UserService'; // Asegúrate de que la ruta es correcta

// Estilo básico para centrar el modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
};

// Estructura base inicial con campos de tu DB
const initialUserState = {
    nombre: '', // Corresponde a 'name'
    primer_apellido: '', // Nuevo campo para edición
    segundo_apellido: '', // Nuevo campo para edición
    correo: '', // Corresponde a 'email'
    password: '', 
    rol_id: 1,  
};

export default function UserFormModal({ open, handleClose, userToEdit }) {
    const [formData, setFormData] = useState(initialUserState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditing = !!userToEdit;

    // --- Efecto para cargar datos en el formulario ---
    useEffect(() => {
        if (isEditing) {
            setFormData({
                nombre: userToEdit.nombre || '',
                primer_apellido: userToEdit.primer_apellido || '',
                segundo_apellido: userToEdit.segundo_apellido || '',
                correo: userToEdit.correo || '',
                rol_id: userToEdit.rol_id || 1,
                password: '', // Siempre vacío al editar
            });
        } else {
            setFormData(initialUserState);
        }
        setError(null);
    }, [userToEdit, isEditing, open]);

    // --- Manejo de cambios en los inputs ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Convertir rol_id a número, ya que el Select lo devuelve como string
        const finalValue = name === 'rol_id' ? Number(value) : value; 
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    // --- Lógica de envío (Creación o Edición) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const dataToSend = { ...formData };
        
        // 1. Manejo de Contraseña
        if (isEditing && !dataToSend.password) {
            // Si estamos editando y el campo de password está vacío, no lo enviamos
            delete dataToSend.password;
        }

        try {
            let message = '';
            if (isEditing) {
                // Modo Edición (PUT): Usamos idUsuario y dataToSend
                await UserService.updateUser(userToEdit.idUsuario, dataToSend);
                message = `Usuario ${userToEdit.idUsuario} actualizado correctamente.`;
            } else {
                // Modo Creación (POST)
                if (!dataToSend.password) {
                    setError("La contraseña es obligatoria para crear un nuevo usuario.");
                    setLoading(false);
                    return;
                }
                await UserService.createUser(dataToSend);
                message = `Usuario creado correctamente.`;
            }

            // Cierra el modal e indica que la tabla principal debe refrescarse (true)
            handleClose(true, message);

        } catch (err) {
            console.error(isEditing ? "Error al actualizar usuario:" : "Error al crear usuario:", err);
            // Intenta obtener un mensaje de error del backend
            setError(`Error al guardar: ${err.response?.data?.message || 'Verifica la conexión o los datos.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={() => handleClose(false)}>
            <Box sx={style} component="form" onSubmit={handleSubmit}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {isEditing ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario'}
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />
                <TextField
                    label="Primer Apellido"
                    name="primer_apellido"
                    value={formData.primer_apellido}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />
                <TextField
                    label="Segundo Apellido (Opcional)"
                    name="segundo_apellido"
                    value={formData.segundo_apellido}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                
                <TextField
                    label="Correo Electrónico (Email)"
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />

                <TextField
                    label={isEditing ? "Contraseña (Dejar vacío para no cambiar)" : "Contraseña"}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required={!isEditing} // Requerida solo en modo creación
                    margin="normal"
                />

                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="rol-select-label">Rol</InputLabel>
                    <Select
                        labelId="rol-select-label"
                        id="rol-select"
                        name="rol_id"
                        value={formData.rol_id}
                        label="Rol"
                        onChange={handleChange}
                    >
                        <MenuItem value={1}>Cliente</MenuItem>
                        <MenuItem value={2}>Técnico</MenuItem>
                        <MenuItem value={3}>Administrador</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                        onClick={() => handleClose(false)} 
                        variant="outlined"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isEditing ? 'Actualizar' : 'Guardar'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
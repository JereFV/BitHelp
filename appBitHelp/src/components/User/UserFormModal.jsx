import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress } from '@mui/material';
import UserService from '../../services/userService'; // Asegúrate de que la ruta es correcta

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

// Estructura base inicial con campos de tu ENDPOINT
const initialUserState = {
    nombre: '', 
    primerApellido: '', // Corregido
    segundoApellido: '', // Corregido
    correo: '', 
    contrasenna: '', // Usando el nombre real del campo de contraseña
    idRol: '1',  // Usando el nombre real del campo de rol, inicializado como string "1"
    telefono: '', // Añadido el campo de teléfono
};

export default function UserFormModal({ open, handleClose, userToEdit }) {
    const [formData, setFormData] = useState(initialUserState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditing = !!userToEdit;

    // --- Efecto para cargar datos en el formulario ---
    useEffect(() => {
        if (isEditing) {
            // Mapeo de la data real del endpoint a los campos del formulario
            setFormData({
                nombre: userToEdit.nombre || '',
                primerApellido: userToEdit.primerApellido || '',
                segundoApellido: userToEdit.segundoApellido || '',
                correo: userToEdit.correo || '',
                telefono: userToEdit.telefono || '',
                idRol: userToEdit.idRol || '1',
                contrasenna: '', // Siempre vacío al editar
            });
        } else {
            setFormData(initialUserState);
        }
        setError(null);
    }, [userToEdit, isEditing, open]);

    // --- Manejo de cambios en los inputs ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Para Select, aseguramos que el valor de rol se mantenga como string, como lo trae el endpoint.
        // Si tu backend espera un número, quita el .toString() y haz Number(value).
        const finalValue = name === 'idRol' ? value.toString() : value; 
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    // --- Lógica de envío (Creación o Edición) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const dataToSend = { ...formData };
        
        // 1. Manejo de Contraseña
        if (isEditing && !dataToSend.contrasenna) {
            // Si estamos editando y el campo de contraseña está vacío, no lo enviamos
            delete dataToSend.contrasenna;
        }

        try {
            let message = '';
            if (isEditing) {
                // Modo Edición (PUT)
                await UserService.updateUser(userToEdit.idUsuario, dataToSend);
                message = `Usuario ${userToEdit.idUsuario} actualizado correctamente.`;
            } else {
                // Modo Creación (POST)
                if (!dataToSend.contrasenna) {
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
                    name="primerApellido" // Corregido
                    value={formData.primerApellido}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />
                <TextField
                    label="Segundo Apellido (Opcional)"
                    name="segundoApellido" // Corregido
                    value={formData.segundoApellido}
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
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label={isEditing ? "Contraseña (Dejar vacío para no cambiar)" : "Contraseña"}
                    name="contrasenna" // Corregido
                    type="password"
                    value={formData.contrasenna}
                    onChange={handleChange}
                    fullWidth
                    required={!isEditing} 
                    margin="normal"
                />

                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="rol-select-label">Rol</InputLabel>
                    <Select
                        labelId="rol-select-label"
                        id="rol-select"
                        name="idRol" // Corregido
                        value={formData.idRol}
                        label="Rol"
                        onChange={handleChange}
                    >
                        <MenuItem value={"1"}>Cliente</MenuItem>
                        <MenuItem value={"2"}>Técnico</MenuItem>
                        <MenuItem value={"3"}>Administrador</MenuItem>
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
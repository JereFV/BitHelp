import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Box, Typography, Alert, CircularProgress, 
    IconButton, InputAdornment
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// Asegúrate de que esta ruta sea correcta
import UserService from '../../services/userService'; 

/**
 * Modal para cambiar la contraseña de un usuario específico.
 * * @param {object} props
 * @param {boolean} props.open - Si el modal está abierto.
 * @param {function(boolean, string): void} props.handleClose - Función para cerrar el modal. 
 * Pasa (true, mensaje) si fue exitoso, (false, null) si se canceló.
 * @param {number} props.userId - ID del usuario cuya contraseña se va a cambiar.
 * @param {string} props.userName - Nombre del usuario para mostrar en el título.
 */
export default function PasswordChangeModal({ open, handleClose, userId, userName }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Reinicia el estado al abrir o cerrar el modal
    const resetForm = () => {
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setLoading(false);
        setShowPassword(false);
    };

    const handleLocalClose = () => {
        resetForm();
        handleClose(false, null); // Cierra sin mensaje de éxito
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const validate = () => {
        if (!password || !confirmPassword) {
            setError('Todos los campos son obligatorios.');
            return false;
        }
        if (password.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            // Llamada al servicio que creamos en el primer paso
            await UserService.updatePassword(userId, password); 

            const successMessage = `Contraseña del usuario ${userName} cambiada exitosamente.`;
            
            // Cierra el modal y notifica al componente padre del éxito
            handleClose(true, successMessage); 
            resetForm();

        } catch (err) {
            console.error("Error al cambiar la contraseña:", err.response?.data || err);
            setError(err.response?.data?.message || 'Error desconocido al intentar cambiar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleLocalClose} 
            aria-labelledby="password-modal-title"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle id="password-modal-title" sx={{ display: 'flex', alignItems: 'center', color: '#00796b', fontWeight: 'bold' }}>
                <LockResetIcon sx={{ mr: 1, color: 'warning.main' }} />
                Cambiar Contraseña
            </DialogTitle>
            
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Typography variant="body2" mb={2}>
                        Estableciendo nueva contraseña para {userName}.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        label="Nueva Contraseña"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Confirmar Contraseña"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        sx={{ mt: 1 }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={handleLocalClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="warning" 
                        disabled={loading || !password || !confirmPassword}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}
                    >
                        {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
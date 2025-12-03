import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Box, Typography, Alert, CircularProgress, 
    IconButton, InputAdornment
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import UserService from '../../services/userService'; 
import { useTranslation } from 'react-i18next';

export default function PasswordChangeModal({ open, handleClose, userId, userName }) {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const resetForm = () => {
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setLoading(false);
        setShowPassword(false);
    };

    const handleLocalClose = () => {
        resetForm();
        handleClose(false, null);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const validate = () => {
        if (!password || !confirmPassword) {
            setError(t('validation.allFieldsRequired'));
            return false;
        }
        if (password.length < 6) {
            setError(t('validation.passwordMinLength'));
            return false;
        }
        if (password !== confirmPassword) {
            setError(t('validation.passwordsNotMatch'));
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
            await UserService.updatePassword(userId, password); 

            const successMessage = t('users.passwordChangedSuccess', { userName });
            
            handleClose(true, successMessage); 
            resetForm();

        } catch (err) {
            console.error("Error al cambiar la contraseña:", err.response?.data || err);
            setError(err.response?.data?.message || t('messages.errorOccurred'));
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
                {t('users.changePassword')}
            </DialogTitle>
            
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Typography variant="body2" mb={2}>
                        {t('users.settingNewPassword')} {userName}.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        label={t('users.newPassword')}
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
                        label={t('users.confirmPassword')}
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
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="warning" 
                        disabled={loading || !password || !confirmPassword}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}
                    >
                        {loading ? t('users.saving') : t('users.changePassword')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
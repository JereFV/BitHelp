import React, { useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form'; 
import { yupResolver } from '@hookform/resolvers/yup'; 
import { userSchema } from '../../Utilities/validationSchemas'; 
import UserService from '../../services/userService';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

UserFormModal.propTypes = {
    open: PropTypes.bool.isRequired, 
    handleClose: PropTypes.func.isRequired,
    userToEdit: PropTypes.shape({
        idUsuario: PropTypes.number,
        nombre: PropTypes.string,
        primerApellido: PropTypes.string,
        segundoApellido: PropTypes.string,
        correo: PropTypes.string,
        telefono: PropTypes.string,
        idRol: PropTypes.number, 
        estado: PropTypes.number,
    }), 
};

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

const defaultValues = {
    nombre: '', 
    primerApellido: '', 
    segundoApellido: '', 
    correo: '', 
    contrasenna: '', 
    idRol: '1', 
    telefono: '',
    estado: 1, 
};

export default function UserFormModal({ open, handleClose, userToEdit }) {
    const { t } = useTranslation();
    const isEditing = !!userToEdit;
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const { 
        handleSubmit, 
        control, 
        reset, 
        formState: { errors, isSubmitting } 
    } = useForm({
        defaultValues,
        resolver: yupResolver(userSchema),
        context: { isEditing }
    });

    useEffect(() => {
        if (open) {
            if (isEditing) {
                reset({
                    nombre: userToEdit.nombre || '',
                    primerApellido: userToEdit.primerApellido || '',
                    segundoApellido: userToEdit.segundoApellido || '',
                    correo: userToEdit.correo || '',
                    telefono: userToEdit.telefono || '',
                    idRol: userToEdit.idRol || '1',
                    contrasenna: '',
                    estado: userToEdit.estado || 1,
                });
            } else {
                reset(defaultValues);
            }
        }
        setError(null);
    }, [userToEdit, isEditing, open, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        let dataToSend = { ...data };

        dataToSend.idRol = Number(dataToSend.idRol);
        
        if (dataToSend.estado !== undefined && dataToSend.estado !== null) {
            dataToSend.estado = Number(dataToSend.estado);
        }

        if (isEditing) {
            if (dataToSend.contrasenna === '' || dataToSend.contrasenna === null) {
                delete dataToSend.contrasenna;
            }
            
            dataToSend.idUsuario = userToEdit.idUsuario;
        }

        try {
            let message = '';
            if (isEditing) {
                await UserService.updateUser(userToEdit.idUsuario, dataToSend);
                message = t('users.userUpdatedSuccess', { userId: userToEdit.idUsuario });
            } else {
                await UserService.createUser(dataToSend);
                message = t('users.userCreatedSuccess');
            }
            
            handleClose(true, message);
        } catch (err) {
            console.error("Error de API:", err.response?.data);
            console.error("Payload enviado:", dataToSend);
            const apiError = err.response?.data?.message || err.response?.data?.error || t('users.verifyConnection');
            setError(`${t('users.errorSaving')}: ${apiError}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={() => handleClose(false)}>
            <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {isEditing ? t('users.editUser') : t('users.createNewUser')}
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label={t('users.firstName')}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />
                    )}
                />

                <Controller
                    name="primerApellido"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label={t('users.firstLastName')}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.primerApellido}
                            helperText={errors.primerApellido?.message}
                        />
                    )}
                />
                
                <Controller
                    name="segundoApellido"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label={t('users.secondLastNameOptional')}
                            fullWidth
                            margin="normal"
                            error={!!errors.segundoApellido}
                            helperText={errors.segundoApellido?.message}
                        />
                    )}
                />
                
                <Controller
                    name="correo"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label={t('users.emailAddress')}
                            type="email"
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.correo}
                            helperText={errors.correo?.message}
                        />
                    )}
                />
                
                <Controller
                    name="telefono"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label={t('technicians.phone')}
                            fullWidth
                            margin="normal"
                            error={!!errors.telefono}
                            helperText={errors.telefono?.message}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                            value={field.value || ''}
                        />
                    )}
                />
                
                {!isEditing && (
                    <Controller
                        name="contrasenna"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t('auth.password')}
                                type="password"
                                fullWidth
                                required={!isEditing}
                                margin="normal"
                                error={!!errors.contrasenna}
                                helperText={errors.contrasenna?.message}
                            />
                        )}
                    />
                )}

                {isEditing && (
                    <Controller
                        name="estado"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth margin="normal" required error={!!errors.estado}>
                                <InputLabel id="estado-select-label">{t('common.status')}</InputLabel>
                                <Select
                                    {...field}
                                    labelId="estado-select-label"
                                    id="estado-select"
                                    label={t('common.status')}                                    
                                    value={field.value !== undefined ? field.value : 1}                                    
                                >
                                    <MenuItem value={1}>{t('common.active')}</MenuItem>
                                    <MenuItem value={0}>{t('common.inactive')}</MenuItem>
                                </Select>
                                {errors.estado && <Typography color="error" variant="caption" sx={{ml: 2}}>{errors.estado.message}</Typography>}
                            </FormControl>
                        )}
                    />
                )}

                <Controller
                    name="idRol"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth margin="normal" required error={!!errors.idRol}>
                            <InputLabel id="rol-select-label">{t('users.role')}</InputLabel>
                            <Select
                                {...field}
                                labelId="rol-select-label"
                                id="rol-select"
                                label={t('users.role')}
                            >
                                <MenuItem value={"1"}>{t('users.client')}</MenuItem>
                                <MenuItem value={"2"}>{t('users.technician')}</MenuItem>
                                <MenuItem value={"3"}>{t('users.administrator')}</MenuItem>
                            </Select>
                            {errors.idRol && <Typography color="error" variant="caption" sx={{ml: 2}}>{errors.idRol.message}</Typography>}
                        </FormControl>
                    )}
                />

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                        onClick={() => handleClose(false)} 
                        variant="outlined"
                        disabled={loading || isSubmitting}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={loading || isSubmitting}
                        startIcon={(loading || isSubmitting) ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isEditing ? t('common.update') : t('common.save')}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
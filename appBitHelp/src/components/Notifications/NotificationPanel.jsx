import { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    Button,
    Tabs,
    Tab,
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import LoginIcon from '@mui/icons-material/Login';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationService from '../../services/NotificationService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotificationPanel({ open, onClose, onRefreshCount }) {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [tabValue, setTabValue] = useState(0); // 0: No leídas, 1: Todas
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = tabValue === 0 
                ? await NotificationService.getUnreadNotifications()
                : await NotificationService.getAllNotifications();
            
            // Validación defensiva: si data es null o undefined, usar array vacío
            const notificationsData = response.data.data || [];
            // Ordenar por fecha descendente (más reciente primero)
            const sortedNotifications = notificationsData.sort((a, b) => {
                return new Date(b.fecha) - new Date(a.fecha);
            });
            
            setNotifications(sortedNotifications);
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            toast.error(t('notifications.errorLoading'));
            setNotifications([]); // Asegurar que siempre sea un array
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open, tabValue]);

    const handleMarkAsRead = async (idNotificacion) => {
        try {
            await NotificationService.markAsRead(idNotificacion);
            toast.success(t('notifications.markedAsRead'));
            fetchNotifications();
            if (onRefreshCount) {
                onRefreshCount();
            }
        } catch (error) {
            console.error('Error al marcar notificación:', error);
            toast.error(t('notifications.errorMarking'));
        }
    };

    const handleNotificationClick = (notification) => {
        // Si la notificación tiene un ticket asociado, navegar al detalle
        if (notification.idTiquete) {
            navigate(`/ticket/${notification.idTiquete}`);
            onClose();
        }
    };

    const getNotificationIcon = (tipoNotificacion) => {
        // Comparar con las claves traducidas
        const loginType = t('notifications.typeLogin');
        const ticketType = t('notifications.typeTicketStateChange');
        
        switch (tipoNotificacion) {
            case 'Inicio de Sesión':
            case 'Login':
                return <LoginIcon color="primary" />;
            case 'Cambio de Estado de Ticket':
            case 'Ticket Status Change':
                return <AssignmentIcon color="secondary" />;
            default:
                return <CircleIcon fontSize="small" />;
        }
    };

    const translateNotificationType = (tipo) => {
        switch (tipo) {
            case 'Inicio de Sesión':
            case 'Login':
                return t('notifications.typeLogin');
            case 'Cambio de Estado de Ticket':
            case 'Ticket Status Change':
                return t('notifications.typeTicketStateChange');
            default:
                return tipo;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const locale = i18n.language === 'es' ? 'es-CR' : 'en-US';
        return date.toLocaleString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 } }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6">
                        {t('notifications.title')}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, newValue) => setTabValue(newValue)}
                        variant="fullWidth"
                    >
                        <Tab label={t('notifications.unread')} />
                        <Tab label={t('notifications.all')} />
                    </Tabs>
                </Box>

                {/* Lista de notificaciones */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                    {loading ? (
                        <Typography sx={{ p: 2, textAlign: 'center' }}>
                            {t('notifications.loading')}
                        </Typography>
                    ) : notifications.length === 0 ? (
                        <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                            {t('notifications.noNotifications')}
                        </Typography>
                    ) : (
                        <List>
                            {notifications.map((notification, index) => (
                                <Paper 
                                    key={notification.idNotificacion}
                                    elevation={1}
                                    sx={{ 
                                        mb: 1,
                                        backgroundColor: notification.estadoNotificacion === 'No Leída' 
                                            ? 'action.hover' 
                                            : 'background.paper'
                                    }}
                                >
                                    <ListItem
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            cursor: notification.idTiquete ? 'pointer' : 'default',
                                            '&:hover': notification.idTiquete ? {
                                                backgroundColor: 'action.selected'
                                            } : {}
                                        }}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        {/* Header con icono y tipo */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            width: '100%',
                                            mb: 1
                                        }}>
                                            {getNotificationIcon(notification.tipoNotificacion)}
                                            <Chip 
                                                label={translateNotificationType(notification.tipoNotificacion)}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                            {notification.estadoNotificacion === 'No Leída' && (
                                                <CircleIcon 
                                                    sx={{ 
                                                        fontSize: 10, 
                                                        color: 'error.main',
                                                        ml: 'auto'
                                                    }} 
                                                />
                                            )}
                                        </Box>

                                        {/* Descripción */}
                                        <ListItemText
                                            primary={notification.descripcion}
                                            secondary={
                                                <>
                                                    <Typography variant="caption" display="block">
                                                        {t('notifications.by')}: {notification.usuarioRemitente}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(notification.fecha)}
                                                    </Typography>
                                                </>
                                            }
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                sx: { 
                                                    fontWeight: notification.estadoNotificacion === 'No Leída' 
                                                        ? 600 
                                                        : 400 
                                                }
                                            }}
                                        />

                                        {/* Botón marcar como leída */}
                                        {notification.estadoNotificacion === 'No Leída' && (
                                            <Button
                                                size="small"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notification.idNotificacion);
                                                }}
                                                sx={{ mt: 1 }}
                                            >
                                                {t('notifications.markAsRead')}
                                            </Button>
                                        )}
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </Paper>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}
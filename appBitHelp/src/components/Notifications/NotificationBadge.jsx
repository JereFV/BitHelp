import { useState, useEffect } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationService from '../../services/NotificationService';

export default function NotificationBadge({ onOpen }) {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const response = await NotificationService.getUnreadCount();
            setUnreadCount(response.data.data.count);
        } catch (error) {
            console.error('Error al obtener contador de notificaciones:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        
        // Actualizar contador cada 30 segundos
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Función pública para refrescar el contador
    const refreshCount = () => {
        fetchUnreadCount();
    };

    return (
        <Tooltip title="Notificaciones">
            <IconButton 
                onClick={() => onOpen(refreshCount)} 
                color="inherit"
                size="large"
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
        </Tooltip>
    );
}
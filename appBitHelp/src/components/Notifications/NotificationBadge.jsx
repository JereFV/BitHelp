import { useContext } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { NotificationContext } from '../../context/NotificationContext';

export default function NotificationBadge({ onOpen }) {
    const { unreadCount, refreshCount } = useContext(NotificationContext);

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
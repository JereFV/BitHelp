import { useContext } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { NotificationContext } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';

export default function NotificationBadge({ onOpen }) {
    const { t } = useTranslation();
    const { unreadCount, refreshCount } = useContext(NotificationContext);

    return (
        <Tooltip title={t('notifications.title')}>
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
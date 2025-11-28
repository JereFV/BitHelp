import { createContext, useState, useEffect, useCallback } from 'react';
import NotificationService from '../services/NotificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Función para refrescar manualmente
  const refreshCount = () => {
    fetchUnreadCount();
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
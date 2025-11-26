import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'NotificationController';

class NotificationService {
    // Obtener token del localStorage - CORREGIDO
    getAuthHeader() {
        const token = localStorage.getItem('authToken'); // Cambio aquí: 'authToken' en lugar de 'token'
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    // Obtener todas las notificaciones
    getAllNotifications() {
        return axios.get(BASE_URL, {
            headers: this.getAuthHeader()
        });
    }

    // Obtener solo notificaciones no leídas
    getUnreadNotifications() {
        return axios.get(`${BASE_URL}/unread`, {
            headers: this.getAuthHeader()
        });
    }

    // Obtener contador de no leídas
    getUnreadCount() {
        return axios.get(`${BASE_URL}/count`, {
            headers: this.getAuthHeader()
        });
    }

    // Marcar como leída
    markAsRead(idNotificacion) {
        return axios.put(`${BASE_URL}/${idNotificacion}`, {}, {
            headers: this.getAuthHeader()
        });
    }
}

export default new NotificationService();
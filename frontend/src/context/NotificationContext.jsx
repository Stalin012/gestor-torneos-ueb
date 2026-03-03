import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNotifications, NotificationCenter } from '../components/NotificationCenter';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const {
        notifications,
        loading,
        addNotification,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        success,
        error,
        warning,
        info,
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);

    // Calcular notificaciones no leídas (reactivo a cambios de notifications)
    const unreadCount = Array.isArray(notifications)
        ? notifications.filter(n => !n.leida).length
        : 0;

    // Cargar y refrescar notificaciones al montar y cuando la sesión cambia
    useEffect(() => {
        const syncNotifications = () => {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            loadNotifications();
        };

        syncNotifications();
        window.addEventListener('storage', syncNotifications);
        window.addEventListener('user-updated', syncNotifications);

        return () => {
            window.removeEventListener('storage', syncNotifications);
            window.removeEventListener('user-updated', syncNotifications);
        };
    }, [loadNotifications]);

    const initializeNotifications = useCallback(() => {
        const token = sessionStorage.getItem('token');
        if (token) loadNotifications();
    }, [loadNotifications]);

    const toggleNotificationCenter = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const closeNotificationCenter = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Wrapper para markAllAsRead: marca todas y cierra el panel si no quedan pendientes
    const handleMarkAllAsRead = useCallback(async () => {
        if (!markAllAsRead) return;
        await markAllAsRead();
    }, [markAllAsRead]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            isOpen,
            toggleNotificationCenter,
            closeNotificationCenter,
            setIsOpen,
            success,
            error,
            warning,
            info,
            unreadCount,
            loadNotifications,
            initializeNotifications,
            markAsRead,
            markAllAsRead: handleMarkAllAsRead,
        }}>
            {children}
            <NotificationCenter
                isOpen={isOpen}
                onClose={closeNotificationCenter}
                notifications={notifications}
                loadNotifications={loadNotifications}
                markAsRead={markAsRead}
                markAllAsRead={handleMarkAllAsRead}
                loading={loading}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

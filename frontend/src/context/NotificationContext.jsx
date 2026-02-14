import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotifications, NotificationCenter } from '../components/NotificationCenter';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const notification = useNotifications();
    const { notifications, addNotification, loadNotifications, success, error, warning, info } = notification;
    
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Cargar notificaciones solo si hay token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadNotifications();
        }
    }, [loadNotifications]);

    // Calcular notificaciones no leídas
    useEffect(() => {
        const count = notifications.filter(n => !n.leida).length;
        setUnreadCount(count);
    }, [notifications]);

    // Función para cargar notificaciones cuando el usuario se loguee
    const initializeNotifications = useCallback(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadNotifications();
        }
    }, [loadNotifications]);

    const toggleNotificationCenter = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const closeNotificationCenter = useCallback(() => {
        setIsOpen(false);
    }, []);

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
            initializeNotifications
        }}>
            {children}
            <NotificationCenter
                isOpen={isOpen}
                onClose={closeNotificationCenter}
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

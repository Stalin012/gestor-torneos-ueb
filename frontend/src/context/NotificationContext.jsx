import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotifications, NotificationCenter } from '../components/NotificationCenter';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    // Destructure the notification logic from the custom hook
    const notification = useNotifications();
    const { notifications, removeNotification, clearAll, addNotification, success, error, warning, info } = notification;

    const [isOpen, setIsOpen] = useState(false);

    const toggleNotificationCenter = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    // Also close the notification center if clicking outside or after some time if needed, 
    // but for now let's keep it simple.

    // Automatically open notification center if there are unread notifications? Maybe not.

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            isOpen,
            toggleNotificationCenter,
            setIsOpen,
            success,
            error,
            warning,
            info,
            removeNotification,
            clearAll
        }}>
            {children}
            {/* The NotificationCenter itself */}
            {isOpen && (
                <NotificationCenter
                    notifications={notifications}
                    onClose={removeNotification}
                    onDismiss={removeNotification}
                    onClearAll={clearAll}
                />
            )}
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

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertCircle, History } from "lucide-react";
import api from "../api";

/**
 * Sistema de Notificaciones Premium con Historial
 * Centro de notificaciones tipo iOS/MacOS con persistencia en BD
 */

const NOTIFICATION_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
};

const NotificationItem = ({ notification, onClose, onDismiss, onMarkAsRead }) => {
    const { id, tipo, titulo, mensaje, created_at, leida } = notification;

    const getIcon = () => {
        switch (tipo) {
            case NOTIFICATION_TYPES.SUCCESS:
                return <CheckCircle size={24} />;
            case NOTIFICATION_TYPES.ERROR:
                return <AlertCircle size={24} />;
            case NOTIFICATION_TYPES.WARNING:
                return <AlertTriangle size={24} />;
            default:
                return <Info size={24} />;
        }
    };

    const getColors = () => {
        switch (tipo) {
            case NOTIFICATION_TYPES.SUCCESS:
                return {
                    bg: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))",
                    border: "rgba(34, 197, 94, 0.5)",
                    icon: "#86efac",
                };
            case NOTIFICATION_TYPES.ERROR:
                return {
                    bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
                    border: "rgba(239, 68, 68, 0.5)",
                    icon: "#fca5a5",
                };
            case NOTIFICATION_TYPES.WARNING:
                return {
                    bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))",
                    border: "rgba(245, 158, 11, 0.5)",
                    icon: "#fbbf24",
                };
            default:
                return {
                    bg: "linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(14, 165, 233, 0.1))",
                    border: "rgba(56, 189, 248, 0.5)",
                    icon: "#bae6fd",
                };
        }
    };

    const colors = getColors();

    const handleClick = async () => {
        if (!leida && onMarkAsRead) {
            await onMarkAsRead(id);
        }
        onDismiss?.(id);
    };

    return (
        <div
            className="notification-item clickable-scale"
            style={{
                background: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                marginBottom: "0.75rem",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                animation: "slideInRight 0.3s ease-out",
                cursor: "pointer",
                opacity: leida ? 0.7 : 1,
            }}
            onClick={handleClick}
        >
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ color: colors.icon, flexShrink: 0 }}>{getIcon()}</div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                            {titulo}
                            {!leida && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    background: colors.border,
                                    borderRadius: '50%',
                                    marginLeft: '0.5rem'
                                }}></span>
                            )}
                        </h4>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose(id);
                            }}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--muted)",
                                cursor: "pointer",
                                padding: "0.25rem",
                                borderRadius: "4px",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            aria-label="Cerrar notificación"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "#ffffff", margin: "0 0 0.5rem 0", lineHeight: 1.5 }}>
                        {mensaje}
                    </p>

                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>
                        {new Date(created_at).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onDismiss: PropTypes.func,
    onMarkAsRead: PropTypes.func,
};

const NotificationCenter = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/notificaciones');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, loadNotifications]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notificaciones/${id}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, leida: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notificaciones/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.leida).length;

    return (
        <div
            className="notification-center"
            style={{
                position: "fixed",
                top: "80px",
                right: "20px",
                width: "400px",
                maxWidth: "calc(100vw - 40px)",
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto",
                zIndex: 10000,
                padding: "1rem",
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98))",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(20px)",
                animation: "slideInRight 0.3s ease-out",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#ffffff" }}>
                    <Bell size={20} />
                    Notificaciones
                    {unreadCount > 0 && (
                        <span
                            style={{
                                fontSize: "0.75rem",
                                padding: "0.15rem 0.5rem",
                                background: "var(--accent)",
                                borderRadius: "12px",
                                color: "#000",
                                fontWeight: "700",
                            }}
                        >
                            {unreadCount}
                        </span>
                    )}
                </h3>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            style={{
                                background: "transparent",
                                border: "1px solid var(--accent)",
                                color: "var(--accent)",
                                padding: "0.4rem 0.8rem",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "600",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--accent)";
                                e.currentTarget.style.color = "#000";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "var(--accent)";
                            }}
                        >
                            Marcar todas
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#ffffff",
                            cursor: "pointer",
                            padding: "0.25rem",
                            borderRadius: "4px",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff' }}>
                        Cargando notificaciones...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                        <History size={60} style={{ opacity: 0.1, margin: "0 auto 1rem", display: "block" }} />
                        <p style={{ color: "#ffffff", fontSize: "0.9rem", textAlign: "center" }}>No hay notificaciones en el historial</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onClose={removeNotification}
                            onDismiss={removeNotification}
                            onMarkAsRead={markAsRead}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

NotificationCenter.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

// Hook personalizado para notificaciones con persistencia
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback(async (type, title, message, userCedula = null) => {
        try {
            await api.post('/notificaciones', {
                titulo: title,
                mensaje: message,
                tipo: type,
                usuario_cedula: userCedula
            });
            // Recargar notificaciones después de crear una nueva
            const response = await api.get('/notificaciones');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }, []);

    const loadNotifications = useCallback(async () => {
        try {
            const response = await api.get('/notificaciones');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }, []);

    return {
        notifications,
        addNotification,
        loadNotifications,
        success: (title, message, userCedula) => addNotification(NOTIFICATION_TYPES.SUCCESS, title, message, userCedula),
        error: (title, message, userCedula) => addNotification(NOTIFICATION_TYPES.ERROR, title, message, userCedula),
        warning: (title, message, userCedula) => addNotification(NOTIFICATION_TYPES.WARNING, title, message, userCedula),
        info: (title, message, userCedula) => addNotification(NOTIFICATION_TYPES.INFO, title, message, userCedula),
    };
};

export { NOTIFICATION_TYPES, NotificationCenter, NotificationItem };
export default NotificationCenter;

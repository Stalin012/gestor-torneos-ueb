import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

/**
 * Sistema de Notificaciones Premium
 * Centro de notificaciones tipo iOS/MacOS
 */

const NOTIFICATION_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
};

const NotificationItem = ({ notification, onClose, onDismiss }) => {
    const { id, type, title, message, timestamp, autoClose = true } = notification;

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                onClose(id);
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [id, autoClose, onClose]);

    const getIcon = () => {
        switch (type) {
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
        switch (type) {
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
            }}
            onClick={() => onDismiss?.(id)}
        >
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ color: colors.icon, flexShrink: 0 }}>{getIcon()}</div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                            {title}
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
                        {message}
                    </p>

                    {timestamp && (
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>
                            {new Date(timestamp).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        type: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        autoClose: PropTypes.bool,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onDismiss: PropTypes.func,
};

const NotificationCenter = ({ notifications, onClose, onDismiss, onClearAll }) => {
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
                    {notifications.length > 0 && (
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
                            {notifications.length}
                        </span>
                    )}
                </h3>

                {notifications.length > 0 && (
                    <button
                        onClick={onClearAll}
                        style={{
                            background: "transparent",
                            border: "1px solid var(--danger)",
                            color: "var(--danger)",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--danger)";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--danger)";
                        }}
                    >
                        Limpiar todo
                    </button>
                )}
            </div>

            <div>
                {notifications.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                        <Bell size={60} style={{ opacity: 0.1, margin: "0 auto 1rem", display: "block" }} />
                        <p style={{ color: "#ffffff", fontSize: "0.9rem", textAlign: "center" }}>No hay notificaciones</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onClose={onClose}
                            onDismiss={onDismiss}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

NotificationCenter.propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClose: PropTypes.func.isRequired,
    onDismiss: PropTypes.func,
    onClearAll: PropTypes.func.isRequired,
};

// Hook personalizado para notificaciones
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [notificationId, setNotificationId] = useState(0);

    const addNotification = useCallback((type, title, message, autoClose = true) => {
        const id = notificationId;
        setNotificationId((prev) => prev + 1);

        const notification = {
            id,
            type,
            title,
            message,
            timestamp: new Date(),
            autoClose,
        };

        setNotifications((prev) => [notification, ...prev]);
        return id;
    }, [notificationId]);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        success: (title, message) => addNotification(NOTIFICATION_TYPES.SUCCESS, title, message),
        error: (title, message) => addNotification(NOTIFICATION_TYPES.ERROR, title, message),
        warning: (title, message) => addNotification(NOTIFICATION_TYPES.WARNING, title, message),
        info: (title, message) => addNotification(NOTIFICATION_TYPES.INFO, title, message),
    };
};

export { NOTIFICATION_TYPES, NotificationCenter, NotificationItem };
export default NotificationCenter;

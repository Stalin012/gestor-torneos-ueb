import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertCircle, History } from "lucide-react";
import api from "../api";

const NOTIFICATION_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
};

const VALID_TYPES = new Set(Object.values(NOTIFICATION_TYPES));

const safeParseUser = () => {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const normalizeType = (value) => {
    const type = String(value || "").toLowerCase();
    return VALID_TYPES.has(type) ? type : NOTIFICATION_TYPES.INFO;
};

const defaultTitleByType = (type) => {
    switch (type) {
        case NOTIFICATION_TYPES.SUCCESS:
            return "Operacion completada";
        case NOTIFICATION_TYPES.ERROR:
            return "Ocurrio un error";
        case NOTIFICATION_TYPES.WARNING:
            return "Atencion";
        default:
            return "Informacion";
    }
};

const normalizeCreatePayload = (args) => {
    const [arg1, arg2, arg3, arg4] = args;

    if (arg1 && typeof arg1 === "object" && !Array.isArray(arg1)) {
        const type = normalizeType(arg1.type);
        return {
            type,
            title: arg1.title || defaultTitleByType(type),
            message: arg1.message || arg1.title || defaultTitleByType(type),
            userCedula: arg1.userCedula ?? null,
            scope: arg1.scope || "self",
        };
    }

    if (typeof arg1 === "string" && VALID_TYPES.has(arg1.toLowerCase())) {
        const type = normalizeType(arg1);
        const title = typeof arg2 === "string" ? arg2 : defaultTitleByType(type);
        const message = typeof arg3 === "string" ? arg3 : title;
        return {
            type,
            title,
            message,
            userCedula: arg4 ?? null,
            scope: "self",
        };
    }

    const message = typeof arg1 === "string" ? arg1 : defaultTitleByType(NOTIFICATION_TYPES.INFO);
    const type = normalizeType(arg2);
    return {
        type,
        title: defaultTitleByType(type),
        message,
        userCedula: arg3 ?? null,
        scope: "self",
    };
};

const resolveTargetCedula = (currentUser, payload) => {
    if (payload.userCedula !== null && payload.userCedula !== undefined) {
        return payload.userCedula;
    }

    const role = String(currentUser?.rol || "").toLowerCase();
    const cedula = currentUser?.cedula || null;

    if (payload.scope === "global" && role === "admin") {
        return null;
    }

    return cedula;
};

const normalizeNotificationsResponse = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
};

const NotificationItem = ({ notification, onDismiss, onMarkAsRead }) => {
    const { id, tipo, titulo, mensaje, created_at, leida } = notification;

    const getIcon = () => {
        switch (tipo) {
            case NOTIFICATION_TYPES.SUCCESS:
                return <CheckCircle size={22} />;
            case NOTIFICATION_TYPES.ERROR:
                return <AlertCircle size={22} />;
            case NOTIFICATION_TYPES.WARNING:
                return <AlertTriangle size={22} />;
            default:
                return <Info size={22} />;
        }
    };

    const getColors = () => {
        switch (tipo) {
            case NOTIFICATION_TYPES.SUCCESS:
                return { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.5)", icon: "#86efac" };
            case NOTIFICATION_TYPES.ERROR:
                return { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.5)", icon: "#fca5a5" };
            case NOTIFICATION_TYPES.WARNING:
                return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.5)", icon: "#fbbf24" };
            default:
                return { bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.5)", icon: "#bae6fd" };
        }
    };

    const colors = getColors();

    const handleMarkRead = async () => {
        if (!leida && onMarkAsRead) {
            await onMarkAsRead(id);
        }
    };

    return (
        <div
            className="notification-item clickable-scale"
            style={{
                background: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "0.9rem 1rem",
                marginBottom: "0.7rem",
                cursor: "pointer",
                opacity: leida ? 0.75 : 1,
            }}
            onClick={handleMarkRead}
        >
            <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                <div style={{ color: colors.icon, flexShrink: 0 }}>{getIcon()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                        <h4 style={{ fontSize: "0.92rem", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                            {titulo || defaultTitleByType(tipo)}
                            {!leida && (
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: "8px",
                                        height: "8px",
                                        background: colors.border,
                                        borderRadius: "50%",
                                        marginLeft: "0.45rem",
                                    }}
                                />
                            )}
                        </h4>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDismiss(id);
                            }}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#94a3b8",
                                cursor: "pointer",
                                padding: "0.1rem",
                                borderRadius: "4px",
                            }}
                            aria-label="Ocultar notificacion"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <p style={{ fontSize: "0.84rem", color: "#ffffff", margin: "0 0 0.4rem 0", lineHeight: 1.45 }}>
                        {mensaje}
                    </p>

                    <span style={{ fontSize: "0.73rem", color: "#94a3b8" }}>
                        {created_at
                            ? new Date(created_at).toLocaleString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "Fecha no disponible"}
                    </span>
                </div>
            </div>
        </div>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.object.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onMarkAsRead: PropTypes.func,
};

const NotificationCenter = ({ isOpen, onClose, notifications, loadNotifications, markAsRead, markAllAsRead, loading }) => {
    const [hiddenIds, setHiddenIds] = useState([]);
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const visibleNotifications = useMemo(
        () => safeNotifications.filter((n) => !hiddenIds.includes(n.id)),
        [safeNotifications, hiddenIds]
    );
    const unreadCount = safeNotifications.filter((n) => !n.leida).length;

    useEffect(() => {
        if (isOpen && loadNotifications) {
            loadNotifications();
        }
    }, [isOpen, loadNotifications]);

    useEffect(() => {
        if (!isOpen) {
            setHiddenIds([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

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
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>
                    <Bell size={19} />
                    Notificaciones
                    {unreadCount > 0 && (
                        <span
                            style={{
                                fontSize: "0.72rem",
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

                <div style={{ display: "flex", gap: "0.45rem" }}>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            style={{
                                background: "transparent",
                                border: "1px solid var(--accent)",
                                color: "var(--accent)",
                                padding: "0.35rem 0.65rem",
                                borderRadius: "8px",
                                fontSize: "0.72rem",
                                cursor: "pointer",
                                fontWeight: "600",
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
                            padding: "0.2rem",
                            borderRadius: "4px",
                        }}
                        aria-label="Cerrar panel"
                    >
                        <X size={19} />
                    </button>
                </div>
            </div>

            <div>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#ffffff" }}>
                        Cargando notificaciones...
                    </div>
                ) : visibleNotifications.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                        <History size={56} style={{ opacity: 0.12, margin: "0 auto 0.8rem", display: "block" }} />
                        <p style={{ color: "#ffffff", fontSize: "0.9rem", textAlign: "center" }}>
                            No hay notificaciones disponibles
                        </p>
                    </div>
                ) : (
                    visibleNotifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onDismiss={(id) => setHiddenIds((prev) => [...prev, id])}
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
    notifications: PropTypes.array,
    loadNotifications: PropTypes.func,
    markAsRead: PropTypes.func,
    markAllAsRead: PropTypes.func,
    loading: PropTypes.bool,
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadNotifications = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setNotifications([]);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get("/notificaciones");
            const normalized = normalizeNotificationsResponse(response.data);
            setNotifications(normalized);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error loading notifications:", error);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const addNotification = useCallback(async (...args) => {
        const token = localStorage.getItem("token");
        if (!token) return false;

        const currentUser = safeParseUser();
        const payload = normalizeCreatePayload(args);
        const targetCedula = resolveTargetCedula(currentUser, payload);

        try {
            await api.post("/notificaciones", {
                titulo: payload.title,
                mensaje: payload.message,
                tipo: payload.type,
                usuario_cedula: targetCedula,
            });
            await loadNotifications();
            return true;
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error creating notification:", error?.response?.data || error);
            }
            return false;
        }
    }, [loadNotifications]);

    const markAsRead = useCallback(async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await api.patch(`/notificaciones/${id}/read`);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error markAsRead:", error);
            }
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await api.patch("/notificaciones/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error markAllAsRead:", error);
            }
        }
    }, []);

    return {
        notifications,
        loading,
        addNotification,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        success: (title, message, userCedula) => addNotification(NOTIFICATION_TYPES.SUCCESS, title, message, userCedula),
        error: (title, message, userCedula) => addNotification(NOTIFICATION_TYPES.ERROR, title, message, userCedula),
        warning: (title, message, userCedula) => addNotification(NOTIFICATION_TYPES.WARNING, title, message, userCedula),
        info: (title, message, userCedula) => addNotification(NOTIFICATION_TYPES.INFO, title, message, userCedula),
    };
};

export { NOTIFICATION_TYPES, NotificationCenter, NotificationItem };
export default NotificationCenter;

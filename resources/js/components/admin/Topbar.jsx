import React from 'react';
import { Bell, Search, Settings, Menu } from 'lucide-react';

const Topbar = ({ onToggleSidebar }) => {
    return (
        <header className="admin-topbar">
            <div className="topbar-left">
                <button
                    className="menu-toggle-btn"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Menu"
                    style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}
                >
                    <Menu size={24} color="var(--text-1)" />
                </button>
                <span className="current-date">
                    {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            </div>

            <div className="topbar-right">
                <div className="topbar-actions">
                    <button className="topbar-btn-icon" aria-label="Buscar">
                        <Search size={18} />
                    </button>
                    <button className="topbar-btn-icon" aria-label="Notificaciones">
                        <div className="notification-dot"></div>
                        <Bell size={18} />
                    </button>
                    <button className="topbar-btn-icon" aria-label="Configuración">
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;

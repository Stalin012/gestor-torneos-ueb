import React, { memo } from 'react';
import { getAssetUrl } from '../utils/helpers';
import { Bell, Menu, LogOut } from 'lucide-react';
import '../css/unified-all.css';
import '../css/unified-navigation.css';

const GlobalNavbar = memo(({ user, title, onToggleSidebar, onLogout, onNotificationsClick, notificationCount, onProfileClick }) => {
    const profileImage = user ? getAssetUrl(user.foto_url || user.persona?.foto_url) : null;

    return (
        <header className="global-header">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="header-btn"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={24} />
                </button>
                <h1 className="header-title">{title || 'Dashboard'}</h1>
            </div>

            <div className="header-actions">
                <button className="header-btn relative" onClick={onNotificationsClick}>
                    <Bell size={20} />
                    {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                </button>

                <div className="user-profile" onClick={onProfileClick}>
                    <div className="user-avatar" style={{ overflow: 'hidden' }}>
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Perfil"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            (user?.nombres || user?.persona?.nombres)?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                    <div className="user-info hidden md:flex">
                        <span className="user-name">
                            {(user?.nombres || user?.persona?.nombres) || 'Usuario'} {(user?.apellidos || user?.persona?.apellidos) || ''}
                        </span>
                        <span className="user-role">{user?.rol || 'Invitado'}</span>
                    </div>
                </div>

                <button
                    className="header-btn hover:text-red-500"
                    onClick={onLogout}
                    aria-label="Cerrar sesión"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
});

export default GlobalNavbar;
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Clipboard,
    User,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react';
import '../../css/referee_styles.css';

const RefereeLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/referee/dashboard' },
        { id: 'partidos', label: 'Mis Partidos', icon: Clipboard, path: '/referee/partidos' },
        { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/referee/perfil' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="referee-layout">
            {/* Sidebar */}
            <aside className={`referee-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="referee-sidebar-header">
                    <div className="referee-logo">
                        <Shield size={24} />
                    </div>
                    <div className="referee-brand">
                        <h3>Panel Árbitro</h3>
                        <p>{user.nombre || 'Árbitro'}</p>
                    </div>
                </div>

                <nav className="referee-nav">
                    {navItems.map(item => (
                        <a
                            key={item.id}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                            className={`referee-nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </a>
                    ))}
                </nav>

                <button
                    className="referee-nav-item"
                    onClick={handleLogout}
                    style={{ marginTop: 'auto', color: 'var(--ref-danger)' }}
                >
                    <LogOut size={20} />
                    Cerrar Sesión
                </button>
            </aside>

            {/* Main Content */}
            <main className="referee-main">
                <Outlet />
            </main>

            {/* Mobile Menu Toggle */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 101,
                    background: 'var(--ref-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'none'
                }}
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
    );
};

export default RefereeLayout;

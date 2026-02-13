import React, { useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/* ============================================================================
   HELPER COMPONENTS (Internal)
   ============================================================================ */

const NavItem = React.memo(({ module, isActive, onClick }) => {
    const IconComponent = module.icon;
    return (
        <button
            onClick={onClick}
            className={`nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
        >
            <span className="nav-item-icon">
                <IconComponent size={18} aria-hidden="true" />
            </span>
            <span className="nav-item-label">{module.label}</span>
            {isActive && <span className="nav-item-badge">Activo</span>}
        </button>
    );
});

NavItem.displayName = 'NavItem';

const NavGroup = React.memo(({ groupName, modules, activePath, onNavigate }) => (
    <div className="sidebar-group">
        <h4 className="group-title">{groupName}</h4>
        <nav className="sidebar-nav">
            {modules.map((module) => (
                <NavItem
                    key={module.id}
                    module={module}
                    isActive={activePath === module.path}
                    onClick={() => onNavigate(module.path)}
                />
            ))}
        </nav>
    </div>
));

NavGroup.displayName = 'NavGroup';

/* ============================================================================
   MAIN SIDEBAR COMPONENT
   ============================================================================ */

/* ============================================================================
   MAIN SIDEBAR COMPONENT
   ============================================================================ */

const Sidebar = ({ user, logout, modules, isOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const groupedModules = useMemo(() => {
        return modules.reduce((acc, module) => {
            if (!acc[module.group]) {
                acc[module.group] = [];
            }
            acc[module.group].push(module);
            return acc;
        }, {});
    }, [modules]);

    const userDisplayInfo = useMemo(() => {
        if (!user) return { name: 'Administrador', initial: 'A' };
        const fullName = user.persona
            ? `${user.persona.nombres} ${user.persona.apellidos}`
            : (user.email || "Administrador");
        return {
            name: fullName,
            initial: fullName.charAt(0).toUpperCase(),
        };
    }, [user]);

    const handleNavigate = (path) => navigate(path);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Menú principal">
            <div className="sidebar-header">
                <div className="sidebar-logo-circle" aria-hidden="true">U</div>
                <div className="sidebar-brand-text">
                    <h3 className="sidebar-title">
                        UEB<span>SPORT</span>
                    </h3>
                    <p className="sidebar-subtitle">Panel de administración</p>
                </div>
            </div>

            <div className="sidebar-user-check">
                <div className="status-dot online"></div>
                <span>Administrador Activo</span>
            </div>

            <div className="sidebar-scroll-area">
                {Object.entries(groupedModules).map(([groupName, groupModules]) => (
                    <NavGroup
                        key={groupName}
                        groupName={groupName}
                        modules={groupModules}
                        activePath={location.pathname}
                        onNavigate={handleNavigate}
                    />
                ))}
            </div>

            <div className="sidebar-footer">
                <div className="user-mini-profile">
                    <div className="avatar-circle-sm">{userDisplayInfo.initial}</div>
                    <div className="user-mini-info">
                        <span className="user-mini-name">{userDisplayInfo.name}</span>
                        <span className="user-mini-role">Super Admin</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="btn-logout-icon"
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                >
                    <LogOut size={18} aria-hidden="true" />
                </button>
            </div>
        </aside>
    );
};

Sidebar.propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
    modules: PropTypes.array.isRequired
};

export default Sidebar;

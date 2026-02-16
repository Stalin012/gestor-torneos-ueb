import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import GlobalSidebar from '../components/GlobalSidebar';
import GlobalNavbar from '../components/GlobalNavbar';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNotification } from '../context/NotificationContext';
import '../css/unified-all.css';
import '../css/enhanced-components.css';

const UnifiedLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { notifications, toggleNotificationCenter, unreadCount } = useNotification();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false); // Close sidebar on small screens
        setIsSidebarCollapsed(false); // Ensure it's not collapsed on small screens
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing user from local storage", e);
          navigate('/login');
        }
      }
    };

    loadUser();

    const handleUserUpdate = () => loadUser();
    window.addEventListener('user-updated', handleUserUpdate);

    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, [navigate]);

  const getUserRole = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.rol?.toLowerCase() || '';
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
    return '';
  }, []);

  const getRolePrefix = useCallback(() => {
    const userRole = getUserRole();
    if (userRole) {
      if (userRole === 'admin') return '/admin';
      if (userRole === 'representante') return '/representante';
      if (userRole === 'arbitro') return '/referee';
      if (userRole === 'user' || userRole === 'jugador') return '/user';
    }

    if (currentPath.startsWith('/admin')) return '/admin';
    if (currentPath.startsWith('/representante')) return '/representante';
    if (currentPath.startsWith('/referee')) return '/referee';
    if (currentPath.startsWith('/user')) return '/user';
    return '/';
  }, [getUserRole, currentPath]);

  const rolePrefix = getRolePrefix();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);



  const handleProfileClick = useCallback(() => {
    navigate(`${rolePrefix}/perfil`);
  }, [navigate, rolePrefix]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev); // Siempre alterna la visibilidad completa

    // Si el sidebar se está abriendo en una pantalla grande, asegúrate de que no esté colapsado por defecto
    if (!isSidebarOpen && window.innerWidth > 768) {
      setIsSidebarCollapsed(false);
    }
  }, [isSidebarOpen]);

  const adminLinks = useMemo(() => [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/torneos", label: "Torneos" },
    { to: "/equipos", label: "Equipos" },
    { to: "/jugadores", label: "Jugadores" },
    { to: "/arbitros", label: "Árbitros" },
    { to: "/usuarios", label: "Usuarios" },
    { to: "/galeria", label: "Galería" },
    { to: "/auditoria", label: "Auditoría" },
    { to: "/noticias", label: "Noticias" },
    { to: "/configuracion", label: "Configuración" },
    { to: "/perfil", label: "Mi Perfil" },
    { to: "/estadisticas", label: "Estadísticas" },
  ], []);

  const representanteLinks = useMemo(() => [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/calendario", label: "Calendario" },
    { to: "/jugadores", label: "Nómina" },
    { to: "/equipos", label: "Equipos" },
    { to: "/inscripciones", label: "Inscripciones" },
    { to: "/partidos", label: "Partidos" },
    { to: "/perfil", label: "Perfil" },
    { to: "/estadisticas", label: "Estadísticas" },
  ], []);

  const refereeLinks = useMemo(() => [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/partidos", label: "Partidos Asignados" },
    { to: "/perfil", label: "Perfil" },
  ], []);

  const userLinks = useMemo(() => [
    { to: "/perfil", label: "Mi Perfil" },
    { to: "/equipos", label: "Mis Equipos" },
  ], []);

  const rawLinks = useMemo(() => {
    if (rolePrefix === '/admin') return adminLinks;
    if (rolePrefix === '/representante') return representanteLinks;
    if (rolePrefix === '/referee') return refereeLinks;
    if (rolePrefix === '/user') return userLinks;
    return [];
  }, [rolePrefix, adminLinks, representanteLinks, refereeLinks, userLinks]);

  const navLinks = useMemo(() => rawLinks.map(link => ({
    ...link,
    to: `${rolePrefix}${link.to}`
  })), [rawLinks, rolePrefix]);

  const pageTitle = useMemo(() => {
    const currentLink = navLinks.find(link => currentPath.startsWith(link.to));
    return currentLink ? currentLink.label : 'Dashboard';
  }, [navLinks, currentPath]);

  return (
    <ErrorBoundary>
      <div className="app-layout">


        <GlobalSidebar
          links={navLinks}
          role={user?.rol?.toLowerCase()}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          isCollapsed={window.innerWidth <= 768 ? false : isSidebarCollapsed}
        />
        <div className={`sidebar-overlay ${isSidebarOpen && window.innerWidth <= 768 ? 'visible' : ''}`} onClick={handleToggleSidebar}></div>

        <div className={`main-wrapper ${!isSidebarOpen ? 'sidebar-hidden-full' : (isSidebarCollapsed ? 'sidebar-collapsed' : '')}`}>
          <GlobalNavbar
            user={user}
            title={pageTitle}
            onToggleSidebar={handleToggleSidebar}
            onLogout={handleLogout}
            onSearchChange={handleSearchChange}
            searchTerm={searchTerm}
            onNotificationsClick={toggleNotificationCenter}
            notificationCount={unreadCount}
            onProfileClick={handleProfileClick}
          />

          <main className="page-content">
            <ErrorBoundary>
              <div className="module-entrance">
                <Outlet />
              </div>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default UnifiedLayout;
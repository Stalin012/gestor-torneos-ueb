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
  const { toggleNotificationCenter, unreadCount } = useNotification();

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
      const token = sessionStorage.getItem('token');
      const storedUser = sessionStorage.getItem('user');

      if (!token || !storedUser) {
        if (!['/login', '/register', '/'].includes(currentPath) && !currentPath.startsWith('/noticias') && !currentPath.startsWith('/torneos') && !currentPath.startsWith('/galeria')) {
          navigate('/login');
        }
        setUser(null);
        return;
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing user from session storage", e);
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
  }, [navigate, currentPath]);

  // Obtener el prefijo de ruta del usuario actual desde su rol
  const getUserRolePrefix = useCallback(() => {
    const userRole = user?.rol?.toLowerCase();
    if (userRole === 'admin') return '/admin';
    if (userRole === 'representante') return '/representante';
    if (userRole === 'arbitro' || userRole === 'árbitro') return '/referee';
    if (userRole === 'user' || userRole === 'jugador') return '/user';
    // Fallback basado en URL
    if (currentPath.startsWith('/admin')) return '/admin';
    if (currentPath.startsWith('/representante')) return '/representante';
    if (currentPath.startsWith('/referee')) return '/referee';
    if (currentPath.startsWith('/user')) return '/user';
    return '';
  }, [user, currentPath]);


  // --- PROTECCIÓN DE RUTAS POR ROL ---
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);
      const userRole = parsedUser.rol?.toLowerCase();

      const roleToPrefixMap = {
        'admin': '/admin',
        'representante': '/representante',
        'arbitro': '/referee',
        'árbitro': '/referee',
        'usuario': '/user',
        'user': '/user',
        'jugador': '/user'
      };

      const expectedPrefix = roleToPrefixMap[userRole];
      const prefixes = ['/admin', '/representante', '/referee', '/user'];
      const currentPrefix = prefixes.find(p => currentPath.startsWith(p));

      // Si estoy en una ruta protegida pero el prefijo no corresponde a mi rol
      if (currentPrefix && expectedPrefix && currentPrefix !== expectedPrefix) {
        console.warn(`Acceso denegado: Usuario ${userRole} intentó acceder a ${currentPath}. Redirigiendo a ${expectedPrefix}`);
        navigate(`${expectedPrefix}/dashboard`);
      }
    } catch (e) {
      console.error("Error en la validación de roles de la ruta", e);
    }
  }, [currentPath, navigate]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleProfileClick = useCallback(() => {
    const prefix = getUserRolePrefix();
    if (prefix) {
      navigate(`${prefix}/perfil`);
    }
  }, [navigate, getUserRolePrefix]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
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
    { to: "/partidos", label: "Partidos" },
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

  const roleLinks = useMemo(() => {
    const userRole = user?.rol?.toLowerCase();
    let baseLinks = [];
    let currentPrefix = '';

    if (userRole === 'admin') {
      baseLinks = adminLinks;
      currentPrefix = '/admin';
    } else if (userRole === 'representante') {
      baseLinks = representanteLinks;
      currentPrefix = '/representante';
    } else if (userRole === 'arbitro' || userRole === 'árbitro') {
      baseLinks = refereeLinks;
      currentPrefix = '/referee';
    } else if (userRole === 'user' || userRole === 'jugador') {
      baseLinks = userLinks;
      currentPrefix = '/user';
    } else {
      // Fallback temporal basado en path mientras carga el usuario
      if (currentPath.startsWith('/admin')) { baseLinks = adminLinks; currentPrefix = '/admin'; }
      else if (currentPath.startsWith('/representante')) { baseLinks = representanteLinks; currentPrefix = '/representante'; }
      else if (currentPath.startsWith('/referee')) { baseLinks = refereeLinks; currentPrefix = '/referee'; }
      else if (currentPath.startsWith('/user')) { baseLinks = userLinks; currentPrefix = '/user'; }
    }

    return baseLinks.map(link => ({
      ...link,
      to: `${currentPrefix}${link.to}`
    }));
  }, [user, currentPath, adminLinks, representanteLinks, refereeLinks, userLinks]);

  const navLinks = roleLinks;


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

        <div className={`main-wrapper ${!isSidebarOpen ? 'layout-full-width' : (isSidebarCollapsed ? 'layout-collapsed-sidebar' : 'layout-full-sidebar')}`}>
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
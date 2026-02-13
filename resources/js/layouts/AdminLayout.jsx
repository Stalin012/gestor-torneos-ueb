import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Trophy, Settings, CalendarCheck,
  UserCheck, Shield, BookOpen, Camera, BarChart2, Flag
} from 'lucide-react';
import '../admin_styles.css';

// Import New Components
import Sidebar from '../Components/admin/Sidebar';
import Topbar from '../Components/admin/Topbar';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";

const ADMIN_MODULES = [
  { id: 'dashboard', label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", group: "Principal" },
  { id: 'estadisticas', label: "Estadísticas", icon: BarChart2, path: "/admin/estadisticas", group: "Principal" },

  { id: 'torneos', label: "Torneos y Deportes", icon: Trophy, path: "/admin/torneos", group: "Gestión Deportiva" },
  { id: 'partidos', label: "Partidos y Fixtures", icon: CalendarCheck, path: "/admin/partidos", group: "Gestión Deportiva" },
  { id: 'equipos', label: "Equipos", icon: Users, path: "/admin/equipos", group: "Gestión Deportiva" },

  { id: 'jugadores', label: "Jugadores y Personas", icon: UserCheck, path: "/admin/jugadores", group: "Usuarios & Personal" },
  { id: 'arbitros', label: "Árbitros", icon: Flag, path: "/admin/arbitros", group: "Usuarios & Personal" },
  { id: 'usuarios', label: "Usuarios del Sistema", icon: Users, path: "/admin/usuarios", group: "Usuarios & Personal" },

  { id: 'galeria', label: "Galería y Media", icon: Camera, path: "/admin/galeria", group: "Contenido" },
  { id: 'noticias', label: "Noticias", icon: BookOpen, path: "/admin/noticias", group: "Contenido" },
  { id: 'auditoria', label: "Auditoría (Logs)", icon: BookOpen, path: "/admin/auditoria", group: "Seguridad y Control" },
  { id: 'configuracion', label: "Configuración General", icon: Settings, path: "/admin/configuracion", group: "Configuración" },
];

// ============================================================================
// CUSTOM HOOK: useAdminAuth
// ============================================================================

const useAdminAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          if (isMounted) {
            setUser(null);
            setError(null);
          }
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch(`${API_BASE}/user`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!isMounted) return;

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (isMounted) {
            setUser(null);
            setError(null);
          }
          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Sesión inválida o expirada.");
        }

        if (data.rol !== "admin") {
          throw new Error("Acceso denegado: no eres administrador.");
        }

        setUser(data);
        setError(null);
      } catch (err) {
        console.error('[AdminAuth]', err);
        if (isMounted) {
          setError(err.message);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch(`${API_BASE}/logout`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('[Logout Error]', err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return { user, loading, error, logout };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, loading, error, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-screen" role="status" aria-live="polite">
        <div className="spinner"></div>
        <p>Cargando panel...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="admin-error-screen" role="alert">
        <div className="error-card">
          <h3>Acceso Restringido</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout pro-theme">
      {/* MOBILE OVERLAY */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* SIDEBAR COMPONENT */}
      <Sidebar
        user={user}
        logout={logout}
        modules={ADMIN_MODULES}
        isOpen={isSidebarOpen}
      />

      {/* MAIN CONTENT WRAPPER */}
      <main className="admin-main-wrapper">
        {/* TOPBAR COMPONENT */}
        <Topbar onToggleSidebar={toggleSidebar} />

        <div className="admin-content-scroll">
          <div className="admin-content-inner">
            {/* CHILD ROUTES */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

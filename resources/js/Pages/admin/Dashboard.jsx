import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Award,
  Zap,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Flame,
  Star,
  Eye,
  Plus,
  ChevronRight,
} from "lucide-react";

import "../../admin_styles.css";
import api from "../../api";



const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    torneos: { total: 0, activos: 0, finalizados: 0 },
    partidos: { total: 0, hoy: 0, pendientes: 0, finalizados: 0 },
    equipos: { total: 0, nuevos: 0 },
    jugadores: { total: 0, activos: 0 },
    deportes: { total: 0 },
    categorias: { total: 0 },
  });

  const [torneos, setTorneos] = useState([]);
  const [proximosPartidos, setProximosPartidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [torneosData, partidosData, equiposData, jugadoresData, deportesData, categoriasData] = await Promise.all([
        api.get('/torneos').catch(() => ({ data: [] })),
        api.get('/partidos').catch(() => ({ data: [] })),
        api.get('/equipos').catch(() => ({ data: [] })),
        api.get('/jugadores').catch(() => ({ data: [] })),
        api.get('/deportes').catch(() => []),
        api.get('/categorias').catch(() => []),
      ]);

      const torneosArray = Array.isArray(torneosData) ? torneosData : torneosData.data || [];
      const partidosArray = Array.isArray(partidosData) ? partidosData : partidosData.data || [];
      const equiposArray = Array.isArray(equiposData) ? equiposData : equiposData.data || [];
      const jugadoresArray = Array.isArray(jugadoresData) ? jugadoresData : jugadoresData.data || [];
      const deportesArray = Array.isArray(deportesData) ? deportesData : deportesData.data || [];
      const categoriasArray = Array.isArray(categoriasData) ? categoriasData : categoriasData.data || [];

      setTorneos(torneosArray.slice(0, 5));
      setProximosPartidos(partidosArray.filter(p => p.estado === "Programado").slice(0, 6));

      setStats({
        torneos: {
          total: torneosArray.length,
          activos: torneosArray.filter(t => t.estado === "Activo").length,
          finalizados: torneosArray.filter(t => t.estado === "Finalizado").length,
        },
        partidos: {
          total: partidosArray.length,
          hoy: partidosArray.filter(p => {
            if (!p.fecha) return false;
            const today = new Date().toISOString().split('T')[0];
            const partidoDate = p.fecha.split('T')[0];
            return partidoDate === today;
          }).length,
          pendientes: partidosArray.filter(p => p.estado === "Programado").length,
          finalizados: partidosArray.filter(p => p.estado === "Finalizado").length,
        },
        equipos: {
          total: equiposArray.length,
          nuevos: equiposArray.filter(e => {
            if (!e.created_at) return false;
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(e.created_at) > weekAgo;
          }).length,
        },
        jugadores: {
          total: jugadoresArray.length,
          activos: jugadoresArray.filter(j => j.activo !== false).length,
        },
        deportes: {
          total: deportesArray.length,
        },
        categorias: {
          total: categoriasArray.length,
        },
      });

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  const quickActions = [
    { icon: Trophy, label: "Nuevo Torneo", path: "/admin/torneos-deportes", color: "#22c55e" },
    { icon: Calendar, label: "Programar Partido", path: "/admin/partidos", color: "#3b82f6" },
    { icon: Users, label: "Registrar Equipo", path: "/admin/equipos", color: "#f59e0b" },
    { icon: Star, label: "Nuevo Jugador", path: "/admin/jugadores", color: "#ec4899" },
  ];

  return (
    <div className="admin-page-container fade-enter">

      {/* HEADER */}
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Panel de Control</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Bienvenido de nuevo, aquí tienes el resumen de hoy.
          </p>
        </div>
        <div className="page-actions">
          <button className="pro-btn btn-secondary">
            <Activity size={18} />
            <span>Ver Reportes</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              className="pro-card"
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', padding: '1.25rem',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = action.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{
                padding: '12px', borderRadius: '12px',
                background: `color-mix(in srgb, ${action.color} 15%, transparent)`,
                color: action.color
              }}>
                <Icon size={24} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: "var(--text-main)" }}>
                {action.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* KPI STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '10px', color: '#22c55e' }}>
              <Trophy size={24} />
            </div>
            {stats.torneos.activos > 0 && <span className="status-badge badge-success">Activos</span>}
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{stats.torneos.total}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Torneos Registrados</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '10px', color: '#3b82f6' }}>
              <Calendar size={24} />
            </div>
            <span className="status-badge badge-warning">{stats.partidos.pendientes} Pendientes</span>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{stats.partidos.total}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Partidos Programados</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', color: '#f59e0b' }}>
              <Users size={24} />
            </div>
            <span className="status-badge badge-neutral">+{stats.equipos.nuevos} Nuevos</span>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{stats.equipos.total}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Equipos Inscritos</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '10px', color: '#ec4899' }}>
              <Target size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{stats.jugadores.total}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Jugadores Totales</p>
        </div>
      </div>

      {/* TABLES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>

        {/* PROXIMOS PARTIDOS */}
        <div className="pro-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" /> Próximos Encuentros
            </h3>
            <button className="pro-btn btn-secondary" onClick={() => navigate('/admin/partidos')} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Ver Todo</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {proximosPartidos.length > 0 ? (
              proximosPartidos.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{p.equipoLocal?.nombre || 'Local'} <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>vs</span> {p.equipoVisitante?.nombre || 'Visita'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {p.fecha ? new Date(p.fecha).toLocaleDateString() : 'Por programar'} • {p.hora ? p.hora.substring(0, 5) : '--:--'}
                    </span>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay partidos pendientes</div>
            )}
          </div>
        </div>

        {/* TORNEOS ACTIVOS */}
        <div className="pro-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="var(--gold)" /> Torneos Activos
            </h3>
            <button className="pro-btn btn-secondary" onClick={() => navigate('/admin/torneos-deportes')} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Gestionar</button>
          </div>

          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {torneos.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: '#fff' }}>{t.nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.organizacion}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${t.estado === 'Activo' ? 'badge-success' : 'badge-neutral'}`}>
                        {t.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => navigate(`/admin/torneos/${t.id}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {torneos.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Sin torneos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

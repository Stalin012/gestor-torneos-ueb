import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Calendar,
  Activity,
  Award,
  Zap,
  Target,
  BarChart3,
  Clock,
  MapPin,
  Star,
  Plus,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

import LoadingScreen from "../../components/LoadingScreen";
import { StatCard } from "../../components/StatsComponents";
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
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const [torneosData, partidosData, equiposData, jugadoresData, deportesData, categoriasData] = await Promise.all([
        api.get('/torneos').catch(() => ({ data: [] })),
        api.get('/partidos').catch(() => ({ data: [] })),
        api.get('/equipos').catch(() => ({ data: [] })),
        api.get('/jugadores').catch(() => ({ data: [] })),
        api.get('/deportes').catch(() => ({ data: [] })),
        api.get('/categorias').catch(() => ({ data: [] })),
      ]);

      const torneosArray = Array.isArray(torneosData?.data) ? torneosData.data : (Array.isArray(torneosData) ? torneosData : []);
      const partidosArray = Array.isArray(partidosData?.data) ? partidosData.data : (Array.isArray(partidosData) ? partidosData : []);
      const equiposArray = Array.isArray(equiposData?.data) ? equiposData.data : (Array.isArray(equiposData) ? equiposData : []);
      const jugadoresArray = Array.isArray(jugadoresData?.data) ? jugadoresData.data : (Array.isArray(jugadoresData) ? jugadoresData : []);
      const deportesArray = Array.isArray(deportesData?.data) ? deportesData.data : (Array.isArray(deportesData) ? deportesData : []);
      const categoriasArray = Array.isArray(categoriasData?.data) ? categoriasData.data : (Array.isArray(categoriasData) ? categoriasData : []);

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
          hoy: 0,
          pendientes: partidosArray.filter(p => p.estado === "Programado").length,
          finalizados: partidosArray.filter(p => p.estado === "Finalizado").length,
        },
        equipos: {
          total: equiposArray.length,
          nuevos: 0,
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
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <LoadingScreen message="SINCRONIZANDO PANEL DE CONTROL..." />;
  }

  const quickActions = [
    { icon: Trophy, label: "Nuevo Torneo", path: "/admin/torneos-deportes", color: "#356ed8" },
    { icon: Calendar, label: "Programar Partido", path: "/admin/partidos", color: "#c55e60" },
    { icon: Users, label: "Registrar Equipo", path: "/admin/equipos", color: "#72add9" },
    { icon: Star, label: "Nuevo Jugador", path: "/admin/jugadores", color: "#33518e" },
  ];

  return (
    <div className="admin-page-container module-entrance">
      {/* HEADER SECTION */}
      <header className="page-header-responsive" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Sistema Integral</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0' }}>Panel Administrativo</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gestión centralizada de la actividad deportiva institucional</p>
        </div>
        <div className="hide-mobile" style={{ textAlign: 'right' }}>
          <div style={{ background: 'rgba(53, 110, 216, 0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(53, 110, 216, 0.2)', fontWeight: 700 }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* QUICK ACTIONS SECTION */}
      <div className="responsive-grid" style={{ marginBottom: '3rem' }}>
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              className="pro-card"
              onClick={() => navigate(action.path)}
              style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                cursor: 'pointer',
                marginBottom: 0
              }}
            >
              <div style={{
                background: `linear-gradient(135deg, ${action.color}bb, ${action.color}44)`,
                padding: '12px',
                borderRadius: '14px',
                color: '#fff',
                boxShadow: `0 8px 16px ${action.color}22`
              }}>
                <Icon size={24} />
              </div>
              <span style={{ fontWeight: 750, fontSize: '1rem', color: '#fff' }}>{action.label}</span>
              <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
            </div>
          )
        })}
      </div>

      {/* STATS SECTION (KPIs) */}
      <div className="responsive-grid" style={{ marginBottom: '3rem' }}>
        <StatCard title="Torneos Totales" value={stats.torneos.total} icon={Trophy} color="#356ed8" />
        <StatCard title="Partidos Pendientes" value={stats.partidos.pendientes} icon={Calendar} color="#f59e0b" />
        <StatCard title="Equipos Inscritos" value={stats.equipos.total} icon={Users} color="#72add9" />
        <StatCard title="Total Atletas" value={stats.jugadores.total} icon={Zap} color="#c55e60" />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="responsive-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
        {/* PROXIMOS PARTIDOS */}
        <div className="pro-card" style={{ marginBottom: 0 }}>
          <div className="pro-card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              <Activity size={24} color="var(--primary)" /> Próximos Encuentros
            </h2>
            <button className="pro-btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/admin/partidos')}>
              Calendario Completo <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {proximosPartidos.length > 0 ? (
              proximosPartidos.map((p) => (
                <div key={p.id} onClick={() => navigate(`/admin/partidos/${p.id}`)} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} className="glow-on-hover">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {p.fecha?.split('T')[0]} • {p.hora?.substring(0, 5)}</span>
                    <span style={{ color: 'var(--primary)' }}>{p.torneo?.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 800, color: '#fff' }}>{p.equipoLocal?.nombre || 'Local'}</div>
                    <div style={{ padding: '4px 12px', background: 'rgba(53, 110, 216, 0.1)', borderRadius: '20px', color: 'var(--primary)', fontWeight: 900, fontSize: '0.9rem' }}>VS</div>
                    <div style={{ flex: 1, textAlign: 'left', fontWeight: 800, color: '#fff' }}>{p.equipoVisitante?.nombre || 'Visita'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} /> {p.lugar || 'Cancha Central'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                <p>No hay partidos próximos programados</p>
                <button className="pro-btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/admin/partidos')}>
                  <Plus size={18} /> Programar Ahora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TORNEOS RECIENTES */}
        <div className="pro-card" style={{ marginBottom: 0 }}>
          <div className="pro-card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              <Trophy size={24} color="#f59e0b" /> Torneos Activos
            </h2>
            <button className="pro-btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/admin/torneos-deportes')}>
              Gestionar <ChevronRight size={16} />
            </button>
          </div>

          <div className="table-responsive-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Torneo</th>
                  <th className="hide-mobile">Estado</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {torneos.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#fff' }}>{t.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.deporte?.nombre}</div>
                    </td>
                    <td className="hide-mobile">
                      <span className={`status-pill ${t.estado === 'Activo' ? 'success' : ''}`}>
                        {t.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="icon-btn"
                        onClick={() => navigate(`/admin/torneos/${t.id}`)}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {torneos.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Sin torneos activos</td>
                  </tr>
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

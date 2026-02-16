// resources/js/pages/representante/DashboardRepresentante.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Trophy,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Clock,
  MapPin,
  ChevronRight,
  TrendingUp,
  Activity,
  History,
  ClipboardList,
  Plus,
  Star,
  Target,
  Award
} from "lucide-react";

import api from "../../api";

const formatDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* =========================
   UI Components
========================= */
const KPI = ({ title, value, desc, icon: Icon, color = "#3b82f6", gradient }) => (
  <div
    className="stat-card kpi-card"
    style={{
      background: `linear-gradient(135deg, ${gradient || color}15, ${gradient || color}05)`,
      border: `1px solid ${color}20`,
    }}
  >
    <div
      className="kpi-card-icon-bg"
      style={{
        background: `${color}10`,
      }}
    >
      <Icon size={32} color={`${color}40`} />
    </div>
    <div className="kpi-card-content">
      <div className="kpi-card-header">
        <div
          className="kpi-card-icon-wrapper"
          style={{
            background: color,
          }}
        >
          <Icon size={18} color="white" />
        </div>
        <div>
          <h3 className="kpi-card-title">{title}</h3>
          <div className="kpi-card-trend">
            <TrendingUp size={12} color="#10b981" />
            <span>Activo</span>
          </div>
        </div>
      </div>
      <div className="kpi-card-value-row">
        <span className="kpi-card-value">{value}</span>
        <div
          className="kpi-card-pulse"
          style={{
            background: color,
          }}
        ></div>
      </div>
      <p className="kpi-card-desc">{desc}</p>
    </div>
  </div>
);

const MatchRow = ({ match }) => (
  <div style={{
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '0.75rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <Clock size={14} color="#94a3b8" />
      <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
        {formatDate(match.fecha)} • {match.hora || '--:--'}
      </span>
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: match.estado === 'Finalizado' ? '#10b98120' : '#f59e0b20',
          color: match.estado === 'Finalizado' ? '#10b981' : '#f59e0b',
          border: `1px solid ${match.estado === 'Finalizado' ? '#10b981' : '#f59e0b'}40`
        }}>
          {match.estado}
        </span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
          {match.equipo_local?.nombre || 'Local'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1rem' }}>
        {match.estado === 'Finalizado' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{match.marcador_local}</span>
            <span style={{ color: '#94a3b8' }}>-</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{match.marcador_visitante}</span>
          </div>
        ) : (
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>VS</span>
        )}
      </div>
      <div style={{ flex: 1, textAlign: 'right' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
          {match.equipo_visitante?.nombre || 'Visitante'}
        </span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <MapPin size={12} color="#94a3b8" />
      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{match.ubicacion || 'Por definir'}</span>
    </div>
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */
const DashboardRepresentante = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [proximosPartidos, setProximosPartidos] = useState([]);
  const [resultadosRecientes, setResultadosRecientes] = useState([]);

  const [kpis, setKpis] = useState({
    equipos: 0,
    jugadores: 0,
    torneos: 0,
    partidos: 0,
  });

  const user = useMemo(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : {};
  }, []);

  /* =========================
     Seguridad básica
  ========================= */
  const ensureAuth = useCallback(() => {
    if (!localStorage.getItem("token")) {
      localStorage.clear();
      navigate("/login", { replace: true });
      return false;
    }
    return true;
  }, [navigate]);

  /* =========================
     Fetch principal
  ========================= */
  const fetchDashboard = useCallback(async () => {
    if (!ensureAuth()) return;

    setLoading(true);
    setError("");

    try {
      const [equiposRes, torneosRes, inscRes, partidosRes] = await Promise.all([
        api.get("/representante/equipos"),
        api.get("/torneos"),
        api.get("/representante/equipo/inscripciones"),
        api.get("/partidos"),
      ]);

      const equiposJson = equiposRes.data || [];
      const torneosJson = torneosRes.data || [];
      const inscJson = inscRes.data || [];
      const partidosJson = partidosRes.data || [];

      const allPartidos = Array.isArray(partidosJson) ? partidosJson : (partidosJson.data || []);

      // Filtrar partidos de mis equipos
      const misEquiposIds = (equiposJson || []).map(e => e.id);
      const misPartidos = allPartidos.filter(p =>
        misEquiposIds.includes(p.equipo_local_id) || misEquiposIds.includes(p.equipo_visitante_id)
      );

      setEquipos(equiposJson || []);
      setTorneos(torneosJson || []);
      setInscripciones(inscJson || []);

      // Separar partidos
      const fechaHoy = new Date();
      const proximos = misPartidos
        .filter(p => new Date(p.fecha) >= fechaHoy && p.estado !== 'Finalizado')
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .slice(0, 4);

      const recientes = misPartidos
        .filter(p => p.estado === 'Finalizado')
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 4);

      setProximosPartidos(proximos);
      setResultadosRecientes(recientes);

      setKpis({
        equipos: equiposJson.length || 0,
        jugadores: (equiposJson || []).reduce(
          (sum, e) => sum + (e.jugadores_count || 0),
          0
        ),
        torneos: (torneosJson || []).filter((t) => t.estado === "Activo").length,
        partidos: proximos.length,
      });
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el panel del representante.");
    } finally {
      setLoading(false);
    }
  }, [ensureAuth]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =========================
     Estados UI
  ========================= */
  if (loading) {
    return (
      <div className="rep-loading-container" style={{ flexDirection: 'column', gap: '1.5rem' }}>
        <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '80px', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={24} className="animate-spin" color="#3b82f6" />
          <p style={{ margin: 0, fontWeight: 600, color: '#94a3b8' }}>Sincronizando panel UEB Sport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rep-card error-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '70px', borderRadius: '10px', marginBottom: '2rem' }} />
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ color: '#fff' }}>Error de Conexión</h2>
        <p style={{ color: '#94a3b8' }}>{error}</p>
        <button className="btn-primary" onClick={fetchDashboard}>
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  /* =========================
     Render
  ========================= */
  return (
    <div className="dashboard-layout-main">
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header mejorado */}
        <header className="dashboard-header-main">
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '50%',
            opacity: 0.1
          }}></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Shield size={24} color="white" />
                  </div>
                  <div>
                    <small style={{ 
                      fontWeight: 700, 
                      letterSpacing: '0.5px', 
                      color: '#3b82f6',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem'
                    }}>
                      Universidad Estatal de Bolívar
                    </small>
                    <h1 style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: '#fff',
                      margin: '0.25rem 0',
                      background: 'linear-gradient(135deg, #fff, #cbd5e1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Bienvenido, {user.persona?.nombres || user.name || 'Representante'}
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>
                      Gestión integral de tus equipos y participación deportiva
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/representante/equipos")}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
                }}
              >
                <Plus size={18} /> Nuevo Equipo
              </button>
            </div>
          </div>
        </header>

        {/* KPIs Section mejorado */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <KPI 
              title="Mis Equipos" 
              value={kpis.equipos} 
              desc="Equipos registrados" 
              icon={Shield} 
              color="#3b82f6"
              gradient="#8b5cf6"
            />
            <KPI 
              title="Jugadores" 
              value={kpis.jugadores} 
              desc="Nómina total activa" 
              icon={Users} 
              color="#10b981"
              gradient="#059669"
            />
            <KPI 
              title="Torneos" 
              value={kpis.torneos} 
              desc="Competencias activas" 
              icon={Trophy} 
              color="#f59e0b"
              gradient="#d97706"
            />
            <KPI 
              title="Próximos" 
              value={kpis.partidos} 
              desc="Partidos pendientes" 
              icon={Calendar} 
              color="#8b5cf6"
              gradient="#7c3aed"
            />
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Matches & Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Próximos Partidos */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#fff',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <Clock size={24} color="#3b82f6" /> Próximos Partidos
                </h2>
                <button
                  onClick={() => navigate("/representante/partidos")}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    color: '#3b82f6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                >
                  Ver todos <ChevronRight size={14} />
                </button>
              </div>
              <div>
                {proximosPartidos.length > 0 ? (
                  proximosPartidos.map(p => <MatchRow key={p.id} match={p} />)
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: '#94a3b8'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem'
                    }}>
                      <Calendar size={40} color="#3b82f6" />
                    </div>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>No tienes partidos programados</p>
                    <button
                      onClick={() => navigate("/representante/calendario")}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}
                    >
                      Ver calendario completo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resultados Recientes */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#fff',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <History size={24} color="#10b981" /> Resultados Recientes
                </h2>
                <button
                  onClick={() => navigate("/representante/partidos")}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    color: '#10b981',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  }}
                >
                  Ver histórico <ChevronRight size={14} />
                </button>
              </div>
              <div>
                {resultadosRecientes.length > 0 ? (
                  resultadosRecientes.map(p => <MatchRow key={p.id} match={p} />)
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: '#94a3b8'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem'
                    }}>
                      <History size={40} color="#10b981" />
                    </div>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Aún no se han registrado resultados</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Statistics & Quick Access */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Rendimiento General */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#fff',
                margin: '0 0 1.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <TrendingUp size={24} color="#f59e0b" /> Rendimiento General
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                    {equipos.filter(e => e.activo).length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Equipos Activos</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>
                    {resultadosRecientes.length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Partidos Jugados</div>
                </div>
              </div>
            </div>

            {/* Inscripciones */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#fff',
                margin: '0 0 1.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <ClipboardList size={24} color="#8b5cf6" /> Inscripciones
              </h2>
              {inscripciones.length > 0 ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  {inscripciones.slice(0, 3).map(i => (
                    <div key={i.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '12px',
                      marginBottom: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                          {i.torneo?.nombre || 'Torneo'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                          {i.equipo?.nombre}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: i.estado === 'Aprobada' ? '#10b98120' : i.estado === 'Pendiente' ? '#f59e0b20' : '#ef444420',
                        color: i.estado === 'Aprobada' ? '#10b981' : i.estado === 'Pendiente' ? '#f59e0b' : '#ef4444',
                        border: `1px solid ${i.estado === 'Aprobada' ? '#10b981' : i.estado === 'Pendiente' ? '#f59e0b' : '#ef4444'}40`
                      }}>
                        {i.estado}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>Sin inscripciones activas</p>
              )}
              <button
                onClick={() => navigate("/representante/inscripciones")}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Gestionar Inscripciones
              </button>
            </div>

            {/* Acciones Rápidas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem'
            }}>
              <button
                onClick={() => navigate("/representante/jugadores")}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: '#10b981',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                  e.currentTarget.style.borderColor = '#10b981';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                }}
              >
                <Users size={20} /> Gestión de Jugadores
              </button>
              <button
                onClick={() => navigate("/representante/calendario")}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: '#3b82f6',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
              >
                <Calendar size={20} /> Calendario Oficial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRepresentante;
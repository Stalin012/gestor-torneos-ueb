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
  Plus
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
const KPI = ({ title, value, desc, icon: Icon, color = "var(--blue-main)" }) => (
  <div className="stat-card kpi-info">
    <div className="stat-card-header">
      <div className="icon-badge" style={{ background: `${color}15`, color: color }}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div className="kpi-trend">
        <TrendingUp size={14} />
        <span>Activo</span>
      </div>
    </div>
    <div className="kpi-content">
      <h3 className="kpi-title">{title}</h3>
      <div className="kpi-main-row">
        <p className="stat-value">{value}</p>
        <div className="kpi-pulse" style={{ background: color }}></div>
      </div>
      <p className="stat-desc">{desc}</p>
    </div>
    <div className="card-decoration" style={{ background: color }}></div>
  </div>
);

const MatchRow = ({ match }) => (
  <div className="match-item-compact">
    <div className="match-time">
      <Clock size={14} />
      <span>{formatDate(match.fecha)} • {match.hora || '--:--'}</span>
    </div>
    <div className="match-teams-display">
      <div className="team-small">
        <span className="team-name">{match.equipo_local?.nombre || 'Local'}</span>
      </div>
      <div className="match-score-vs">
        {match.estado === 'Finalizado' ? (
          <span className="score">{match.marcador_local} - {match.marcador_visitante}</span>
        ) : (
          <span className="vs">VS</span>
        )}
      </div>
      <div className="team-small" style={{ textAlign: 'right' }}>
        <span className="team-name">{match.equipo_visitante?.nombre || 'Visitante'}</span>
      </div>
    </div>
    <div className="match-footer">
      <span className="match-location"><MapPin size={12} /> {match.ubicacion || 'Por definir'}</span>
      <span className={`match-badge ${match.estado === 'Finalizado' ? 'finished' : 'pending'}`}>
        {match.estado}
      </span>
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
    <div className="rep-scope rep-screen-container rep-dashboard-fade">
      <header className="rep-header-main">
        <div className="header-info">
          <small className="university-label">Universidad Estatal de Bolívar</small>
          <h1 className="content-title">Bienvenido, {user.persona?.nombres || user.name || 'Representante'}</h1>
          <p className="content-subtitle">Gestión integral de tus equipos y participación deportiva</p>
        </div>
        <div className="header-actions">
          <button className="btn-quick-action" onClick={() => navigate("/representante/equipos")}>
            <Plus size={18} /> Nuevo Equipo
          </button>
        </div>
      </header>

      {/* KPIs Section */}
      <section className="dashboard-section">
        <div className="stats-grid-kpi">
          <KPI title="Mis Equipos" value={kpis.equipos} desc="Registrados" icon={Shield} color="#3b82f6" />
          <KPI title="Jugadores" value={kpis.jugadores} desc="Nómina total" icon={Users} color="#10b981" />
          <KPI title="Torneos" value={kpis.torneos} desc="Activos" icon={Trophy} color="#f59e0b" />
          <KPI title="Próximos" value={kpis.partidos} desc="Partidos pendientes" icon={Calendar} color="#8b5cf6" />
        </div>
      </section>

      <div className="dashboard-main-layout">
        {/* Left Column: Matches & Activity */}
        <div className="dashboard-col-left">
          <div className="rep-card-premium">
            <div className="card-header-flex">
              <h2 className="section-title"><Clock size={20} color="#3b82f6" /> Próximos Partidos</h2>
              <button className="btn-view-all" onClick={() => navigate("/representante/partidos")}>Ver todos <ChevronRight size={14} /></button>
            </div>
            <div className="matches-container">
              {proximosPartidos.length > 0 ? (
                proximosPartidos.map(p => <MatchRow key={p.id} match={p} />)
              ) : (
                <div className="empty-state-info">
                  <div className="empty-icon-wrapper">
                    <Calendar size={40} strokeWidth={1.5} />
                  </div>
                  <p>No tienes partidos programados próximamente.</p>
                  <button className="btn-text-action" onClick={() => navigate("/representante/calendario")}>
                    Ver calendario completo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rep-card-premium mt-4">
            <div className="card-header-flex">
              <h2 className="section-title"><History size={20} color="#10b981" /> Resultados Recientes</h2>
              <button className="btn-view-all" onClick={() => navigate("/representante/partidos")}>Ver histórico <ChevronRight size={14} /></button>
            </div>
            <div className="matches-container">
              {resultadosRecientes.length > 0 ? (
                resultadosRecientes.map(p => <MatchRow key={p.id} match={p} />)
              ) : (
                <div className="empty-state-info">
                  <div className="empty-icon-wrapper">
                    <History size={40} strokeWidth={1.5} />
                  </div>
                  <p>Aún no se han registrado resultados de tus equipos.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Statistics & Quick Access */}
        <div className="dashboard-col-right">
          <div className="rep-card-premium accent-yellow">
            <h2 className="section-title"><TrendingUp size={20} /> Rendimiento General</h2>
            <div className="performance-stats">
              <div className="perf-item">
                <span className="perf-label">Jugadores por Equipo</span>
                <div className="perf-bar-bg">
                  <div className="perf-bar-fill" style={{
                    width: `${Math.min(100, Math.max(0, (kpis.equipos > 0 ? (kpis.jugadores / kpis.equipos / 20) * 100 : 0)))}%`,
                    background: '#f59e0b'
                  }}></div>
                </div>
                <span className="perf-val">{(kpis.equipos > 0 ? (kpis.jugadores / kpis.equipos) : 0).toFixed(1)}</span>
              </div>
              <div className="perf-item mt-3">
                <span className="perf-label">Inscripciones Pendientes</span>
                <div className="perf-bar-bg">
                  <div className="perf-bar-fill" style={{
                    width: `${Math.min(100, Math.max(0, (inscripciones.filter(i => i.estado === 'Pendiente').length / 5) * 100))}%`,
                    background: '#ef4444'
                  }}></div>
                </div>
                <span className="perf-val">{inscripciones.filter(i => i.estado === 'Pendiente').length}</span>
              </div>
            </div>
            <div className="simple-stats-list">
              <div className="stat-row">
                <span>Equipos Activos</span>
                <strong>{equipos.filter(e => e.activo).length}</strong>
              </div>
              <div className="stat-row">
                <span>Partidos Jugados</span>
                <strong>{resultadosRecientes.length}</strong>
              </div>
            </div>
          </div>

          <div className="rep-card-premium mt-4">
            <h2 className="section-title"><ClipboardList size={20} /> Inscripciones</h2>
            {inscripciones.length > 0 ? (
              <div className="insc-mini-list">
                {inscripciones.slice(0, 3).map(i => (
                  <div key={i.id} className="insc-item">
                    <div className="insc-info">
                      <strong>{i.torneo?.nombre || 'Torneo'}</strong>
                      <small>{i.equipo?.nombre}</small>
                    </div>
                    <span className={`status-pill ${i.estado?.toLowerCase()}`}>
                      {i.estado}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted small">Sin inscripciones activas</p>
            )}
            <button className="btn-block-action" onClick={() => navigate("/representante/inscripciones")}>
              Gestionar Inscripciones
            </button>
          </div>

          <div className="action-grid-mini mt-4">
            <button className="mini-action-btn" onClick={() => navigate("/representante/jugadores")}>
              <Users size={18} /> Gestión de Jugadores
            </button>
            <button className="mini-action-btn" onClick={() => navigate("/representante/calendario")}>
              <Calendar size={18} /> Calendario Oficial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRepresentante;

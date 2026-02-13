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

import "../../../css/representante_dashboard.css";


const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/* =========================
   Helpers
========================= */
const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${getToken()}`,
});

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
      <h3>{title}</h3>
      <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
        <Icon size={18} />
      </div>
    </div>
    <p className="stat-value">{value}</p>
    <p className="stat-desc">{desc}</p>
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
    if (!getToken()) {
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
        fetch(`${API_BASE}/representante/equipos`, { headers: authHeaders() }),
        fetch(`${API_BASE}/torneos`, { headers: authHeaders() }),
        fetch(`${API_BASE}/representante/equipo/inscripciones`, { headers: authHeaders() }),
        fetch(`${API_BASE}/partidos`, { headers: authHeaders() }),
      ]);

      const equiposJson = equiposRes.ok ? await equiposRes.json() : [];
      const torneosJson = torneosRes.ok ? await torneosRes.json() : [];
      const inscJson = inscRes.ok ? await inscRes.json() : [];
      const partidosJson = partidosRes.ok ? await partidosRes.json() : [];

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
      <div className="rep-loading-container">
        <RefreshCw size={40} className="animate-spin" />
        <p>Sincronizando panel UEB Sport...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rep-card error-card">
        <AlertTriangle size={48} color="#ef4444" />
        <h2>Error de Conexión</h2>
        <p>{error}</p>
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
    <div className="rep-dashboard-fade">
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
                <div className="empty-state-small">
                  <Calendar size={32} opacity={0.3} />
                  <p>No hay partidos programados</p>
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
                <div className="empty-state-small">
                  <Activity size={32} opacity={0.3} />
                  <p>Aún no hay resultados registrados</p>
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
                <span className="perf-label">Eficiencia</span>
                <div className="perf-bar-bg">
                  <div className="perf-bar-fill" style={{ width: '65%', background: '#f59e0b' }}></div>
                </div>
                <span className="perf-val">65%</span>
              </div>
            </div>
            <div className="simple-stats-list">
              <div className="stat-row">
                <span>Goles/Puntos Total</span>
                <strong>12</strong>
              </div>
              <div className="stat-row">
                <span>Puntos Ranking</span>
                <strong>1.240</strong>
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
            <button className="mini-action-btn" onClick={() => navigate("/representante/nomina")}>
              <Users size={18} /> Jugadores
            </button>
            <button className="mini-action-btn" onClick={() => navigate("/representante/calendario")}>
              <Calendar size={18} /> Calendario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRepresentante;

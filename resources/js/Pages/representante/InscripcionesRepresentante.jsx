// resources/js/pages/representante/InscripcionesRepresentante.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  RefreshCcw,
  Download,
  ClipboardList,
  Search,
  Plus,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Filter
} from "lucide-react";
import "../../../css/representante_dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function InscripcionesRepresentante() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);

  const [form, setForm] = useState({
    equipo_id: "",
    torneo_id: "",
  });

  const [filters, setFilters] = useState({
    equipo_id: "",
    status: "",
    q: ""
  });

  // ================= HELPERS =================
  const getToken = () => {
    const t = localStorage.getItem("token");
    if (!t) throw new Error("Sesión expirada.");
    return t;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const parseError = async (res) => {
    const t = await res.text();
    try {
      const j = JSON.parse(t);
      return j.message || j.error || "Error del servidor";
    } catch {
      return t;
    }
  };

  // ================= FETCH =================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [eqsRes, torRes, insRes] = await Promise.all([
        fetch(`${API_BASE}/representante/equipos`, { headers }),
        fetch(`${API_BASE}/torneos`, { headers }),
        fetch(`${API_BASE}/representante/equipo/inscripciones`, { headers }),
      ]);

      if (eqsRes.status === 401) logout();

      const eqs = eqsRes.ok ? await eqsRes.json() : [];
      const tor = torRes.ok ? await torRes.json() : [];
      const ins = insRes.ok ? await insRes.json() : [];

      setEquipos(eqs);
      setTorneos(tor.filter(t => t.estado === 'Activo' || t.inscripciones_abiertas));
      setInscripciones(ins);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ================= ACTIONS =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipo_id || !form.torneo_id) {
      setError("Por favor selecciona equipo y torneo.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const token = getToken();

      const res = await fetch(`${API_BASE}/representante/inscripcion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error(await parseError(res));

      setSuccess("Inscripción solicitada correctamente.");
      setForm({ equipo_id: "", torneo_id: "" });
      loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ================= FILTRO =================
  const filtered = useMemo(() => {
    return inscripciones.filter((i) => {
      const matchQ = !filters.q || [i.equipo?.nombre, i.torneo?.nombre].join(" ").toLowerCase().includes(filters.q.toLowerCase());
      const matchEq = !filters.equipo_id || String(i.equipo_id) === String(filters.equipo_id);
      const matchStatus = !filters.status || i.estado === filters.status;
      return matchQ && matchEq && matchStatus;
    });
  }, [inscripciones, filters]);

  if (loading) {
    return (
      <div className="rep-loading-container">
        <Loader2 className="animate-spin" size={48} />
        <p>Cargando inscripciones...</p>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="rep-scope rep-dashboard-fade">
      <header className="rep-header-main">
        <div className="header-info">
          <small className="university-label">Gestión de Torneos UEB</small>
          <h1 className="content-title">Inscripciones y Participación</h1>
          <p className="content-subtitle">Inscribe tus equipos y monitorea sus solicitudes</p>
        </div>
        <div className="header-actions">
          <button onClick={loadData} className="btn-outline">
            <RefreshCcw size={16} /> Actualizar
          </button>
        </div>
      </header>

      {error && (
        <div className="rep-card error-card" style={{ maxWidth: '100%', margin: '0 0 24px 0' }}>
          <AlertCircle size={24} color="#ef4444" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="rep-card" style={{ background: '#dcfce7', border: '1px solid #10b981', marginBottom: '24px' }}>
          <p style={{ color: '#065f46', fontWeight: 700 }}>{success}</p>
        </div>
      )}

      <div className="dashboard-main-layout">
        {/* Registration Form */}
        <div className="dashboard-col-left">
          <div className="rep-card-premium">
            <h2 className="section-title"><Trophy size={20} color="#f59e0b" /> Nueva Inscripción</h2>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="rep-label">Equipo</label>
                  <select
                    className="rep-input"
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    value={form.equipo_id}
                    onChange={e => setForm({ ...form, equipo_id: e.target.value })}
                  >
                    <option value="">Selecciona tu equipo</option>
                    {equipos.map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="rep-label">Torneo Disponible</label>
                  <select
                    className="rep-input"
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    value={form.torneo_id}
                    onChange={e => setForm({ ...form, torneo_id: e.target.value })}
                  >
                    <option value="">Selecciona el torneo</option>
                    {torneos.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre} ({t.deporte?.nombre})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-quick-action mt-4 w-full justify-center" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Inscribir Equipo
              </button>
            </form>
          </div>

          <div className="rep-card-premium mt-6">
            <div className="card-header-flex">
              <h2 className="section-title"><ClipboardList size={20} color="#3b82f6" /> Historial de Inscripciones</h2>
              <div className="search-box">
                <Search size={16} />
                <input
                  placeholder="Filtrar..."
                  value={filters.q}
                  onChange={e => setFilters({ ...filters, q: e.target.value })}
                />
              </div>
            </div>

            <div className="rep-table-container">
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>Torneo</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map(i => (
                      <tr key={i.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{i.equipo?.nombre?.[0]}</div>
                            <span>{i.equipo?.nombre}</span>
                          </div>
                        </td>
                        <td>{i.torneo?.nombre}</td>
                        <td>
                          <span className={`status-pill ${i.estado?.toLowerCase()}`}>
                            {i.estado}
                          </span>
                        </td>
                        <td>{formatDate(i.created_at)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn-icon-only"><ChevronRight size={16} /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 muted">No se encontraron inscripciones</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Filters/Stats side */}
        <div className="dashboard-col-right">
          <div className="rep-card-premium">
            <h2 className="section-title"><Filter size={18} /> Filtros Rápidos</h2>
            <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="rep-label">Filtro por Equipo</label>
                <select
                  className="rep-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  value={filters.equipo_id}
                  onChange={e => setFilters({ ...filters, equipo_id: e.target.value })}
                >
                  <option value="">Cualquiera</option>
                  {equipos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="rep-label">Estado</label>
                <select
                  className="rep-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setFilters({ equipo_id: "", status: "", q: "" })}
              className="btn-block-action mt-4"
            >
              Limpiar Filtros
            </button>
          </div>

          <div className="rep-card-premium mt-6" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white' }}>
            <h2 className="section-title" style={{ color: 'white' }}><CheckCircle2 size={20} /> Información</h2>
            <p className="small mt-2" style={{ opacity: 0.9 }}>
              Las inscripciones pasan por un proceso de validación por parte del administrador de deportes de la UEB.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><Clock size={12} /> Plazo: 48h hábiles</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><CheckCircle2 size={12} /> Nómina completa requerida</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

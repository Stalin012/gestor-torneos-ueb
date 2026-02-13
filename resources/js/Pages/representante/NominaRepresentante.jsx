// resources/js/pages/representante/NominaRepresentante.jsx

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Loader2,
  AlertCircle,
  Users,
  RefreshCcw,
  Download,
  Search,
  Plus,
  Trash2,
  X,
  CheckCircle,
  Upload,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react";
import "../../../css/representante_dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function NominaRepresentante() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [equipos, setEquipos] = useState([]);
  const [equipoId, setEquipoId] = useState("");

  const [data, setData] = useState({ total_equipos: 0, total_jugadores: 0, equipos: [] });
  const [q, setQ] = useState("");

  // ---- Modal Agregar ----
  const [showModal, setShowModal] = useState(false);
  const [savingJugador, setSavingJugador] = useState(false);
  const [formJugador, setFormJugador] = useState({ equipo_id: "", cedula: "", numero: "", posicion: "" });

  // ---- Importación ----
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const getTokenOrThrow = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Sesión expirada.");
    return token;
  };

  const logoutAndRedirect = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const parseErrorResponse = async (res) => {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return json?.message || json?.error || "Error del servidor";
    } catch {
      return text || `Error HTTP ${res.status}`;
    }
  };

  const clearAlerts = () => {
    setError("");
    setSuccess("");
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      clearAlerts();
      const token = getTokenOrThrow();
      const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };

      // Cargar equipos e info general
      const [eqsRes, nomRes] = await Promise.all([
        fetch(`${API_BASE}/representante/equipos`, { headers }),
        fetch(`${API_BASE}/representante/equipo/jugadores/nomina${equipoId ? `?equipo_id=${equipoId}` : ""}`, { headers }),
      ]);

      if (eqsRes.status === 401) logoutAndRedirect();

      const eqs = eqsRes.ok ? await eqsRes.json() : [];
      const nom = nomRes.ok ? await nomRes.json() : { total_equipos: 0, total_jugadores: 0, equipos: [] };

      setEquipos(Array.isArray(eqs) ? eqs : []);
      setData(nom);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const flatRows = useMemo(() => {
    const rows = [];
    for (const eq of data?.equipos || []) {
      const jugadores = eq?.jugadores || [];
      for (const j of jugadores) {
        const p = j?.persona || {};
        rows.push({
          equipo_id: eq.id,
          equipo: eq.nombre,
          torneo: eq?.torneo?.nombre || "—",
          cedula: j.cedula,
          nombres: p.nombres || "",
          apellidos: p.apellidos || "",
          completo: `${p.nombres || ""} ${p.apellidos || ""}`.trim(),
          numero: j.numero ?? "—",
          posicion: j.posicion || "—",
        });
      }
    }
    return rows;
  }, [data]);

  const filteredRows = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return flatRows;
    return flatRows.filter(r =>
      r.equipo.toLowerCase().includes(term) ||
      r.completo.toLowerCase().includes(term) ||
      r.cedula.includes(term)
    );
  }, [flatRows, q]);

  const handleAddJugador = async (e) => {
    e.preventDefault();
    try {
      setSavingJugador(true);
      clearAlerts();
      const token = getTokenOrThrow();

      const res = await fetch(`${API_BASE}/representante/equipo/jugadores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formJugador,
          equipo_id: Number(formJugador.equipo_id)
        }),
      });

      if (!res.ok) throw new Error(await parseErrorResponse(res));

      setShowModal(false);
      setSuccess("Jugador agregado correctamente.");
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingJugador(false);
    }
  };

  const handleRemoveJugador = async (cedula) => {
    if (!window.confirm("¿Quitar este jugador de la nómina?")) return;
    try {
      clearAlerts();
      const token = getTokenOrThrow();
      const res = await fetch(`${API_BASE}/representante/equipo/jugadores/${cedula}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseErrorResponse(res));
      setSuccess("Jugador removido.");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImportFile = async (file) => {
    if (!file || !equipoId) {
      setError("Selecciona un equipo antes de importar.");
      return;
    }

    try {
      setImporting(true);
      clearAlerts();
      const token = getTokenOrThrow();
      const form = new FormData();
      form.append("equipo_id", equipoId);
      form.append("file", file);

      const res = await fetch(`${API_BASE}/representante/equipo/jugadores/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error(await parseErrorResponse(res));
      const json = await res.json();
      setImportResult(json);
      setSuccess(`Importación exitosa: ${json.inserted || 0} nuevos.`);
      fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="rep-loading-container">
        <Loader2 className="animate-spin" size={48} />
        <p>Sincronizando nómina...</p>
      </div>
    );
  }

  return (
    <div className="rep-scope rep-dashboard-fade">
      <header className="rep-header-main">
        <div className="header-info">
          <small className="university-label">Gestión de Talento UEB</small>
          <h1 className="content-title">Nómina de Jugadores</h1>
          <p className="content-subtitle">Administra los integrantes de tus equipos deportivos</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowModal(true)} className="btn-quick-action">
            <Plus size={18} /> Agregar Jugador
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="stats-grid-kpi mb-6">
        <div className="stat-card kpi-info">
          <div className="stat-card-header">
            <h3>Total Jugadores</h3>
            <Users size={18} />
          </div>
          <p className="stat-value">{data.total_jugadores}</p>
          <p className="stat-desc">En {data.total_equipos} equipos</p>
          <div className="card-decoration" style={{ background: '#3b82f6' }}></div>
        </div>
        <div className="stat-card kpi-info">
          <div className="stat-card-header">
            <h3>Promedio x Equipo</h3>
            <TrendingUp size={18} />
          </div>
          <p className="stat-value">{data.total_equipos > 0 ? (data.total_jugadores / data.total_equipos).toFixed(1) : 0}</p>
          <p className="stat-desc">Jugadores por plantilla</p>
          <div className="card-decoration" style={{ background: '#10b981' }}></div>
        </div>
      </div>

      <div className="dashboard-main-layout">
        <div className="dashboard-col-left">
          <div className="rep-card-premium">
            <div className="card-header-flex">
              <h2 className="section-title"><Users size={20} color="#3b82f6" /> Integrantes</h2>
              <div className="search-box">
                <Search size={16} />
                <input
                  placeholder="Buscar jugador o equipo..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>
            </div>

            <div className="rep-table-container">
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th>Cédula</th>
                    <th>Dorsal</th>
                    <th>Posición</th>
                    <th>Equipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length > 0 ? (
                    filteredRows.map((r, i) => (
                      <tr key={i}>
                        <td>
                          <div className="flex-item-cell">
                            <div className="mini-avatar" style={{ background: '#eff6ff', color: '#3b82f6' }}>{r.nombres[0]}</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="font-bold">{r.completo}</span>
                              <small className="muted">{r.torneo}</small>
                            </div>
                          </div>
                        </td>
                        <td>{r.cedula}</td>
                        <td><span className="badge-dorsal">{r.numero}</span></td>
                        <td>{r.posicion}</td>
                        <td><span className="badge-team-small">{r.equipo}</span></td>
                        <td className="text-right">
                          <button onClick={() => handleRemoveJugador(r.cedula)} className="btn-icon-danger" title="Quitar de nómina">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-10 muted">No hay jugadores en la nómina</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-col-right">
          <div className="rep-card-premium">
            <h2 className="section-title"><RefreshCcw size={18} /> Herramientas</h2>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="rep-label">Filtro por Equipo</label>
                <select
                  className="rep-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  value={equipoId}
                  onChange={e => setEquipoId(e.target.value)}
                >
                  <option value="">Todos los equipos</option>
                  {equipos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="import-zone mt-6">
                <h3 className="small-title mb-2">Carga Masiva</h3>
                <p className="muted x-small mb-3">Sube un archivo CSV con la nómina para el equipo seleccionado.</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={e => handleImportFile(e.target.files[0])}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={!equipoId || importing}
                  className="btn-block-action mb-2"
                >
                  {importing ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  Importar CSV
                </button>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // download template logic or link
                    alert("Descargando plantilla CSV...");
                  }}
                  className="text-link x-small"
                >
                  Descargar Plantilla
                </a>
              </div>
            </div>
          </div>

          <div className="rep-card-premium mt-6" style={{ background: '#f8fafc' }}>
            <h2 className="section-title"><AlertCircle size={18} /> Requisitos</h2>
            <ul className="simple-list mt-3">
              <li>Copias de cédula legibles</li>
              <li>Fotos en fondo blanco</li>
              <li>Certificado de matrícula</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Agregar */}
      {showModal && (
        <div className="modal-overlay backdrop-blur-sm">
          <div className="modal-content scale-in" style={{ maxWidth: '450px' }}>
            <div className="modal-header-premium">
              <h2><Plus size={20} /> Nuevo Jugador</h2>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAddJugador} className="p-6 space-y-4">
              <div className="form-group">
                <label className="rep-label">Equipo de Destino</label>
                <select
                  required
                  className="rep-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  value={formJugador.equipo_id}
                  onChange={e => setFormJugador({ ...formJugador, equipo_id: e.target.value })}
                >
                  <option value="">Selecciona...</option>
                  {equipos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="rep-label">Cédula del Jugador</label>
                <input
                  required
                  placeholder="Ej: 020XXXXXXX"
                  className="rep-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  value={formJugador.cedula}
                  onChange={e => setFormJugador({ ...formJugador, cedula: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="rep-label">Dorsal</label>
                  <input
                    placeholder="Num"
                    className="rep-input"
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    value={formJugador.numero}
                    onChange={e => setFormJugador({ ...formJugador, numero: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="rep-label">Posición</label>
                  <input
                    placeholder="Ej: Portero"
                    className="rep-input"
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    value={formJugador.posicion}
                    onChange={e => setFormJugador({ ...formJugador, posicion: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" disabled={savingJugador}>
                  {savingJugador ? <Loader2 className="animate-spin" size={16} /> : "Agregar Jugador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

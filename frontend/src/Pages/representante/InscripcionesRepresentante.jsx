import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  RefreshCcw,
  ClipboardList,
  Search,
  Plus,
  Trophy,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Shield,
  Calendar
} from "lucide-react";
import api from "../../api";
import "../../css/unified-all.css";

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

  // ================= FETCH =================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [eqsRes, torRes, insRes] = await Promise.all([
        api.get('/representante/equipos'),
        api.get('/torneos'),
        api.get('/representante/equipo/inscripciones'),
      ]);

      const normalize = (d) => Array.isArray(d) ? d : (d.data || []);

      setEquipos(normalize(eqsRes.data));

      const allTorneos = normalize(torRes.data);
      // Filter tournaments that are active or open for registration
      setTorneos(allTorneos.filter(t => t.estado === 'Activo' || t.inscripciones_abiertas));

      setInscripciones(normalize(insRes.data));
    } catch (e) {
      console.error(e);
      setError("Error al cargar los datos. Verifique su conexión.");
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
      setSuccess("");

      await api.post('/representante/inscripcion', form);

      setSuccess("Inscripción solicitada correctamente. Pendiente de aprobación.");
      setForm({ equipo_id: "", torneo_id: "" });
      loadData();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "No se pudo procesar la inscripción.");
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

  // --- STYLES FOR DARK THEME COMPATIBILITY ---
  const glassCardStyle = {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    color: '#f8fafc'
  };

  const inputStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '8px',
    boxSizing: 'border-box'
  };

  if (loading) {
    return (
      <div className="rep-scope rep-screen-container rep-loading-container" style={{ flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCcw size={24} className="animate-spin" color="var(--primary-ocean)" />
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-muted)' }}>Cargando inscripciones...</p>
        </div>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="rep-scope rep-screen-container rep-dashboard-fade">
      <header className="rep-header-main" style={{ marginBottom: '2.5rem' }}>
        <div className="header-info">
        </div>
        <div className="header-actions">
          <button onClick={loadData} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            <RefreshCcw size={18} /> Actualizar
          </button>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#86efac', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
          <CheckCircle2 size={20} /> {success}
        </div>
      )}

      <div className="dashboard-main-layout" style={{ gap: '2.5rem', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)' }}>

        {/* LEFT COLUMN: FORM & TABLE */}
        <div className="dashboard-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Registration Form */}
          <div className="rep-card-premium" style={{ ...glassCardStyle, borderTop: '5px solid var(--accent-orange)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Trophy size={24} color="var(--accent-orange)" /> Nueva Inscripción
            </h2>

            <form onSubmit={handleSubmit} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '700' }}>Equipo Representativo</label>
                  <div style={{ position: 'relative' }}>
                    <Shield size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                    <select
                      className="pro-input"
                      style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
                      value={form.equipo_id}
                      onChange={e => setForm({ ...form, equipo_id: e.target.value })}
                    >
                      <option value="" style={{ color: '#333' }}>Selecciona tu equipo</option>
                      {equipos.map(eq => (
                        <option key={eq.id} value={eq.id} style={{ color: '#333' }}>{eq.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '700' }}>Torneo de Destino</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                    <select
                      className="pro-input"
                      style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
                      value={form.torneo_id}
                      onChange={e => setForm({ ...form, torneo_id: e.target.value })}
                    >
                      <option value="" style={{ color: '#333' }}>Selecciona el torneo</option>
                      {torneos.map(t => (
                        <option key={t.id} value={t.id} style={{ color: '#333' }}>{t.nombre} ({t.deporte?.nombre})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontWeight: '700', fontSize: '1rem' }} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                Confirmar Solicitud
              </button>
            </form>
          </div>

          {/* History Table */}
          <div className="rep-card-premium" style={{ ...glassCardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ClipboardList size={20} color="#60a5fa" /> Historial de Inscripciones
              </h2>
              <div className="search-box" style={{ ...inputStyle, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={16} color="#94a3b8" />
                <input
                  placeholder="Buscar..."
                  style={{ background: 'transparent', border: 'none', color: '#fff', width: '150px', outline: 'none', fontSize: '0.9rem' }}
                  value={filters.q}
                  onChange={e => setFilters({ ...filters, q: e.target.value })}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="rep-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(0,0,0,0.2)', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700' }}>Equipo</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700' }}>Torneo</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700' }}>Estado</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700' }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map(i => (
                      <tr key={i.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(53, 110, 216, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                              {i.equipo?.nombre?.[0]}
                            </div>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{i.equipo?.nombre}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: '500' }}>{i.torneo?.nombre}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span className="badge-pill" style={{
                            background: i.estado === 'Aprobada' ? 'rgba(34, 197, 94, 0.2)' : i.estado === 'Rechazada' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: i.estado === 'Aprobada' ? '#86efac' : i.estado === 'Rechazada' ? '#fca5a5' : '#93c5fd',
                            padding: '0.35rem 0.85rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            border: '1px solid currentColor'
                          }}>
                            {i.estado}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>{formatDate(i.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <ClipboardList size={48} style={{ opacity: 0.1, color: '#fff', margin: '0 auto 1rem' }} />
                        <p>No se encontraron inscripciones.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FILTERS & INFO */}
        <div className="dashboard-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="rep-card-premium" style={{ ...glassCardStyle, padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Filter size={20} color="#60a5fa" /> Filtros Rápidos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>Por Equipo</label>
                <select
                  className="pro-input"
                  style={{ ...inputStyle, width: '100%' }}
                  value={filters.equipo_id}
                  onChange={e => setFilters({ ...filters, equipo_id: e.target.value })}
                >
                  <option value="" style={{ color: '#333' }}>Cualquiera</option>
                  {equipos.map(eq => (
                    <option key={eq.id} value={eq.id} style={{ color: '#333' }}>{eq.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>Estado</label>
                <select
                  className="pro-input"
                  style={{ ...inputStyle, width: '100%' }}
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="" style={{ color: '#333' }}>Todos</option>
                  <option value="Pendiente" style={{ color: '#333' }}>Pendiente</option>
                  <option value="Aprobada" style={{ color: '#333' }}>Aprobada</option>
                  <option value="Rechazada" style={{ color: '#333' }}>Rechazada</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setFilters({ equipo_id: "", status: "", q: "" })}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Reiniciar Filtros
            </button>
          </div>

          <div className="rep-card-premium" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={22} color="#10B981" /> Proceso de Validación
            </h2>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              Las inscripciones son evaluadas por la Dirección de Deportes UEB para asegurar el cumplimiento del reglamento.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', color: '#fff' }}>
                <Clock size={16} color="#94a3b8" /> <span>Plazo: 48h hábiles</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', color: '#fff' }}>
                <ClipboardList size={16} color="#94a3b8" /> <span>Nómina completa requerida</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

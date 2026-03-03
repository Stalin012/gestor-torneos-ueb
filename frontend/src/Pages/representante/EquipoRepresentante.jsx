import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Shield,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle,
  RefreshCcw,
  Trash2,
  Trophy,
  Search,
  Dumbbell,
  Target,
  Edit
} from "lucide-react";
import { apiFetch } from "../../services/api";
import "../../css/unified-all.css";

const EquipoRepresentante = () => {
  const navigate = useNavigate();

  const [equipos, setEquipos] = useState([]);
  const [catalogos, setCatalogos] = useState({
    torneos: [],
    deportes: [],
    categorias: [],
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [q, setQ] = useState("");
  const formRef = useRef(null);

  const [form, setForm] = useState({
    nombre: "",
    torneo_id: "",
    deporte_id: "",
    categoria_id: "",
  });

  const normalize = (d) => Array.isArray(d) ? d : (d?.data || []);

  const getApiErrorMessage = (err, fallback) => {
    const status = err?.response?.status;
    const apiMessage = err?.response?.data?.message;
    const apiErrors = err?.response?.data?.errors;

    if (status === 401) return "Sesion expirada. Inicia sesion nuevamente.";
    if (status === 403) return apiMessage || "No tienes permisos para acceder a equipos del representante.";
    if (apiMessage) return apiMessage;
    if (apiErrors && typeof apiErrors === "object") {
      const first = Object.values(apiErrors).flat()[0];
      if (first) return String(first);
    }
    if (err?.message === "Network Error") return "No se pudo conectar con el servidor API.";
    return fallback;
  };

  // ---- Fetch Data ----
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [resEq, resTor, resDep, resCat] = await Promise.allSettled([
        apiFetch('/representante/equipos'),
        apiFetch('/torneos'),
        apiFetch('/deportes'),
        apiFetch('/categorias'),
      ]);

      if (resEq.status === 'rejected') {
        throw resEq.reason;
      }

      setEquipos(normalize(resEq.value));
      const torneosCrudos = resTor.status === 'fulfilled' ? normalize(resTor.value) : [];
      const torneosDisponibles = torneosCrudos.filter(t => t.estado === 'Programado' || t.estado === 'Activo');

      setCatalogos({
        torneos: torneosDisponibles,
        deportes: resDep.status === 'fulfilled' ? normalize(resDep.value) : [],
        categorias: resCat.status === 'fulfilled' ? normalize(resCat.value) : [],
      });

    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Error al cargar los datos. Por favor revise su conexión."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Handlers ----
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        nombre: form.nombre.trim(),
        torneo_id: Number(form.torneo_id),
        deporte_id: Number(form.deporte_id),
        categoria_id: Number(form.categoria_id),
      };

      if (!payload.nombre || !payload.torneo_id || !payload.deporte_id || !payload.categoria_id) {
        throw new Error("Todos los campos son obligatorios.");
      }

      const data = await apiFetch('/representante/equipos', { method: 'POST', body: JSON.stringify(payload) });

      setEquipos(prev => [data, ...prev]);
      setForm({ nombre: "", torneo_id: "", deporte_id: "", categoria_id: "" });
      setSuccess("Equipo creado exitosamente.");
    } catch (err) {
      console.error(err);
      if (err.message === "Todos los campos son obligatorios.") {
        setError(err.message);
      } else {
        setError("Error al crear el equipo. Verifique los datos o intente nuevamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Seguro que deseas eliminar este equipo? Se perderan sus estadisticas.")) return;
    try {
      await apiFetch(`/representante/equipos/${id}`, { method: 'DELETE' });
      setEquipos(prev => prev.filter(e => e.id !== id));
      setSuccess("Equipo eliminado.");
    } catch (err) {
      setError("No se pudo eliminar el equipo.");
    }
  };

  // ---- Derived State ----
  const categoriasFiltradas = useMemo(() => {
    if (!form.deporte_id) return [];
    return catalogos.categorias.filter(c => String(c.deporte_id) === String(form.deporte_id));
  }, [catalogos.categorias, form.deporte_id]);

  const visibleEquipos = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return equipos;
    return equipos.filter(e =>
      e.nombre.toLowerCase().includes(term) ||
      e.torneo?.nombre?.toLowerCase().includes(term) ||
      e.deporte?.nombre?.toLowerCase().includes(term)
    );
  }, [equipos, q]);

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

  const colors = {
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    panelBg: 'rgba(15, 23, 42, 0.75)',
    activeBg: 'rgba(16, 185, 129, 0.18)',
    activeText: '#6ee7b7',
    pendingBg: 'rgba(245, 158, 11, 0.18)',
    pendingText: '#fcd34d'
  };

  const selectStyle = {
    ...inputStyle,
    width: '100%',
    paddingLeft: '2.5rem',
    color: colors.textPrimary,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    appearance: 'none'
  };

  const optionStyle = {
    color: '#f8fafc',
    backgroundColor: '#0f172a'
  };

  if (loading) {
    return (
      <div className="rep-scope rep-screen-container rep-loading-container" style={{ flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCcw size={24} className="animate-spin" color="var(--primary-ocean)" />
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-muted)' }}>Cargando equipos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rep-scope rep-screen-container rep-dashboard-fade">
      <style>
        {`
          @media (max-width: 991px) {
            .equipos-layout {
              grid-template-columns: 1fr !important;
            }
            .equipos-sidebar {
              position: static !important;
              width: 100% !important;
              margin-bottom: 2rem;
            }
          }
          
          .team-card-premium {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .team-card-premium:hover {
            transform: translateY(-8px);
            border-color: rgba(96, 165, 250, 0.4) !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
          }
          
          .form-input-focus:focus {
            border-color: var(--primary-ocean) !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          }

          .search-box-focus:focus-within {
            border-color: var(--primary-ocean) !important;
            background: rgba(0,0,0,0.3) !important;
          }
        `}
      </style>

      {/* HEADER SECTION */}
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-ocean), var(--accent-teal))', display: 'flex' }}>
              <Shield size={28} color="#fff" />
            </div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              Gestión de Equipos
            </h1>
          </div>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: '1.1rem' }}>
            Administra tus clubes, nóminas e inscripciones en torneos activos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-ocean)' }}>{equipos.length}</span>
            <span style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Equipos Registrados</span>
          </div>
        </div>
      </header>

      <div className="equipos-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 380px) 1fr', gap: '2.5rem', alignItems: 'start' }}>

        {/* SIDEBAR FORM */}
        <aside className="equipos-sidebar rep-card-premium" style={{ borderTop: '5px solid var(--primary-ocean)', ...glassCardStyle, padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: '1.4rem', fontWeight: 800 }}>Registrar Equipo</h3>
            <p style={{ margin: '0.5rem 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>Crea un club y asígnalo a una competencia</p>
          </div>

          {(catalogos.torneos.length === 0 || catalogos.deportes.length === 0) && (
            <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#fff' }}>Registro deshabilitado</strong>
                <span style={{ opacity: 0.9, lineHeight: '1.5' }}>
                  No tienes torneos o deportes disponibles para registrar equipos. Contacta al administrador para habilitar inscripciones.
                </span>
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="nombre-club" className="form-label" style={{ color: '#cbd5e1', fontWeight: '800', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                <Shield size={14} /> Nombre del Club
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="nombre-club"
                  name="nombre"
                  className="pro-input form-input-focus"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Leones F.C."
                  style={{
                    ...inputStyle,
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    borderColor: (!form.nombre.trim() && isSaving) ? '#ef4444' : 'rgba(255,255,255,0.1)'
                  }}
                  required
                />
                {(!form.nombre.trim() && isSaving) && <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Este campo es obligatorio</small>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="torneo-destino" className="form-label" style={{ color: '#cbd5e1', fontWeight: '800', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                <Trophy size={14} /> Torneo Destino
              </label>
              <select
                id="torneo-destino"
                name="torneo_id"
                className="pro-input form-input-focus"
                value={form.torneo_id}
                onChange={e => setForm({ ...form, torneo_id: e.target.value })}
                style={{
                  ...selectStyle,
                  paddingLeft: '1rem',
                  height: '48px',
                  borderColor: (!form.torneo_id && isSaving) ? '#ef4444' : 'rgba(255,255,255,0.1)'
                }}
                disabled={catalogos.torneos.length === 0}
                required
              >
                <option value="" style={optionStyle}>
                  {catalogos.torneos.length === 0 ? "No hay torneos disponibles" : "Selecciona el torneo..."}
                </option>
                {catalogos.torneos.map(t => <option key={t.id} value={t.id} style={optionStyle}>{t.nombre}</option>)}
              </select>
              {(!form.torneo_id && isSaving) && <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Selecciona un torneo</small>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="deporte-select" className="form-label" style={{ color: '#cbd5e1', fontWeight: '800', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <Dumbbell size={14} /> Deporte
                </label>
                <select
                  id="deporte-select"
                  name="deporte_id"
                  className="pro-input form-input-focus"
                  value={form.deporte_id}
                  onChange={e => setForm({ ...form, deporte_id: e.target.value, categoria_id: "" })}
                  style={{
                    ...selectStyle,
                    paddingLeft: '1rem',
                    height: '48px',
                    borderColor: (!form.deporte_id && isSaving) ? '#ef4444' : 'rgba(255,255,255,0.1)'
                  }}
                  disabled={catalogos.deportes.length === 0}
                  required
                >
                  <option value="" style={optionStyle}>
                    Selecciona...
                  </option>
                  {catalogos.deportes.map(d => <option key={d.id} value={d.id} style={optionStyle}>{d.nombre}</option>)}
                </select>
                {(!form.deporte_id && isSaving) && <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Obligatorio</small>}
              </div>
              <div className="form-group">
                <label htmlFor="categoria-select" className="form-label" style={{ color: '#cbd5e1', fontWeight: '800', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <Target size={14} /> Categoría
                </label>
                <select
                  id="categoria-select"
                  name="categoria_id"
                  className="pro-input form-input-focus"
                  value={form.categoria_id}
                  onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                  style={{
                    ...selectStyle,
                    paddingLeft: '1rem',
                    height: '48px',
                    borderColor: (!form.categoria_id && isSaving) ? '#ef4444' : 'rgba(255,255,255,0.1)'
                  }}
                  disabled={!form.deporte_id || categoriasFiltradas.length === 0}
                  required
                >
                  <option value="" style={optionStyle}>
                    Selecciona...
                  </option>
                  {categoriasFiltradas.map(c => <option key={c.id} value={c.id} style={optionStyle}>{c.nombre}</option>)}
                </select>
                {(!form.categoria_id && isSaving && form.deporte_id) && <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Obligatorio</small>}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isSaving || catalogos.torneos.length === 0} style={{ padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 800, marginTop: '1rem' }}>
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Crear Equipo Profesional</>}
            </button>

            {error && (
              <div className="fade-in" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}
            {success && (
              <div className="fade-in" style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', color: '#86efac', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={18} /> {success}
              </div>
            )}
          </form>
        </aside>

        {/* MAIN LIST */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {(equipos.length > 0 || q) && (
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-box search-box-focus" style={{ flex: 1, ...inputStyle, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px', height: '54px' }}>
                <Search size={22} color="#94a3b8" />
                <input
                  id="buscar-equipo"
                  name="q"
                  placeholder="Buscar por equipo, torneo o disciplina..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', color: '#fff', fontSize: '1rem', fontWeight: 500 }}
                />
              </div>
              <button className="btn-secondary" onClick={fetchData} title="Refrescar datos" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', width: '54px', height: '54px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <RefreshCcw size={22} />
              </button>
            </div>
          )}

          {visibleEquipos.length === 0 ? (
            <div className="rep-card-premium fade-in" style={{ ...glassCardStyle, textAlign: 'center', padding: '6rem 2rem', borderStyle: 'dashed', borderRadius: '24px' }}>
              <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 2rem' }}>
                <Shield size={80} style={{ opacity: 0.15, color: colors.textPrimary }} />
                <Plus size={30} style={{ position: 'absolute', bottom: 0, right: 0, color: 'var(--primary-ocean)' }} />
              </div>
              <h3 style={{ color: colors.textPrimary, fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 900 }}>No hay clubes registrados</h3>
              <p style={{ color: colors.textMuted, maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                {q ? "No encontramos resultados para tu búsqueda." : "Aún no has registrado ningún equipo. Completa el formulario lateral para comenzar tu participación académica."}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {visibleEquipos.map(eq => (
                <div key={eq.id} className="rep-card-premium team-card-premium fade-in" style={{ ...glassCardStyle, padding: '1.75rem', position: 'relative', overflow: 'hidden', borderRadius: '24px' }}>
                  {/* Status Badge */}
                  <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: eq.activo ? colors.activeBg : colors.pendingBg, color: eq.activo ? colors.activeText : colors.pendingText, padding: '4px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900, border: '1px solid currentColor', letterSpacing: '0.5px' }}>
                    {eq.activo ? "VERIFICADO" : "EN REVISIÓN"}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                      <Shield size={32} color="var(--primary-ocean)" fill="rgba(59, 130, 246, 0.1)" />
                      <span style={{ position: 'absolute', fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>{eq.nombre.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.3px' }}>{eq.nombre}</h4>
                      <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Dumbbell size={12} /> {eq.deporte?.nombre} <span style={{ opacity: 0.3 }}>•</span> {eq.categoria?.nombre}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '16px', padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ textAlign: 'left', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: colors.textMuted, fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Nómina</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{eq.jugadores_count || 0}</span>
                        <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>deportistas</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: colors.textMuted, fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Competición</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#93c5fd', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {eq.torneo?.nombre || 'General'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => navigate(`/representante/jugadores?equipo_id=${eq.id}`)}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700, background: 'rgba(30, 41, 59, 0.7)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
                    >
                      <Users size={18} /> Gestionar Nómina
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(eq.id)}
                      title="Eliminar equipo"
                      style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', transition: 'all 0.2s', width: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};


export default EquipoRepresentante;



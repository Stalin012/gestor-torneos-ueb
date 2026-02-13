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
import api from "../../api";
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

  // ---- Fetch Data ----
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [resEq, resTor, resDep, resCat] = await Promise.all([
        api.get('/representante/equipos'),
        api.get('/torneos'),
        api.get('/deportes'),
        api.get('/categorias'),
      ]);

      const normalize = (d) => Array.isArray(d) ? d : (d.data || []);

      setEquipos(normalize(resEq.data));
      setCatalogos({
        torneos: normalize(resTor.data),
        deportes: normalize(resDep.data),
        categorias: normalize(resCat.data),
      });

    } catch (err) {
      console.error(err);
      setError("Error al cargar los datos. Por favor revise su conexión.");
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

      const { data } = await api.post('/representante/equipos', payload);

      setEquipos(prev => [data, ...prev]);
      setForm({ nombre: "", torneo_id: "", deporte_id: "", categoria_id: "" });
      setSuccess("Equipo creado exitosamente.");
    } catch (err) {
      console.error(err);
      setError("Error al crear el equipo. Verifique los datos o intente nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este equipo? Se perderán sus estadísticas.")) return;
    try {
      await api.delete(`/representante/equipos/${id}`);
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
    <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 380px) 1fr', gap: '2.5rem', padding: '0 0 2rem 0' }}>

      {/* SIDEBAR FORM */}
      <aside className="rep-card-premium" style={{ height: 'fit-content', borderTop: '5px solid var(--primary-ocean)', ...glassCardStyle }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Registrar Equipo</h3>
          <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Crea un club y asígnalo a una competencia</p>
        </div>

        <form ref={formRef} onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#cbd5e1', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Nombre del Club</label>
            <div style={{ position: 'relative' }}>
              <Shield size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
              <input
                className="pro-input"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Leones F.C."
                style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#cbd5e1', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Torneo Destino</label>
            <div style={{ position: 'relative' }}>
              <Trophy size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
              <select
                className="pro-input"
                value={form.torneo_id}
                onChange={e => setForm({ ...form, torneo_id: e.target.value })}
                style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
              >
                <option value="" style={{ color: '#333' }}>Selecciona el torneo...</option>
                {catalogos.torneos.map(t => <option key={t.id} value={t.id} style={{ color: '#333' }}>{t.nombre}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Deporte</label>
              <div style={{ position: 'relative' }}>
                <Dumbbell size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                <select
                  className="pro-input"
                  value={form.deporte_id}
                  onChange={e => setForm({ ...form, deporte_id: e.target.value, categoria_id: "" })}
                  style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
                >
                  <option value="" style={{ color: '#333' }}>...</option>
                  {catalogos.deportes.map(d => <option key={d.id} value={d.id} style={{ color: '#333' }}>{d.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Categoría</label>
              <div style={{ position: 'relative' }}>
                <Target size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                <select
                  className="pro-input"
                  value={form.categoria_id}
                  onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                  style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
                  disabled={!form.deporte_id}
                >
                  <option value="" style={{ color: '#333' }}>...</option>
                  {categoriasFiltradas.map(c => <option key={c.id} value={c.id} style={{ color: '#333' }}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={isSaving} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Crear Equipo</>}
            </button>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', color: '#86efac', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} /> {success}
            </div>
          )}
        </form>
      </aside>

      {/* MAIN LIST */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, ...inputStyle, padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Search size={22} color="#94a3b8" />
            <input
              placeholder="Buscar equipo..."
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', color: '#fff', fontSize: '1rem', fontWeight: 500 }}
            />
          </div>
          <button className="btn-secondary" onClick={fetchData} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', padding: '0.85rem' }}>
            <RefreshCcw size={22} />
          </button>
        </div>

        {visibleEquipos.length === 0 ? (
          <div className="rep-card-premium" style={{ ...glassCardStyle, textAlign: 'center', padding: '5rem 2rem', borderStyle: 'dashed' }}>
            <Shield size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2, color: '#fff' }} />
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>Sin equipos encontrados</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Registra tu primer equipo en el panel lateral.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {visibleEquipos.map(eq => (
              <div key={eq.id} className="rep-card-premium" style={{ ...glassCardStyle, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                {/* Card Badge */}
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: eq.activo ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: eq.activo ? '#4ade80' : '#fbbf24', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid currentColor' }}>
                  {eq.activo ? "ACTIVO" : "PENDIENTE"}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary-ocean), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {eq.nombre.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>{eq.nombre}</h4>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{eq.deporte?.nombre} • {eq.categoria?.nombre}</p>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#60a5fa', display: 'block' }}>{eq.jugadores_count || 0}</span>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Jugadores</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#c084fc', display: 'block' }}>{eq.torneo?.nombre?.substring(0, 10) || '-'}</span>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Torneo</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => navigate(`/representante/nomina?equipo_id=${eq.id}`)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Users size={16} style={{ marginRight: '6px' }} /> Nómina
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(eq.id)}
                    style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', transition: 'all 0.2s' }}
                    className="hover:bg-red-500/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EquipoRepresentante;
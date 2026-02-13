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
} from "lucide-react";
import "../../../css/representante_dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

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
  const [logoError, setLogoError] = useState({});
  const formRef = useRef(null);

  const [form, setForm] = useState({
    nombre: "",
    torneo_id: "",
    deporte_id: "",
    categoria_id: "",
  });

  // ---- Helpers ----
  const getTokenOrThrow = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      throw new Error("NO_TOKEN");
    }
    return token;
  };

  const logoutAndRedirect = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }, [navigate]);

  const parseErrorResponse = async (res) => {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return (
        json?.message ||
        json?.error ||
        (json?.errors ? JSON.stringify(json.errors) : JSON.stringify(json))
      );
    } catch {
      return text || `Error HTTP ${res.status}`;
    }
  };

  // Normaliza respuestas (array directo o paginado {data:[]})
  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data; // Laravel paginate
    return [];
  };

  const clearAlerts = () => {
    setError("");
    setSuccess("");
  };

  const fetchData = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      clearAlerts();

      const token = getTokenOrThrow();

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [resEq, resTor, resDep, resCat] = await Promise.all([
        fetch(`${API_BASE}/representante/equipos`, { headers, signal: controller.signal }),
        fetch(`${API_BASE}/torneos`, { headers, signal: controller.signal }),
        fetch(`${API_BASE}/deportes`, { headers, signal: controller.signal }),
        fetch(`${API_BASE}/categorias`, { headers, signal: controller.signal }),
      ]);

      // Manejo auth
      const authFail = [resEq, resTor, resDep, resCat].find((r) => r.status === 401 || r.status === 403);
      if (authFail) {
        // opcional: mostrar msg antes de salir
        // const msg = await parseErrorResponse(authFail);
        // setError(msg || "No autorizado. Inicia sesión nuevamente.");
        logoutAndRedirect();
        return;
      }

      // Manejo de errores generales
      const anyFail = [resEq, resTor, resDep, resCat].find((r) => !r.ok);
      if (anyFail) {
        const msg = await parseErrorResponse(anyFail);
        throw new Error(msg || "Error al cargar datos.");
      }

      const dataEq = await resEq.json();
      const dataTor = await resTor.json();
      const dataDep = await resDep.json();
      const dataCat = await resCat.json();

      setEquipos(normalizeList(dataEq));
      setCatalogos({
        torneos: normalizeList(dataTor),
        deportes: normalizeList(dataDep),
        categorias: normalizeList(dataCat),
      });
    } catch (err) {
      if (err?.message === "NO_TOKEN") {
        logoutAndRedirect();
        return;
      }

      setError(err?.message || "Error inesperado");
      setEquipos([]);
      setCatalogos({ torneos: [], deportes: [], categorias: [] });
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [logoutAndRedirect]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      clearAlerts();

      const token = getTokenOrThrow();

      const payload = {
        nombre: String(form.nombre || "").trim(),
        torneo_id: form.torneo_id ? Number(form.torneo_id) : null,
        deporte_id: form.deporte_id ? Number(form.deporte_id) : null,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      };

      if (!payload.nombre) throw new Error("El nombre del equipo es obligatorio.");
      if (!payload.torneo_id) throw new Error("Selecciona un torneo.");
      if (!payload.deporte_id) throw new Error("Selecciona un deporte.");
      if (!payload.categoria_id) throw new Error("Selecciona una categoría.");

      const resp = await fetch(`${API_BASE}/representante/equipos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (resp.status === 401 || resp.status === 403) {
        logoutAndRedirect();
        return;
      }

      if (!resp.ok) {
        const msg = await parseErrorResponse(resp);
        throw new Error(msg || "No se pudo crear el equipo.");
      }

      const nuevo = await resp.json();
      setEquipos((prev) => [nuevo, ...prev]);

      setForm({ nombre: "", torneo_id: "", deporte_id: "", categoria_id: "" });
      setSuccess("Equipo creado correctamente.");
    } catch (err) {
      if (err?.message === "NO_TOKEN") {
        logoutAndRedirect();
        return;
      }
      setError(err?.message || "Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const canSubmit = useMemo(() => {
    return (
      String(form.nombre || "").trim().length > 0 &&
      String(form.torneo_id || "").length > 0 &&
      String(form.deporte_id || "").length > 0 &&
      String(form.categoria_id || "").length > 0 &&
      !isSaving
    );
  }, [form, isSaving]);

  const categoriasFiltradas = useMemo(() => {
    if (!form.deporte_id) return catalogos.categorias || [];
    return (catalogos.categorias || []).filter((c) => String(c.deporte_id) === String(form.deporte_id));
  }, [catalogos.categorias, form.deporte_id]);

  const visibleEquipos = useMemo(() => {
    const term = String(q || "").toLowerCase().trim();
    if (!term) return equipos;
    return (equipos || []).filter((e) => {
      return (
        String(e.nombre || "").toLowerCase().includes(term) ||
        String(e.torneo?.nombre || "").toLowerCase().includes(term) ||
        String(e.deporte?.nombre || "").toLowerCase().includes(term)
      );
    });
  }, [equipos, q]);

  const sortedEquipos = useMemo(() => {
    const list = (visibleEquipos || []).slice();
    list.sort((a, b) => {
      // activos primero
      const aAct = a.activo ? 0 : 1;
      const bAct = b.activo ? 0 : 1;
      if (aAct !== bAct) return aAct - bAct;

      // luego por torneo
      const tA = String(a.torneo?.nombre || "").toLowerCase();
      const tB = String(b.torneo?.nombre || "").toLowerCase();
      if (tA !== tB) return tA.localeCompare(tB);

      // finalmente por nombre de equipo
      return String(a.nombre || "").toLowerCase().localeCompare(String(b.nombre || "").toLowerCase());
    });
    return list;
  }, [visibleEquipos]);

  const groupedEquipos = useMemo(() => {
    const map = {};
    for (const e of sortedEquipos) {
      const tn = e.torneo?.nombre || "Sin torneo";
      if (!map[tn]) map[tn] = [];
      map[tn].push(e);
    }
    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, items: map[name] }));
  }, [sortedEquipos]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3500);
    return () => clearTimeout(t);
  }, [success]);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const avatarColor = (seed) => {
    const palette = ["#f97316", "#3b82f6", "#22c55e", "#ef4444", "#8b5cf6", "#f59e0b"];
    const s = String(seed || "");
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return palette[Math.abs(h) % palette.length];
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm("¿Eliminar este equipo? Esta acción no se puede deshacer.")) return;
    try {
      const token = getTokenOrThrow();
      const resp = await fetch(`${API_BASE}/representante/equipos/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(json?.message || `Error eliminando equipo (${resp.status})`);
      }
      setEquipos((prev) => prev.filter((e) => e.id !== id));
      setSuccess("Equipo eliminado correctamente.");
    } catch (err) {
      setError(err?.message || "Error al eliminar equipo.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="rep-scope teams-page">
      <div className="teams-layout">
        <aside className="team-form-card" aria-labelledby="form-title">
          <div className="card-head">
            <h3 id="form-title">Registrar nuevo equipo</h3>
            <p className="muted small">Crea un equipo y asígnalo a un torneo</p>
          </div>

          <form ref={formRef} onSubmit={handleCreate} className="team-form" noValidate>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                className="form-input"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre del equipo"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="torneo">Torneo</label>
                <select
                  id="torneo"
                  name="torneo_id"
                  className="form-input"
                  value={form.torneo_id}
                  onChange={(e) => setForm({ ...form, torneo_id: e.target.value })}
                  required
                >
                  <option value="">Selecciona...</option>
                  {catalogos.torneos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ width: 140 }}>
                <label htmlFor="deporte">Deporte</label>
                <select
                  id="deporte"
                  name="deporte_id"
                  className="form-input"
                  value={form.deporte_id}
                  onChange={(e) => setForm({ ...form, deporte_id: e.target.value, categoria_id: "" })}
                >
                  <option value="">Selecciona...</option>
                  {catalogos.deportes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                name="categoria_id"
                className="form-input"
                value={form.categoria_id}
                onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
              >
                <option value="">Selecciona...</option>
                {categoriasFiltradas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-cta" disabled={!canSubmit}>
                {isSaving ? "Guardando..." : "Crear equipo"}
              </button>
              <button type="button" className="btn-outline" onClick={fetchData}>
                Recargar
              </button>
            </div>

            {error && (
              <div className="form-error" role="alert" aria-live="assertive">
                {error}
              </div>
            )}
            {success && (
              <div className="form-success" role="status" aria-live="polite">
                {success}
              </div>
            )}
          </form>
        </aside>

        <main className="teams-cards" aria-live="polite">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <input
              placeholder="Buscar equipos, torneo o deporte..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button className="btn-outline" onClick={fetchData} title="Recargar">
              <RefreshCcw size={16} />
            </button>
          </div>

          {(!sortedEquipos || sortedEquipos.length === 0) ? (
            <div className="empty-card">
              <p>No hay equipos registrados.</p>
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    formRef.current?.scrollIntoView({ behavior: 'smooth' });
                    const el = formRef.current?.querySelector('input[name="nombre"]');
                    el?.focus();
                  }}
                >
                  Crear primer equipo
                </button>
              </div>
            </div>
          ) : (
            groupedEquipos.map((group) => (
              <section key={group.name} className="team-group">
                <h3 className="group-title" style={{ margin: '0 0 12px 8px' }}>
                  {group.name} <small style={{ color: 'var(--muted)', marginLeft: 8 }}>({group.items.length})</small>
                </h3>
                <div className="group-cards">
                  {group.items.map((eq) => (
                    <article key={eq.id} className="team-card" tabIndex={0}>
                <div className="card-accent" />

                <div className="card-top">
                  <div className="avatar" style={{ background: avatarColor(eq.id || eq.nombre), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{getInitials(eq.nombre)}</div>
                      {eq.logo && !logoError[eq.id] && (
                        <img
                          src={eq.logo}
                          alt={eq.nombre}
                          className="avatar-img"
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                          onError={() => setLogoError((s) => ({ ...s, [eq.id]: true }))}
                        />
                      )}
                    </div>
                  </div>

                  <div className="card-info">
                    <h4 className="team-name">{eq.nombre}</h4>
                    <div className="team-sub">
                      {eq.deporte?.nombre || "—"} · {eq.categoria?.nombre || "—"}
                    </div>
                  </div>

                  <div className="card-status">
                    <span className={`status ${eq.activo ? "ok" : "off"}`}>
                      {eq.activo ? "Activo" : "Inactivo"}
                    </span>
                    <div className="tournament small muted">{eq.torneo?.nombre || "—"}</div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="metrics">
                    <div className="metric">
                      <strong>{eq.jugadores_count ?? eq.jugadores?.length ?? 0}</strong>
                      <span className="muted">Jugadores</span>
                    </div>

                    <div className="metric">
                      <strong>#{eq.id}</strong>
                      <span className="muted">ID</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn-outline"
                      onClick={() => navigate(`/representante/equipos/${eq.id}/jugadores`)}
                    >
                      Jugadores
                    </button>
                    <button className="btn-cta" onClick={() => navigate(`/representante/equipo/${eq.id}`)}>
                      Ver detalles
                    </button>
                    <button className="btn-outline" onClick={() => handleDeleteTeam(eq.id)} title="Eliminar equipo" style={{ marginLeft: 8 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default EquipoRepresentante;



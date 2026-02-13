import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import {
    Trophy,
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Award,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    TrendingUp,
    Target,
    Zap,
    CheckCircle,
    AlertCircle,
    Settings,
    Palette,
    GitBranch,
    List,
    ChevronRight,
    Activity,
    Swords
} from "lucide-react";
import api, { API_BASE } from "../../api";

import LoadingScreen from "../../components/LoadingScreen";
import TorneoBracket from "../../components/TorneoBracket";

// =========================================================
// CONSTANTS
// =========================================================
// API_BASE importada desde api.js

const ESTADOS_PARTIDO = {
    PENDIENTE: "Pendiente",
    EN_CURSO: "En Curso",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
};

const TEMAS_TORNEO = {
    futbol: {
        nombre: "Fútbol",
        colorPrimario: "#22c55e",
        colorSecundario: "#16a34a",
        gradiente: "linear-gradient(135deg, #22c55e, #16a34a)",
        icono: "⚽",
        emoji: "🌟",
    },
    baloncesto: {
        nombre: "Baloncesto",
        colorPrimario: "#f97316",
        colorSecundario: "#ea580c",
        gradiente: "linear-gradient(135deg, #f97316, #ea580c)",
        icono: "🏀",
        emoji: "🔥",
    },
    voleibol: {
        nombre: "Voleibol",
        colorPrimario: "#3b82f6",
        colorSecundario: "#2563eb",
        gradiente: "linear-gradient(135deg, #3b82f6, #2563eb)",
        icono: "🏐",
        emoji: "💫",
    },
    tenis: {
        nombre: "Tenis",
        colorPrimario: "#eab308",
        colorSecundario: "#ca8a04",
        gradiente: "linear-gradient(135deg, #eab308, #ca8a04)",
        icono: "🎾",
        emoji: "⭐",
    },
    default: {
        nombre: "Torneo",
        colorPrimario: "#38bdf8",
        colorSecundario: "#0ea5e9",
        gradiente: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
        icono: "🏆",
        emoji: "✨",
    },
};

// =========================================================
// UTILITIES
// =========================================================

const formatDateDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Usar instancia 'api' directamente para manejar tokens y headers

/**
 * Obtiene el tema visual según el nombre del deporte
 */
const getTemaDeporte = (nombreDeporte) => {
    if (!nombreDeporte) return TEMAS_TORNEO.default;

    const nombre = nombreDeporte.toLowerCase();

    if (nombre.includes("futbol") || nombre.includes("fútbol") || nombre.includes("soccer")) {
        return TEMAS_TORNEO.futbol;
    }
    if (nombre.includes("baloncesto") || nombre.includes("básquet") || nombre.includes("basket")) {
        return TEMAS_TORNEO.baloncesto;
    }
    if (nombre.includes("volei") || nombre.includes("vóley")) {
        return TEMAS_TORNEO.voleibol;
    }
    if (nombre.includes("tenis")) {
        return TEMAS_TORNEO.tenis;
    }

    return TEMAS_TORNEO.default;
};

/**
 * Calcula la tabla de posiciones basada en los resultados
 */
const calcularTablaPosiciones = (equipos, partidos) => {
    const tabla = {};

    // Inicializar estadísticas para cada equipo
    equipos.forEach((equipo) => {
        tabla[equipo.id] = {
            id: equipo.id,
            nombre: equipo.nombre,
            logo: equipo.logo,
            pj: 0, // Partidos jugados
            pg: 0, // Partidos ganados
            pe: 0, // Partidos empatados
            pp: 0, // Partidos perdidos
            gf: 0, // Goles a favor
            gc: 0, // Goles en contra
            dg: 0, // Diferencia de goles
            pts: 0, // Puntos
        };
    });

    // Calcular estadísticas basadas en partidos finalizados
    partidos
        .filter((p) => p.estado === ESTADOS_PARTIDO.FINALIZADO)
        .forEach((partido) => {
            const localId = partido.equipo_local_id;
            const visitanteId = partido.equipo_visitante_id;
            const golesLocal = partido.marcador_local || 0;
            const golesVisitante = partido.marcador_visitante || 0;

            if (!tabla[localId] || !tabla[visitanteId]) return;

            // Actualizar partidos jugados
            tabla[localId].pj++;
            tabla[visitanteId].pj++;

            // Actualizar goles
            tabla[localId].gf += golesLocal;
            tabla[localId].gc += golesVisitante;
            tabla[visitanteId].gf += golesVisitante;
            tabla[visitanteId].gc += golesLocal;

            // Determinar resultado
            if (golesLocal > golesVisitante) {
                // Victoria local
                tabla[localId].pg++;
                tabla[localId].pts += 3;
                tabla[visitanteId].pp++;
            } else if (golesLocal < golesVisitante) {
                // Victoria visitante
                tabla[visitanteId].pg++;
                tabla[visitanteId].pts += 3;
                tabla[localId].pp++;
            } else {
                // Empate
                tabla[localId].pe++;
                tabla[visitanteId].pe++;
                tabla[localId].pts += 1;
                tabla[visitanteId].pts += 1;
            }
        });

    // Calcular diferencia de goles
    Object.values(tabla).forEach((equipo) => {
        equipo.dg = equipo.gf - equipo.gc;
    });

    // Ordenar por puntos, luego por diferencia de goles, luego por goles a favor
    return Object.values(tabla).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
    });
};

// =========================================================
// COMPONENTE: MODAL PARTIDO
// =========================================================

// =========================================================
// COMPONENTE: MODAL PARTIDO (ELITE)
// =========================================================

const PartidoModal = ({ isOpen, onClose, onSave, initialData, equipos, torneoId }) => {
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        equipo_local_id: "",
        equipo_visitante_id: "",
        fecha: "",
        marcador_local: "",
        marcador_visitante: "",
        estado: ESTADOS_PARTIDO.PENDIENTE,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                equipo_local_id: String(initialData.equipo_local_id || ""),
                equipo_visitante_id: String(initialData.equipo_visitante_id || ""),
                fecha: initialData.fecha ? initialData.fecha.split("T")[0] : "",
                marcador_local: initialData.marcador_local ?? "",
                marcador_visitante: initialData.marcador_visitante ?? "",
                estado: initialData.estado || ESTADOS_PARTIDO.PENDIENTE,
            });
        } else if (isOpen) {
            setFormData({
                equipo_local_id: "",
                equipo_visitante_id: "",
                fecha: "",
                marcador_local: "",
                marcador_visitante: "",
                estado: ESTADOS_PARTIDO.PENDIENTE,
            });
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'auto'; };
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.equipo_local_id === formData.equipo_visitante_id) {
            alert("El equipo local y visitante no pueden ser el mismo.");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                torneo_id: torneoId,
                equipo_local_id: Number(formData.equipo_local_id),
                equipo_visitante_id: Number(formData.equipo_visitante_id),
                fecha: formData.fecha ? `${formData.fecha} 00:00:00` : null,
                marcador_local: formData.marcador_local ? Number(formData.marcador_local) : null,
                marcador_visitante: formData.marcador_visitante ? Number(formData.marcador_visitante) : null,
                estado: formData.estado,
            };

            await onSave(payload, isEditMode ? initialData.id : null);
            onClose();
        } catch (error) {
            console.error("Error al guardar partido:", error);
            alert("Error al guardar el partido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content scale-in" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(53, 110, 216, 0.1), rgba(16, 185, 129, 0.05))',
                    borderBottom: '2px solid var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            <Swords size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                                {isEditMode ? "Editar Encuentro" : "Nuevo Encuentro"}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Configura los equipos y la fecha del partido
                            </p>
                        </div>
                    </div>
                    <button className="btn-icon-close" type="button" onClick={onClose} aria-label="Cerrar">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="equipo_local_id">Equipo Local</label>
                            <select
                                id="equipo_local_id"
                                name="equipo_local_id"
                                value={formData.equipo_local_id}
                                onChange={handleChange}
                                required
                                className="pro-input"
                            >
                                <option value="">Seleccione equipo local</option>
                                {equipos.map((equipo) => (
                                    <option key={equipo.id} value={String(equipo.id)}>
                                        {equipo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="equipo_visitante_id">Equipo Visitante</label>
                            <select
                                id="equipo_visitante_id"
                                name="equipo_visitante_id"
                                value={formData.equipo_visitante_id}
                                onChange={handleChange}
                                required
                                className="pro-input"
                            >
                                <option value="">Seleccione equipo visitante</option>
                                {equipos.map((equipo) => (
                                    <option key={equipo.id} value={String(equipo.id)}>
                                        {equipo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" htmlFor="fecha">Fecha del partido</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            required
                            className="pro-input"
                        />
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        marginBottom: '1.5rem'
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Resultados (Opcional)
                        </h4>
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Local</label>
                                <input
                                    type="number"
                                    name="marcador_local"
                                    value={formData.marcador_local}
                                    onChange={handleChange}
                                    min="0"
                                    className="pro-input"
                                    style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 800 }}
                                />
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, opacity: 0.3, marginTop: '1.2rem' }}>VS</div>
                            <div className="form-group">
                                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Visitante</label>
                                <input
                                    type="number"
                                    name="marcador_visitante"
                                    value={formData.marcador_visitante}
                                    onChange={handleChange}
                                    min="0"
                                    className="pro-input"
                                    style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 800 }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" htmlFor="estado">Estado del Partido</label>
                        <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="pro-input">
                            {Object.values(ESTADOS_PARTIDO).map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '0' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="pro-btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {isEditMode ? "Actualizar Encuentro" : "Crear Encuentro"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


PartidoModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    equipos: PropTypes.array.isRequired,
    torneoId: PropTypes.number.isRequired,
};

// =========================================================
// COMPONENTE: MODAL DETALLES DEL EQUIPO
// =========================================================

// =========================================================
// COMPONENTE: MODAL DETALLES DEL EQUIPO (ELITE)
// =========================================================

const EquipoModal = ({ isOpen, onClose, equipo, jugadores, tema }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'auto'; };
        }
    }, [isOpen]);

    if (!isOpen || !equipo) return null;

    return (
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content scale-in" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05))',
                    borderBottom: `2px solid ${tema.colorPrimario}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${tema.colorPrimario}, ${tema.colorSecundario || '#3b82f6'})`,
                            color: 'white',
                            boxShadow: `0 4px 12px ${tema.colorPrimario}44`
                        }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                                Perfil de Equipo
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Jugadores registrados y estadísticas base
                            </p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div className="premium-card" style={{
                        textAlign: 'center',
                        marginBottom: '2rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <div
                            style={{
                                width: "90px",
                                height: "90px",
                                margin: "0 auto 1rem",
                                borderRadius: "24px",
                                background: 'var(--bg-darkest)',
                                border: `3px solid ${tema.colorPrimario}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "3rem",
                                fontWeight: "900",
                                color: tema.colorPrimario,
                                boxShadow: `0 0 30px ${tema.colorPrimario}33`,
                                transform: 'rotate(-5deg)'
                            }}
                        >
                            {equipo.nombre.charAt(0)}
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>{equipo.nombre}</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                            <span className="status-badge badge-neutral" style={{ fontSize: '0.8rem' }}>
                                <Trophy size={12} style={{ marginRight: '4px' }} /> {equipo.categoria?.nombre || 'General'}
                            </span>
                            <span className="status-badge badge-success" style={{ fontSize: '0.8rem' }}>
                                <Users size={12} style={{ marginRight: '4px' }} /> {jugadores.length} Atletas
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <List size={18} color={tema.colorPrimario} /> Nómina Oficial
                        </h4>
                    </div>

                    {jugadores.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            opacity: 0.5,
                            background: 'rgba(255,255,255,0.01)',
                            borderRadius: '16px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                            <Search size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p>No hay jugadores registrados en este equipo.</p>
                        </div>
                    ) : (
                        <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>ID / Cédula</th>
                                        <th>Nombre Completo</th>
                                        <th style={{ textAlign: 'center' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jugadores.map((jugador) => (
                                        <tr key={jugador.cedula}>
                                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{jugador.cedula}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{jugador.persona?.nombres} {jugador.persona?.apellidos}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jugador Federado</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`status-badge ${jugador.estado === 'Activo' ? 'badge-success' : 'badge-neutral'}`}
                                                    style={{ fontSize: '0.7rem', padding: '3px 10px' }}
                                                >
                                                    {jugador.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <button className="pro-btn btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Cerrar Vista</button>
                </div>
            </div>
        </div>
    );
};


EquipoModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    equipo: PropTypes.object,
    jugadores: PropTypes.array.isRequired,
    tema: PropTypes.object.isRequired,
};

// =========================================================
// COMPONENTE: MODAL ESTADÍSTICAS DEL PARTIDO
// =========================================================

// =========================================================
// COMPONENTE: MODAL ESTADÍSTICAS DEL PARTIDO (ELITE)
// =========================================================

const MatchStatsModal = ({ isOpen, onClose, partido, tema }) => {
    const [playersLocal, setPlayersLocal] = useState([]);
    const [playersVisitante, setPlayersVisitante] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState([]);

    const [form, setForm] = useState({
        jugador_cedula: "",
        goles: 0,
        asistencias: 0,
        tarjetas_amarillas: 0,
        tarjetas_rojas: 0,
    });

    const loadPlayersAndStats = useCallback(async () => {
        if (!partido) return;
        setLoading(true);
        try {
            const [localResp, visitResp, statsResp] = await Promise.all([
                api.get(`/equipos/${partido.equipo_local_id}/jugadores`),
                api.get(`/equipos/${partido.equipo_visitante_id}/jugadores`),
                api.get(`/estadisticas/partido/${partido.id}`),
            ]);

            const localData = localResp.data;
            const visitData = visitResp.data;
            const statsData = statsResp.data;

            // Asegurar que sean arrays (el backend a veces devuelve el objeto directo o envuelto en data)
            const getArray = (res) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (res.data && Array.isArray(res.data)) return res.data;
                return [];
            };

            setPlayersLocal(getArray(localData));
            setPlayersVisitante(getArray(visitData));
            setStats(statsData.resumen || []);
        } catch (err) {
            console.error("Error loading players/stats:", err);
        } finally {
            setLoading(false);
        }
    }, [partido]);

    useEffect(() => {
        if (isOpen && partido) {
            loadPlayersAndStats();
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'auto'; };
        }
    }, [isOpen, partido, loadPlayersAndStats]);

    const handleAddStats = async (e) => {
        e.preventDefault();
        if (!form.jugador_cedula) return;

        try {
            const resp = await api.post('/estadisticas', {
                partido_id: partido.id,
                ...form
            });

            if (resp.status === 200 || resp.status === 201) {
                setForm({ jugador_cedula: "", goles: 0, asistencias: 0, tarjetas_amarillas: 0, tarjetas_rojas: 0 });
                loadPlayersAndStats();
            }
        } catch (err) {
            console.error("Error adding stats:", err);
        }
    };

    if (!isOpen || !partido) return null;

    return (
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content scale-in" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(59, 130, 246, 0.05))',
                    borderBottom: `2px solid ${tema.colorPrimario}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                                Control de Incidencias
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {partido.local_nombre} vs {partido.visitante_nombre}
                            </p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <form onSubmit={handleAddStats} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} color="var(--primary)" /> Registrar Nuevo Evento
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Seleccionar Jugador</label>
                                <select
                                    className="pro-input"
                                    value={form.jugador_cedula}
                                    onChange={e => setForm({ ...form, jugador_cedula: e.target.value })}
                                    required
                                >
                                    <option value="">Buscar en campo...</option>
                                    <optgroup label={`🏠 LOCAL: ${partido.local_nombre}`}>
                                        {Array.isArray(playersLocal) && playersLocal.map(p => (
                                            <option key={p.cedula} value={p.cedula}>#{p.numero || '?'} - {p.persona?.nombres} {p.persona?.apellidos}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label={`✈️ VISITANTE: ${partido.visitante_nombre}`}>
                                        {Array.isArray(playersVisitante) && playersVisitante.map(p => (
                                            <option key={p.cedula} value={p.cedula}>#{p.numero || '?'} - {p.persona?.nombres} {p.persona?.apellidos}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.8rem', textAlign: 'center' }}>Goles</label>
                                <input type="number" className="pro-input" min="0" value={form.goles} onChange={e => setForm({ ...form, goles: parseInt(e.target.value) || 0 })} style={{ textAlign: 'center', fontWeight: 700 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.8rem', textAlign: 'center' }}>Asist.</label>
                                <input type="number" className="pro-input" min="0" value={form.asistencias} onChange={e => setForm({ ...form, asistencias: parseInt(e.target.value) || 0 })} style={{ textAlign: 'center', fontWeight: 700 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.8rem', textAlign: 'center' }}>Amarillas</label>
                                <input type="number" className="pro-input" min="0" max="2" value={form.tarjetas_amarillas} onChange={e => setForm({ ...form, tarjetas_amarillas: parseInt(e.target.value) || 0 })} style={{ textAlign: 'center', fontWeight: 700, color: '#fbbf24' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.8rem', textAlign: 'center' }}>Rojas</label>
                                <input type="number" className="pro-input" min="0" max="1" value={form.tarjetas_rojas} onChange={e => setForm({ ...form, tarjetas_rojas: parseInt(e.target.value) || 0 })} style={{ textAlign: 'center', fontWeight: 700, color: '#ef4444' }} />
                            </div>
                        </div>

                        <button type="submit" className="pro-btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '46px' }}>
                            <CheckCircle size={18} /> Confirmar Acción
                        </button>
                    </form>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <List size={20} color={tema.colorPrimario} /> Resumen Estadístico
                    </h3>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Procesando datos...</p>
                        </div>
                    ) : stats.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            opacity: 0.5,
                            background: 'rgba(255,255,255,0.01)',
                            borderRadius: '16px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                            <Activity size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p>Sin eventos registrados en este encuentro.</p>
                        </div>
                    ) : (
                        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>Atleta</th>
                                        <th style={{ textAlign: 'center' }}>⚽ G</th>
                                        <th style={{ textAlign: 'center' }}>🎯 A</th>
                                        <th style={{ textAlign: 'center' }}>🟨</th>
                                        <th style={{ textAlign: 'center' }}>🟥</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map(s => (
                                        <tr key={s.jugador_cedula}>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{s.nombre_jugador}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {s.jugador_cedula}</div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 900, color: tema.colorPrimario, fontSize: '1.1rem' }}>{s.goles}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.asistencias}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {s.tarjetas_amarillas > 0 && <span style={{ background: '#fbbf24', padding: '2px 6px', borderRadius: '4px', color: '#000', fontWeight: 800 }}>{s.tarjetas_amarillas}</span>}
                                                {s.tarjetas_amarillas === 0 && '-'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {s.tarjetas_rojas > 0 && <span style={{ background: '#ef4444', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontWeight: 800 }}>{s.tarjetas_rojas}</span>}
                                                {s.tarjetas_rojas === 0 && '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button className="pro-btn btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Cerrar Supervisor</button>
                </div>
            </div>
        </div>
    );
};


// =========================================================
// COMPONENTE PRINCIPAL: DETALLE DEL TORNEO
// =========================================================

const TorneoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const torneoId = Number(id);

    const [torneo, setTorneo] = useState(null);
    const [equipos, setEquipos] = useState([]);
    const [partidos, setPartidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isPartidoModalOpen, setIsPartidoModalOpen] = useState(false);
    const [currentPartido, setCurrentPartido] = useState(null);

    const [activeTab, setActiveTab] = useState("posiciones");
    const [goleadores, setGoleadores] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);

    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [statsMatch, setStatsMatch] = useState(null);

    const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [equipoJugadores, setEquipoJugadores] = useState([]);

    const [selectedPartidos, setSelectedPartidos] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Cargar datos del torneo
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [torneoResp, equiposResp, partidosResp] = await Promise.all([
                api.get(`/torneos/${torneoId}`),
                api.get(`/torneos/${torneoId}/equipos`),
                api.get(`/partidos?torneo_id=${torneoId}&with=equipoLocal,equipoVisitante`),
            ]);

            const torneoData = torneoResp.data;
            const equiposData = equiposResp.data;
            const partidosData = partidosResp.data;

            setTorneo(torneoData);
            setEquipos(Array.isArray(equiposData) ? equiposData : equiposData.data || []);
            setPartidos(Array.isArray(partidosData) ? partidosData : partidosData.data || []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Error al cargar datos del torneo");
        } finally {
            setLoading(false);
        }
    }, [torneoId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const fetchGoleadores = useCallback(async () => {
        try {
            setLoadingStats(true);
            const resp = await api.get(`/estadisticas/torneo/${torneoId}`);
            const data = resp.data;
            setGoleadores(data.resumen || []);
        } catch (err) {
            console.error("Error fetching goleadores:", err);
        } finally {
            setLoadingStats(false);
        }
    }, [torneoId]);

    useEffect(() => {
        if (activeTab === "goleadores") {
            fetchGoleadores();
        }
    }, [activeTab, fetchGoleadores]);

    // Tema visual del torneo
    const tema = useMemo(() => {
        if (!torneo) return TEMAS_TORNEO.default;
        return getTemaDeporte(torneo.deporte?.nombre);
    }, [torneo]);

    // Tabla de posiciones
    const tablaPosiciones = useMemo(() => {
        return calcularTablaPosiciones(equipos, partidos);
    }, [equipos, partidos]);

    // Handlers para estado del torneo
    const handleIniciarTorneo = async () => {
        if (!confirm("¿Estás seguro de iniciar el torneo? Esto marcará el inicio oficial de la competencia.")) return;
        try {
            const resp = await api.post(`/torneos/${torneoId}/iniciar`);
            if (resp.status === 200) loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFinalizarTorneo = async () => {
        if (!confirm("¿Estás seguro de finalizar el torneo? Esto cerrará todas las inscripciones y resultados.")) return;
        try {
            const resp = await api.post(`/torneos/${torneoId}/finalizar`);
            if (resp.status === 200) loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerarFixtures = async () => {
        if (equipos.length < 2) {
            alert("Se necesitan al menos 2 equipos para generar partidos.");
            return;
        }
        if (!confirm("¿Generar fixtures automáticamente para este torneo? Esto creará todos los partidos pendientes.")) return;
        try {
            const resp = await api.get(`/fixtures/generar/${torneoId}`);
            if (resp.status === 200) {
                alert("Fixtures generados exitosamente.");
                loadData();
            } else {
                alert(resp.data.message || "Error al generar fixtures.");
            }
        } catch (err) {
            console.error("Error generando fixtures:", err);
            alert("Error al generar fixtures.");
        }
    };

    const handleVerEquipo = async (equipo) => {
        setSelectedEquipo(equipo);
        try {
            const resp = await api.get(`/equipos/${equipo.id}/jugadores`);
            const data = resp.data;
            setEquipoJugadores(data.data || data || []);
        } catch (err) {
            console.error("Error loading jugadores:", err);
        }
        setIsEquipoModalOpen(true);
    };

    const handleSelectPartido = (partidoId, checked) => {
        if (checked) {
            setSelectedPartidos(prev => [...prev, partidoId]);
        } else {
            setSelectedPartidos(prev => prev.filter(id => id !== partidoId));
            setSelectAll(false);
        }
    };

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedPartidos(partidos.map(p => p.id));
        } else {
            setSelectedPartidos([]);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedPartidos.length === 0) {
            alert("Selecciona al menos un partido para eliminar.");
            return;
        }
        if (!confirm(`¿Eliminar ${selectedPartidos.length} partido(s) seleccionado(s)? Esta acción no se puede deshacer.`)) return;

        try {
            const deletePromises = selectedPartidos.map(id => api.delete(`/partidos/${id}`));

            await Promise.all(deletePromises);
            setSelectedPartidos([]);
            setSelectAll(false);
            loadData();
            alert(`${selectedPartidos.length} partido(s) eliminado(s) exitosamente.`);
        } catch (err) {
            console.error("Error deleting partidos:", err);
            alert("Error al eliminar los partidos.");
        }
    };

    // Handlers
    const handleCreatePartido = () => {
        setCurrentPartido(null);
        setIsPartidoModalOpen(true);
    };

    const handleEditPartido = (partido) => {
        setCurrentPartido(partido);
        setIsPartidoModalOpen(true);
    };

    const handleSavePartido = async (payload, partidoId) => {
        try {
            const url = partidoId ? `/partidos/${partidoId}` : `/partidos`;
            let resp;
            if (partidoId) {
                resp = await api.put(url, payload);
            } else {
                resp = await api.post(url, payload);
            }

            if (resp.status !== 200 && resp.status !== 201) {
                throw new Error(resp.data.message || "Error al guardar el partido");
            }

            await loadData();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.message);
        }
    };

    const handleDeletePartido = async (partidoId, nombreLocal, nombreVisitante) => {
        if (!window.confirm(`¿Eliminar el partido ${nombreLocal} vs ${nombreVisitante}?`)) return;

        try {
            const resp = await api.delete(`/partidos/${partidoId}`);
            if (resp.status === 200) {
                await loadData();
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error al eliminar el partido");
        }
    };

    if (loading) return <LoadingScreen message="CONFIGURANDO TORNEO..." />;

    if (error || !torneo) {
        return (
            <div className="admin-page-container">
                <div className="error-message" style={{ textAlign: "center", padding: "3rem" }}>
                    {error || "Torneo no encontrado"}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-container fade-enter">
            <div className="admin-page-header">
                <button
                    className="pro-btn btn-secondary"
                    onClick={() => navigate("/admin/torneos-deportes")}
                    style={{ marginRight: '1rem', padding: '0.5rem' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="page-title">{tema.emoji} {torneo.nombre}</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem", display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span><Trophy size={14} style={{ display: 'inline', marginRight: '4px' }} /> {torneo.deporte?.nombre}</span>
                        <span><Users size={14} style={{ display: 'inline', marginRight: '4px' }} /> {torneo.categoria?.nombre}</span>
                        <span><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> {formatDateDisplay(torneo.fecha_inicio)}</span>
                    </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`status-badge ${torneo.estado === 'Activo' ? 'badge-success' : 'badge-neutral'}`}>
                        {torneo.estado}
                    </span>
                    <div className="page-actions">
                        {torneo?.estado !== "Activo" && torneo?.estado !== "Finalizado" && (
                            <button className="pro-btn btn-primary" onClick={handleIniciarTorneo}>
                                <Zap size={18} /> Iniciar Torneo
                            </button>
                        )}
                        {torneo?.estado === "Activo" && (
                            <button className="pro-btn btn-danger" onClick={handleFinalizarTorneo} style={{ background: '#ef4444', color: '#fff' }}>
                                <CheckCircle size={18} /> Finalizar Torneo
                            </button>
                        )}
                        <button className="pro-btn btn-secondary" onClick={() => navigate("/admin/torneos")}>
                            <Settings size={18} /> Configurar
                        </button>
                    </div>
                </div>
            </div>

            <div className="pro-card" style={{
                background: tema.gradiente,
                color: '#fff',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
                boxShadow: `0 10px 40px -10px ${tema.colorPrimario}66`
            }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, fontSize: '12rem', lineHeight: 1 }}>
                    {tema.icono}
                </div>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Resumen del Torneo</h2>
                        <p style={{ opacity: 0.9, maxWidth: '600px' }}>
                            Gestiona partidos, equipos y estadísticas en tiempo real.
                        </p>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{equipos.length}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Equipos</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{partidos.length}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Partidos</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
                                    {partidos.filter(p => p.estado === ESTADOS_PARTIDO.FINALIZADO).length}
                                </div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Jugados</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
                                    {partidos.filter(p => p.estado === ESTADOS_PARTIDO.PENDIENTE).length}
                                </div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Pendientes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pro-card">
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
                    <button
                        className={`tab-btn ${activeTab === 'posiciones' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posiciones')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'posiciones' ? `2px solid ${tema.colorPrimario}` : '2px solid transparent',
                            color: activeTab === 'posiciones' ? tema.colorPrimario : 'var(--text-muted)',
                            fontWeight: activeTab === 'posiciones' ? 600 : 400,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Award size={18} /> Tabla de Posiciones
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'partidos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('partidos')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'partidos' ? `2px solid ${tema.colorPrimario}` : '2px solid transparent',
                            color: activeTab === 'partidos' ? tema.colorPrimario : 'var(--text-muted)',
                            fontWeight: activeTab === 'partidos' ? 600 : 400,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Zap size={18} /> Partidos
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'equipos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('equipos')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'equipos' ? `2px solid ${tema.colorPrimario}` : '2px solid transparent',
                            color: activeTab === 'equipos' ? tema.colorPrimario : 'var(--text-muted)',
                            fontWeight: activeTab === 'equipos' ? 600 : 400,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Users size={18} /> Equipos
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'brackets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('brackets')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'brackets' ? `2px solid ${tema.colorPrimario}` : '2px solid transparent',
                            color: activeTab === 'brackets' ? tema.colorPrimario : 'var(--text-muted)',
                            fontWeight: activeTab === 'brackets' ? 600 : 400,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <GitBranch size={18} /> Eliminatorias
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'goleadores' ? 'active' : ''}`}
                        onClick={() => setActiveTab('goleadores')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'goleadores' ? `2px solid ${tema.colorPrimario}` : '2px solid transparent',
                            color: activeTab === 'goleadores' ? tema.colorPrimario : 'var(--text-muted)',
                            fontWeight: activeTab === 'goleadores' ? 600 : 400,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Target size={18} /> Goleadores
                    </button>
                </div>

                {/* Contenido de tabs */}
                <div className="main-module-content" style={{ padding: '2rem' }}>
                    {activeTab === "posiciones" && (
                        <div className="fade-enter">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Award size={20} color={tema.colorPrimario} />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Tabla de Posiciones</h2>
                                </div>
                            </div>

                            {tablaPosiciones.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                    <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                                    <p>No hay datos suficientes para mostrar la tabla de posiciones.</p>
                                    <p style={{ fontSize: "0.9rem" }}>Registra partidos para ver las estadísticas.</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "60px", textAlign: 'center' }}>Pos</th>
                                                <th>Equipo</th>
                                                <th style={{ textAlign: 'center' }}>PJ</th>
                                                <th style={{ textAlign: 'center' }}>PG</th>
                                                <th style={{ textAlign: 'center' }}>PE</th>
                                                <th style={{ textAlign: 'center' }}>PP</th>
                                                <th style={{ textAlign: 'center' }}>GF</th>
                                                <th style={{ textAlign: 'center' }}>GC</th>
                                                <th style={{ textAlign: 'center' }}>DG</th>
                                                <th style={{ fontWeight: "900", textAlign: 'center' }}>PTS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tablaPosiciones.map((item, index) => (
                                                <tr key={item.id} style={
                                                    torneo?.estado === "Finalizado" && index === 0
                                                        ? { background: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid #eab308' }
                                                        : {}
                                                }>
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {index === 0 && torneo?.estado === "Finalizado" ? "🏆" : index + 1}
                                                    </td>
                                                    <td style={{ fontWeight: 600 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {item.nombre}
                                                            {index === 0 && torneo?.estado === "Finalizado" &&
                                                                <span style={{ fontSize: '0.7rem', background: '#eab308', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 900 }}>CAMPEÓN</span>
                                                            }
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>{item.pj}</td>
                                                    <td style={{ textAlign: 'center', color: "var(--success-text)", fontWeight: 600 }}>{item.pg}</td>
                                                    <td style={{ textAlign: 'center', color: "var(--warning-text)", fontWeight: 600 }}>{item.pe}</td>
                                                    <td style={{ textAlign: 'center', color: "var(--danger-text)", fontWeight: 600 }}>{item.pp}</td>
                                                    <td style={{ textAlign: 'center', opacity: 0.8 }}>{item.gf}</td>
                                                    <td style={{ textAlign: 'center', opacity: 0.8 }}>{item.gc}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: 700, color: item.dg > 0 ? "var(--success-text)" : item.dg < 0 ? "var(--danger-text)" : "var(--text-muted)" }}>
                                                        {item.dg > 0 ? "+" : ""}
                                                        {item.dg}
                                                    </td>
                                                    <td
                                                        style={{
                                                            textAlign: 'center',
                                                            fontWeight: "900",
                                                            fontSize: "1.2rem",
                                                            color: tema.colorPrimario
                                                        }}
                                                    >
                                                        {item.pts}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", fontSize: "0.85rem", color: "var(--text-muted)", display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <span><strong>PJ:</strong> Jugados</span>
                                <span><strong>PG:</strong> Ganados</span>
                                <span><strong>PE:</strong> Empates</span>
                                <span><strong>PP:</strong> Perdidos</span>
                                <span><strong>GF:</strong> Goles Favor</span>
                                <span><strong>GC:</strong> Goles Contra</span>
                                <span><strong>DG:</strong> Deferencia</span>
                                <span><strong>PTS:</strong> Puntos</span>
                            </div>
                        </div>
                    )}

                    {activeTab === "partidos" && (
                        <div className="fade-enter">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Zap size={20} color={tema.colorPrimario} />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Partidos del Torneo ({partidos.length})</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="pro-btn btn-secondary" onClick={handleGenerarFixtures}>
                                        <GitBranch size={18} style={{ marginRight: '6px' }} /> Generar Fixtures
                                    </button>
                                    {selectedPartidos.length > 0 && (
                                        <button className="pro-btn btn-danger" onClick={handleDeleteSelected}>
                                            <Trash2 size={18} style={{ marginRight: '6px' }} /> Eliminar ({selectedPartidos.length})
                                        </button>
                                    )}
                                    <button className="pro-btn btn-primary" onClick={handleCreatePartido}>
                                        <Plus size={18} style={{ marginRight: '6px' }} /> Nuevo Partido
                                    </button>
                                </div>
                            </div>

                            {partidos.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                    <Zap size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                                    <p>No hay partidos registrados aún.</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Local</th>
                                                <th style={{ textAlign: 'center' }}>Marcador</th>
                                                <th>Visitante</th>
                                                <th>Estado</th>
                                                <th style={{ textAlign: 'center' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {partidos.map((partido) => {
                                                const equipoLocal = equipos.find((e) => e.id === partido.equipo_local_id);
                                                const equipoVisitante = equipos.find((e) => e.id === partido.equipo_visitante_id);
                                                return (
                                                    <tr key={partido.id}>
                                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                            {formatDateDisplay(partido.fecha)}
                                                        </td>
                                                        <td style={{ fontWeight: 600 }}>
                                                            {equipoLocal?.nombre || "Equipo Local"}
                                                        </td>
                                                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px' }}>
                                                            <span style={{ color: partido.marcador_local > partido.marcador_visitante ? 'var(--success-text)' : 'inherit' }}>{partido.marcador_local ?? '-'}</span>
                                                            <span style={{ margin: '0 4px', opacity: 0.4, fontWeight: 400 }}>:</span>
                                                            <span style={{ color: partido.marcador_visitante > partido.marcador_local ? 'var(--success-text)' : 'inherit' }}>{partido.marcador_visitante ?? '-'}</span>
                                                        </td>
                                                        <td style={{ fontWeight: 600 }}>
                                                            {equipoVisitante?.nombre || "Equipo Visitante"}
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${partido.estado === ESTADOS_PARTIDO.FINALIZADO ? 'badge-finalizado' : partido.estado === ESTADOS_PARTIDO.EN_CURSO ? 'badge-primary' : 'badge-neutral'}`}
                                                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                                            >
                                                                {partido.estado}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                                <button
                                                                    className="pro-btn btn-primary"
                                                                    style={{ padding: '6px' }}
                                                                    title="Registrar Estadísticas"
                                                                    onClick={() => {
                                                                        setStatsMatch({
                                                                            ...partido,
                                                                            local_nombre: equipoLocal?.nombre || "Local",
                                                                            visitante_nombre: equipoVisitante?.nombre || "Visitante"
                                                                        });
                                                                        setIsStatsModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Activity size={16} />
                                                                </button>
                                                                <button
                                                                    className="pro-btn btn-secondary"
                                                                    style={{ padding: '6px' }}
                                                                    onClick={() => handleEditPartido(partido)}
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    className="pro-btn btn-danger"
                                                                    style={{ padding: '6px' }}
                                                                    onClick={() =>
                                                                        handleDeletePartido(
                                                                            partido.id,
                                                                            equipoLocal?.nombre,
                                                                            equipoVisitante?.nombre
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "equipos" && (
                        <div className="fade-enter">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Users size={20} color={tema.colorPrimario} />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Equipos Participantes ({equipos.length})</h2>
                                </div>
                            </div>

                            {equipos.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                    <Users size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                                    <p>No hay equipos inscritos aún.</p>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                                        gap: "1.5rem",
                                    }}
                                >
                                    {equipos.map((equipo) => (
                                        <div
                                            key={equipo.id}
                                            className="pro-card"
                                            style={{
                                                textAlign: "center",
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: tema.gradiente }}></div>
                                            <div
                                                style={{
                                                    width: "70px",
                                                    height: "70px",
                                                    margin: "0 auto 1rem",
                                                    borderRadius: "50%",
                                                    background: 'var(--bg-darkest)',
                                                    border: `2px solid ${tema.colorPrimario}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "1.8rem",
                                                    fontWeight: "900",
                                                    color: tema.colorPrimario,
                                                    boxShadow: `0 0 20px ${tema.colorPrimario}33`,
                                                }}
                                            >
                                                {equipo.nombre.charAt(0)}
                                            </div>
                                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem", color: 'var(--text-main)' }}>
                                                {equipo.nombre}
                                            </h3>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                {equipo.categoria?.nombre || "Sin categoría"}
                                            </p>
                                            <button
                                                className="pro-btn btn-primary"
                                                style={{ marginTop: '1rem', padding: '6px 12px', fontSize: '0.8rem' }}
                                                onClick={() => handleVerEquipo(equipo)}
                                            >
                                                <Users size={14} style={{ marginRight: '4px' }} /> Ver Jugadores
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "brackets" && (
                        <div className="fade-enter">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <GitBranch size={20} color={tema.colorPrimario} />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Eliminatorias</h2>
                                </div>
                            </div>
                            <div className="pro-card" style={{ overflowX: 'auto' }}>
                                <TorneoBracket equipos={equipos} partidos={partidos} tema={tema} />
                            </div>
                        </div>
                    )}

                    {activeTab === "goleadores" && (
                        <div className="fade-enter">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Target size={20} color={tema.colorPrimario} />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Tabla de Goleadores</h2>
                                </div>
                                <button
                                    className="pro-btn btn-secondary"
                                    onClick={fetchGoleadores}
                                    disabled={loadingStats}
                                    style={{ padding: '8px 16px' }}
                                >
                                    <TrendingUp size={16} style={{ marginRight: '8px' }} />
                                    {loadingStats ? "Actualizando..." : "Actualizar"}
                                </button>
                            </div>

                            {goleadores.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                    <Award size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                                    <p>No hay estadísticas registradas aún.</p>
                                    <p style={{ fontSize: "0.9rem" }}>Registra eventos de partido para ver los goleadores.</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "60px", textAlign: 'center' }}>Pos</th>
                                                <th>Jugador</th>
                                                <th>Equipo</th>
                                                <th style={{ textAlign: 'center' }}>PJ</th>
                                                <th style={{ textAlign: 'center', fontWeight: "900" }}>Goles</th>
                                                <th style={{ textAlign: 'center' }}>Asist.</th>
                                                <th style={{ textAlign: 'center' }}>🟨</th>
                                                <th style={{ textAlign: 'center' }}>🟥</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {goleadores.map((jugador, index) => (
                                                <tr key={jugador.jugador_cedula}>
                                                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{index + 1}</td>
                                                    <td style={{ fontWeight: 600 }}>{jugador.nombre_jugador}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {jugador.equipo_logo ? (
                                                                <img src={jugador.equipo_logo} alt={jugador.equipo_nombre} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                                            ) : (
                                                                <div style={{ width: '24px', height: '24px', background: tema.gradiente, borderRadius: '50%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                                    {jugador.equipo_nombre?.charAt(0)}
                                                                </div>
                                                            )}
                                                            {jugador.equipo_nombre}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>{jugador.pj}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: "900", color: tema.colorPrimario, fontSize: "1.1rem" }}>{jugador.goles}</td>
                                                    <td style={{ textAlign: 'center' }}>{jugador.asistencias}</td>
                                                    <td style={{ textAlign: 'center', color: '#eab308' }}>{jugador.tarjetas_amarillas}</td>
                                                    <td style={{ textAlign: 'center', color: '#ef4444' }}>{jugador.tarjetas_rojas}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Partido */}
            <PartidoModal
                isOpen={isPartidoModalOpen}
                onClose={() => setIsPartidoModalOpen(false)}
                onSave={handleSavePartido}
                initialData={currentPartido}
                equipos={equipos}
                torneoId={torneoId}
            />

            {/* Modal de Estadísticas */}
            <MatchStatsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                partido={statsMatch}
                tema={tema}
            />

            {/* Modal de Equipo */}
            <EquipoModal
                isOpen={isEquipoModalOpen}
                onClose={() => setIsEquipoModalOpen(false)}
                equipo={selectedEquipo}
                jugadores={equipoJugadores}
                tema={tema}
            />
        </div>
    );
};

export default TorneoDetalle;

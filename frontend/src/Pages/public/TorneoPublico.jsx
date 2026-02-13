import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Trophy, Calendar, MapPin, Award,
    Zap, Users, Target, GitBranch, TrendingUp,
    ChevronRight, Activity, Info
} from 'lucide-react';
import TorneoBracket from "../../components/TorneoBracket";
import "../../css/home.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";

const TEMAS_TORNEO = {
    futbol: {
        nombre: "Fútbol",
        colorPrimario: "#22c55e",
        gradiente: "linear-gradient(135deg, #22c55e, #16a34a)",
        icono: "⚽",
        emoji: "🌟",
    },
    baloncesto: {
        nombre: "Baloncesto",
        colorPrimario: "#f97316",
        gradiente: "linear-gradient(135deg, #f97316, #ea580c)",
        icono: "🏀",
        emoji: "🔥",
    },
    voleibol: {
        nombre: "Voleibol",
        colorPrimario: "#3b82f6",
        gradiente: "linear-gradient(135deg, #3b82f6, #2563eb)",
        icono: "🏐",
        emoji: "💫",
    },
    tenis: {
        nombre: "Tenis",
        colorPrimario: "#eab308",
        gradiente: "linear-gradient(135deg, #eab308, #ca8a04)",
        icono: "🎾",
        emoji: "⭐",
    },
    default: {
        nombre: "Torneo",
        colorPrimario: "#38bdf8",
        gradiente: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
        icono: "🏆",
        emoji: "✨",
    },
};

const getTemaDeporte = (nombreDeporte) => {
    if (!nombreDeporte) return TEMAS_TORNEO.default;
    const nombre = nombreDeporte.toLowerCase();
    if (nombre.includes("futbol") || nombre.includes("fútbol") || nombre.includes("soccer")) return TEMAS_TORNEO.futbol;
    if (nombre.includes("baloncesto") || nombre.includes("básquet") || nombre.includes("basket")) return TEMAS_TORNEO.baloncesto;
    if (nombre.includes("volei") || nombre.includes("vóley")) return TEMAS_TORNEO.voleibol;
    if (nombre.includes("tenis")) return TEMAS_TORNEO.tenis;
    return TEMAS_TORNEO.default;
};

const TorneoPublico = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [torneo, setTorneo] = useState(null);
    const [equipos, setEquipos] = useState([]);
    const [partidos, setPartidos] = useState([]);
    const [goleadores, setGoleadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posiciones");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token"); // Optional
            const headers = { "Content-Type": "application/json", Accept: "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const [torneoResp, equiposResp, partidosResp, goleadoresResp] = await Promise.all([
                fetch(`${API_BASE}/torneos/${id}`, { headers }),
                fetch(`${API_BASE}/equipos?torneo_id=${id}`, { headers }),
                fetch(`${API_BASE}/partidos?torneo_id=${id}`, { headers }),
                fetch(`${API_BASE}/estadisticas/torneo/${id}`, { headers }),
            ]);

            const torneoData = await torneoResp.json();
            const equiposData = await equiposResp.json();
            const partidosData = await partidosResp.json();
            const goleadoresData = await goleadoresResp.json();

            setTorneo(torneoData);
            setEquipos(Array.isArray(equiposData) ? equiposData : equiposData.data || []);
            setPartidos(Array.isArray(partidosData) ? partidosData : partidosData.data || []);
            setGoleadores(goleadoresData.resumen || []);
        } catch (err) {
            console.error("Error loading tournament data:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const tema = useMemo(() => getTemaDeporte(torneo?.deporte?.nombre), [torneo]);

    const tablaPosiciones = useMemo(() => {
        const tabla = {};
        equipos.forEach(e => {
            tabla[e.id] = { id: e.id, nombre: e.nombre, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        });

        partidos.filter(p => p.estado === 'Finalizado').forEach(p => {
            const l = p.equipo_local_id;
            const v = p.equipo_visitante_id;
            const gl = p.marcador_local || 0;
            const gv = p.marcador_visitante || 0;

            if (tabla[l] && tabla[v]) {
                tabla[l].pj++; tabla[v].pj++;
                tabla[l].gf += gl; tabla[l].gc += gv;
                tabla[v].gf += gv; tabla[v].gc += gl;

                if (gl > gv) { tabla[l].pg++; tabla[l].pts += 3; tabla[v].pp++; }
                else if (gl < gv) { tabla[v].pg++; tabla[v].pts += 3; tabla[l].pp++; }
                else { tabla[l].pe++; tabla[v].pe++; tabla[l].pts += 1; tabla[v].pts += 1; }
            }
        });

        return Object.values(tabla).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc));
    }, [equipos, partidos]);

    if (loading) return <div className="home-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-screen" style={{ color: '#fff' }}>Cargando Torneo...</div></div>;

    return (
        <div className="home-wrapper">
            <nav className="navbar scrolled">
                <div className="nav-content">
                    <div className="brand" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
                        <div className="brand-icon">
                            <img src="/img/logo-ueb.png" alt="Logo UEB" className="brand-logo-img" />
                        </div>
                    </div>
                </div>
            </nav>
            <div className="hero-bg" style={{ background: tema.gradiente, opacity: 0.1, position: 'fixed', inset: 0, filter: 'blur(100px)' }}></div>

            <div className="container" style={{ paddingTop: '8.5rem', paddingBottom: '4rem', position: 'relative', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} className="nav-btn" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                    <ArrowLeft size={20} /> Volver
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    <div style={{
                        width: 120, height: 120, borderRadius: 32,
                        background: tema.gradiente,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 20px 50px ${tema.colorPrimario}44`,
                        fontSize: '4rem', color: '#fff'
                    }}>
                        {tema.icono}
                    </div>
                    <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '0.75rem' }}>
                            <span style={{
                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                background: tema.colorPrimario + '22', color: tema.colorPrimario, border: `1px solid ${tema.colorPrimario}44`
                            }}>
                                {torneo?.estado}
                            </span>
                            <span style={{
                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {torneo?.deporte?.nombre}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '3.5rem', margin: 0, lineHeight: 1.1, fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>{torneo?.nombre}</h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.25rem', marginTop: '0.5rem', fontWeight: 500 }}>
                            {torneo?.categoria?.nombre} • {torneo?.ubicacion || 'Sede del Torneo'}
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '10px',
                    scrollbarWidth: 'none', msOverflowStyle: 'none'
                }}>
                    {[
                        { id: 'posiciones', label: 'Tabla de Posiciones', icon: Award },
                        { id: 'partidos', label: 'Calendario y Resultados', icon: Zap },
                        { id: 'goleadores', label: 'Máximos Anotadores', icon: Target },
                        { id: 'brackets', label: 'Fase de Eliminatorias', icon: GitBranch },
                        { id: 'info', label: 'Información', icon: Info }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                padding: '12px 24px',
                                background: activeTab === t.id ? tema.gradiente : 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '14px',
                                color: activeTab === t.id ? '#fff' : '#94a3b8',
                                fontWeight: activeTab === t.id ? 700 : 500,
                                display: 'flex', alignItems: 'center', gap: '10px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                boxShadow: activeTab === t.id ? `0 10px 20px ${tema.colorPrimario}33` : 'none'
                            }}
                        >
                            <t.icon size={18} /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="tab-content fade-enter">
                    {activeTab === 'posiciones' && (
                        <div className="pro-card" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                            <table className="glass-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Pos</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Equipo</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>PJ</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>GF</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>GC</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>DG</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tablaPosiciones.map((e, i) => (
                                        <tr key={e.id} style={{ background: i < 3 ? `rgba(255,255,255,0.03)` : 'transparent', borderRadius: '12px' }}>
                                            <td style={{ padding: '16px', textAlign: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>{e.nombre}</td>
                                            <td style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>{e.pj}</td>
                                            <td style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>{e.gf}</td>
                                            <td style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>{e.gc}</td>
                                            <td style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: (e.gf - e.gc) > 0 ? '#22c55e' : (e.gf - e.gc) < 0 ? '#ef4444' : '#94a3b8' }}>{e.gf - e.gc}</td>
                                            <td style={{ padding: '16px', textAlign: 'center', fontWeight: 900, color: tema.colorPrimario, fontSize: '1.5rem' }}>{e.pts}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {tablaPosiciones.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No hay datos suficientes para mostrar la tabla.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'partidos' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {partidos.map(p => {
                                const localName = equipos.find(e => e.id === p.equipo_local_id)?.nombre || "Local";
                                const visitName = equipos.find(e => e.id === p.equipo_visitante_id)?.nombre || "Visitante";
                                return (
                                    <div key={p.id} className="pro-card match-card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px', transition: 'all 0.3s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                <Calendar size={14} /> {new Date(p.fecha).toLocaleDateString()}
                                            </div>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: '10px',
                                                background: p.estado === 'Finalizado' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                                color: p.estado === 'Finalizado' ? '#22c55e' : '#94a3b8'
                                            }}>{p.estado.toUpperCase()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1, textAlign: 'right', fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{localName}</div>
                                            <div style={{
                                                padding: '8px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                                                fontSize: '1.8rem', fontWeight: 900, color: tema.colorPrimario,
                                                minWidth: '100px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {p.marcador_local ?? '-'} : {p.marcador_visitante ?? '-'}
                                            </div>
                                            <div style={{ flex: 1, textAlign: 'left', fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{visitName}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {partidos.length === 0 && <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', gridColumn: '1/-1' }}>No hay partidos programados.</div>}
                        </div>
                    )}

                    {activeTab === 'goleadores' && (
                        <div className="pro-card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '1.5rem' }}>
                            <table className="glass-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>Rank</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Jugador</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Equipo</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>PJ</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Goles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {goleadores.map((g, i) => (
                                        <tr key={g.jugador_cedula} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '16px', textAlign: 'center', fontWeight: 900, color: i === 0 ? tema.colorPrimario : '#fff' }}>{i + 1}</td>
                                            <td style={{ padding: '16px', fontWeight: 700, color: '#fff' }}>{g.nombre_jugador}</td>
                                            <td style={{ padding: '16px', color: '#94a3b8' }}>{g.equipo_nombre}</td>
                                            <td style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>{g.pj}</td>
                                            <td style={{ padding: '16px', textAlign: 'center', fontWeight: 900, color: tema.colorPrimario, fontSize: '1.6rem' }}>{g.goles}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {goleadores.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Las estadísticas se mostrarán conforme avance el torneo.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'brackets' && (
                        <div className="pro-card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', borderRadius: '24px', padding: '2rem' }}>
                            <TorneoBracket equipos={equipos} partidos={partidos} tema={tema} />
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div className="pro-card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: tema.colorPrimario }}><Calendar size={20} /> Fecha de Inicio</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{new Date(torneo?.fecha_inicio).toLocaleDateString() || 'Por confirmar'}</p>
                            </div>
                            <div className="pro-card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: tema.colorPrimario }}><MapPin size={20} /> Ubicación</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{torneo?.ubicacion || 'Sede por confirmar'}</p>
                            </div>
                            <div className="pro-card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px', gridColumn: '1 / -1' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: tema.colorPrimario }}><Info size={20} /> Descripción del Evento</h3>
                                <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '1.1rem' }}>
                                    {torneo?.descripcion || 'Bienvenido al campeonato oficial. Aquí podrás seguir todos los resultados en tiempo real, ver la tabla de goleadores y el avance de las llaves de eliminación directa.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="section" style={{ textAlign: 'center', borderTop: '1px solid var(--glass-border)', padding: '4rem 1rem', marginTop: '4rem' }}>
                <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '60px', marginBottom: '1.5rem', borderRadius: '8px', objectFit: 'contain' }} />
                <p style={{ color: '#94a3b8' }}>&copy; 2025 Universidad Estatal de Bolívar</p>
            </footer>
        </div>
    );
};

export default TorneoPublico;

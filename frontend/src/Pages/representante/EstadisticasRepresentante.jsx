import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    TrendingUp,
    Users,
    Trophy,
    Activity,
    Award,
    Loader2,
    RefreshCw,
    Filter,
    BarChart3,
    UserCheck
} from "lucide-react";
import api from "../../api";
import "../../css/unified-all.css";

export default function EstadisticasRepresentante() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [equipos, setEquipos] = useState([]);
    const [equipoId, setEquipoId] = useState("");
    const [stats, setStats] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            // Cargar equipos
            const { data: eqs } = await api.get('/representante/equipos');
            const listaEquipos = Array.isArray(eqs) ? eqs : (eqs.data || []);
            setEquipos(listaEquipos);

            // Si no hay equipo seleccionado, seleccionamos el primero si hay
            let targetId = equipoId;
            if (!targetId && listaEquipos.length > 0) {
                targetId = listaEquipos[0].id;
                setEquipoId(targetId);
            }

            if (targetId) {
                const { data: statistics } = await api.get(`/representante/equipos/${targetId}/estadisticas`);
                setStats(statistics);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setError("Error al cargar estadísticas.");
            setLoading(false);
        }
    }, [equipoId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

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
                    <RefreshCw size={24} className="animate-spin" color="var(--primary-ocean)" />
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-muted)' }}>Analizando rendimiento...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade">
            <header className="rep-header-main" style={{ marginBottom: '2.5rem' }}>
                <div className="header-info">
                    <small className="university-label" style={{ fontWeight: '700', letterSpacing: '0.5px', color: 'var(--accent-teal)' }}>Analytics Deportivo</small>
                    <h1 className="content-title" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Estadísticas de Rendimiento</h1>
                    <p className="content-subtitle" style={{ color: '#cbd5e1' }}>Métricas y análisis de resultados de tus equipos</p>
                </div>
                <div className="header-actions">
                    <div style={{ position: 'relative' }}>
                        <select
                            className="pro-input"
                            style={{ ...inputStyle, paddingRight: '2.5rem', width: '250px' }}
                            value={equipoId}
                            onChange={e => setEquipoId(e.target.value)}
                        >
                            {equipos.map(eq => (
                                <option key={eq.id} value={eq.id} style={{ color: '#333' }}>{eq.nombre}</option>
                            ))}
                        </select>
                        <Filter size={16} color="#94a3b8" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                </div>
            </header>

            {(!equipoId && !loading) ? (
                <div className="rep-card-premium text-center py-20" style={{ ...glassCardStyle, padding: '5rem', borderStyle: 'dashed' }}>
                    <Trophy size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2, color: '#fff' }} />
                    <h3 style={{ color: '#fff', fontWeight: 800 }}>No hay datos disponibles</h3>
                    <p style={{ color: '#94a3b8' }}>Registra un equipo para comenzar a ver métricas.</p>
                </div>
            ) : (
                <>
                    {/* KPI Section */}
                    <div className="stats-grid-kpi mb-8" style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        <div className="stat-card rep-card-premium" style={{ ...glassCardStyle, borderTop: '4px solid #10b981' }}>
                            <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Goles a Favor</h3>
                                <Activity size={20} color="#10b981" />
                            </div>
                            <p className="stat-value" style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{stats?.golesFavor}</p>
                            <p className="stat-desc" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Promedio {stats?.promedioGoles} p/m</p>
                        </div>

                        <div className="stat-card rep-card-premium" style={{ ...glassCardStyle, borderTop: '4px solid #f59e0b' }}>
                            <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Posición</h3>
                                <Award size={20} color="#f59e0b" />
                            </div>
                            <p className="stat-value" style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>#{stats?.posicion}</p>
                            <p className="stat-desc" style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>En zona de clasificación</p>
                        </div>
                    </div>

                    <div className="dashboard-main-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>

                        {/* LEFT COL */}
                        <div className="dashboard-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Balance Chart */}
                            <div className="rep-card-premium" style={{ ...glassCardStyle, padding: '2rem' }}>
                                <h2 className="section-title" style={{ color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                    <BarChart3 size={24} color="#60a5fa" /> Balance de Encuentros
                                </h2>
                                <div className="match-balance-visual" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1rem 0' }}>
                                    <div className="balance-item" style={{ textAlign: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)' }}>
                                            {stats?.ganados}
                                        </div>
                                        <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Ganados</span>
                                    </div>
                                    <div className="balance-item" style={{ textAlign: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', background: 'rgba(148, 163, 184, 0.1)' }}>
                                            {stats?.empatados}
                                        </div>
                                        <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Empatados</span>
                                    </div>
                                    <div className="balance-item" style={{ textAlign: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)' }}>
                                            {stats?.perdidos}
                                        </div>
                                        <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Perdidos</span>
                                    </div>
                                </div>
                            </div>

                            {/* Top Scorers */}
                            <div className="rep-card-premium" style={{ ...glassCardStyle }}>
                                <h2 className="section-title" style={{ color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <Trophy size={24} color="#f59e0b" /> Top Goleadores
                                </h2>
                                <div className="top-scorers-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {stats?.topGoleadores.map((sc, i) => (
                                        <div key={i} className="scorer-item" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem 1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="scorer-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span className="scorer-rank" style={{ width: '30px', height: '30px', background: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{i + 1}</span>
                                                <span className="scorer-name" style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{sc.nombre}</span>
                                            </div>
                                            <div className="scorer-stats" style={{ textAlign: 'right' }}>
                                                <span className="scorer-goals" style={{ color: '#60a5fa', fontWeight: 900, fontSize: '1.1rem', display: 'block' }}>{sc.goles} Goles</span>
                                                <small style={{ color: '#94a3b8', fontWeight: 600 }}>{sc.partidos} PJ</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COL */}
                        <div className="dashboard-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="rep-card-premium" style={{ ...glassCardStyle }}>
                                <h2 className="section-title" style={{ color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <Award size={22} color="#ec4899" /> Logros
                                </h2>
                                <div className="achievements-mini-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="achievement-item" style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div className="ach-icon" style={{ width: '40px', height: '40px', background: '#f97316', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Trophy size={18} /></div>
                                        <div className="ach-text">
                                            <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>Valla Menos Batida</strong>
                                            <small style={{ color: '#fbbf24', fontWeight: 600 }}>Fase de Grupos</small>
                                        </div>
                                    </div>
                                    <div className="achievement-item" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', opacity: 0.6 }}>
                                        <div className="ach-icon" style={{ width: '40px', height: '40px', background: '#475569', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Award size={18} /></div>
                                        <div className="ach-text">
                                            <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>Mención Fair Play</strong>
                                            <small style={{ color: '#94a3b8' }}>Por desbloquear</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rep-card-premium" style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', border: 'none', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                                <h2 className="section-title" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
                                    <Activity size={22} color="rgba(255,255,255,0.9)" /> Proyecciones
                                </h2>
                                <p className="small mt-4" style={{ opacity: 0.95, lineHeight: 1.6, fontWeight: 500 }}>
                                    Basado en el rendimiento actual, el equipo tiene un <strong style={{ color: '#fff', textDecoration: 'underline' }}>85% de probabilidad</strong> de clasificar directamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

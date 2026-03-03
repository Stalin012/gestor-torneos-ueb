import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Loader2,
    AlertCircle,
    RefreshCcw,
    Calendar,
    Clock,
    MapPin,
    Search,
    CheckCircle2,
    Trophy
} from "lucide-react";
import api from "../../api";
import "../../css/unified-all.css";

export default function PartidosRepresentante() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [partidos, setPartidos] = useState([]);
    const [q, setQ] = useState("");

    const fetchPartidos = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const { data } = await api.get('/representante/partidos');
            setPartidos(Array.isArray(data) ? data : (data.data || []));

        } catch (e) {
            console.error(e);
            setError("No se pudieron cargar los partidos. Verifique su conexión.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPartidos();
    }, [fetchPartidos]);

    const filtered = useMemo(() => {
        const term = q.toLowerCase();
        return partidos.filter(p =>
            p.equipo_local?.nombre?.toLowerCase().includes(term) ||
            p.equipo_visitante?.nombre?.toLowerCase().includes(term) ||
            p.torneo?.nombre?.toLowerCase().includes(term)
        );
    }, [partidos, q]);

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

    if (loading) return (
        <div className="rep-scope rep-screen-container rep-loading-container" style={{ flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RefreshCcw size={24} className="animate-spin" color="var(--primary-ocean)" />
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-muted)' }}>Buscando resultados y encuentros...</p>
            </div>
        </div>
    );

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade">
            <header className="rep-header-main" style={{ marginBottom: '2.5rem' }}>
                <div className="header-info">
                    <small className="university-label" style={{ fontWeight: '700', letterSpacing: '0.5px', color: 'var(--accent-teal)' }}>Calendario de Juego</small>
                    <h1 className="content-title" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', margin: '0 0 0.5rem 0' }}>Gestión de Partidos</h1>
                    <p className="content-subtitle" style={{ color: '#cbd5e1' }}>Encuentros programados y resultados de tus equipos</p>
                </div>
                <div className="header-actions">
                    <button onClick={fetchPartidos} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <RefreshCcw size={18} /> Actualizar Resultados
                    </button>
                </div>
            </header>

            {partidos.length === 0 && !loading && (
                <div className="fade-in" style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd',
                    padding: '1.25rem 2rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontWeight: '600'
                }}>
                    <Calendar size={24} /> No tienes encuentros programados actualmente.
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <div className="rep-card-premium mb-8" style={{ ...glassCardStyle, padding: '1.5rem 2.5rem' }}>
                <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 className="section-title" style={{ color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                        <Clock size={22} color="#60a5fa" /> Filtrar Encuentros
                    </h2>
                    <div className="search-box" style={{ ...inputStyle, width: '350px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            placeholder="Buscar por equipo o torneo..."
                            className="pro-input"
                            style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }}
                            value={q}
                            onChange={e => setQ(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="matches-results-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filtered.length > 0 ? (
                    filtered.map((p, idx) => (
                        <div key={idx} className="rep-card-premium match-card-premium" style={{
                            ...glassCardStyle,
                            borderLeft: p.estado === 'Finalizado' ? '6px solid #10B981' : '6px solid #3B82F6',
                            padding: '1.5rem 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1.5rem',
                            transition: 'all 0.3s ease'
                        }}>
                            {/* Lado Izquierdo: Equipos y Torneo */}
                            <div style={{ flex: '1 1 400px', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ minWidth: '140px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                                        <Trophy size={14} />
                                        {p.torneo?.nombre || p.torneo}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid rgba(59, 130, 246, 0.3)' }}>{p.equipo_local?.nombre?.[0]}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Local</div>
                                        </div>
                                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>V S</div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid rgba(236, 72, 153, 0.3)' }}>{p.equipo_visitante?.nombre?.[0]}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Visitante</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', marginBottom: '4px' }}>
                                        {p.equipo_local?.nombre} vs {p.equipo_visitante?.nombre}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        <MapPin size={14} /> {p.sede || 'Sede por confirmar'}
                                    </div>
                                </div>
                            </div>

                            {/* Lado Derecho: Estado, Marcador y Fecha */}
                            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '2.5rem', minWidth: '300px', justifyContent: 'flex-end' }}>
                                {p.estado === 'Finalizado' && (
                                    <div style={{ textAlign: 'center', padding: '0.5rem 1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '4px' }}>
                                            {p.goles_local || 0} - {p.goles_visitante || 0}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>Resultado Final</div>
                                    </div>
                                )}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '0.35rem 0.85rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        marginBottom: '0.75rem',
                                        background: p.estado === 'Finalizado' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        color: p.estado === 'Finalizado' ? '#10b981' : '#60a5fa',
                                        border: `1px solid ${p.estado === 'Finalizado' ? '#10b981' : '#3B82F6'}40`
                                    }}>
                                        {p.estado === 'Finalizado' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                        {p.estado}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 800, fontSize: '0.9rem', justifyContent: 'flex-end' }}>
                                            <Calendar size={14} /> {p.fecha}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: (p.hora && p.hora !== '--:--') ? '#94a3b8' : '#f59e0b', fontSize: '0.8rem', justifyContent: 'flex-end' }}>
                                            <Clock size={14} /> {p.hora || '--:--'}
                                        </div>
                                        {(!p.hora || p.hora === '--:--') && (
                                            <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700, fontStyle: 'italic', marginTop: '2px' }}>
                                                Este encuentro aún no tiene horario confirmado
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rep-card-premium text-center py-20 w-full" style={{ ...glassCardStyle, gridColumn: '1 / -1', padding: '5rem', borderStyle: 'dashed' }}>
                        <Calendar size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2, color: '#fff' }} />
                        <h3 style={{ color: '#fff', fontWeight: 800 }}>No se encontraron registros de partidos</h3>
                        <p style={{ color: '#94a3b8' }}>Asegúrate de estar inscrito en un torneo activo</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .match-card-premium {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .match-card-premium:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
                }
            `}} />
        </div>
    );
}

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
                </div>
                <div className="header-actions">
                    <button onClick={fetchPartidos} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <RefreshCcw size={18} /> Actualizar Resultados
                    </button>
                </div>
            </header>

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

            <div className="matches-results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2.5rem' }}>
                {filtered.length > 0 ? (
                    filtered.map((p, idx) => (
                        <div key={idx} className="rep-card-premium match-card-premium" style={{
                            ...glassCardStyle,
                            borderLeft: p.estado === 'Finalizado' ? '6px solid #10B981' : '6px solid #3B82F6',
                            padding: '2rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div className="match-card-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="match-tournament" style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <Trophy size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                    {p.torneo?.nombre || p.torneo}
                                </span>
                                <span className="badge-pill" style={{
                                    background: p.estado === 'Finalizado' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                    color: p.estado === 'Finalizado' ? '#34d399' : '#60a5fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    border: '1px solid currentColor'
                                }}>
                                    {p.estado === 'Finalizado' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                    {p.estado}
                                </span>
                            </div>

                            <div className="match-card-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <div className="match-team local" style={{ flex: 1, textAlign: 'center' }}>
                                    <div className="team-icon" style={{
                                        width: '64px',
                                        height: '64px',
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        color: '#fff',
                                        margin: '0 auto 12px',
                                        borderRadius: '18px',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 900,
                                        fontSize: '1.4rem'
                                    }}>{p.equipo_local?.nombre?.[0]}</div>
                                    <span className="team-name" style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>{p.equipo_local?.nombre || 'Local'}</span>
                                </div>

                                <div className="match-score" style={{ flex: 0.6, textAlign: 'center' }}>
                                    {p.estado === 'Finalizado' ? (
                                        <div className="score-display" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>
                                            <span>{p.goles_local || 0}</span>
                                            <span style={{ color: '#64748b', fontSize: '1.2rem' }}>:</span>
                                            <span>{p.goles_visitante || 0}</span>
                                        </div>
                                    ) : (
                                        <div className="vs-label" style={{ color: '#60a5fa', fontSize: '1.4rem', fontWeight: 900, opacity: 0.5, fontStyle: 'italic' }}>VS</div>
                                    )}
                                </div>

                                <div className="match-team visitante" style={{ flex: 1, textAlign: 'center' }}>
                                    <div className="team-icon" style={{
                                        width: '64px',
                                        height: '64px',
                                        background: 'linear-gradient(135deg, #ec4899, #db2777)',
                                        color: '#fff',
                                        margin: '0 auto 12px',
                                        borderRadius: '18px',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 900,
                                        fontSize: '1.4rem'
                                    }}>{p.equipo_visitante?.nombre?.[0]}</div>
                                    <span className="team-name" style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>{p.equipo_visitante?.nombre || 'Visitante'}</span>
                                </div>
                            </div>

                            <div className="match-card-footer" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                                <div className="match-info-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}>
                                    <Calendar size={16} color="#60a5fa" />
                                    <span>{p.fecha}</span>
                                </div>
                                <div className="match-info-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}>
                                    <MapPin size={16} color="#fbbf24" />
                                    <span>{p.sede || 'Por definir'}</span>
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

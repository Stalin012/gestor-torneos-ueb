// resources/js/pages/representante/PartidosRepresentante.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Loader2,
    AlertCircle,
    RefreshCcw,
    Trophy,
    Calendar,
    Clock,
    MapPin,
    ChevronRight,
    TrendingUp,
    Search,
    CheckCircle2,
    XCircle
} from "lucide-react";
import "../../../css/representante_dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function PartidosRepresentante() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [partidos, setPartidos] = useState([]);
    const [q, setQ] = useState("");

    const fetchPartidos = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const res = await fetch(`${API_BASE}/representante/partidos`, { headers });
            if (res.status === 401) window.location.href = "/login";
            if (!res.ok) throw new Error("Error al obtener partidos.");
            const data = await res.json();
            setPartidos(data || []);
        } catch (e) {
            setError(e.message);
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

    if (loading) return (
        <div className="rep-loading-container">
            <Loader2 className="animate-spin" size={48} />
        </div>
    );

    return (
        <div className="rep-scope rep-dashboard-fade">
            <header className="rep-header-main">
                <div className="header-info">
                    <small className="university-label">Competición UEB</small>
                    <h1 className="content-title">Historial de Partidos</h1>
                    <p className="content-subtitle">Resultados y programación de tus equipos</p>
                </div>
                <div className="header-actions">
                    <button onClick={fetchPartidos} className="btn-outline">
                        <RefreshCcw size={16} /> Actualizar
                    </button>
                </div>
            </header>

            <div className="rep-card-premium mb-6">
                <div className="card-header-flex">
                    <h2 className="section-title"><Clock size={20} color="#3b82f6" /> Buscar Partidos</h2>
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            placeholder="Filtrar por equipo o torneo..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="matches-results-grid">
                {filtered.length > 0 ? (
                    filtered.map((p, idx) => (
                        <div key={idx} className="match-card-premium">
                            <div className="match-card-header">
                                <span className="match-tournament">{p.torneo?.nombre || p.torneo}</span>
                                <span className={`match-status-pill ${p.estado?.toLowerCase()}`}>
                                    {p.estado === 'Finalizado' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                    {p.estado}
                                </span>
                            </div>

                            <div className="match-card-content">
                                <div className="match-team local">
                                    <div className="team-icon">{p.equipo_local?.nombre?.[0]}</div>
                                    <span className="team-name">{p.equipo_local?.nombre || 'Local'}</span>
                                </div>

                                <div className="match-score">
                                    {p.estado === 'Finalizado' ? (
                                        <div className="score-display">
                                            <span>{p.goles_local || 0}</span>
                                            <small>-</small>
                                            <span>{p.goles_visitante || 0}</span>
                                        </div>
                                    ) : (
                                        <div className="vs-label">VS</div>
                                    )}
                                </div>

                                <div className="match-team visitante">
                                    <div className="team-icon">{p.equipo_visitante?.nombre?.[0]}</div>
                                    <span className="team-name">{p.equipo_visitante?.nombre || 'Visitante'}</span>
                                </div>
                            </div>

                            <div className="match-card-footer">
                                <div className="match-info-box">
                                    <Calendar size={14} />
                                    <span>{p.fecha}</span>
                                </div>
                                <div className="match-info-box">
                                    <MapPin size={14} />
                                    <span>{p.sede || 'PD'}</span>
                                </div>
                            </div>

                            <div className="match-card-accent"></div>
                        </div>
                    ))
                ) : (
                    <div className="rep-card-premium text-center py-20 w-full" style={{ gridColumn: '1 / -1' }}>
                        <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500">No se encontraron partidos</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .matches-results-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
            gap: 24px; 
        }
        
        .match-card-premium {
            background: white;
            border-radius: 20px;
            padding: 24px;
            border: 1px solid #f1f5f9;
            box-shadow: 0 10px 25px rgba(0,0,0,0.02);
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .match-card-premium:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.06);
            border-color: #3b82f6;
        }
        
        .match-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .match-tournament { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .match-status-pill { 
            display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 20px;
        }
        .match-status-pill.finalizado { background: #dcfce7; color: #10b981; }
        .match-status-pill.programado { background: #eff6ff; color: #3b82f6; }
        
        .match-card-content { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .match-team { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .match-team .team-icon { width: 48px; height: 48px; background: #f8fafc; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #3b82f6; font-size: 1.2rem; border: 1px solid #e2e8f0; }
        .match-team .team-name { font-weight: 700; color: #1e293b; font-size: 0.85rem; text-align: center; }
        
        .match-score { flex: 0.5; display: flex; justify-content: center; }
        .score-display { display: flex; align-items: center; gap: 8px; font-size: 1.8rem; font-weight: 900; color: #0f172a; }
        .score-display small { font-size: 1rem; color: #cbd5e1; }
        .vs-label { font-size: 1rem; font-weight: 900; font-style: italic; color: #cbd5e1; }
        
        .match-card-footer { display: flex; border-top: 1px solid #f1f5f9; padding-top: 16px; justify-content: space-between; }
        .match-info-box { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 0.75rem; font-weight: 600; }
        
        .match-card-accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #3b82f6; opacity: 0; transition: opacity 0.3s; }
        .match-card-premium:hover .match-card-accent { opacity: 1; }
      `}} />
        </div>
    );
}

// resources/js/pages/representante/EstadisticasRepresentante.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    TrendingUp,
    Users,
    Trophy,
    Activity,
    Award,
    ChevronRight,
    Loader2,
    AlertTriangle,
    RefreshCw,
    Search,
    Filter,
    BarChart3,
    PieChart,
    UserCheck
} from "lucide-react";
import "../../../css/representante_dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

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
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Cargar equipos
            const eqsRes = await fetch(`${API_BASE}/representante/equipos`, { headers });
            if (eqsRes.status === 401) window.location.href = "/login";
            const eqs = eqsRes.ok ? await eqsRes.json() : [];
            setEquipos(eqs);

            // Si no hay equipo seleccionado, seleccionamos el primero si hay
            let targetId = equipoId;
            if (!targetId && eqs.length > 0) {
                targetId = eqs[0].id;
                setEquipoId(targetId);
            }

            if (targetId) {
                // En un escenario real, tendrías un endpoint dedicado: /api/representante/equipo/{id}/estadisticas
                // Por ahora simularemos datos basados en lo que tenemos o usaremos un endpoint genérico si existiera.
                // Simularemos una respuesta exitosa con datos de prueba realistas para la Universidad

                setTimeout(() => {
                    setStats({
                        ganados: 5,
                        empatados: 2,
                        perdidos: 1,
                        golesFavor: 18,
                        golesContra: 9,
                        posicion: 3,
                        promedioGoles: 2.2,
                        rendimiento: 68,
                        topGoleadores: [
                            { nombre: "Carlos Ruiz", goles: 8, partidos: 8 },
                            { nombre: "Mario Santos", goles: 5, partidos: 7 },
                            { nombre: "Luis Vaca", goles: 3, partidos: 8 }
                        ],
                        asistencia: 94
                    });
                    setLoading(false);
                }, 800);
            } else {
                setLoading(false);
            }
        } catch (e) {
            setError("Error al cargar estadísticas.");
            setLoading(false);
        }
    }, [equipoId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="rep-loading-container">
                <Loader2 className="animate-spin" size={48} />
                <p>Analizando rendimiento deportivo...</p>
            </div>
        );
    }

    return (
        <div className="rep-scope rep-dashboard-fade">
            <header className="rep-header-main">
                <div className="header-info">
                    <small className="university-label">Analytics Deportivo UEB</small>
                    <h1 className="content-title">Estadísticas de Rendimiento</h1>
                    <p className="content-subtitle">Métricas y análisis de resultados de tus equipos</p>
                </div>
                <div className="header-actions">
                    <select
                        className="rep-select-premium"
                        value={equipoId}
                        onChange={e => setEquipoId(e.target.value)}
                    >
                        {equipos.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                        ))}
                    </select>
                </div>
            </header>

            {(!equipoId && !loading) ? (
                <div className="rep-card-premium text-center py-20">
                    <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Registra un equipo para ver estadísticas</p>
                </div>
            ) : (
                <>
                    {/* KPI Section */}
                    <div className="stats-grid-kpi mb-6">
                        <div className="stat-card kpi-info">
                            <div className="stat-card-header">
                                <h3>Rendimiento</h3>
                                <TrendingUp size={18} />
                            </div>
                            <p className="stat-value">{stats?.rendimiento}%</p>
                            <div className="perf-bar-bg mt-2" style={{ height: '6px' }}>
                                <div className="perf-bar-fill" style={{ width: `${stats?.rendimiento}%`, background: '#3b82f6' }}></div>
                            </div>
                            <div className="card-decoration" style={{ background: '#3b82f6' }}></div>
                        </div>
                        <div className="stat-card kpi-info">
                            <div className="stat-card-header">
                                <h3>Goles a Favor</h3>
                                <Activity size={18} />
                            </div>
                            <p className="stat-value">{stats?.golesFavor}</p>
                            <p className="stat-desc">Promedio {stats?.promedioGoles} p/m</p>
                            <div className="card-decoration" style={{ background: '#10b981' }}></div>
                        </div>
                        <div className="stat-card kpi-info">
                            <div className="stat-card-header">
                                <h3>Posición en Tabla</h3>
                                <Award size={18} />
                            </div>
                            <p className="stat-value">#{stats?.posicion}</p>
                            <p className="stat-desc">En zona de clasificación</p>
                            <div className="card-decoration" style={{ background: '#f59e0b' }}></div>
                        </div>
                        <div className="stat-card kpi-info">
                            <div className="stat-card-header">
                                <h3>Asistencia</h3>
                                <UserCheck size={18} />
                            </div>
                            <p className="stat-value">{stats?.asistencia}%</p>
                            <p className="stat-desc">Compromiso del equipo</p>
                            <div className="card-decoration" style={{ background: '#8b5cf6' }}></div>
                        </div>
                    </div>

                    <div className="dashboard-main-layout">
                        <div className="dashboard-col-left">
                            <div className="rep-card-premium">
                                <h2 className="section-title"><BarChart3 size={20} color="#3b82f6" /> Balance de Partidos</h2>
                                <div className="match-balance-visual mt-6">
                                    <div className="balance-item">
                                        <div className="balance-circle" style={{ borderColor: '#10b981' }}>{stats?.ganados}</div>
                                        <span>Ganados</span>
                                    </div>
                                    <div className="balance-item">
                                        <div className="balance-circle" style={{ borderColor: '#94a3b8' }}>{stats?.empatados}</div>
                                        <span>Empatados</span>
                                    </div>
                                    <div className="balance-item">
                                        <div className="balance-circle" style={{ borderColor: '#ef4444' }}>{stats?.perdidos}</div>
                                        <span>Perdidos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rep-card-premium mt-6">
                                <h2 className="section-title"><PieChart size={20} color="#10b981" /> Top Goleadores</h2>
                                <div className="top-scorers-list mt-4">
                                    {stats?.topGoleadores.map((sc, i) => (
                                        <div key={i} className="scorer-item">
                                            <div className="scorer-info">
                                                <span className="scorer-rank">{i + 1}</span>
                                                <span className="scorer-name">{sc.nombre}</span>
                                            </div>
                                            <div className="scorer-stats">
                                                <span className="scorer-goals">{sc.goles} Goles</span>
                                                <small className="muted">{sc.partidos} PJ</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-col-right">
                            <div className="rep-card-premium">
                                <h2 className="section-title"><Award size={18} /> Logros del Equipo</h2>
                                <div className="achievements-mini-list mt-4">
                                    <div className="achievement-item">
                                        <div className="ach-icon"><Trophy size={14} /></div>
                                        <div className="ach-text">
                                            <strong>Valla Menos Batida</strong>
                                            <small>Fase de Grupos</small>
                                        </div>
                                    </div>
                                    <div className="achievement-item opacity-40">
                                        <div className="ach-icon"><Award size={14} /></div>
                                        <div className="ach-text">
                                            <strong>Fair Play</strong>
                                            <small>Próximo desbloqueo</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rep-card-premium mt-6 bg-slate-900 text-white">
                                <h2 className="section-title text-white"><Activity size={18} /> Proyecciones</h2>
                                <p className="small mt-2 opacity-80">
                                    Basado en el rendimiento actual, el equipo tiene un 85% de probabilidad de clasificar a Octavos de Final.
                                </p>
                                <button className="btn-quick-action w-full mt-4 justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    Ver Simulación
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .rep-select-premium { 
            background: white; 
            border: 1px solid #e2e8f0; 
            padding: 10px 20px; 
            border-radius: 12px; 
            font-weight: 700; 
            color: #1e293b;
            box-shadow: 0 4px 10px rgba(0,0,0,0.03);
            outline: none;
            cursor: pointer;
        }
        
        .match-balance-visual { display: flex; justify-content: space-around; padding: 20px 0; }
        .balance-item { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .balance-circle { width: 60px; height: 60px; border-radius: 50%; border: 4px solid; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; color: #0f172a; }
        .balance-item span { font-size: 0.8rem; font-weight: 700; color: #64748b; }
        
        .top-scorers-list { display: flex; flexDirection: column; gap: 12px; }
        .scorer-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 12px; }
        .scorer-info { display: flex; align-items: center; gap: 15px; }
        .scorer-rank { width: 24px; height: 24px; background: #3b82f6; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; }
        .scorer-name { font-weight: 700; color: #1e293b; }
        .scorer-stats { text-align: right; display: flex; flexDirection: column; }
        .scorer-goals { font-weight: 800; color: #0f172a; font-size: 0.95rem; }
        
        .achievement-item { display: flex; gap: 12px; align-items: center; padding: 10px; }
        .ach-icon { width: 32px; height: 32px; background: #fef3c7; color: #d97706; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .ach-text strong { display: block; font-size: 0.85rem; color: #1e293b; }
        .ach-text small { font-size: 0.75rem; color: #64748b; }
      `}} />
        </div>
    );
}

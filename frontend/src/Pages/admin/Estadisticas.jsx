import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Filter, Search, ClipboardX, Trophy, Users, Zap, AlertCircle } from 'lucide-react';

import api from "../../api";
import LoadingScreen from "../../components/LoadingScreen";
import { StatCard } from "../../components/StatsComponents";

const Estadisticas = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/estadisticas');
                setStats(response.data?.data || response.data || []);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const totals = useMemo(() => {
        return stats.reduce((acc, curr) => ({
            goles: acc.goles + (curr.goles || 0),
            asistencias: acc.asistencias + (curr.asistencias || 0),
            amarillas: acc.amarillas + (curr.tarjetas_amarillas || 0),
            rojas: acc.rojas + (curr.tarjetas_rojas || 0)
        }), { goles: 0, asistencias: 0, amarillas: 0, rojas: 0 });
    }, [stats]);

    const filteredStats = stats.filter(stat =>
        stat.jugador?.persona?.nombres?.toLowerCase().includes(filter.toLowerCase()) ||
        stat.jugador?.persona?.apellidos?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <LoadingScreen message="PROCESANDO ANALÍTICA DE RENDIMIENTO..." />;

    return (
        <div className="admin-page-container module-entrance">
            {/* HEADER SECTION */}
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Analítica Deportiva</span>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0' }}>Estadísticas de Rendimiento</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Seguimiento detallado de desempeño individual y colectivo</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="pro-btn btn-primary">
                        <Filter size={18} /> Exportar Reporte
                    </button>
                </div>
            </header>

            {/* KPI SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Goles Totales" value={totals.goles} icon={Trophy} color="#10b981" />
                <StatCard title="Asistencias" value={totals.asistencias} icon={Zap} color="#356ed8" />
                <StatCard title="T. Amarillas" value={totals.amarillas} icon={AlertCircle} color="#f59e0b" />
                <StatCard title="T. Rojas" value={totals.rojas} icon={AlertCircle} color="#ef4444" />
            </div>

            <div className="pro-card">
                {/* TOOLBAR */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="header-search" style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: '1.25rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }} />
                        <input
                            className="pro-input"
                            style={{ paddingLeft: '3.5rem' }}
                            type="text"
                            placeholder="Buscar por nombre de jugador..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>

                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                        Resultados encontrados: <span style={{ color: '#fff' }}>{filteredStats.length}</span>
                    </div>
                </div>

                {/* TABLE */}
                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Encuentro</th>
                                <th style={{ textAlign: 'center' }}>Goles</th>
                                <th style={{ textAlign: 'center' }}>Asistencias</th>
                                <th style={{ textAlign: 'center' }}>Sanciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStats.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        <ClipboardX size={48} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                                        <p>No se encontraron registros estadísticos que coincidan</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStats.map(stat => (
                                    <tr key={stat.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'var(--primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 900
                                                }}>
                                                    {stat.jugador?.persona?.nombres?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#fff' }}>
                                                        {stat.jugador?.persona?.nombres} {stat.jugador?.persona?.apellidos}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {stat.jugador_cedula}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>PARTIDO #{stat.partido_id}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981',
                                                borderRadius: '8px',
                                                fontWeight: 900,
                                                minWidth: '35px'
                                            }}>
                                                {stat.goles}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{stat.asistencias}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                {stat.tarjetas_amarillas > 0 && (
                                                    <span style={{
                                                        width: '12px',
                                                        height: '18px',
                                                        background: '#f59e0b',
                                                        borderRadius: '2px',
                                                        boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)'
                                                    }} title={`Amarillas: ${stat.tarjetas_amarillas}`}></span>
                                                )}
                                                {stat.tarjetas_rojas > 0 && (
                                                    <span style={{
                                                        width: '12px',
                                                        height: '18px',
                                                        background: '#ef4444',
                                                        borderRadius: '2px',
                                                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                                                    }} title={`Rojas: ${stat.tarjetas_rojas}`}></span>
                                                )}
                                                {stat.tarjetas_amarillas === 0 && stat.tarjetas_rojas === 0 && (
                                                    <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>Limpio</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Estadisticas;

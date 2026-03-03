import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3, Filter, Search, ClipboardX, Trophy, Users, Zap, AlertCircle,
    Download, RefreshCw, Star, Activity, ArrowRight, User, Trash2
} from 'lucide-react';
import api from "../../api";
import LoadingScreen from "../../components/LoadingScreen";
import { getAssetUrl } from "../../utils/helpers";

// ================= HELPERS =====================
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="pro-card dashboard-fade" style={{
        padding: '1.5rem 2rem',
        borderRadius: '24px',
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        transition: '0.3s'
    }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</div>
        </div>
    </div>
);

// ================= MAIN COMPONENT =====================
const Estadisticas = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/estadisticas');
            setStats(response.data?.data || response.data || []);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro estadístico?")) return;
        try {
            await api.delete(`/estadisticas/${id}`);
            fetchStats();
        } catch (error) {
            console.error("Error deleting stat:", error);
            alert("Error al eliminar la estadística.");
        }
    };

    const totals = useMemo(() => {
        return stats.reduce((acc, curr) => ({
            goles: acc.goles + (curr.goles || 0),
            asistencias: acc.asistencias + (curr.asistencias || 0),
            amarillas: acc.amarillas + (curr.tarjetas_amarillas || 0),
            rojas: acc.rojas + (curr.tarjetas_rojas || 0)
        }), { goles: 0, asistencias: 0, amarillas: 0, rojas: 0 });
    }, [stats]);

    const filteredStats = useMemo(() => {
        return stats.filter(stat =>
            stat.jugador?.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stat.jugador?.persona?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stat.jugador_cedula?.includes(searchTerm)
        ).sort((a, b) => (b.goles || 0) - (a.goles || 0));
    }, [stats, searchTerm]);

    const handleExportCSV = () => {
        if (filteredStats.length === 0) return;

        const headers = ["Deportista", "Cedula", "Partido ID", "Goles", "Asistencias", "Amarillas", "Rojas", "Rebotes", "Bloqueos"];
        const rows = filteredStats.map(s => [
            `${s.jugador?.persona?.nombres} ${s.jugador?.persona?.apellidos}`,
            s.jugador_cedula,
            s.partido_id,
            s.goles || 0,
            s.asistencias || 0,
            s.tarjetas_amarillas || 0,
            s.tarjetas_rojas || 0,
            s.rebotes || 0,
            s.bloqueos || 0
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_estadisticas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <LoadingScreen message="Consolidando Analítica de Rendimiento..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* HEADER */}
            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div className="header-info">
                        <small className="university-label" style={{ color: '#10b981', fontWeight: 800 }}>Módulo de Inteligencia Deportiva</small>
                        <h1 className="content-title" style={{ color: '#fff', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                            <BarChart3 size={42} className="header-icon-main" color="#10b981" /> Desempeño & Analítica
                        </h1>
                        <p className="content-subtitle" style={{ color: '#94a3b8', fontSize: '1rem' }}>Seguimiento biométrico, efectividad táctica y registro de sanciones</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={fetchStats}
                            className="pro-btn btn-secondary"
                            style={{ padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                            disabled={loading}
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="pro-btn btn-primary"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.8rem 1.5rem', borderRadius: '14px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Download size={20} />
                            <span>Exportar Reporte</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* KPI GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Goles Totales" value={totals.goles} icon={Trophy} color="#10b981" />
                <StatCard title="Asistencias Clave" value={totals.asistencias} icon={Zap} color="#3b82f6" />
                <StatCard title="Expediente Amarillo" value={totals.amarillas} icon={AlertCircle} color="#f59e0b" />
                <StatCard title="Sanción Roja" value={totals.rojas} icon={AlertCircle} color="#ef4444" />
            </div>

            {/* SEARCH AND TABLES */}
            <div className="rep-content-wrapper">
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '2rem', flexWrap: 'wrap' }}>
                        <div className="search-wrapper" style={{ flex: 1, minWidth: '280px', margin: 0 }}>
                            <Search size={18} className="search-icon" style={{ color: '#10b981' }} />
                            <input
                                className="pro-input"
                                placeholder="Busca por nombre, apellido o cédula..."
                                style={{ paddingLeft: '3rem', height: '48px', borderRadius: '16px', width: '100%' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 800, whiteSpace: 'nowrap' }}>RESULTADOS: {filteredStats.length}</div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Deportista</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>ID Part.</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Goles</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Asist.</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Reb/Bloq</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Sanciones</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStats.map(stat => (
                                    <tr key={stat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' }}>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    {stat.jugador?.persona?.foto_url || stat.jugador?.persona?.foto ? (
                                                        <img
                                                            src={getAssetUrl(stat.jugador.persona.foto_url || stat.jugador.persona.foto)}
                                                            alt="Foto"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        stat.jugador?.persona?.nombres?.charAt(0) || <User size={18} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ color: '#fff', fontWeight: 800 }}>{stat.jugador?.persona?.nombres} {stat.jugador?.persona?.apellidos}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CI: {stat.jugador_cedula}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <span style={{ color: '#6366f1', fontWeight: 800 }}>#{stat.partido_id}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontWeight: 900 }}>
                                                {stat.goles || 0}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'center', color: '#fff', fontWeight: 700 }}>
                                            {stat.asistencias || 0}
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <div>R: {stat.rebotes || 0}</div>
                                                <div>B: {stat.bloqueos || 0}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                {Array.from({ length: stat.tarjetas_amarillas || 0 }).map((_, i) => (
                                                    <div key={`y-${i}`} style={{ width: '10px', height: '14px', background: '#f59e0b', borderRadius: '2px', boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)' }} title="Tarjeta Amarilla" />
                                                ))}
                                                {Array.from({ length: stat.tarjetas_rojas || 0 }).map((_, i) => (
                                                    <div key={`r-${i}`} style={{ width: '10px', height: '14px', background: '#ef4444', borderRadius: '2px', boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)' }} title="Tarjeta Roja" />
                                                ))}
                                                {(!stat.tarjetas_amarillas && !stat.tarjetas_rojas) && <Activity size={16} color="#313d4f" />}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDelete(stat.id)}
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                title="Eliminar registro"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Estadisticas;

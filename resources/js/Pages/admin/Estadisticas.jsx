import React, { useState, useEffect } from 'react';
import { BarChart2, Filter, Search } from 'lucide-react';
import '../../admin_styles.css';
import api from "../../api";

const Estadisticas = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/estadisticas');
                setStats(response.data?.data || response.data || []); // Handle pagination or list
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const filteredStats = stats.filter(stat =>
        stat.jugador?.persona?.nombres?.toLowerCase().includes(filter.toLowerCase()) ||
        stat.jugador?.persona?.apellidos?.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="admin-page-container fade-enter">

            {/* COMPONENT HEADER */}
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Estadísticas</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Registro de rendimiento de jugadores
                    </p>
                </div>
            </div>

            {/* MAIN CARD */}
            <div className="pro-card">

                {/* TOOLBAR */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-darkest)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            className="pro-input"
                            style={{ background: 'transparent', border: 'none', padding: '0', width: '200px' }}
                            type="text"
                            placeholder="Buscar jugador..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>

                    <button className="pro-btn btn-primary">
                        <Filter size={18} />
                        <span>Filtros Avanzados</span>
                    </button>
                </div>

                {/* TABLE */}
                <div className="table-container">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Partido (ID)</th>
                                <th>Goles</th>
                                <th>Asistencias</th>
                                <th>Tarjetas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div className="spinner"></div>
                                    </td>
                                </tr>
                            ) : filteredStats.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No se encontraron datos coincidentes.
                                    </td>
                                </tr>
                            ) : (
                                filteredStats.map(stat => (
                                    <tr key={stat.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="avatar-circle-sm" style={{ width: '36px', height: '36px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                                    {stat.jugador?.persona?.nombres?.charAt(0)}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600', color: '#fff' }}>
                                                        {stat.jugador?.persona?.nombres} {stat.jugador?.persona?.apellidos}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        CI: {stat.jugador_cedula}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{stat.partido_id}</span>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '1.1rem' }}>
                                                {stat.goles}
                                            </span>
                                        </td>
                                        <td>{stat.asistencias}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {stat.tarjetas_amarillas > 0 &&
                                                    <span className="status-badge badge-warning" title="Amarillas">{stat.tarjetas_amarillas}</span>
                                                }
                                                {stat.tarjetas_rojas > 0 &&
                                                    <span className="status-badge badge-danger" title="Rojas">{stat.tarjetas_rojas}</span>
                                                }
                                                {stat.tarjetas_amarillas === 0 && stat.tarjetas_rojas === 0 && <span style={{ color: 'var(--border)' }}>-</span>}
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

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    TrendingUp,
    Award,
    AlertCircle,
    CheckCircle,
    Clipboard,
    User,
    Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "../../css/unified-all.css";
import api from "../../api";

const RefereeDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPartidos: 0,
        partidosPendientes: 0,
        partidosCompletados: 0,
        tarjetasAmarillas: 0,
        tarjetasRojas: 0
    });
    const [proximosPartidos, setProximosPartidos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get user safely
    const [user, setUser] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user", e);
            }
        }
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Cargar todos los partidos
            // Idealmente debería haber un endpoint específico para el árbitro
            const { data } = await api.get('/partidos');

            const partidos = Array.isArray(data) ? data : data.data || [];
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = storedUser.id || storedUser.cedula;

            // Filtrar partidos donde el usuario actual es el árbitro
            // Nota: La lógica de comparación puede requerir ajuste según cómo venga el ID del backend (number vs string)
            const partidosArbitro = partidos.filter(p =>
                String(p.arbitro_id) === String(userId) ||
                String(p.arbitro_central_id) === String(userId) || // Check alternate field names just in case
                p.arbitro?.cedula === userId
            );

            // Calcular estadísticas
            const pendientes = partidosArbitro.filter(p => p.estado === 'Programado' || p.estado === 'Pendiente').length;
            const completados = partidosArbitro.filter(p => p.estado === 'Finalizado').length;
            const enJuego = partidosArbitro.filter(p => p.estado === 'En Curso' || p.estado === 'En Juego').length;

            setStats({
                totalPartidos: partidosArbitro.length,
                partidosPendientes: pendientes,
                partidosCompletados: completados,
                tarjetasAmarillas: 0, // Placeholder
                tarjetasRojas: 0
            });

            // Próximos partidos (ordenar por fecha)
            const sorted = partidosArbitro
                .filter(p => p.estado !== 'Finalizado')
                .sort((a, b) => new Date(a.fecha + ' ' + a.hora) - new Date(b.fecha + ' ' + b.hora))
                .slice(0, 3);

            setProximosPartidos(sorted);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Por definir';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
        });
    };

    // --- STYLES ---
    const glassCardStyle = {
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        color: '#f8fafc',
        borderRadius: '16px',
        padding: '1.5rem'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <Activity className="animate-spin" size={40} color="#3b82f6" />
                <p style={{ color: '#94a3b8' }}>Cargando panel arbitral...</p>
            </div>
        );
    }

    return (
        <div className="rep-dashboard-fade">
            {/* HEADER */}
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <small style={{ fontWeight: '700', letterSpacing: '0.5px', color: '#10b981', textTransform: 'uppercase' }}>
                            Panel de Control
                        </small>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0 0.5rem 0' }}>
                            Hola, {user.persona?.nombres?.split(' ')[0] || 'Árbitro'}
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
                            Gestiona tus partidos asignados y registra resultados.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/referee/partidos')}
                            className="btn-primary"
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            <Calendar size={18} /> Ver Mis Partidos
                        </button>
                    </div>
                </div>
            </header>

            {/* STATS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>

                {/* Total */}
                <div style={{ ...glassCardStyle, borderBottom: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Total Asignaciones</span>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '0.5rem 0 0 0', lineHeight: 1 }}>
                                {stats.totalPartidos}
                            </h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '12px', color: '#60a5fa' }}>
                            <Clipboard size={24} />
                        </div>
                    </div>
                </div>

                {/* Pendientes */}
                <div style={{ ...glassCardStyle, borderBottom: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Por Arbitrar</span>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '0.5rem 0 0 0', lineHeight: 1 }}>
                                {stats.partidosPendientes}
                            </h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', color: '#fbbf24' }}>
                            <Clock size={24} />
                        </div>
                    </div>
                    {stats.partidosPendientes > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#fbbf24', marginTop: '0.5rem' }}>
                            <AlertCircle size={14} /> Tienes partidos pendientes
                        </div>
                    )}
                </div>

                {/* Completados */}
                <div style={{ ...glassCardStyle, borderBottom: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Finalizados</span>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '0.5rem 0 0 0', lineHeight: 1 }}>
                                {stats.partidosCompletados}
                            </h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#34d399' }}>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>

            </div>

            {/* MAIN CONTENT SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* UPCOMING MATCHES */}
                <div style={{ ...glassCardStyle, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Calendar size={20} color="#60a5fa" /> Próximos Encuentros
                        </h3>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                        {proximosPartidos.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {proximosPartidos.map((partido, index) => (
                                    <div key={partido.id || index} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '12px',
                                        padding: '1.25rem',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }} className="hover:bg-white/5">

                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                borderRadius: '10px',
                                                padding: '0.5rem',
                                                minWidth: '60px',
                                                border: '1px solid rgba(59, 130, 246, 0.2)'
                                            }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                                                    {new Date(partido.fecha).getDate()}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase' }}>
                                                    {new Date(partido.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                                </span>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={14} /> {partido.hora ? partido.hora.substring(0, 5) : '00:00'} • {partido.torneo?.nombre || 'Torneo'}
                                                </div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                                                    {partido.equipoLocal?.nombre || 'Local'} vs {partido.equipoVisitante?.nombre || 'Visitante'}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                                                    Cancha Principal
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate('/referee/partidos')}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: '#fff',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                            className="hover:bg-white/10"
                                        >
                                            Gestionar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                                <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No hay partidos asignados próximamente.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* QUICK TIPS / INFO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ ...glassCardStyle, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#fff' }}>
                            Estado de Cuenta
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
                                <CheckCircle color="#fff" size={28} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#fff' }}>Habilitado</div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Licencia activa</div>
                            </div>
                        </div>
                        <button style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#cbd5e1', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/referee/perfil')}>
                            Ver Perfil
                        </button>
                    </div>

                    <div style={{ ...glassCardStyle, border: '1px dashed rgba(255,255,255,0.2)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#cbd5e1' }}>
                            Accesos Directos
                        </h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <button className="btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: 'none' }}>
                                <Activity size={18} /> Reglamento Deportivo
                            </button>
                            <button className="btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: 'none' }}>
                                <TrendingUp size={18} /> Historial de Partidos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefereeDashboard;

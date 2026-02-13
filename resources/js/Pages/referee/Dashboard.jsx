import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    TrendingUp,
    Award,
    AlertCircle,
    CheckCircle,
    Clipboard,
    User
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const RefereeDashboard = () => {
    const [stats, setStats] = useState({
        totalPartidos: 0,
        partidosPendientes: 0,
        partidosCompletados: 0,
        tarjetasAmarillas: 0,
        tarjetasRojas: 0
    });
    const [proximosPartidos, setProximosPartidos] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Cargar todos los partidos (filtrar por árbitro en el backend si es necesario)
            const response = await fetch(`${API_BASE}/partidos`, { headers });
            if (response.ok) {
                const data = await response.json();
                const partidos = Array.isArray(data) ? data : data.data || [];

                // Filtrar partidos donde el usuario actual es el árbitro
                const userId = user.id || user.cedula;
                const partidosArbitro = partidos.filter(p =>
                    p.arbitro_id === userId || p.arbitro?.cedula === userId
                );

                // Calcular estadísticas
                const pendientes = partidosArbitro.filter(p => p.estado === 'Pendiente').length;
                const completados = partidosArbitro.filter(p => p.estado === 'Finalizado').length;

                setStats({
                    totalPartidos: partidosArbitro.length,
                    partidosPendientes: pendientes,
                    partidosCompletados: completados,
                    tarjetasAmarillas: 0, // Esto vendría del backend
                    tarjetasRojas: 0
                });

                // Próximos 3 partidos
                setProximosPartidos(partidosArbitro.slice(0, 3));
            }
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
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="fade-enter">
                <div className="referee-page-header">
                    <div>
                        <h1 className="referee-page-title">Cargando...</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-enter">
            <div className="referee-page-header">
                <div>
                    <h1 className="referee-page-title">Bienvenido, {user.nombre}</h1>
                    <p className="referee-page-subtitle">Panel de control de arbitraje</p>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="referee-stats-grid">
                <div className="referee-stat-card">
                    <div className="referee-stat-label">Total Partidos</div>
                    <div className="referee-stat-value">{stats.totalPartidos}</div>
                </div>

                <div className="referee-stat-card">
                    <div className="referee-stat-label">Pendientes</div>
                    <div className="referee-stat-value" style={{ color: 'var(--ref-warning)' }}>
                        {stats.partidosPendientes}
                    </div>
                </div>

                <div className="referee-stat-card">
                    <div className="referee-stat-label">Completados</div>
                    <div className="referee-stat-value">{stats.partidosCompletados}</div>
                </div>

                <div className="referee-stat-card">
                    <div className="referee-stat-label">Tarjetas Amarillas</div>
                    <div className="referee-stat-value" style={{ color: 'var(--ref-warning)' }}>
                        {stats.tarjetasAmarillas}
                    </div>
                </div>
            </div>

            {/* Próximos Partidos */}
            <div className="referee-card">
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={24} color="var(--ref-primary)" />
                    Próximos Partidos
                </h2>

                {proximosPartidos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ref-muted)' }}>
                        <AlertCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No tienes partidos asignados próximamente</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {proximosPartidos.map((partido) => (
                            <div key={partido.id} className="match-card">
                                <div className="match-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ref-muted)', fontSize: '0.9rem' }}>
                                        <Clock size={16} />
                                        {formatDate(partido.fecha)} - {partido.hora || '00:00'}
                                    </div>
                                    <span className={`match-status ${partido.estado === 'Pendiente' ? 'pending' : partido.estado === 'En Curso' ? 'in-progress' : 'finished'}`}>
                                        {partido.estado}
                                    </span>
                                </div>

                                <div className="match-teams">
                                    <div className="team-name">{partido.equipoLocal?.nombre || 'Equipo Local'}</div>
                                    <div className="match-score">
                                        {partido.marcador_local ?? '-'} : {partido.marcador_visitante ?? '-'}
                                    </div>
                                    <div className="team-name">{partido.equipoVisitante?.nombre || 'Equipo Visitante'}</div>
                                </div>

                                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--ref-muted)' }}>
                                    <strong>Torneo:</strong> {partido.torneo?.nombre || 'N/A'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Acciones Rápidas */}
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <button className="referee-btn referee-btn-primary" onClick={() => window.location.href = '/referee/partidos'}>
                    <Clipboard size={20} />
                    Ver Todos los Partidos
                </button>
                <button className="referee-btn referee-btn-secondary" onClick={() => window.location.href = '/referee/perfil'}>
                    <User size={20} />
                    Mi Perfil
                </button>
            </div>
        </div>
    );
};

export default RefereeDashboard;

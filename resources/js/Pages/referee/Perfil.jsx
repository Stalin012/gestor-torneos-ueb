import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    Award,
    Calendar,
    TrendingUp
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const Perfil = () => {
    const [arbitro, setArbitro] = useState(null);
    const [stats, setStats] = useState({
        totalPartidos: 0,
        partidosCompletados: 0,
        tarjetasAmarillas: 0,
        tarjetasRojas: 0
    });
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        loadPerfilData();
    }, []);

    const loadPerfilData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Cargar datos del árbitro
            const arbitroRes = await fetch(`${API_BASE}/arbitros/${user.id}`, { headers });
            if (arbitroRes.ok) {
                const arbitroData = await arbitroRes.json();
                setArbitro(arbitroData);
            }

            // Cargar estadísticas
            const partidosRes = await fetch(`${API_BASE}/arbitro/partidos`, { headers });
            if (partidosRes.ok) {
                const partidosData = await partidosRes.json();
                const partidos = Array.isArray(partidosData) ? partidosData : partidosData.data || [];

                setStats({
                    totalPartidos: partidos.length,
                    partidosCompletados: partidos.filter(p => p.estado === 'Finalizado').length,
                    tarjetasAmarillas: 0,
                    tarjetasRojas: 0
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fade-enter">
                <div className="referee-page-header">
                    <h1 className="referee-page-title">Cargando perfil...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-enter">
            <div className="referee-page-header">
                <div>
                    <h1 className="referee-page-title">Mi Perfil</h1>
                    <p className="referee-page-subtitle">Información personal y estadísticas</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Información Personal */}
                <div className="referee-card">
                    <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={24} color="var(--ref-primary)" />
                        Información Personal
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)', marginBottom: '0.25rem' }}>Nombre Completo</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.nombre || 'N/A'}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)', marginBottom: '0.25rem' }}>Cédula</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.cedula || 'N/A'}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)', marginBottom: '0.25rem' }}>Email</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={18} color="var(--ref-primary)" />
                                {user.email || 'N/A'}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)', marginBottom: '0.25rem' }}>Teléfono</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Phone size={18} color="var(--ref-primary)" />
                                {user.telefono || 'N/A'}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)', marginBottom: '0.25rem' }}>Rol</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                <span className="card-badge green">Árbitro</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="referee-card">
                    <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={24} color="var(--ref-primary)" />
                        Estadísticas de Arbitraje
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)' }}>Total Partidos</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ref-primary)' }}>{stats.totalPartidos}</div>
                            </div>
                            <Calendar size={40} color="var(--ref-primary)" style={{ opacity: 0.3 }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)' }}>Completados</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ref-primary)' }}>{stats.partidosCompletados}</div>
                            </div>
                            <Award size={40} color="var(--ref-primary)" style={{ opacity: 0.3 }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)' }}>Amarillas</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ref-warning)' }}>{stats.tarjetasAmarillas}</div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--ref-muted)' }}>Rojas</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ref-danger)' }}>{stats.tarjetasRojas}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;

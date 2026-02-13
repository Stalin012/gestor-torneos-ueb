import React, { useState, useEffect } from 'react';
import {
    Clipboard,
    Edit,
    Save,
    X,
    AlertTriangle,
    FileText,
    Clock,
    MapPin,
    CheckCircle,
    Play,
    Flag
} from 'lucide-react';
import "../../css/unified-all.css";
import api from "../../api";

const PartidosAsignados = () => {
    const [partidos, setPartidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMatch, setEditingMatch] = useState(null);
    const [scoreData, setScoreData] = useState({ local: 0, visitante: 0 });
    const [statusUpdating, setStatusUpdating] = useState(null);

    useEffect(() => {
        loadPartidos();
    }, []);

    const loadPartidos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const { data } = await api.get('/partidos');

            const allPartidos = Array.isArray(data) ? data : data.data || [];

            // Filtrar partidos donde el usuario actual es el árbitro
            const userId = user.id || user.cedula;
            const partidosArbitro = allPartidos.filter(p =>
                String(p.arbitro_id) === String(userId) ||
                String(p.arbitro_central_id) === String(userId) ||
                p.arbitro?.cedula === userId
            );

            // Sort by date/time
            partidosArbitro.sort((a, b) => new Date(a.fecha + ' ' + a.hora) - new Date(b.fecha + ' ' + b.hora));

            setPartidos(partidosArbitro);
        } catch (error) {
            console.error('Error loading matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditScore = (partido) => {
        setEditingMatch(partido.id);
        setScoreData({
            local: partido.marcador_local || 0,
            visitante: partido.marcador_visitante || 0
        });
    };

    const handleSaveScore = async (partidoId) => {
        try {
            await api.put(`/partidos/${partidoId}/actualizar-marcador`, {
                marcador_local: scoreData.local,
                marcador_visitante: scoreData.visitante
            });

            setEditingMatch(null);
            loadPartidos();
        } catch (error) {
            console.error('Error saving score:', error);
            alert("Error al actualizar marcador.");
        }
    };

    const handleStartMatch = async (partidoId) => {
        if (!window.confirm("¿Seguro que deseas iniciar el partido?")) return;
        setStatusUpdating(partidoId);
        try {
            await api.post(`/partidos/${partidoId}/iniciar`);
            loadPartidos();
        } catch (error) {
            console.error('Error starting match:', error);
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleFinishMatch = async (partidoId) => {
        if (!window.confirm("¿Seguro que deseas finalizar el partido? Se actualizará la validación de resultados.")) return;
        setStatusUpdating(partidoId);
        try {
            await api.post(`/partidos/${partidoId}/finalizar`);
            loadPartidos();
        } catch (error) {
            console.error('Error finishing match:', error);
        } finally {
            setStatusUpdating(null);
        }
    };

    const formatDate = (dateString, timeString) => {
        if (!dateString) return 'Fecha por definir';
        const date = new Date(dateString);
        const day = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        return timeString ? `${day} • ${timeString.substring(0, 5)}` : day;
    };

    // --- STYLES ---
    const glassCardStyle = {
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        color: '#f8fafc',
        borderRadius: '16px',
        overflow: 'hidden'
    };

    const inputStyle = {
        width: '60px',
        padding: '0.5rem',
        fontSize: '1.5rem',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 'bold',
        outline: 'none'
    };

    if (loading) {
        return (
            <div className="rep-dashboard-fade" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
                    <div className="animate-spin" style={{ border: '3px solid rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', width: '24px', height: '24px' }}></div>
                    Cargando asignaciones...
                </div>
            </div>
        );
    }

    return (
        <div className="rep-dashboard-fade">
            <div style={{ marginBottom: '2.5rem' }}>
                <small style={{ fontWeight: '700', letterSpacing: '0.5px', color: '#8b5cf6', textTransform: 'uppercase' }}>
                    Gestión de Encuentros
                </small>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0 0.5rem 0' }}>
                    Partidos Asignados
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
                    Controla el tiempo de juego, registra marcadores y finaliza los encuentros.
                </p>
            </div>

            {partidos.length === 0 ? (
                <div style={{ ...glassCardStyle, padding: '4rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Clipboard size={64} style={{ opacity: 0.1, marginBottom: '1.5rem', color: '#fff' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Sin asignaciones activas</h3>
                    <p style={{ color: '#94a3b8' }}>Actualmente no tienes partidos programados para arbitrar.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {partidos.map((partido) => {
                        const isLive = partido.estado === 'En Juego' || partido.estado === 'En Curso';
                        const isFinished = partido.estado === 'Finalizado';
                        const isPending = partido.estado === 'Programado' || partido.estado === 'Pendiente';

                        return (
                            <div key={partido.id} style={glassCardStyle}>
                                {/* Header del Partido */}
                                <div style={{
                                    padding: '1.25rem 1.5rem',
                                    background: isLive ? 'linear-gradient(90deg, rgba(220, 38, 38, 0.1), transparent)' : 'rgba(255,255,255,0.02)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {partido.torneo?.nombre || 'Torneo Oficial'}
                                            </span>
                                            {isLive && (
                                                <span style={{
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} className="animate-pulse"></div> EN VIVO
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={16} color="#60a5fa" />
                                                {formatDate(partido.fecha, partido.hora)}
                                            </span>
                                            {partido.ubicacion && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <MapPin size={16} color="#f59e0b" />
                                                    {partido.ubicacion}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        background: isLive ? 'rgba(220, 38, 38, 0.2)' : isFinished ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                        color: isLive ? '#fca5a5' : isFinished ? '#6ee7b7' : '#cbd5e1',
                                        border: `1px solid ${isLive ? 'rgba(220, 38, 38, 0.3)' : isFinished ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.1)'}`
                                    }}>
                                        {partido.estado}
                                    </div>
                                </div>

                                {/* Equipos y Marcador */}
                                <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                                    {/* Local */}
                                    <div style={{ flex: 1, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                                            {partido.equipo_local?.nombre || partido.equipoLocal?.nombre || 'Local'}
                                        </span>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                            <Flag size={20} color="#60a5fa" />
                                        </div>
                                    </div>

                                    {/* Marcador Central */}
                                    <div style={{ padding: '0 1rem' }}>
                                        {editingMatch === partido.id ? (
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={scoreData.local}
                                                    onChange={(e) => setScoreData({ ...scoreData, local: parseInt(e.target.value) || 0 })}
                                                    style={inputStyle}
                                                />
                                                <span style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: 'bold' }}>-</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={scoreData.visitante}
                                                    onChange={(e) => setScoreData({ ...scoreData, visitante: parseInt(e.target.value) || 0 })}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{
                                                background: '#0f172a',
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '12px',
                                                fontSize: '2rem',
                                                fontWeight: 900,
                                                color: '#fff',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                                                minWidth: '120px',
                                                textAlign: 'center'
                                            }}>
                                                {partido.marcador_local ?? 0} <span style={{ color: '#64748b', fontSize: '1.5rem', margin: '0 4px' }}>:</span> {partido.marcador_visitante ?? 0}
                                            </div>
                                        )}
                                    </div>

                                    {/* Visitante */}
                                    <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                            <Flag size={20} color="#fbbf24" />
                                        </div>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                                            {partido.equipo_visitante?.nombre || partido.equipoVisitante?.nombre || 'Visitante'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions Toolbar */}
                                <div style={{
                                    padding: '1.25rem',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    background: 'rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    flexWrap: 'wrap'
                                }}>
                                    {editingMatch === partido.id ? (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => handleSaveScore(partido.id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}
                                            >
                                                <Save size={18} /> Guardar
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => setEditingMatch(null)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
                                            >
                                                <X size={18} /> Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {isPending && (
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => handleStartMatch(partido.id)}
                                                    disabled={statusUpdating === partido.id}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                                                >
                                                    {statusUpdating === partido.id ? (
                                                        <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                                    ) : <Play size={18} />}
                                                    Iniciar Partido
                                                </button>
                                            )}

                                            {isLive && (
                                                <>
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => handleEditScore(partido)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <Edit size={18} /> Actualizar Marcador
                                                    </button>
                                                    <button
                                                        onClick={() => handleFinishMatch(partido.id)}
                                                        disabled={statusUpdating === partido.id}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            background: 'rgba(220, 38, 38, 0.1)',
                                                            color: '#fca5a5',
                                                            border: '1px solid rgba(220, 38, 38, 0.3)',
                                                            padding: '0.6rem 1.5rem',
                                                            borderRadius: '10px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.target.style.background = 'rgba(220, 38, 38, 0.2)'}
                                                        onMouseOut={(e) => e.target.style.background = 'rgba(220, 38, 38, 0.1)'}
                                                    >
                                                        {statusUpdating === partido.id ? (
                                                            <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                                        ) : <CheckCircle size={18} />}
                                                        Finalizar
                                                    </button>
                                                </>
                                            )}

                                            {isFinished && (
                                                <button
                                                    className="btn-secondary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', opacity: 0.7 }}
                                                    disabled
                                                >
                                                    <CheckCircle size={18} /> Partido Finalizado
                                                </button>
                                            )}

                                            <button
                                                className="btn-secondary"
                                                onClick={() => alert("Función de reporte en desarrollo...")}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
                                            >
                                                <FileText size={18} /> Reporte
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PartidosAsignados;

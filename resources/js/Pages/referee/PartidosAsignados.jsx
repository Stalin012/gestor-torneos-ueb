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
    CheckCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const PartidosAsignados = () => {
    const [partidos, setPartidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMatch, setEditingMatch] = useState(null);
    const [scoreData, setScoreData] = useState({ local: 0, visitante: 0 });

    useEffect(() => {
        loadPartidos();
    }, []);

    const loadPartidos = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await fetch(`${API_BASE}/partidos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const allPartidos = Array.isArray(data) ? data : data.data || [];

                // Filtrar partidos donde el usuario actual es el árbitro
                const userId = user.id || user.cedula;
                const partidosArbitro = allPartidos.filter(p =>
                    p.arbitro_id === userId || p.arbitro?.cedula === userId
                );

                setPartidos(partidosArbitro);
            }
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/partidos/${partidoId}/actualizar-marcador`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    marcador_local: scoreData.local,
                    marcador_visitante: scoreData.visitante
                })
            });

            if (response.ok) {
                setEditingMatch(null);
                loadPartidos();
                alert("Marcador actualizado con éxito.");
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };

    const handleStartMatch = async (partidoId) => {
        if (!window.confirm("¿Seguro que deseas iniciar el partido?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/partidos/${partidoId}/iniciar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) loadPartidos();
        } catch (error) {
            console.error('Error starting match:', error);
        }
    };

    const handleFinishMatch = async (partidoId) => {
        if (!window.confirm("¿Seguro que deseas finalizar el partido? Se actualizará la tabla de posiciones.")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/partidos/${partidoId}/finalizar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) loadPartidos();
        } catch (error) {
            console.error('Error finishing match:', error);
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
                    <h1 className="referee-page-title">Cargando partidos...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-enter">
            <div className="referee-page-header">
                <div>
                    <h1 className="referee-page-title">Mis Partidos Asignados</h1>
                    <p className="referee-page-subtitle">Gestiona los partidos que te han sido asignados</p>
                </div>
            </div>

            {partidos.length === 0 ? (
                <div className="referee-card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Clipboard size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h3>No tienes partidos asignados</h3>
                    <p style={{ color: 'var(--ref-muted)' }}>Los partidos asignados aparecerán aquí</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {partidos.map((partido) => (
                        <div key={partido.id} className="match-card">
                            {/* Header del Partido */}
                            <div className="match-header">
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        {partido.torneo?.nombre || 'Torneo'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--ref-muted)', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={16} />
                                            {formatDate(partido.fecha)} - {partido.hora || '00:00'}
                                        </span>
                                        {partido.ubicacion && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={16} />
                                                {partido.ubicacion}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={`match-status ${partido.estado?.toLowerCase() === 'pendiente' ? 'pending' :
                                    partido.estado?.toLowerCase() === 'en juego' || partido.estado?.toLowerCase() === 'en curso' ? 'in-progress' :
                                        'finished'
                                    }`}>
                                    {partido.estado}
                                </span>
                            </div>

                            {/* Equipos y Marcador */}
                            <div className="match-teams" style={{ margin: '1.5rem 0' }}>
                                <div className="team-name">{partido.equipo_local?.nombre || partido.equipoLocal?.nombre || 'Equipo Local'}</div>

                                {editingMatch === partido.id ? (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={scoreData.local}
                                            onChange={(e) => setScoreData({ ...scoreData, local: parseInt(e.target.value) || 0 })}
                                            style={{
                                                width: '60px',
                                                padding: '0.5rem',
                                                fontSize: '1.5rem',
                                                textAlign: 'center',
                                                background: 'var(--ref-card)',
                                                border: '2px solid var(--ref-primary)',
                                                borderRadius: '8px',
                                                color: 'var(--ref-text)'
                                            }}
                                        />
                                        <span style={{ fontSize: '1.5rem', color: 'var(--ref-muted)' }}>:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={scoreData.visitante}
                                            onChange={(e) => setScoreData({ ...scoreData, visitante: parseInt(e.target.value) || 0 })}
                                            style={{
                                                width: '60px',
                                                padding: '0.5rem',
                                                fontSize: '1.5rem',
                                                textAlign: 'center',
                                                background: 'var(--ref-card)',
                                                border: '2px solid var(--ref-primary)',
                                                borderRadius: '8px',
                                                color: 'var(--ref-text)'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="match-score">
                                        {partido.marcador_local ?? 0} : {partido.marcador_visitante ?? 0}
                                    </div>
                                )}

                                <div className="team-name">{partido.equipo_visitante?.nombre || partido.equipoVisitante?.nombre || 'Equipo Visitante'}</div>
                            </div>

                            {/* Acciones */}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingTop: '1rem', borderTop: '1px solid var(--ref-border)', flexWrap: 'wrap' }}>
                                {editingMatch === partido.id ? (
                                    <>
                                        <button
                                            className="referee-btn referee-btn-primary"
                                            onClick={() => handleSaveScore(partido.id)}
                                        >
                                            <Save size={18} />
                                            Guardar Marcador
                                        </button>
                                        <button
                                            className="referee-btn referee-btn-secondary"
                                            onClick={() => setEditingMatch(null)}
                                        >
                                            <X size={18} />
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {partido.estado === 'Programado' || partido.estado === 'Pendiente' ? (
                                            <button
                                                className="referee-btn referee-btn-primary"
                                                onClick={() => handleStartMatch(partido.id)}
                                            >
                                                <Clock size={18} />
                                                Iniciar Partido
                                            </button>
                                        ) : partido.estado === 'En juego' || partido.estado === 'En curso' ? (
                                            <>
                                                <button
                                                    className="referee-btn referee-btn-primary"
                                                    onClick={() => handleEditScore(partido)}
                                                >
                                                    <Edit size={18} />
                                                    Actualizar Marcador
                                                </button>
                                                <button
                                                    className="referee-btn"
                                                    style={{ background: '#ef4444', color: 'white' }}
                                                    onClick={() => handleFinishMatch(partido.id)}
                                                >
                                                    <CheckCircle size={18} />
                                                    Finalizar Partido
                                                </button>
                                            </>
                                        ) : (
                                            <span style={{ color: 'var(--ref-muted)', fontStyle: 'italic' }}>Partido Finalizado</span>
                                        )}

                                        <button
                                            className="referee-btn referee-btn-secondary"
                                            onClick={() => alert("Función de reporte en desarrollo...")}
                                        >
                                            <FileText size={18} />
                                            Reporte
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartidosAsignados;

// resources/js/pages/admin/PartidosFixtures.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

import {
    CalendarCheck,
    Zap,
    Edit,
    Clock,
    X,
    Hash,
    CornerDownRight,
    Eye,
    Save,
    AlertCircle,
    Play,
    CheckCircle,
    Trash2,
    Plus,
    Search,
    Filter,
    Users,
} from 'lucide-react';

import LoadingScreen from '../../components/LoadingScreen';
import api, { apiPublic } from '../../api';

// Estados válidos
const ESTADOS_VALIDOS = ['Programado', 'En Juego', 'Finalizado'];

// Función para formatear estado para display
const formatEstado = (estado) => estado.replace('_', ' ');

// -----------------------------------------------------------------
// FUNCIÓN DE UTILIDAD: Formatea fecha y hora
// -----------------------------------------------------------------
const formatDateTime = (date, time) => {
    if (!date) return 'TBD';
    try {
        // Extraer solo la fecha si viene en formato timestamp
        let dateStr = date;
        if (typeof date === 'string' && date.includes('T')) {
            dateStr = date.split('T')[0];
        }

        // Crear objeto de fecha
        const dateObj = new Date(`${dateStr}T00:00:00`);
        if (isNaN(dateObj)) {
            return `${dateStr} ${time || ''}`;
        }

        // Formatear fecha
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        // Formatear hora
        let timeStr = '00:00';
        if (time) {
            if (typeof time === 'string') {
                timeStr = time.substring(0, 5);
            }
        }

        return `${day}/${month}/${year} ${timeStr}`;
    } catch (e) {
        return `${date} ${time || ''}`;
    }
};

/* ============================================================
    MODAL EDITAR PARTIDO
============================================================ */
/* ============================================================
    MODAL EDITAR PARTIDO (ELITE)
============================================================ */
const ModalEditarPartido = ({ isOpen, onClose, partido, onSave, loading }) => {
    const [formData, setFormData] = useState({
        fecha: '',
        hora: '',
        campo: '',
        arbitro_cedula: '',
        estado: 'Programado',
        marcador_local: 0,
        marcador_visitante: 0,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!partido) return;
        setFormData({
            fecha: partido.fecha || '',
            hora: (partido.hora && partido.hora.substring(0, 5)) || '',
            campo: partido.campo || '',
            arbitro_cedula: partido.arbitro_cedula || '',
            estado: ESTADOS_VALIDOS.includes(partido.estado) ? partido.estado : 'Programado',
            marcador_local: parseInt(partido.marcador_local ?? 0, 10),
            marcador_visitante: parseInt(partido.marcador_visitante ?? 0, 10),
        });
        setError(null);
    }, [partido]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'auto'; };
        }
    }, [isOpen]);

    if (!isOpen || !partido) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.fecha) {
            setError('La fecha es requerida.');
            return;
        }
        if (!formData.hora) {
            setError('La hora es requerida.');
            return;
        }
        if (!ESTADOS_VALIDOS.includes(formData.estado)) {
            setError('Estado inválido.');
            return;
        }

        const payload = {
            fecha: formData.fecha,
            hora: `${formData.hora}:00`,
            campo: formData.campo || null,
            arbitro_cedula: formData.arbitro_cedula || null,
            estado: formData.estado,
            marcador_local: parseInt(formData.marcador_local, 10) || 0,
            marcador_visitante: parseInt(formData.marcador_visitante, 10) || 0,
        };

        onSave(partido.id, payload);
    };

    return createPortal((
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content scale-in" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(245, 158, 11, 0.05))',
                    borderBottom: '2px solid var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            <CalendarCheck size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                                Gestión de Encuentro
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Ref: #{partido.id} • {partido.torneo?.nombre || 'Torneo General'}
                            </p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={20} /></button>
                </div>

                {error && (
                    <div style={{
                        margin: '1.5rem 2rem 0',
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center'
                    }}>
                        <AlertCircle size={20} style={{ color: '#ef4444' }} />
                        <span style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        gap: '2rem',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Local</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{partido.equipoLocal?.nombre}</div>
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            color: 'var(--text-muted)'
                        }}>VS</div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Visitante</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{partido.equipoVisitante?.nombre}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Fecha del Evento</label>
                            <input type="date" className="pro-input" value={formData.fecha} onChange={(e) => handleChange('fecha', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Hora de Inicio</label>
                            <input type="time" className="pro-input" value={formData.hora} onChange={(e) => handleChange('hora', e.target.value)} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Campo / Sede</label>
                            <input type="text" className="pro-input" placeholder="Ej. Cancha Principal" value={formData.campo} onChange={(e) => handleChange('campo', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Árbitro Designado (ID)</label>
                            <input type="text" className="pro-input" placeholder="Opcional" value={formData.arbitro_cedula} onChange={(e) => handleChange('arbitro_cedula', e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Estado de Competencia</label>
                        <select className="pro-input" value={formData.estado} onChange={(e) => handleChange('estado', e.target.value)}>
                            {ESTADOS_VALIDOS.map(estado => (
                                <option key={estado} value={estado}>{formatEstado(estado)}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(245, 158, 11, 0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(245, 158, 11, 0.1)',
                        marginBottom: '2rem'
                    }}>
                        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>Marcador Oficial</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
                            <div className="form-group">
                                <input type="number" className="pro-input" min="0" value={formData.marcador_local} onChange={(e) => handleChange('marcador_local', parseInt(e.target.value, 10) || 0)} style={{ fontSize: '1.8rem', textAlign: 'center', fontWeight: 900, height: '60px' }} />
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, opacity: 0.3 }}>-</div>
                            <div className="form-group">
                                <input type="number" className="pro-input" min="0" value={formData.marcador_visitante} onChange={(e) => handleChange('marcador_visitante', parseInt(e.target.value, 10) || 0)} style={{ fontSize: '1.8rem', textAlign: 'center', fontWeight: 900, height: '60px' }} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: '16px', height: '16px' }} />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ), document.body);
};


/* ============================================================
    MODAL CONFIRMAR ACCIÓN
============================================================ */
/* ============================================================
    MODAL CONFIRMAR ACCIÓN (ELITE)
============================================================ */
const ModalConfirmar = ({ isOpen, onClose, titulo, mensaje, onConfirm, loading, tipo = 'info' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'auto'; };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const colorMap = {
        info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', icon: '#3b82f6', iconComp: CalendarCheck },
        success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', icon: '#10b981', iconComp: CheckCircle },
        warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', icon: '#f59e0b', iconComp: AlertCircle },
        danger: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', icon: '#ef4444', iconComp: Trash2 },
    };

    const color = colorMap[tipo] || colorMap.info;
    const IconComp = color.iconComp;

    return createPortal((
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content scale-in" style={{ maxWidth: '480px', borderRadius: '24px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                    height: '8px',
                    background: color.border,
                    boxShadow: `0 4px 12px ${color.border}44`
                }} />

                <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: color.bg,
                        border: `2px solid ${color.border}44`,
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: `0 8px 16px ${color.border}22`
                    }}>
                        <IconComp size={40} style={{ color: color.icon }} />
                    </div>

                    <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{titulo}</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem 0', lineHeight: 1.6 }}>{mensaje}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '1rem' }}>
                        <button className="pro-btn btn-secondary" onClick={onClose} disabled={loading} style={{ justifyContent: 'center' }}>
                            Descartar
                        </button>
                        <button
                            className="pro-btn"
                            onClick={onConfirm}
                            disabled={loading}
                            style={{
                                background: color.border,
                                color: '#fff',
                                justifyContent: 'center',
                                boxShadow: `0 8px 20px ${color.border}44`
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    {tipo === 'danger' ? 'Confirmar Eliminación' : 'Aceptar Acción'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ), document.body);
};


/* ============================================================
    COMPONENTE PRINCIPAL
============================================================ */
const PartidosFixtures = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('programados');
    const [partidos, setPartidos] = useState([]);
    const [torneos, setTorneos] = useState([]);
    const [selectedTorneo, setSelectedTorneo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [loading, setLoading] = useState(false);

    const [modalEditar, setModalEditar] = useState({ isOpen: false, partido: null, loading: false });
    const [modalConfirmar, setModalConfirmar] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info', loading: false, action: null });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [partidosResponse, torneosResponse] = await Promise.all([
                api.get('/partidos'),
                api.get('/torneos'),
            ]);

            // Handle partidos data - check multiple possible response structures
            const partidosData = partidosResponse.data?.data || partidosResponse.data || [];
            console.log('Partidos API response:', partidosResponse.data);
            console.log('Partidos data extracted:', partidosData);
            setPartidos(Array.isArray(partidosData) ? partidosData : []);

            // Handle torneos data - check multiple possible response structures  
            const torneosData = torneosResponse.data?.data || torneosResponse.data || [];
            console.log('Torneos API response:', torneosResponse.data);
            console.log('Torneos data extracted:', torneosData);
            setTorneos(Array.isArray(torneosData) ? torneosData : []);

            // Set default tournament if none selected
            if (torneosData && torneosData.length > 0 && !selectedTorneo) {
                setSelectedTorneo(String(torneosData[0].id));
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);

            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            // Set empty arrays on error
            setPartidos([]);
            setTorneos([]);
        } finally {
            setLoading(false);
        }
    }, [navigate, selectedTorneo]);

    const handleSavePartido = async (partidoId, payload) => {
        setModalEditar(prev => ({ ...prev, loading: true }));
        try {
            await api.put(`/partidos/${partidoId}`, payload);
            await loadData();
            setModalEditar({ isOpen: false, partido: null, loading: false });
        } catch (err) {
            console.error('Error actualizando partido:', err);
        } finally {
            setModalEditar(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeletePartido = (partido) => {
        setModalConfirmar({
            isOpen: true,
            titulo: 'Eliminar Partido',
            mensaje: `¿Estás seguro de eliminar el partido ${partido.equipoLocal?.nombre} vs ${partido.equipoVisitante?.nombre}?`,
            tipo: 'danger',
            loading: false,
            action: async () => {
                setModalConfirmar(prev => ({ ...prev, loading: true }));
                try {
                    await api.delete(`/partidos/${partido.id}`);
                    await loadData();
                    setModalConfirmar({ isOpen: false, titulo: '', mensaje: '', tipo: 'info', loading: false, action: null });
                } catch (err) {
                    console.error('Error eliminando partido:', err);
                } finally {
                    setModalConfirmar(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    const handleViewPartido = (partido) => {
        navigate(`/admin/partidos/${partido.id}`);
    };

    const filteredPartidos = useMemo(() => {
        return partidos.filter(partido => {
            const matchesSearch = !searchTerm ||
                (partido.equipoLocal?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (partido.equipoVisitante?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (partido.torneo?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTorneo = !selectedTorneo ||
                String(partido.torneo_id) === String(selectedTorneo) ||
                String(partido.torneo?.id) === String(selectedTorneo);

            const matchesEstado = !filterEstado || partido.estado === filterEstado;

            return matchesSearch && matchesTorneo && matchesEstado;
        });
    }, [partidos, searchTerm, selectedTorneo, filterEstado]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) return <LoadingScreen message="PROCESANDO FIXTURES..." />;

    return (
        <div className="admin-page-container fade-enter">

            <div className="premium-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Lista de Partidos</h3>
                    <button className="pro-btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => /* Add Logic later? user had logic inline */ null}>
                        {/* Logic was just a button with no onClick in original at line 451? No wait */}
                        <Plus size={18} />
                        Nuevo Partido
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {/* Filters... */}
                    <div>
                        <label className="form-label">Buscar partidos</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="pro-input"
                                placeholder="Buscar por equipos..."
                                style={{ paddingLeft: '40px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Torneo</label>
                        <select
                            className="pro-input"
                            value={selectedTorneo}
                            onChange={(e) => setSelectedTorneo(e.target.value)}
                        >
                            <option value="">Todos los torneos</option>
                            {torneos.map(torneo => (
                                <option key={torneo.id} value={torneo.id}>{torneo.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Estado</label>
                        <select
                            className="pro-input"
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            {ESTADOS_VALIDOS.map(estado => (
                                <option key={estado} value={estado}>{formatEstado(estado)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: 40, height: 40, border: '3px solid var(--primary-light)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                        <p>Cargando partidos...</p>
                    </div>
                ) : filteredPartidos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <CalendarCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>No hay partidos</h3>
                        <p style={{ margin: 0 }}>No se encontraron partidos con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Fecha/Hora</th>
                                    <th>Equipos</th>
                                    <th>Torneo</th>
                                    <th>Estado</th>
                                    <th>Marcador</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPartidos.map(partido => (
                                    <tr key={partido.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontSize: '0.9rem' }}>
                                                    {formatDateTime(partido.fecha, partido.hora)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontWeight: 600 }}>
                                                    {partido.equipoLocal?.nombre} vs {partido.equipoVisitante?.nombre}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-neutral">{partido.torneo?.nombre}</span>
                                        </td>
                                        <td>
                                            <span className={`badge-${partido.estado === 'Programado' ? 'warning' :
                                                partido.estado === 'En Juego' ? 'success' :
                                                    partido.estado === 'Finalizado' ? 'neutral' : 'neutral'
                                                }`}>
                                                {formatEstado(partido.estado)}
                                            </span>
                                        </td>
                                        <td>
                                            {partido.estado === 'Finalizado' ? (
                                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                                                    {partido.marcador_local || 0} - {partido.marcador_visitante || 0}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="pro-btn btn-secondary"
                                                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                                    onClick={() => setModalEditar({ isOpen: true, partido, loading: false })}
                                                    title="Editar partido"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className="pro-btn btn-secondary"
                                                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                                    onClick={() => handleViewPartido(partido)}
                                                    title="Ver detalles"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    className="pro-btn btn-danger"
                                                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                                    onClick={() => handleDeletePartido(partido)}
                                                    title="Eliminar partido"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modales */}
            <ModalEditarPartido
                isOpen={modalEditar.isOpen}
                onClose={() => setModalEditar({ isOpen: false, partido: null, loading: false })}
                partido={modalEditar.partido}
                onSave={handleSavePartido}
                loading={modalEditar.loading}
            />

            <ModalConfirmar
                isOpen={modalConfirmar.isOpen}
                onClose={() => setModalConfirmar({ isOpen: false, titulo: '', mensaje: '', tipo: 'info', loading: false, action: null })}
                titulo={modalConfirmar.titulo}
                mensaje={modalConfirmar.mensaje}
                onConfirm={modalConfirmar.action}
                loading={modalConfirmar.loading}
                tipo={modalConfirmar.tipo}
            />
        </div>
    );
};

export default PartidosFixtures;

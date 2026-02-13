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


import api from '../../api';

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
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
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
            <div className="modal-content scale-in" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(245, 158, 11, 0.05))', borderBottom: '2px solid var(--primary)' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                            <Edit size={26} style={{ color: 'var(--primary)' }} />
                            Editar Partido
                        </h2>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {partido.equipoLocal?.nombre} vs {partido.equipoVisitante?.nombre}
                        </p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} style={{ marginTop: 0 }}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '1rem 1.25rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                        <span style={{ color: '#fca5a5' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Equipo Local</label>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: 4 }}>{partido.equipoLocal?.nombre}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Equipo Visitante</label>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: 4 }}>{partido.equipoVisitante?.nombre}</div>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Torneo</label>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: 4 }}>{partido.torneo?.nombre}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Fecha</label>
                            <input type="date" className="pro-input" value={formData.fecha} onChange={(e) => handleChange('fecha', e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Hora</label>
                            <input type="time" className="pro-input" value={formData.hora} onChange={(e) => handleChange('hora', e.target.value)} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Campo</label>
                            <input type="text" className="pro-input" placeholder="Ej. Estadio Central" value={formData.campo} onChange={(e) => handleChange('campo', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Árbitro (Cédula)</label>
                            <input type="text" className="pro-input" placeholder="Opcional" value={formData.arbitro_cedula} onChange={(e) => handleChange('arbitro_cedula', e.target.value)} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Estado</label>
                        <select className="pro-input" value={formData.estado} onChange={(e) => handleChange('estado', e.target.value)}>
                            {ESTADOS_VALIDOS.map(estado => (
                                <option key={estado} value={estado}>{formatEstado(estado)}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: '0.9rem', color: 'var(--gold)' }}>Marcador</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{partido.equipoLocal?.nombre}</label>
                                <input type="number" className="pro-input" min="0" value={formData.marcador_local} onChange={(e) => handleChange('marcador_local', parseInt(e.target.value, 10) || 0)} style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 700 }} />
                            </div>
                            <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-muted)' }}>VS</div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{partido.equipoVisitante?.nombre}</label>
                                <input type="number" className="pro-input" min="0" value={formData.marcador_visitante} onChange={(e) => handleChange('marcador_visitante', parseInt(e.target.value, 10) || 0)} style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 700 }} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ gap: '1rem' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {loading ? (
                                <>
                                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    Guardando...
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
const ModalConfirmar = ({ isOpen, onClose, titulo, mensaje, onConfirm, loading, tipo = 'info' }) => {
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [isOpen]);

    if (!isOpen) return null;

    const colorMap = {
        info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', icon: '#3b82f6' },
        success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', icon: '#10b981' },
        warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', icon: '#f59e0b' },
        danger: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', icon: '#ef4444' },
    };

    const color = colorMap[tipo] || colorMap.info;

    return createPortal((
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content scale-in" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, background: color.bg, border: `2px solid ${color.border}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        {tipo === 'success' && <CheckCircle size={32} style={{ color: color.icon }} />}
                        {tipo === 'warning' && <AlertCircle size={32} style={{ color: color.icon }} />}
                        {tipo === 'danger' && <Trash2 size={32} style={{ color: color.icon }} />}
                        {tipo === 'info' && <CalendarCheck size={32} style={{ color: color.icon }} />}
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 800 }}>{titulo}</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0' }}>{mensaje}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="pro-btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
                        <button className="pro-btn btn-primary" onClick={onConfirm} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {loading ? (
                                <>
                                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    {tipo === 'success' && <CheckCircle size={18} />}
                                    {tipo === 'warning' && <Play size={18} />}
                                    {tipo === 'danger' && <Trash2 size={18} />}
                                    {tipo === 'info' && <Save size={18} />}
                                    Confirmar
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
            const [{ data: partidosData }, { data: torneosData }] = await Promise.all([
                api.get('/partidos'),
                api.get('/torneos'),
            ]);

            console.log('Partidos recibidos:', partidosData);
            setPartidos(Array.isArray(partidosData) ? partidosData : []);
            setTorneos(Array.isArray(torneosData) ? torneosData : []);

            if (torneosData && torneosData.length > 0 && !selectedTorneo) {
                setSelectedTorneo(String(torneosData[0].id));
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
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
                partido.equipoLocal?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                partido.equipoVisitante?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesTorneo = !selectedTorneo || String(partido.torneo_id) === String(selectedTorneo);
            
            const matchesEstado = !filterEstado || partido.estado === filterEstado;
            
            return matchesSearch && matchesTorneo && matchesEstado;
        });
    }, [partidos, searchTerm, selectedTorneo, filterEstado]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div>
            <h1 className="page-title">Partidos y Fixtures</h1>
            
            <div className="pro-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <CalendarCheck size={24} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Gestión de Partidos</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Administra partidos, fixtures y resultados del sistema deportivo.</p>
            </div>

            <div className="pro-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Lista de Partidos</h3>
                    <button className="pro-btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} />
                        Nuevo Partido
                    </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
                        <table className="glass-table">
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
                                            <span className={`badge-${
                                                partido.estado === 'Programado' ? 'warning' :
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

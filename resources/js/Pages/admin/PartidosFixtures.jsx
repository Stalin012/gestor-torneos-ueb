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

import '../../admin_styles.css';
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
            alert(`Error al cargar datos: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [selectedTorneo, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filtrar partidos por torneo, estado y búsqueda
    const partidosFiltrados = useMemo(() => {
        return partidos.filter(p => {
            const matchTorneo = !selectedTorneo || p.torneo_id === parseInt(selectedTorneo);
            const matchEstado = !filterEstado || p.estado === filterEstado;
            const matchSearch = !searchTerm ||
                p.equipoLocal?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.equipoVisitante?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.torneo?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchTorneo && matchEstado && matchSearch;
        });
    }, [partidos, selectedTorneo, filterEstado, searchTerm]);

    const openModalEditar = (partido) => {
        if (!partido || !partido.id) {
            alert('Partido inválido.');
            return;
        }
        setModalEditar({ isOpen: true, partido, loading: false });
    };

    const handleSavePartido = async (id, payload) => {
        setModalEditar(prev => ({ ...prev, loading: true }));
        try {
            await api.put(`/partidos/${id}`, payload);
            await loadData();
            setModalEditar({ isOpen: false, partido: null, loading: false });
            alert('Partido actualizado exitosamente.');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
            alert(err.response?.data?.message || 'Error al guardar el partido.');
            setModalEditar(prev => ({ ...prev, loading: false }));
        }
    };

    const openConfirmAction = (titulo, mensaje, tipo, action) => {
        setModalConfirmar({ isOpen: true, titulo, mensaje, tipo, loading: false, action });
    };

    const handleConfirmAction = async () => {
        if (!modalConfirmar.action) return;
        setModalConfirmar(prev => ({ ...prev, loading: true }));
        try {
            await modalConfirmar.action();
            await loadData();
            setModalConfirmar({ isOpen: false, titulo: '', mensaje: '', tipo: 'info', loading: false, action: null });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error al procesar la acción.');
            setModalConfirmar(prev => ({ ...prev, loading: false }));
        }
    };

    const renderPartidosProgramadosTab = () => (
        <div className="tab-content fade-enter">
            {/* Filtros */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(59, 130, 246, 0.02)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Torneo</label>
                        <select className="pro-input" value={selectedTorneo} onChange={(e) => setSelectedTorneo(e.target.value)}>
                            <option value="">-- Todos los Torneos --</option>
                            {torneos.map((t) => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Estado</label>
                        <select className="pro-input" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                            <option value="">-- Todos los Estados --</option>
                            {ESTADOS_VALIDOS.map(estado => (
                                <option key={estado} value={estado}>{formatEstado(estado)}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Buscar Equipo o Torneo</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" className="pro-input" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Filter size={16} />
                    <span>Mostrando {partidosFiltrados.length} de {partidos.length} partidos</span>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(59, 130, 246, 0.2)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    Cargando partidos...
                </div>
            ) : (
                <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'auto' }}>
                    <table className="glass-table" style={{ minWidth: '1200px' }}>
                        <thead>
                            <tr>
                                <th style={{ minWidth: '150px' }}>Torneo</th>
                                <th style={{ minWidth: '250px' }}>Encuentro</th>
                                <th style={{ minWidth: '140px' }}>Fecha/Hora</th>
                                <th style={{ minWidth: '120px' }}>Campo</th>
                                <th style={{ minWidth: '100px' }}>Árbitro</th>
                                <th style={{ textAlign: 'center', minWidth: '100px' }}>Resultado</th>
                                <th style={{ minWidth: '100px' }}>Estado</th>
                                <th style={{ minWidth: '200px' }}>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {partidosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No hay partidos que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                partidosFiltrados.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <strong style={{ color: '#fff' }}>{p.torneo?.nombre}</strong>
                                                <small style={{ color: 'var(--text-muted)' }}>{p.torneo?.categoria || ''}</small>
                                            </div>
                                        </td>

                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: '250px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'normal', wordBreak: 'break-word' }}>{p.equipoLocal?.nombre || 'TBD'}</div>
                                                    <div style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>VS</div>
                                                    <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'normal', wordBreak: 'break-word' }}>{p.equipoVisitante?.nombre || 'TBD'}</div>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Users size={14} />
                                                        {p.equipoLocal?.jugadores_count || 0} vs {p.equipoVisitante?.jugadores_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            <div>{formatDateTime(p.fecha, p.hora)}</div>
                                        </td>

                                        <td>{p.campo || <span style={{ opacity: 0.5 }}>-</span>}</td>

                                        <td>{p.arbitro_cedula || <span style={{ opacity: 0.5 }}>-</span>}</td>

                                        <td style={{ textAlign: 'center' }}>
                                            {p.estado === 'Finalizado' ? (
                                                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>{p.marcador_local ?? 0} — {p.marcador_visitante ?? 0}</span>
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-darkest)', padding: '4px 8px', borderRadius: '6px' }}>
                                                    {p.hora ? new Date(`${p.fecha} ${p.hora}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <span className={`status-badge ${p.estado === 'Finalizado' ? 'badge-success' : p.estado === 'En Juego' ? 'badge-warning' : 'badge-neutral'}`}>
                                                {formatEstado(p.estado)}
                                            </span>
                                        </td>

                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <button className="pro-btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); openModalEditar(p); }} title="Editar">
                                                    <Edit size={14} />
                                                </button>
                                                {p.estado === 'Programado' && (
                                                    <button className="pro-btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#10b981' }} onClick={(e) => { e.stopPropagation(); openConfirmAction('Iniciar Partido', `¿Iniciar ${p.equipoLocal?.nombre || 'TBD'} vs ${p.equipoVisitante?.nombre}?`, 'success', () => api.post(`/partidos/${p.id}/iniciar`)); }} title="Iniciar">
                                                        <Play size={14} />
                                                    </button>
                                                )}
                                                {p.estado === 'En Juego' && (
                                                    <button className="pro-btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#fbbf24' }} onClick={(e) => { e.stopPropagation(); openConfirmAction('Finalizar Partido', `¿Finalizar ${p.equipoLocal?.nombre || 'TBD'} vs ${p.equipoVisitante?.nombre}?`, 'warning', () => api.post(`/partidos/${p.id}/finalizar`)); }} title="Finalizar">
                                                        <CheckCircle size={14} />
                                                    </button>
                                                )}
                                                <button className="pro-btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); openConfirmAction('Eliminar Partido', `¿Eliminar ${p.equipoLocal?.nombre || 'TBD'} vs ${p.equipoVisitante?.nombre}?`, 'danger', () => api.delete(`/partidos/${p.id}`)); }} title="Eliminar">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderFixturesTab = () => {
        const torneosFiltrados = partidos.filter(p => !selectedTorneo || p.torneo_id === parseInt(selectedTorneo));

        return (
            <div className="tab-content fade-enter">
                {/* Filtros */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Seleccionar Torneo</label>
                            <select className="pro-input" value={selectedTorneo} onChange={(e) => setSelectedTorneo(e.target.value)}>
                                <option value="">-- Todos los Torneos --</option>
                                {torneos.map((t) => (
                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'end' }}>
                            <button className="pro-btn btn-primary" onClick={() => {
                                if (!selectedTorneo) {
                                    alert('Por favor, selecciona un torneo primero.');
                                    return;
                                }
                                openConfirmAction('Generar Fixture', `¿Generar fixture para el torneo seleccionado?`, 'info', () => api.get(`/fixtures/generar/${selectedTorneo}`));
                            }}>
                                <Zap size={18} style={{ marginRight: '8px' }} /> Generar Fixture
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <Filter size={16} />
                        <span>Mostrando {torneosFiltrados.length} partidos del torneo seleccionado</span>
                    </div>
                </div>

                {/* Tabla */}
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ width: 40, height: 40, border: '3px solid rgba(59, 130, 246, 0.2)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                        Cargando partidos...
                    </div>
                ) : (
                    <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'auto' }}>
                        <table className="glass-table" style={{ minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th style={{ minWidth: '300px' }}>Encuentro</th>
                                    <th style={{ minWidth: '140px' }}>Fecha/Hora</th>
                                    <th style={{ minWidth: '120px' }}>Campo</th>
                                    <th style={{ minWidth: '120px' }}>Estado</th>
                                </tr>
                            </thead>

                            <tbody>
                                {torneosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No hay partidos generados para este torneo. Usa el botón "Generar Fixture" para crearlos.
                                        </td>
                                    </tr>
                                ) : (
                                    torneosFiltrados.map((p) => (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: '300px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'normal', wordBreak: 'break-word' }}>{p.equipoLocal?.nombre || 'TBD'}</div>
                                                        <div style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center' }}>VS</div>
                                                        <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'normal', wordBreak: 'break-word' }}>{p.equipoVisitante?.nombre || 'TBD'}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                <div>{formatDateTime(p.fecha, p.hora)}</div>
                                            </td>

                                            <td>{p.campo || <span style={{ opacity: 0.5 }}>-</span>}</td>

                                            <td>
                                                <span className={`status-badge ${p.estado === 'Finalizado' ? 'badge-success' : p.estado === 'En Juego' ? 'badge-warning' : 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    {p.estado === 'Programado' && <Clock size={12} />}
                                                 {p.estado === 'En Juego' && <Play size={12} />}
                                                 {p.estado === 'Finalizado' && <CheckCircle size={12} />}
                                                 {formatEstado(p.estado)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="admin-page-container fade-enter">
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Partidos y Fixtures</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Programación de encuentros y generación de calendarios.
                    </p>
                </div>
            </div>

            <div className="pro-card">
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    <button className={`tab-btn ${activeTab === 'programados' ? 'active' : ''}`} onClick={() => setActiveTab('programados')} style={{ padding: '1rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'programados' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'programados' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'programados' ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                        <Clock size={18} /> Partidos Programados
                    </button>

                    <button className={`tab-btn ${activeTab === 'fixtures' ? 'active' : ''}`} onClick={() => setActiveTab('fixtures')} style={{ padding: '1rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'fixtures' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'fixtures' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'fixtures' ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                        <Zap size={18} /> Generar Fixtures
                    </button>
                </div>

                <div className="main-module-content">
                    {activeTab === 'programados' ? renderPartidosProgramadosTab() : renderFixturesTab()}
                </div>
            </div>

            <ModalEditarPartido isOpen={modalEditar.isOpen} onClose={() => setModalEditar({ isOpen: false, partido: null, loading: false })} partido={modalEditar.partido} onSave={handleSavePartido} loading={modalEditar.loading} />

            <ModalConfirmar isOpen={modalConfirmar.isOpen} onClose={() => setModalConfirmar({ isOpen: false, titulo: '', mensaje: '', tipo: 'info', loading: false, action: null })} titulo={modalConfirmar.titulo} mensaje={modalConfirmar.mensaje} tipo={modalConfirmar.tipo} onConfirm={handleConfirmAction} loading={modalConfirmar.loading} />

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .glass-table th:nth-child(4), .glass-table td:nth-child(4) { display: none; } /* Campo */
                    .glass-table th:nth-child(5), .glass-table td:nth-child(5) { display: none; } /* Árbitro */
                    .glass-table th:nth-child(6), .glass-table td:nth-child(6) { width: 80px; } /* Resultado */
                    .glass-table th:nth-child(7), .glass-table td:nth-child(7) { width: 100px; } /* Estado */
                    .glass-table th:nth-child(8), .glass-table td:nth-child(8) { width: 150px; } /* Acciones */
                }
            `}</style>
        </div>
    );
};

export default PartidosFixtures;

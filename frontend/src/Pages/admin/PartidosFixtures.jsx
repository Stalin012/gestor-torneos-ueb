import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
    CalendarCheck, Zap, Edit, Clock, X, Hash, CornerDownRight, Eye, Save,
    AlertCircle, Play, CheckCircle, Trash2, Plus, Search, Filter, Users,
    Trophy, MapPin, ChevronRight, Activity, Calendar, Shield, Award, MoreHorizontal,
    Flag, Trash
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

// ================= CONSTANTES =====================
const ESTADOS = ['Programado', 'En Juego', 'Finalizado', 'Suspendido'];

// ================= MODAL DE PARTIDO =====================
const PartidoModal = ({ isOpen, onClose, partido, onSave, loading, arbitros }) => {
    const [form, setForm] = useState({
        fecha: '',
        hora: '',
        campo: '',
        arbitro_cedula: '',
        estado: 'Programado',
        marcador_local: 0,
        marcador_visitante: 0
    });

    useEffect(() => {
        if (partido) {
            setForm({
                fecha: partido.fecha || '',
                hora: partido.hora ? partido.hora.substring(0, 5) : '',
                campo: partido.campo || '',
                arbitro_cedula: partido.arbitro_cedula || '',
                estado: partido.estado || 'Programado',
                marcador_local: partido.marcador_local || 0,
                marcador_visitante: partido.marcador_visitante || 0
            });
        }
    }, [partido, isOpen]);

    if (!isOpen || !partido) return null;

    return createPortal(
        <div className="modal-overlay" style={{ padding: '15px' }}>
            <div className="modal-content modal-lg" style={{
                width: '100%',
                maxWidth: '700px',
                maxHeight: '95vh',
                overflowY: 'auto',
                margin: 'auto'
            }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ borderBottom: '2px solid #6366f1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: '40px', height: '40px', minWidth: '40px' }}>
                            <CalendarCheck size={22} />
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Gestión de Encuentro</h2>
                            <p className="modal-subtitle" style={{ fontSize: '0.8rem' }}>Actualización de programación y resultados</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" type="button" onClick={onClose}><X size={22} /></button>
                </div>

                <form onSubmit={e => {
                    e.preventDefault();
                    if (window.confirm('¿Desea guardar los cambios en este encuentro?')) {
                        onSave(partido.id, form);
                    }
                }}>
                    <div className="modal-body" style={{ padding: '1.5rem' }}>
                        {/* Marcador */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            background: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: '20px',
                            border: '1px solid rgba(99, 102, 241, 0.1)'
                        }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginBottom: '8px', wordBreak: 'break-word' }}>{partido.equipoLocal?.nombre}</div>
                                <input type="number" className="pro-input" style={{ width: '70px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 900, height: '54px' }} value={form.marcador_local} onChange={e => setForm({ ...form, marcador_local: e.target.value })} />
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366f1' }}>-</div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginBottom: '8px', wordBreak: 'break-word' }}>{partido.equipoVisitante?.nombre}</div>
                                <input type="number" className="pro-input" style={{ width: '70px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 900, height: '54px' }} value={form.marcador_visitante} onChange={e => setForm({ ...form, marcador_visitante: e.target.value })} />
                            </div>
                        </div>

                        {/* Detalles */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                            <div className="form-group">
                                <label className="form-label">Fecha</label>
                                <input type="date" className="pro-input" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hora</label>
                                <input type="time" className="pro-input" required value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Campo / Locación</label>
                                <input className="pro-input" value={form.campo} onChange={e => setForm({ ...form, campo: e.target.value })} placeholder="Ej: Cancha Central" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Estado</label>
                                <select className="pro-input" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                                    {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Árbitro Asignado</label>
                                <select className="pro-input" value={form.arbitro_cedula} onChange={e => setForm({ ...form, arbitro_cedula: e.target.value })}>
                                    <option value="">Sin Asignar</option>
                                    {arbitros.map(a => (
                                        <option key={a.cedula} value={a.cedula}>
                                            {a.persona?.nombres} {a.persona?.apellidos} ({a.especialidad})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ padding: '1.2rem 1.5rem' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                            {loading ? <div className="spinner-sm" /> : <Save size={18} />} Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ================= MODAL GENERAR CALENDARIO =====================
const GenerarCalendarioModal = ({ isOpen, onClose, onGenerate, loading, torneos }) => {
    const [torneoId, setTorneoId] = useState('');

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" style={{ padding: '15px' }}>
            <div className="modal-content" style={{ maxWidth: '500px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ borderBottom: '2px solid #6366f1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: '40px', height: '40px' }}>
                            <Zap size={22} />
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Generar Calendario</h2>
                            <p className="modal-subtitle" style={{ fontSize: '0.8rem' }}>Crea encuentros automáticamente</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={22} /></button>
                </div>
                <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Seleccionar Torneo</label>
                        <select className="pro-input" value={torneoId} onChange={e => setTorneoId(e.target.value)}>
                            <option value="">Seleccione un torneo...</option>
                            {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.deporte?.nombre})</option>)}
                        </select>
                        <div style={{ marginTop: '1.2rem', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', gap: '10px' }}>
                            <AlertCircle size={18} color="#6366f1" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                                Se generarán todos los encuentros de ida para el torneo seleccionado basándose en los equipos inscritos.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="modal-footer" style={{ padding: '1.2rem 1.5rem' }}>
                    <button className="pro-btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
                    <button
                        className="pro-btn btn-primary"
                        disabled={loading || !torneoId}
                        onClick={() => onGenerate(torneoId)}
                        style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                    >
                        {loading ? <div className="spinner-sm" /> : <><Zap size={18} /> Generar Ahora</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ================= MODAL CREAR PARTIDO DIRECTO =====================
const CrearPartidoModal = ({ isOpen, onClose, onCreate, loading, torneos, arbitros }) => {
    const [form, setForm] = useState({
        torneo_id: '',
        equipo_local_id: '',
        equipo_visitante_id: '',
        fecha: '',
        hora: '',
        campo: '',
        arbitro_cedula: ''
    });

    const [equiposDisponibles, setEquiposDisponibles] = useState([]);

    useEffect(() => {
        if (form.torneo_id) {
            const torneo = torneos.find(t => t.id === parseInt(form.torneo_id));
            setEquiposDisponibles(torneo?.equipos || []);
        } else {
            setEquiposDisponibles([]);
        }
    }, [form.torneo_id, torneos]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" style={{ padding: '15px' }}>
            <div className="modal-content modal-lg" style={{ maxWidth: '750px', margin: 'auto', maxHeight: '95vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ borderBottom: '2px solid #6366f1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: '40px', height: '40px' }}>
                            <Plus size={22} />
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Nuevo Encuentro Manual</h2>
                            <p className="modal-subtitle" style={{ fontSize: '0.8rem' }}>Carga directa de programación deportiva</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={22} /></button>
                </div>
                <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Torneo Anfitrión</label>
                            <select className="pro-input" required value={form.torneo_id} onChange={e => setForm({ ...form, torneo_id: e.target.value })}>
                                <option value="">Seleccione el torneo...</option>
                                {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.deporte?.nombre})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Equipo Local</label>
                            <select className="pro-input" required value={form.equipo_local_id} onChange={e => setForm({ ...form, equipo_local_id: e.target.value })}>
                                <option value="">Seleccione rival...</option>
                                {equiposDisponibles.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Equipo Visitante</label>
                            <select className="pro-input" required value={form.equipo_visitante_id} onChange={e => setForm({ ...form, equipo_visitante_id: e.target.value })}>
                                <option value="">Seleccione rival...</option>
                                {equiposDisponibles.filter(e => e.id !== parseInt(form.equipo_local_id)).map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha Programada</label>
                            <input type="date" className="pro-input" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Hora de Inicio</label>
                            <input type="time" className="pro-input" required value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Lugar / Campo</label>
                            <input className="pro-input" value={form.campo} onChange={e => setForm({ ...form, campo: e.target.value })} placeholder="Ej: Cancha Central" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Juez / Árbitro</label>
                            <select className="pro-input" value={form.arbitro_cedula} onChange={e => setForm({ ...form, arbitro_cedula: e.target.value })}>
                                <option value="">Sin Asignar</option>
                                {arbitros.map(a => (
                                    <option key={a.cedula} value={a.cedula}>
                                        {a.persona?.nombres} {a.persona?.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="modal-footer" style={{ padding: '1.2rem 1.5rem' }}>
                    <button className="pro-btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
                    <button
                        className="pro-btn btn-primary"
                        disabled={loading || !form.torneo_id || !form.equipo_local_id || !form.equipo_visitante_id}
                        onClick={() => onCreate(form)}
                        style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                    >
                        {loading ? <div className="spinner-sm" /> : <><Plus size={18} /> Crear Encuentro</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ================= COMPONENTE PRINCIPAL =====================
const PartidosFixtures = () => {
    const { addNotification } = useNotification();
    const [partidos, setPartidos] = useState([]);
    const [arbitros, setArbitros] = useState([]);
    const [deportes, setDeportes] = useState([]);
    const [torneos, setTorneos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroDeporte, setFiltroDeporte] = useState('Todos');
    const [filtroEstado, setFiltroEstado] = useState('Todos');

    const [selectedPartido, setSelectedPartido] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pResp, aResp, dResp, tResp] = await Promise.all([
                api.get('/partidos'),
                api.get('/arbitros'),
                api.get('/deportes'),
                api.get('/torneos')
            ]);
            setPartidos(Array.isArray(pResp.data) ? pResp.data : (pResp.data?.data || []));
            setArbitros(Array.isArray(aResp.data) ? aResp.data : (aResp.data?.data || []));
            setDeportes(Array.isArray(dResp.data) ? dResp.data : (dResp.data?.data || []));
            setTorneos(Array.isArray(tResp.data) ? tResp.data : (tResp.data?.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveEdit = async (id, form) => {
        setLoading(true);
        try {
            await api.put(`/partidos/${id}`, form);
            addNotification('Encuentro actualizado correctamente', 'success');
            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            addNotification('Error al actualizar el partido.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDirect = async (form) => {
        setLoading(true);
        try {
            await api.post('/partidos', form);
            addNotification('Encuentro creado correctamente', 'success');
            setIsCreateModalOpen(false);
            fetchData();
        } catch (err) {
            addNotification('Error al crear el encuentro.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFixture = async (torneoId) => {
        setLoading(true);
        try {
            const resp = await api.get(`/fixtures/generar/${torneoId}`);
            addNotification(resp.data.message || 'Fixture generado correctamente', 'success');
            setIsGenerateModalOpen(false);
            fetchData();
        } catch (err) {
            addNotification(err.response?.data?.message || 'Error al generar fixture.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Deseas anular este encuentro? Esta acción no se puede deshacer.")) return;
        setLoading(true);
        try {
            await api.delete(`/partidos/${id}`);
            addNotification('Encuentro anulado correctamente', 'info');
            fetchData();
        } catch (err) {
            addNotification('Error al eliminar el encuentro.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filtrado lógico
    const filteredPartidos = useMemo(() => {
        return partidos.filter(p => {
            const matchesSearch =
                p.equipoLocal?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.equipoVisitante?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.torneo?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDeporte = filtroDeporte === 'Todos' || p.torneo?.deporte?.nombre === filtroDeporte;
            const matchesEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;

            return matchesSearch && matchesDeporte && matchesEstado;
        });
    }, [partidos, searchTerm, filtroDeporte, filtroEstado]);

    if (loading && partidos.length === 0) return <LoadingScreen message="Cargando cronograma deportivo..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>

            {/* CABECERA */}
            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ minWidth: '280px', flex: 1 }}>
                        <small style={{ color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Módulo Operativo</small>
                        <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.5rem 0' }}>
                            <CalendarCheck size={36} color="#6366f1" /> Gestión de Partidos
                        </h1>
                        <p style={{ color: '#94a3b8', maxWidth: '600px', fontSize: '0.9rem' }}>Control de cronogramas, resultados en vivo y designaciones oficiales de cada campeonato.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <button className="pro-btn btn-secondary" onClick={() => setIsGenerateModalOpen(true)}>
                            <Plus size={18} /> Generar Calendario
                        </button>
                        <button className="pro-btn btn-primary" onClick={() => setIsCreateModalOpen(true)} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                            <Zap size={18} /> Partido Directo
                        </button>
                    </div>
                </div>
            </header>

            {/* FILTROS Y BÚSQUEDA */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.2rem',
                background: 'rgba(30,32,44,0.3)',
                padding: '1.2rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                    <input
                        className="pro-input"
                        placeholder="Buscar por equipo o torneo..."
                        style={{ paddingLeft: '45px', background: 'rgba(15,17,26,0.5)', width: '100%' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Flag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                        <select className="pro-input" style={{ paddingLeft: '38px', background: 'rgba(15,17,26,0.5)', width: '100%', fontSize: '0.85rem' }} value={filtroDeporte} onChange={e => setFiltroDeporte(e.target.value)}>
                            <option value="Todos">Todos los Deportes</option>
                            {deportes.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                        <select className="pro-input" style={{ paddingLeft: '38px', background: 'rgba(15,17,26,0.5)', width: '100%', fontSize: '0.85rem' }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                            <option value="Todos">Cualquier Estado</option>
                            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* LISTADO DE PARTIDOS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 450px), 1fr))',
                gap: '1.5rem'
            }}>
                {filteredPartidos.length > 0 ? (
                    filteredPartidos.map(p => (
                        <div key={p.id} className="pro-card dashboard-card-hover" style={{
                            padding: '1.5rem',
                            borderRadius: '24px',
                            background: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.2rem',
                            transition: 'all 0.3s ease'
                        }}>
                            {/* Torneo y Estado */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        color: '#818cf8',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        width: 'fit-content',
                                        textTransform: 'uppercase'
                                    }}>{p.torneo?.deporte?.nombre}</span>
                                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: '1.2' }}>{p.torneo?.nombre}</div>
                                </div>
                                <span style={{
                                    padding: '6px 12px',
                                    background: p.estado === 'Finalizado' ? 'rgba(239, 68, 68, 0.15)' : p.estado === 'En Juego' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                    color: p.estado === 'Finalizado' ? '#ef4444' : p.estado === 'En Juego' ? '#10b981' : '#818cf8',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 950,
                                    whiteSpace: 'nowrap'
                                }}>{p.estado}</span>
                            </div>

                            {/* Duelo Central */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1rem',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.equipoLocal?.nombre}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>LOCAL</div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 950, color: '#fff' }}>{p.marcador_local}</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#6366f1', opacity: 0.5 }}>:</span>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 950, color: '#fff' }}>{p.marcador_visitante}</span>
                                </div>

                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.equipoVisitante?.nombre}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>VISITA</div>
                                </div>
                            </div>

                            {/* Detalles Logísticos */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.8rem',
                                padding: '0.2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                    <Calendar size={14} color="#6366f1" />
                                    <span>{p.fecha || 'Por definir'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                    <Clock size={14} color="#6366f1" />
                                    <span>{p.hora ? p.hora.substring(0, 5) : '--:--'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', gridColumn: 'span 2' }}>
                                    <MapPin size={14} color="#6366f1" />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.campo || 'Ubicación pendiente'}</span>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginTop: 'auto',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                paddingTop: '1rem'
                            }}>
                                <button className="pro-btn" style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '14px',
                                    background: 'rgba(99,102,241,0.1)',
                                    color: '#818cf8',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem'
                                }} onClick={() => { setSelectedPartido(p); setIsEditModalOpen(true); }}>
                                    <Edit size={16} /> Editar
                                </button>
                                <button className="pro-btn" style={{
                                    padding: '10px',
                                    borderRadius: '14px',
                                    background: 'rgba(239,68,68,0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} onClick={() => handleDelete(p.id)}>
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', background: 'rgba(30,41,59,0.2)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                        <div style={{ marginBottom: '1.5rem', opacity: 0.3 }}>
                            <CalendarCheck size={64} color="#fff" />
                        </div>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No hay encuentros programados</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Intenta ajustar los filtros de búsqueda o genera un nuevo calendario.</p>
                    </div>
                )}
            </div>

            <PartidoModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} partido={selectedPartido} onSave={handleSaveEdit} loading={loading} arbitros={arbitros} />
            <GenerarCalendarioModal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} torneos={torneos} onGenerate={handleGenerateFixture} loading={loading} />
            <CrearPartidoModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} torneos={torneos} arbitros={arbitros} onCreate={handleCreateDirect} loading={loading} />

        </div>
    );
};

export default PartidosFixtures;


import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Users,
    List,
    CheckCircle,
    X,
    Trash2,
    Edit,
    Plus,
    CreditCard,
    ClipboardCheck,
    ShieldAlert,
    Clock,
    Trophy,
    User,
    Save,
    ChevronRight,
    Search,
    Filter,
    ArrowRight,
    Camera,
    Info,
    AlertTriangle
} from 'lucide-react';

import LoadingScreen from "../../components/LoadingScreen";
import api from "../../api";
import { useNotification } from "../../context/NotificationContext";

// ============================================================
// 1. Modal de Detalle / Gestión de Equipo (PREMIUM)
// ============================================================
const EquipoDetailModal = ({ isOpen, onClose, equipo, onUpdated }) => {
    const { addNotification } = useNotification();
    const [teamName, setTeamName] = useState('');
    const [teamLogo, setTeamLogo] = useState('');
    const [jugadores, setJugadores] = useState([]);
    const [newCedula, setNewCedula] = useState('');
    const [loadingJugadores, setLoadingJugadores] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadJugadores = useCallback(async () => {
        if (!equipo) return;
        try {
            setLoadingJugadores(true);
            const resp = await api.get(`/equipos/${equipo.id}/jugadores`);
            // Con axios, la data está en resp.data
            const jugadoresData = resp.data?.jugadores?.data || resp.data?.jugadores || [];
            setJugadores(Array.isArray(jugadoresData) ? jugadoresData : []);
        } catch (err) {
            console.error('Error cargando jugadores:', err);
        } finally {
            setLoadingJugadores(false);
        }
    }, [equipo]);

    useEffect(() => {
        if (isOpen && equipo) {
            setTeamName(equipo.nombre || '');
            setTeamLogo(equipo.logo || '');
            loadJugadores();
        }
    }, [equipo, isOpen, loadJugadores]);

    if (!isOpen) return null;

    const handleUpdateIdentity = async () => {
        if (!teamName.trim()) {
            addNotification('El nombre del equipo es obligatorio.', 'warning');
            return;
        }

        if (!window.confirm('¿Desea actualizar la identidad corporativa del equipo?')) return;
        setSaving(true);
        try {
            await api.put(`/equipos/${equipo.id}`, {
                nombre: teamName.trim(),
                logo: teamLogo.trim()
            });
            addNotification('Identidad actualizada correctamente', 'success');
            if (onUpdated) onUpdated();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error al actualizar datos corporativos.';
            addNotification(errorMsg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddPlayer = async () => {
        if (!newCedula.trim()) return;
        try {
            await api.post(`/equipos/${equipo.id}/agregar-jugador`, {
                cedula: newCedula.trim()
            });
            setNewCedula('');
            loadJugadores();
            addNotification('Deportista vinculado con éxito', 'success');
        } catch (err) {
            console.error('Error al vincular:', err.response?.data);
            const errorMsg = err.response?.data?.message || 'Identificación no encontrada o no registrada como jugador.';
            addNotification(errorMsg, 'error');
        }
    };

    const handleRemovePlayer = async (cedula) => {
        if (!confirm("¿Deseas desvincular a este jugador del equipo?")) return;
        try {
            await api.delete(`/equipos/${equipo.id}/jugador/${cedula}`);
            loadJugadores();
            addNotification('Vínculo comercial finalizado', 'info');
        } catch (err) {
            addNotification('Error al desvincular.', 'error');
        }
    };

    return createPortal(
        <div className="modal-overlay fade-in" style={{ zIndex: 1200 }}>
            <div className="modal-content modal-lg scale-in" onClick={e => e.stopPropagation()} style={{ borderRadius: '32px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ color: '#fff' }}>Gestión de Colectivo</h2>
                            <p className="modal-subtitle">Administración de identidad y nómina</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose} style={{ color: '#fff' }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                        {/* LEFT: IDENTITY */}
                        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Camera size={18} color="#3b82f6" /> Perfil Corporativo
                            </h3>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Nombre del Equipo</label>
                                <input className="pro-input" value={teamName} onChange={e => setTeamName(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="form-label">URL del Logo (Opcional)</label>
                                <input className="pro-input" value={teamLogo} onChange={e => setTeamLogo(e.target.value)} placeholder="https://..." />
                            </div>
                            <button className="pro-btn btn-primary" onClick={handleUpdateIdentity} disabled={saving} style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                {saving ? <div className="spinner-sm" /> : <Save size={18} />} Guardar Identidad
                            </button>
                        </div>

                        {/* RIGHT: ROSTER */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '24px', border: '1px dashed rgba(59, 130, 246, 0.3)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Vincular Nuevo Deportista</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        className="pro-input"
                                        placeholder="Cédula / Identificación..."
                                        value={newCedula}
                                        onChange={e => setNewCedula(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleAddPlayer()}
                                    />
                                    <button className="pro-btn btn-primary" onClick={handleAddPlayer} style={{ padding: '0 1.5rem' }}>
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1, maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#94a3b8', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    Nómina Actual <span>{jugadores.length}</span>
                                </h3>
                                {loadingJugadores ? (
                                    <div className="spinner-sm" style={{ margin: '2rem auto' }} />
                                ) : jugadores.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Sin jugadores inscritos.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {jugadores.map(player => (
                                            <div key={player.cedula} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{player.persona?.nombres} {player.persona?.apellidos}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>CI: {player.cedula}</div>
                                                </div>
                                                <button className="pro-btn" onClick={() => handleRemovePlayer(player.cedula)} style={{ padding: '8px', color: '#ef4444', background: 'transparent' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

/* ============================================================
   2. Modal de Creación de Equipo
============================================================ */
const CreateEquipoModal = ({ isOpen, onClose, onCreated, torneos, deportes, categorias, initialTorneoId }) => {
    const { addNotification } = useNotification();
    const [form, setForm] = useState({
        nombre: '',
        torneo_id: '',
        deporte_id: '',
        categoria_id: '',
        representante_cedula: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({
                nombre: '',
                torneo_id: initialTorneoId || '',
                deporte_id: '',
                categoria_id: '',
                representante_cedula: ''
            });
        }
    }, [isOpen, initialTorneoId]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de campos obligatorios
        if (!form.nombre.trim() || !form.torneo_id || !form.deporte_id || !form.categoria_id) {
            addNotification('Por favor, complete todos los campos obligatorios del equipo.', 'warning');
            return;
        }

        setLoading(true);
        try {
            await api.post('/equipos', form);
            addNotification('Equipo registrado exitosamente', 'success');
            if (onCreated) onCreated();
            onClose();
        } catch (err) {
            const serverMsg = err.response?.data?.message;
            const errors = err.response?.data?.errors;

            if (errors) {
                // Si hay errores de validación específicos (ej: nombre duplicado)
                const firstError = Object.values(errors)[0][0];
                addNotification(firstError, 'error');
            } else {
                addNotification(serverMsg || 'Error al registrar equipo.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-content modal-md" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            <Plus size={28} />
                        </div>
                        <div>
                            <h2 className="modal-title">Gestión de Contingente</h2>
                            <p className="modal-subtitle" style={{ color: '#94a3b8' }}>Alta de equipos y asignación de categorías</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" type="button" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Nombre del Colectivo</label>
                                <input className="pro-input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Rayos del Valle" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Evento / Torneo</label>
                                    <select className="pro-input" required value={form.torneo_id} onChange={e => setForm({ ...form, torneo_id: e.target.value })}>
                                        <option value="">Seleccione...</option>
                                        {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cédula Representante</label>
                                    <input className="pro-input" required value={form.representante_cedula} onChange={e => setForm({ ...form, representante_cedula: e.target.value })} placeholder="0000000000" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Disciplina</label>
                                    <select className="pro-input" required value={form.deporte_id} onChange={e => setForm({ ...form, deporte_id: e.target.value })}>
                                        <option value="">Seleccione...</option>
                                        {deportes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Categoría</label>
                                    <select className="pro-input" required value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                                        <option value="">Seleccione...</option>
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading}>
                            {loading ? <div className="spinner-sm" /> : <CheckCircle size={18} />} Crear Registro
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

/* ============================================================
   MAIN COMPONENT: EquiposInscripciones
============================================================ */
const EquiposInscripciones = () => {
    const { torneoId } = useParams();
    const { addNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('equipos');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [equipos, setEquipos] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [torneos, setTorneos] = useState([]);
    const [deportes, setDeportes] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [eResp, iResp, tResp, dResp, cResp] = await Promise.all([
                api.get(torneoId ? `/torneos/${torneoId}/equipos` : '/equipos'),
                api.get('/inscripciones'),
                api.get('/torneos'),
                api.get('/deportes'),
                api.get('/categorias')
            ]);
            // Axios devuelve .data del body
            setEquipos(Array.isArray(eResp.data) ? eResp.data : (eResp.data?.data || []));

            const inscData = Array.isArray(iResp.data) ? iResp.data : (iResp.data?.data || []);
            setInscripciones(inscData.filter(i => i.estado === 'Pendiente'));

            setTorneos(Array.isArray(tResp.data) ? tResp.data : (tResp.data?.data || []));
            setDeportes(Array.isArray(dResp.data) ? dResp.data : (dResp.data?.data || []));
            setCategorias(Array.isArray(cResp.data) ? cResp.data : (cResp.data?.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [torneoId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApprove = async (id) => {
        if (!confirm("¿Deseas formalizar esta inscripción? El equipo quedará habilitado.")) return;
        try {
            await api.post(`/inscripciones/${id}/aprobar`);
            addNotification('Inscripción aprobada satisfactoriamente', 'success');
            loadData();
        } catch (err) {
            addNotification('Error al aprobar.', 'error');
        }
    };

    const handleReject = async (id) => {
        if (!confirm("¿Rechazar solicitud? Esta acción notificará al representante.")) return;
        try {
            await api.post(`/inscripciones/${id}/rechazar`);
            addNotification('Solicitud rechazada', 'info');
            loadData();
        } catch (err) {
            addNotification('Error al procesar rechazo.', 'error');
        }
    };

    const handleDeleteEquipo = async (id) => {
        if (!confirm("¿Eliminar equipo del sistema permanentemente?")) return;
        try {
            await api.delete(`/equipos/${id}`);
            addNotification('Equipo removido del catálogo', 'success');
            loadData();
        } catch (err) {
            addNotification('Existen dependencias activas que impiden la eliminación.', 'error');
        }
    };

    const filteredEquipos = equipos.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.representante?.nombres?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && equipos.length === 0) return <LoadingScreen message="Auditoría de Contingente..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* HEADER */}
            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div className="header-info">
                        <small className="university-label" style={{ color: '#10b981', fontWeight: 800 }}>Módulo Administrativo</small>
                        <h1 className="content-title" style={{ color: '#fff', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Users size={42} color="#10b981" /> Equipos & Afiliaciones
                        </h1>
                        <p className="content-subtitle" style={{ color: '#94a3b8' }}>Supervisión de colectivos deportivos y aprobación de solicitudes de ingreso</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="pro-btn btn-secondary" style={{ padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Filter size={18} /> Filtrar
                        </button>
                        <button className="pro-btn btn-primary" onClick={() => setIsCreateModalOpen(true)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.8rem 1.5rem', borderRadius: '14px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
                            <Plus size={20} /> Registrar Equipo
                        </button>
                    </div>
                </div>
            </header>

            {/* TAB-STYLE BUTTONS AND SEARCH */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '2rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    display: 'flex',
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    padding: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <button
                        onClick={() => setActiveTab('equipos')}
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '18px',
                            border: 'none',
                            background: activeTab === 'equipos' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                            color: activeTab === 'equipos' ? '#fff' : '#94a3b8',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: '0.3s'
                        }}
                    >
                        <Users size={18} /> Catálogo ({equipos.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('inscripciones')}
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '18px',
                            border: 'none',
                            background: activeTab === 'inscripciones' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                            color: activeTab === 'inscripciones' ? '#fff' : '#94a3b8',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: '0.3s'
                        }}
                    >
                        <ClipboardCheck size={18} /> Solicitudes {inscripciones.length > 0 && <span style={{ background: '#fff', color: '#f59e0b', padding: '1px 7px', borderRadius: '8px', fontSize: '0.7rem' }}>{inscripciones.length}</span>}
                    </button>
                </div>

                <div className="search-wrapper" style={{ flex: 1, maxWidth: '450px', margin: 0 }}>
                    <Search size={20} className="search-icon" style={{ color: '#10b981' }} />
                    <input
                        className="pro-input"
                        placeholder="Filtrar por nombre de equipo o representante..."
                        style={{ paddingLeft: '3.5rem', height: '54px', borderRadius: '20px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="rep-content-wrapper">
                {activeTab === 'equipos' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
                        {filteredEquipos.map(equipo => (
                            <div key={equipo.id} className="pro-card" style={{
                                padding: '2rem',
                                borderRadius: '28px',
                                background: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: '0.4s'
                            }}>
                                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '20px',
                                        background: equipo.logo ? `url(${equipo.logo}) center/cover` : 'linear-gradient(135deg, #10b981, #059669)',
                                        border: '3px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: 900,
                                        fontSize: '1.5rem'
                                    }}>
                                        {!equipo.logo && equipo.nombre.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>{equipo.nombre}</h3>
                                            <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '8px', fontWeight: 800 }}>ID: #{equipo.id}</span>
                                        </div>
                                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>{equipo.torneo?.nombre || 'General'}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '18px', marginBottom: '1.5rem' }}>
                                    <div>
                                        <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800 }}>Disciplina</small>
                                        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{equipo.deporte?.nombre}</div>
                                    </div>
                                    <div>
                                        <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800 }}>Categoría</small>
                                        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{equipo.categoria?.nombre || 'N/A'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{equipo.representante?.nombres || 'S. Representante'}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Responsable</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="pro-btn btn-secondary" style={{ padding: '10px', borderRadius: '12px' }} onClick={() => { setSelectedEquipo(equipo); setIsDetailModalOpen(true); }}><Edit size={16} /></button>
                                        <button className="pro-btn btn-danger" style={{ padding: '10px', borderRadius: '12px' }} onClick={() => handleDeleteEquipo(equipo.id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        borderRadius: '32px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        overflow: 'hidden'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                                <tr>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Club / Solicitante</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Evento Destino</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>Miembros</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'right', color: '#94a3b8', fontWeight: 800 }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscripciones.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '6rem', textAlign: 'center' }}>
                                            <ShieldAlert size={64} color="#64748b" opacity={0.2} style={{ marginBottom: '1.5rem' }} />
                                            <h3 style={{ color: '#fff', margin: 0 }}>Bandeja Limpia</h3>
                                            <p style={{ color: '#94a3b8' }}>No hay solicitudes de inscripción pendientes.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    inscripciones.map(insc => (
                                        <tr key={insc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={20} /></div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#fff' }}>{insc.equipo?.nombre}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Rep: {insc.equipo?.representante?.nombres}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <span style={{ padding: '6px 12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem' }}>
                                                    {insc.torneo?.nombre || 'Torneo General'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                                                <div style={{ fontWeight: 800, color: '#fff' }}>{insc.equipo?.jugadores_count || 0}</div>
                                                <small style={{ color: '#64748b' }}>Participantes</small>
                                            </td>
                                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button className="pro-btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '10px 15px' }} onClick={() => handleApprove(insc.id)}><CheckCircle size={18} /> Validar</button>
                                                    <button className="pro-btn btn-danger" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '10px 15px' }} onClick={() => handleReject(insc.id)}><X size={18} /> Rechazar</button>
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

            <EquipoDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                equipo={selectedEquipo}
                onUpdated={loadData}
            />

            <CreateEquipoModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={loadData}
                torneos={torneos}
                deportes={deportes}
                categorias={categorias}
                initialTorneoId={torneoId}
            />
        </div>
    );
};

export default EquiposInscripciones;

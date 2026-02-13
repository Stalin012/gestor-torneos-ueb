import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Trophy
} from 'lucide-react';

import LoadingScreen from "../../components/LoadingScreen";
import api from "../../api";
import { StatCard } from "../../components/StatsComponents";

/* ============================================================
   1. Modal de Detalle / Gestión de Equipo
============================================================ */
/* ============================================================
   1. Modal de Detalle / Gestión de Equipo (ELITE)
============================================================ */
const EquipoDetailModal = ({ isOpen, onClose, equipo, onUpdated }) => {
    const navigate = useNavigate();

    const [teamName, setTeamName] = useState('');
    const [jugadores, setJugadores] = useState([]);
    const [newCedula, setNewCedula] = useState('');
    const [loadingJugadores, setLoadingJugadores] = useState(false);

    const loadJugadores = useCallback(async () => {
        if (!equipo) return;

        try {
            setLoadingJugadores(true);
            const resp = await api.get(`/equipos/${equipo.id}/jugadores`);
            setJugadores(Array.isArray(resp.data?.jugadores) ? resp.data.jugadores : []);
        } catch (err) {
            console.error('Error cargando jugadores:', err);
        } finally {
            setLoadingJugadores(false);
        }
    }, [equipo]);

    useEffect(() => {
        if (isOpen && equipo) {
            setTeamName(equipo.nombre || '');
            loadJugadores();
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'auto'; };
        } else if (!isOpen) {
            setTeamName('');
            setJugadores([]);
            setNewCedula('');
        }
    }, [equipo, isOpen, loadJugadores]);

    if (!isOpen || !equipo) return null;

    const handleAddPlayer = async () => {
        if (!newCedula.trim()) return;

        try {
            await api.post(`/equipos/${equipo.id}/agregar-jugador`, {
                cedula: newCedula.trim(),
            });
            setNewCedula('');
            await loadJugadores();
            if (onUpdated) onUpdated();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al agregar jugador.');
        }
    };

    const handleRemovePlayer = async (cedula) => {
        if (!window.confirm("¿Seguro que desea eliminar este jugador del equipo?")) return;

        try {
            await api.delete(`/equipos/${equipo.id}/jugador/${cedula}`);
            await loadJugadores();
            if (onUpdated) onUpdated();
        } catch (err) {
            alert('Error al eliminar jugador.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/equipos/${equipo.id}`, {
                nombre: teamName.trim(),
            });
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            alert('Error al actualizar equipo.');
        }
    };

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content scale-in" style={{ maxWidth: '950px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(53, 110, 216, 0.1), rgba(16, 185, 129, 0.05))',
                    borderBottom: '2px solid var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
                            borderRadius: '16px',
                            color: 'white',
                            boxShadow: '0 8px 16px rgba(53, 110, 216, 0.3)'
                        }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>Administrar Comitiva</h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                Edición de perfil corporativo y gestión de nómina oficial
                            </p>
                        </div>
                    </div>
                    <button className="btn-icon-close" type="button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '2.5rem' }}>
                    <form id="equipo-form" onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label className="form-label" style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'block' }}>Identidad del Colectivo</label>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '16px',
                                    background: 'var(--bg-darkest)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    fontWeight: 900,
                                    color: 'var(--primary)',
                                    border: '2px solid var(--primary-light)'
                                }}>
                                    {teamName.charAt(0) || 'E'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        className="pro-input"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        required
                                        placeholder="Ingrese el nombre oficial del equipo..."
                                        style={{ fontSize: '1.2rem', fontWeight: 700, height: '54px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="premium-card" style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <List size={22} color="var(--primary)" /> Miembros del Equipo
                                    </h3>
                                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Listado de deportistas habilitados en el sistema</p>
                                </div>
                                <span style={{ padding: '6px 16px', background: 'rgba(53, 110, 216, 0.1)', color: 'var(--primary)', borderRadius: '100px', fontWeight: 800, fontSize: '0.9rem', border: '1px solid rgba(53, 110, 216, 0.2)' }}>
                                    {jugadores.length} Registrados
                                </span>
                            </div>

                            {loadingJugadores ? (
                                <div style={{ textAlign: 'center', padding: '4rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sincronizando nómina...</p>
                                </div>
                            ) : (
                                <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '150px' }}>Identificación</th>
                                                <th>Deportista / Atleta</th>
                                                <th style={{ textAlign: 'right' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jugadores.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                                                        <p style={{ fontWeight: 600 }}>Nómina vacía. Vincule deportistas para iniciar.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                jugadores.map((jugador) => (
                                                    <tr key={jugador.cedula}>
                                                        <td><code style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>{jugador.cedula}</code></td>
                                                        <td>
                                                            <div style={{ fontWeight: 700, color: '#fff' }}>
                                                                {jugador.persona ? `${jugador.persona.nombres} ${jugador.persona.apellidos}` : jugador.nombre}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estado: Legible</div>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button
                                                                type="button"
                                                                className="pro-btn btn-danger"
                                                                style={{ padding: '10px' }}
                                                                onClick={() => handleRemovePlayer(jugador.cedula)}
                                                                title="Expulsar de Nómina"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div style={{
                            marginTop: '2.5rem',
                            padding: '2rem',
                            background: 'linear-gradient(135deg, rgba(53, 110, 216, 0.05), rgba(0,0,0,0))',
                            borderRadius: '24px',
                            border: '1px solid rgba(53, 110, 216, 0.1)'
                        }}>
                            <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Plus size={20} /> Incorporar Nuevo Atleta
                            </h4>
                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <CreditCard size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="pro-input"
                                        placeholder="Ingrese número de cédula o pasaporte..."
                                        value={newCedula}
                                        onChange={(e) => setNewCedula(e.target.value)}
                                        style={{ paddingLeft: '48px', height: '54px' }}
                                    />
                                </div>
                                <button type="button" className="pro-btn btn-primary" onClick={handleAddPlayer} style={{ padding: '0 30px', height: '54px' }}>
                                    Vincular Atleta
                                </button>
                            </div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                * El atleta debe estar previamente registrado en el sistema global de personas.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="modal-footer" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 2.5rem' }}>
                    <button type="button" className="pro-btn btn-secondary" onClick={onClose}>
                        Descartar Operación
                    </button>
                    <button type="submit" form="equipo-form" className="pro-btn btn-primary" style={{ minWidth: '200px', justifyContent: 'center' }}>
                        Actualizar Entidad
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateEquipoModal = ({ isOpen, onClose, onCreated, torneos, deportes, categorias }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        torneo_id: '',
        deporte_id: '',
        categoria_id: '',
        representante_cedula: ''
    });
    const [representantes, setRepresentantes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchRepresentantes = async () => {
                try {
                    const resp = await api.get('/personas');
                    const reps = Array.isArray(resp.data) ? resp.data.filter(p => p.rol === 'representante') : [];
                    setRepresentantes(reps);
                } catch (e) {
                    console.error("Error fetching representatives", e);
                }
            };
            fetchRepresentantes();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/equipos', {
                ...formData,
                torneo_id: Number(formData.torneo_id),
                deporte_id: Number(formData.deporte_id),
                categoria_id: Number(formData.categoria_id),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al crear equipo.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1100 }}>
            <div className="modal-content scale-in" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Registrar Nuevo Equipo</h2>
                    <button className="btn-icon-close" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="modal-body">
                    <form id="create-equipo-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Nombre del Equipo</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="pro-input" placeholder="Nombre oficial..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Torneo</label>
                            <select name="torneo_id" value={formData.torneo_id} onChange={handleChange} required className="pro-input">
                                <option value="">Seleccione Torneo...</option>
                                {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deporte</label>
                            <select name="deporte_id" value={formData.deporte_id} onChange={handleChange} required className="pro-input">
                                <option value="">Seleccione Deporte...</option>
                                {deportes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required className="pro-input">
                                <option value="">Seleccione Categoría...</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Representante (opcional)</label>
                            <select name="representante_cedula" value={formData.representante_cedula} onChange={handleChange} className="pro-input">
                                <option value="">Sin representante...</option>
                                {representantes.map(r => <option key={r.cedula} value={r.cedula}>{r.nombres} {r.apellidos}</option>)}
                            </select>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="pro-btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="create-equipo-form" className="pro-btn btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Crear Equipo'}
                    </button>
                </div>
            </div>
        </div>
    );
};


/* ============================================================
   2. Componente principal: Equipos e Inscripciones
============================================================ */
const EquiposInscripciones = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('inscripciones');
    const [inscripciones, setInscripciones] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [torneos, setTorneos] = useState([]);
    const [deportes, setDeportes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [inscData, equiposData, torneosData, deportesData, categoriasData] = await Promise.all([
                api.get('/inscripciones/pendientes'),
                api.get('/equipos'),
                api.get('/torneos'),
                api.get('/deportes'),
                api.get('/categorias'),
            ]);

            setInscripciones(Array.isArray(inscData.data) ? inscData.data : []);

            const equiposArray = equiposData.data?.data || equiposData.data || [];
            setEquipos(Array.isArray(equiposArray) ? equiposArray : []);

            setTorneos(torneosData.data?.data || torneosData.data || []);
            setDeportes(deportesData.data || []);
            setCategorias(categoriasData.data || []);
        } catch (err) {
            console.error('Error al cargar datos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApprove = async (id) => {
        if (!window.confirm("¿Aprobar esta solicitud oficial?")) return;
        try {
            await api.post(`/inscripciones/${id}/aprobar`);
            await loadData();
        } catch (err) {
            alert('Error al aprobar.');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("¿Rechazar esta solicitud definitivamente?")) return;
        try {
            await api.post(`/inscripciones/${id}/rechazar`);
            await loadData();
        } catch (err) {
            alert('Error al rechazar.');
        }
    };

    const handleDeleteEquipo = async (id) => {
        if (!window.confirm("¿Eliminar este equipo del sistema?")) return;
        try {
            await api.delete(`/equipos/${id}`);
            await loadData();
        } catch (err) {
            alert('Error al eliminar equipo.');
        }
    };

    const stats = useMemo(() => ({
        pendientes: inscripciones.length,
        totalEquipos: equipos.length,
        deportes: new Set(equipos.map(e => e.deporte_id)).size
    }), [inscripciones, equipos]);

    if (loading) return <LoadingScreen message="Sincronizando gestión de equipos..." />;

    return (
        <div className="admin-page-container module-entrance">
            {/* HEADER SECTION */}
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Sistema de Gestión</span>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0' }}>Equipos e Inscripciones</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Control administrativo de colectivos y solicitudes de ingreso</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="pro-btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} /> Registrar Nuevo Equipo
                    </button>
                </div>
            </header>

            {/* KPI OVERVIEW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Solicitudes Pendientes" value={stats.pendientes} icon={Clock} color="#f59e0b" />
                <StatCard title="Total Equipos" value={stats.totalEquipos} icon={Users} color="#10b981" />
                <StatCard title="Disciplinas Activas" value={stats.deportes} icon={Trophy} color="#356ed8" />
            </div>

            {/* TABS NAVIGATION */}
            <div className="premium-tabs-container" style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('inscripciones')}
                    className={`premium-tab ${activeTab === 'inscripciones' ? 'active' : ''}`}
                >
                    <ClipboardCheck size={20} />
                    <span>Revisiones de Inscripción</span>
                    {stats.pendientes > 0 && <span className="tab-badge">{stats.pendientes}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('equipos')}
                    className={`premium-tab ${activeTab === 'equipos' ? 'active' : ''}`}
                >
                    <Users size={20} />
                    <span>Catálogo de Equipos</span>
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="pro-card">
                {activeTab === 'inscripciones' ? (
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Solicitus</th>
                                    <th>Torneo / Destino</th>
                                    <th>Representante</th>
                                    <th style={{ textAlign: 'center' }}>Nómina</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscripciones.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                            <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                                            <p>No existen solicitudes de inscripción a la espera de revisión</p>
                                        </td>
                                    </tr>
                                ) : (
                                    inscripciones.map((insc) => (
                                        <tr key={insc.id}>
                                            <td>
                                                <div style={{ fontWeight: 800, color: '#fff' }}>{insc.equipo?.nombre || 'Sin nombre'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {insc.id}</div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{insc.torneo?.nombre || 'Torneo General'}</span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{insc.equipo?.representante ? `${insc.equipo.representante.nombres} ${insc.equipo.representante.apellidos}` : 'Sin representar'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insc.equipo?.representante_cedula || 'N/A'}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '8px', fontWeight: 800 }}>
                                                    {insc.equipo?.jugadores_count ?? 0}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button className="pro-btn btn-primary" onClick={() => handleApprove(insc.id)} title="Aprobar Oficialmente">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button className="pro-btn btn-danger" onClick={() => handleReject(insc.id)} title="Rechazar Inscripción">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Logo / Equipo</th>
                                    <th>Competición</th>
                                    <th>Deporte / Categoría</th>
                                    <th style={{ textAlign: 'center' }}>ID</th>
                                    <th style={{ textAlign: 'right' }}>Gestión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                                            <p>No se han registrado equipos en la plataforma aún</p>
                                        </td>
                                    </tr>
                                ) : (
                                    equipos.map((equipo) => (
                                        <tr key={equipo.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 900,
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        {equipo.nombre?.charAt(0)}
                                                    </div>
                                                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>{equipo.nombre}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{equipo.torneo?.nombre || 'General'}</span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.9rem', color: '#fff' }}>{equipo.deporte?.nombre}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{equipo.categoria?.nombre || 'Abierta'}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <code style={{ color: 'var(--text-muted)' }}>#{equipo.id}</code>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button className="pro-btn btn-secondary" onClick={() => { setSelectedEquipo(equipo); setIsDetailModalOpen(true); }} title="Gestionar Nómina">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="pro-btn btn-primary" title="Ficha Técnica / Carnet">
                                                        <CreditCard size={16} />
                                                    </button>
                                                    <button className="pro-btn btn-danger" onClick={() => handleDeleteEquipo(equipo.id)} title="Eliminar Registro">
                                                        <Trash2 size={16} />
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

            {/* MODALS */}
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
            />
        </div>
    );
};

export default EquiposInscripciones;

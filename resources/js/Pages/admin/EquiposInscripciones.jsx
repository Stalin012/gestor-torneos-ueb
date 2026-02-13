// resources/js/pages/admin/EquiposInscripciones.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    List,
    CheckCircle,
    XCircle,
    Trash2,
    Edit,
    Plus,
    CreditCard
} from 'lucide-react';

import '../../admin_styles.css';
import api from "../../api";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/* ============================================================
   1. Modal de Detalle / Gestión de Equipo
============================================================ */
const EquipoDetailModal = ({ isOpen, onClose, equipo, onUpdated }) => {
    const navigate = useNavigate();

    const [teamName, setTeamName] = useState('');
    const [jugadores, setJugadores] = useState([]);
    const [newCedula, setNewCedula] = useState('');
    const [loadingJugadores, setLoadingJugadores] = useState(false);

    // Helper para manejar 401/403 dentro del modal
    const handleAuthError = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    // Cargar jugadores del equipo desde la API
    const loadJugadores = useCallback(async () => {
        if (!equipo) return;

        try {
            setLoadingJugadores(true);
            const token = localStorage.getItem('token');
            if (!token) {
                handleAuthError();
                return;
            }

            const resp = await fetch(`${API_BASE}/equipos/${equipo.id}/jugadores`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await resp.json().catch(() => null);

            if (resp.status === 401 || resp.status === 403) {
                handleAuthError();
                return;
            }

            if (!resp.ok) {
                console.error('Error cargando jugadores:', resp.status, json);
                return;
            }

            setJugadores(Array.isArray(json?.jugadores) ? json.jugadores : []);
        } catch (err) {
            console.error('Error cargando jugadores:', err);
        } finally {
            setLoadingJugadores(false);
        }
    }, [equipo, navigate]);

    // Inicializar nombre y cargar jugadores cuando cambia el equipo o se abre el modal
    useEffect(() => {
        if (isOpen && equipo) {
            setTeamName(equipo.nombre || '');
            loadJugadores();
        } else if (!isOpen) {
            setTeamName('');
            setJugadores([]);
            setNewCedula('');
        }
    }, [equipo, isOpen, loadJugadores]);

    if (!isOpen || !equipo) return null;

    // Agregar jugador por cédula (el jugador YA debe existir en la tabla jugadores)
    const handleAddPlayer = async () => {
        if (!newCedula.trim()) {
            alert("La cédula del jugador es obligatoria. El jugador debe existir previamente en el módulo Jugadores.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleAuthError();
                return;
            }

            const resp = await fetch(`${API_BASE}/equipos/${equipo.id}/agregar-jugador`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cedula: newCedula.trim(),
                }),
            });

            const json = await resp.json().catch(() => null);

            if (resp.status === 401 || resp.status === 403) {
                handleAuthError();
                return;
            }

            if (!resp.ok) {
                console.error(json);
                alert(json?.message || 'Error al agregar jugador. Verifica que la cédula exista en la tabla de jugadores.');
                return;
            }

            alert(json?.message || 'Jugador añadido al equipo.');
            setNewCedula('');
            await loadJugadores();
            if (onUpdated) onUpdated();
        } catch (err) {
            console.error(err);
            alert('Error de conexión al agregar jugador.');
        }
    };

    // Quitar jugador del equipo
    const handleRemovePlayer = async (cedula) => {
        if (!window.confirm("¿Seguro que desea eliminar este jugador del equipo?")) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleAuthError();
                return;
            }

            const resp = await fetch(`${API_BASE}/equipos/${equipo.id}/jugador/${cedula}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await resp.json().catch(() => null);

            if (resp.status === 401 || resp.status === 403) {
                handleAuthError();
                return;
            }

            if (!resp.ok) {
                console.error(json);
                alert(json?.message || 'Error al eliminar jugador.');
                return;
            }

            alert(json?.message || 'Jugador removido del equipo.');
            await loadJugadores();
            if (onUpdated) onUpdated();
        } catch (err) {
            console.error(err);
            alert('Error de conexión al eliminar jugador.');
        }
    };

    // Actualizar nombre del equipo
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleAuthError();
                return;
            }

            const resp = await fetch(`${API_BASE}/equipos/${equipo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nombre: teamName.trim(),
                }),
            });

            const json = await resp.json().catch(() => null);

            if (resp.status === 401 || resp.status === 403) {
                handleAuthError();
                return;
            }

            if (!resp.ok) {
                console.error(json);
                alert(json?.message || 'Error al actualizar el equipo.');
                return;
            }

            alert(json?.message || 'Equipo actualizado correctamente.');
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Error de conexión al actualizar equipo.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h2>
                        <Users size={24} style={{ marginRight: '10px' }} />
                        Gestión: {equipo.nombre}
                    </h2>
                    <button className="btn-icon-close" type="button" onClick={onClose}>
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="teamName">Nombre del Equipo</label>
                        <input
                            type="text"
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                        />
                    </div>

                    <h3 style={{ marginTop: '25px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>
                        Jugadores ({jugadores.length})
                    </h3>

                    {loadingJugadores && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Cargando jugadores...
                        </p>
                    )}

                    {/* Tabla de Jugadores */}
                    <div className="table-container table-container-players">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombre Completo</th>
                                    <th>Teléfono</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadores.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No hay jugadores registrados en este equipo.
                                        </td>
                                    </tr>
                                ) : (
                                    jugadores.map((jugador) => {
                                        const nombreCompleto = jugador.persona
                                            ? `${jugador.persona.nombres} ${jugador.persona.apellidos}`
                                            : (jugador.nombre || jugador.cedula);

                                        const telefono = jugador.persona?.telefono || 'N/D';

                                        return (
                                            <tr key={jugador.cedula}>
                                                <td>{jugador.cedula}</td>
                                                <td>{nombreCompleto}</td>
                                                <td>{telefono}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn-icon btn-icon-delete"
                                                        onClick={() => handleRemovePlayer(jugador.cedula)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Formulario para añadir jugador existente por cédula */}
                    <h4 style={{ marginTop: '20px', color: 'var(--info)' }}>
                        <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        Añadir Jugador Existente (por cédula)
                    </h4>

                    <div className="form-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="newCedula">Cédula del Jugador</label>
                            <input
                                type="text"
                                id="newCedula"
                                value={newCedula}
                                onChange={(e) => setNewCedula(e.target.value)}
                                placeholder="Ej. 1720..."
                            />
                        </div>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleAddPlayer}
                        >
                            <Plus size={18} /> Agregar
                        </button>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cerrar
                        </button>
                        <button type="submit" className="btn-primary">
                            Guardar Cambios del Equipo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ============================================================
   Carnet Virtual Modal
============================================================ */
const CarnetVirtualModal = ({ isOpen, onClose, equipo }) => {
    if (!isOpen || !equipo) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ width: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <div className="carnet-card" style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Background Elements */}
                    <div style={{
                        position: 'absolute', top: -50, right: -50, width: 150, height: 150,
                        background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
                        opacity: 0.1, borderRadius: '50%'
                    }} />

                    <div className="carnet-header" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent)' }}>
                            Ficha Institucional
                        </h3>
                        <div style={{ width: '40px', height: '3px', background: 'var(--accent)', margin: '10px auto' }}></div>
                    </div>

                    <div className="carnet-logo" style={{
                        width: '100px', height: '100px', margin: '0 auto 1.5rem',
                        borderRadius: '50%', background: '#020617',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid var(--accent)', boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)'
                    }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-1)' }}>
                            {equipo.nombre?.charAt(0)}
                        </span>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
                        {equipo.nombre}
                    </h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {equipo.deporte?.nombre} - {equipo.categoria?.nombre}
                    </p>

                    <div className="carnet-stats" style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
                        background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)' }}>TORNEO</span>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{equipo.torneo?.nombre || 'N/A'}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)' }}>ESTADO</span>
                            <span className="badge-premium badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                VERIFICADO
                            </span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                            Documento oficial generado por el sistema.
                        </p>
                    </div>
                </div>
                <button className="btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={onClose}>
                    Cerrar Ficha
                </button>
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCarnetModalOpen, setIsCarnetModalOpen] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);

    // Helper para sesión expirada
    const handleAuthError = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    }, [navigate]);

    // Cargar inscripciones + equipos desde API
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                handleAuthError();
                return;
            }

            const headers = {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            };

            const [inscData, equiposData] = await Promise.all([
                api.get('/inscripciones/pendientes'),
                api.get('/equipos'),
            ]);

            setInscripciones(Array.isArray(inscData.data) ? inscData.data : []);

            const equiposArray = equiposData.data?.data || equiposData.data || [];
            setEquipos(Array.isArray(equiposArray) ? equiposArray : []);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [handleAuthError]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- Acciones sobre inscripciones ---
    const handleApprove = async (id) => {
        const insc = inscripciones.find(i => i.id === id);
        const nombreEquipo = insc?.nombre_equipo || insc?.nombreEquipo || 'este equipo';

        if (!window.confirm(`¿Aprobar la inscripción de ${nombreEquipo}?`)) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleAuthError();
                return;
            }

            const resp = await fetch(`${API_BASE}/inscripciones/${id}/aprobar`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await resp.json().catch(() => null);

            if (resp.status === 401 || resp.status === 403) {
                handleAuthError();
                return;
            }

            if (!resp.ok) {
                console.error(json);
                alert(json?.message || 'Error al aprobar la inscripción.');
                return;
            }

            alert(json?.message || 'Inscripción aprobada correctamente.');
            await loadData();
        } catch (err) {
            console.error(err);
            alert('Error de conexión al aprobar inscripción.');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("¿Seguro que desea rechazar esta inscripción?")) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleAuthError();
                return;
            }

            const resp = await fetch(`${API_BASE}/inscripciones/${id}/rechazar`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await resp.json().catch(() => null);

            if (resp.status === 401 || resp.status === 403) {
                handleAuthError();
                return;
            }

            if (!resp.ok) {
                console.error(json);
                alert(json?.message || 'Error al rechazar la inscripción.');
                return;
            }

            alert(json?.message || 'Inscripción rechazada correctamente.');
            await loadData();
        } catch (err) {
            console.error(err);
            alert('Error de conexión al rechazar inscripción.');
        }
    };

    // --- Acciones de equipos ---
    const handleOpenDetailModal = (equipo) => {
        setSelectedEquipo(equipo);
        setIsDetailModalOpen(true);
    };

    const handleOpenCarnet = (equipo) => {
        setSelectedEquipo(equipo);
        setIsCarnetModalOpen(true);
    };

    const handleDeleteEquipo = async (id) => {
        if (!window.confirm("¿Seguro que desea eliminar este equipo? Se desvinculará del torneo.")) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleAuthError();
                return;
            }

            const resp = await fetch(`${API_BASE}/equipos/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await resp.json().catch(() => null);

            if (resp.status === 401 || resp.status === 403) {
                handleAuthError();
                return;
            }

            if (!resp.ok) {
                console.error(json);
                alert(json?.message || 'Error al eliminar equipo.');
                return;
            }

            alert(json?.message || 'Equipo eliminado correctamente.');
            await loadData();
        } catch (err) {
            console.error(err);
            alert('Error de conexión al eliminar equipo.');
        }
    };

    // --- Render pestaña Inscripciones ---
    const renderInscripcionesTab = () => (
        <div className="tab-content fade-enter">
            <div className="pro-card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Solicitudes Pendientes ({inscripciones.length})</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Gestione las solicitudes de ingreso a torneos.</p>
                </div>
                <div className="table-container">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Torneo</th>
                                <th>Equipo</th>
                                <th>Capitán</th>
                                <th>Integrantes</th>
                                <th>Fecha</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inscripciones.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No hay solicitudes de inscripción pendientes.
                                    </td>
                                </tr>
                            ) : (
                                inscripciones.map((insc) => (
                                    <tr key={insc.id}>
                                        <td><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{insc.id}</span></td>
                                        <td><span style={{ fontWeight: 500, color: '#f8fafc' }}>{insc.torneo?.nombre || 'N/D'}</span></td>
                                        <td>{insc.nombre_equipo || insc.nombreEquipo || 'N/D'}</td>
                                        <td>{insc.capitan_nombre || insc.capitan || 'N/D'}</td>
                                        <td>{insc.integrantes ?? '-'}</td>
                                        <td>{insc.fecha_solicitud || (insc.created_at ? insc.created_at.substring(0, 10) : 'N/D')}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="pro-btn btn-primary"
                                                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                    onClick={() => handleApprove(insc.id)}
                                                    title="Aprobar"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    className="pro-btn btn-danger"
                                                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                    onClick={() => handleReject(insc.id)}
                                                    title="Rechazar"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // --- Render pestaña Equipos Activos ---
    const renderEquiposActivosTab = () => (
        <div className="tab-content fade-enter">
            <div className="pro-card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Equipos Activos ({equipos.length})</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Base de datos de equipos registrados en el sistema.</p>
                </div>

                <div className="table-container">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Torneo</th>
                                <th>Deporte</th>
                                <th>Categoría</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No hay equipos registrados.
                                    </td>
                                </tr>
                            ) : (
                                equipos.map((equipo) => (
                                    <tr key={equipo.id}>
                                        <td><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{equipo.id}</span></td>
                                        <td><strong style={{ color: '#fff' }}>{equipo.nombre}</strong></td>
                                        <td>{equipo.torneo?.nombre || 'N/D'}</td>
                                        <td><span className="status-badge badge-neutral">{equipo.deporte?.nombre || 'N/D'}</span></td>
                                        <td>{equipo.categoria?.nombre || 'N/D'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="pro-btn btn-secondary"
                                                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                    onClick={() => handleOpenDetailModal(equipo)}
                                                    title="Ver/Editar Jugadores"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="pro-btn btn-primary"
                                                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                    onClick={() => handleOpenCarnet(equipo)}
                                                    title="Ver Carnet Virtual"
                                                >
                                                    <CreditCard size={16} />
                                                </button>
                                                <button
                                                    className="pro-btn btn-danger"
                                                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                    onClick={() => handleDeleteEquipo(equipo.id)}
                                                    title="Eliminar Equipo"
                                                >
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
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="admin-loading">
                Cargando equipos e inscripciones...
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error">
                {error}
            </div>
        );
    }

    return (
        <div className="admin-page-container fade-enter">

            {/* HEADER */}
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Gestión de Equipos</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Administra solicitudes de inscripción y la base de datos de equipos.
                    </p>
                </div>
            </div>

            {/* TABS BUTTONS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1px' }}>
                <button
                    onClick={() => setActiveTab('inscripciones')}
                    style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'inscripciones' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'inscripciones' ? 'var(--primary)' : 'var(--text-muted)',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <List size={18} /> Solicitudes {inscripciones.length > 0 && <span className="status-badge badge-warning" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{inscripciones.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('activos')}
                    style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'activos' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'activos' ? 'var(--primary)' : 'var(--text-muted)',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <CheckCircle size={18} /> Equipos Activos
                </button>
            </div>

            {/* TAB CONTENT */}
            <div>
                {activeTab === 'inscripciones'
                    ? renderInscripcionesTab()
                    : renderEquiposActivosTab()}
            </div>

            {/* MODALS */}
            <EquipoDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                equipo={selectedEquipo}
                onUpdated={loadData}
            />

            <CarnetVirtualModal
                isOpen={isCarnetModalOpen}
                onClose={() => setIsCarnetModalOpen(false)}
                equipo={selectedEquipo}
            />
        </div>
    );
};

export default EquiposInscripciones;

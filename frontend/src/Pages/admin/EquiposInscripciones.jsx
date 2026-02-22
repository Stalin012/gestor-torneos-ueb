import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    User, // Added User icon
    Save // Added Save icon
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
    const [teamLogo, setTeamLogo] = useState('');
    const [jugadores, setJugadores] = useState([]);
    const [newCedula, setNewCedula] = useState('');
    const [loadingJugadores, setLoadingJugadores] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [playersPerPage] = useState(10); // Number of players per page
    const [paginationMeta, setPaginationMeta] = useState(null);
    const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [error, setError] = useState(null); // Nuevo estado para errores
    const [loading, setLoading] = useState(false); // Added loading state for form submission

    const handlePageChange = (page) => {
        if (page > 0 && page <= paginationMeta.last_page) {
            setCurrentPage(page);
        }
    };

    const handleEditPlayer = (player) => {
        setSelectedPlayer(player);
        setIsEditPlayerModalOpen(true);
    };

    const handleSavePlayer = async (updatedPlayer) => {
        try {
            // Assuming an API endpoint for updating player details
            await api.put(`/jugadores/${updatedPlayer.cedula}`, updatedPlayer);
            setIsEditPlayerModalOpen(false);
            await loadJugadores(); // Reload players to reflect changes
            if (onUpdated) onUpdated();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al actualizar jugador.');
        }
    };

    const loadJugadores = useCallback(async () => {
        if (!equipo) return;

        try {
            setLoadingJugadores(true);
            const resp = await api.get(`/equipos/${equipo.id}/jugadores?page=${currentPage}&per_page=${playersPerPage}`);
            setJugadores(Array.isArray(resp.data?.jugadores?.data) ? resp.data.jugadores.data : []);
            setPaginationMeta(resp.data?.jugadores);
        } catch (err) {
            console.error('Error cargando jugadores:', err);
        } finally {
            setLoadingJugadores(false);
        }
    }, [equipo, currentPage, playersPerPage]);

    useEffect(() => {
        if (isOpen && equipo) {
            setTeamName(equipo.nombre || '');
            setTeamLogo(equipo.logo || '');
            setCurrentPage(1);
            loadJugadores();
        } else if (!isOpen) {
            setTeamName('');
            setJugadores([]);
            setNewCedula('');
            setCurrentPage(1);
            setPaginationMeta(null);
        }
    }, [equipo, isOpen, loadJugadores]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            return () => document.body.classList.remove('modal-open');
        }
    }, [isOpen]);



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
        setError(null); // Limpiar errores previos
        setLoading(true); // Start loading
        try {
            await api.put(`/equipos/${equipo.id}`, {
                nombre: teamName.trim(),
                logo: teamLogo.trim(),
            });
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            console.error('Error al actualizar equipo:', err);
            setError(err.response?.data?.message || 'Error al actualizar equipo.');
        } finally {
            setLoading(false); // End loading
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setError(null); // Limpiar errores cuando el modal se cierra
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content modal-lg scale-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(53, 110, 216, 0.1), rgba(16, 185, 129, 0.05))',
                    borderBottom: '2px solid var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
                            color: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 8px 20px rgba(53, 110, 216, 0.25)'
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

                <div className="modal-body">
                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}
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
                            <div style={{ marginTop: '1.5rem' }}>
                                <label className="form-label" htmlFor="teamLogo">URL del Logo</label>
                                <input
                                    type="url"
                                    id="teamLogo"
                                    className="pro-input"
                                    value={teamLogo}
                                    onChange={(e) => setTeamLogo(e.target.value)}
                                    placeholder="URL del logo del equipo (opcional)"
                                    pattern="^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$"
                                    title="Por favor, introduce una URL válida (ej. http://example.com/logo.png)"
                                />
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
                                    <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'rgba(53, 110, 216, 0.2)', borderTopColor: 'var(--primary)', margin: '0 auto' }}></div>
                                    <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cargando nómina...</p>
                                </div>
                            ) : jugadores.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(53, 110, 216, 0.05)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                                        <Users size={40} color="var(--text-muted)" />
                                    </div>
                                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>Nómina Vacía</h4>
                                    <p style={{ color: 'var(--text-muted)', maxWidth: '280px', margin: '10px auto 0' }}>Este equipo aún no tiene deportistas asignados en el sistema.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {jugadores.map(jugador => (
                                        <div key={jugador.id} className="persona-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-darkest)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {jugador.persona?.foto_url ? (
                                                    <img src={jugador.persona.foto_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(53, 110, 216, 0.1)', color: 'var(--primary)' }}><User size={20} /></div>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{jugador.persona?.nombres} {jugador.persona?.apellidos}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>C.I. {jugador.persona?.cedula}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button type="button" onClick={() => handleEditPlayer(jugador)} className="pro-btn btn-secondary" style={{ padding: '8px' }} title="Editar miembro">
                                                    <Edit size={16} />
                                                </button>
                                                <button type="button" onClick={() => handleRemovePlayer(jugador.persona?.cedula)} className="pro-btn btn-danger" style={{ padding: '8px' }} title="Eliminar miembro">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {paginationMeta && paginationMeta.last_page > 1 && (
                                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className="pro-btn btn-secondary"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        Anterior
                                    </button>
                                    <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>
                                        Página {currentPage} de {paginationMeta.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        className="pro-btn btn-secondary"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === paginationMeta.last_page}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="pro-btn btn-secondary">Descartar</button>
                    <button type="submit" form="equipo-form" disabled={loading} className="pro-btn btn-primary" style={{ minWidth: '180px' }}>
                        {loading ? <div className="spinner" /> : <Save size={18} />}
                        {loading ? 'Guardando...' : 'Aplicar Cambios'}
                    </button>
                </div>
            </div>

            <EditPlayerModal
                isOpen={isEditPlayerModalOpen}
                onClose={() => setIsEditPlayerModalOpen(false)}
                player={selectedPlayer}
                onSave={handleSavePlayer}
            />
        </div>,
        document.body
    );
};

const EditPlayerModal = ({ isOpen, onClose, player, onSave }) => {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        genero: '',
        nacionalidad: '',
        telefono: '',
        email: '',
    });

    useEffect(() => {
        if (isOpen && player) {
            setFormData({
                nombres: player.persona?.nombres || '',
                apellidos: player.persona?.apellidos || '',
                fecha_nacimiento: player.persona?.fecha_nacimiento || '',
                genero: player.persona?.genero || '',
                nacionalidad: player.persona?.nacionalidad || '',
                telefono: player.persona?.telefono || '',
                email: player.persona?.email || '',
            });
        }
    }, [isOpen, player]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'deporte_id') {
                newState.categoria_id = ''; // Reset categoria_id when deporte_id changes
            }
            return newState;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...player, persona: { ...player.persona, ...formData } });
    };

    if (!isOpen || !player) return null;

    return createPortal(
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content modal-md scale-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="modal-icon">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="modal-title">Editar Deportista</h2>
                            <p className="modal-subtitle">{player.persona?.nombres} {player.persona?.apellidos}</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="modal-body">
                    <form id="edit-player-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Nombres</label>
                                <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required className="pro-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Apellidos</label>
                                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="pro-input" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Fecha de Nacimiento</label>
                                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="pro-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Género</label>
                                <select name="genero" value={formData.genero} onChange={handleChange} className="pro-input">
                                    <option value="">Seleccione...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 800 }}>Nacionalidad</label>
                            <input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="pro-input" placeholder="Ej: Ecuatoriana" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Teléfono</label>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="pro-input" placeholder="099..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="pro-input" placeholder="correo@ejemplo.com" />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="pro-btn btn-secondary" onClick={onClose}>Descartar</button>
                    <button type="submit" form="edit-player-form" className="pro-btn btn-primary">
                        <Save size={18} /> Aplicar Cambios
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const CreateEquipoModal = ({ isOpen, onClose, onCreated, torneos, deportes, categorias, initialTorneoId }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        logo: '', // Nuevo campo para el logo
        torneo_id: initialTorneoId || '', // Usar initialTorneoId si está presente
        deporte_id: '',
        categoria_id: '',
        representante_cedula: ''
    });
    const [representantes, setRepresentantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Nuevo estado para errores

    const [filteredCategorias, setFilteredCategorias] = useState([]); // Nuevo estado para categorías filtradas

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            return () => document.body.classList.remove('modal-open');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const fetchRepresentantesAndCategorias = async () => {
                try {
                    const respRepresentantes = await api.get('/personas');
                    const reps = Array.isArray(respRepresentantes.data) ? respRepresentantes.data.filter(p => p.rol === 'representante') : [];
                    setRepresentantes(reps);

                    // Cargar todas las categorías inicialmente
                    const respCategorias = await api.get('/categorias');
                    setFilteredCategorias(respCategorias.data); // Usar para el estado inicial
                } catch (e) {
                    console.error("Error fetching data", e);
                }
            };
            fetchRepresentantesAndCategorias();

            // Si hay un torneo inicial, preseleccionar el torneo y su deporte
            if (initialTorneoId) {
                const selectedTorneo = torneos.find(t => String(t.id) === initialTorneoId);
                if (selectedTorneo) {
                    setFormData(prev => ({
                        ...prev,
                        torneo_id: initialTorneoId,
                        deporte_id: String(selectedTorneo.deporte_id) // Asegurarse de que sea string para el select
                    }));
                }
            }
        }
    }, [isOpen, initialTorneoId, torneos]);

    useEffect(() => {
        if (formData.deporte_id) {
            const fetchCategoriasByDeporte = async () => {
                try {
                    const resp = await api.get(`/categorias?deporte_id=${formData.deporte_id}`);
                    setFilteredCategorias(resp.data);
                } catch (e) {
                    console.error("Error fetching categories by sport", e);
                }
            };
            fetchCategoriasByDeporte();
        } else {
            // Si no hay deporte seleccionado, mostrar todas las categorías o ninguna
            const fetchAllCategorias = async () => {
                try {
                    const resp = await api.get('/categorias');
                    setFilteredCategorias(resp.data);
                } catch (e) {
                    console.error("Error fetching all categories", e);
                }
            };
            if (isOpen) { // Solo cargar todas si el modal está abierto
                fetchAllCategorias();
            } else {
                setFilteredCategorias([]); // O vaciar si el modal está cerrado
            }
        }
    }, [formData.deporte_id, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Limpiar errores previos
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
            console.error('Error al crear equipo:', err);
            setError(err.response?.data?.message || 'Error al crear equipo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setError(null); // Limpiar errores cuando el modal se cierra
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content modal-md scale-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="modal-icon">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 className="modal-title">Registrar Nuevo Equipo</h2>
                            <p className="modal-subtitle">Inscripción oficial del colectivo</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="modal-body">
                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}
                    <form id="create-equipo-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 800 }}>Nombre del Equipo</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="pro-input" placeholder="Nombre oficial..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 800 }}>URL del Logo (opcional)</label>
                            <input type="url" name="logo" value={formData.logo} onChange={handleChange} className="pro-input" placeholder="URL del logo del equipo..."
                                pattern="^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$"
                                title="Por favor, introduce una URL válida (ej. http://example.com/logo.png)"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Vincular a Torneo</label>
                                <select name="torneo_id" value={formData.torneo_id} onChange={handleChange} required className="pro-input">
                                    <option value="">Seleccione Torneo...</option>
                                    {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 800 }}>Deporte</label>
                                    <select name="deporte_id" value={formData.deporte_id} onChange={handleChange} required className="pro-input">
                                        <option value="">Seleccione Deporte...</option>
                                        {deportes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 800 }}>Categoría</label>
                                    <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required className="pro-input">
                                        <option value="">Seleccione Categoría...</option>
                                        {filteredCategorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 800 }}>Representante (opcional)</label>
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
        </div>,
        document.body
    );
};


/* ============================================================
   2. Componente principal: Equipos e Inscripciones
============================================================ */
const EquiposInscripciones = () => {
    const navigate = useNavigate();
    const { torneoId } = useParams(); // Obtener torneoId de la URL

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

    // Filtrar torneos si se proporciona un torneoId en la URL
    const filteredTorneosForModal = useMemo(() => {
        if (torneoId) {
            return torneos.filter(t => String(t.id) === torneoId);
        }
        return torneos;
    }, [torneos, torneoId]);

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
            <div className="premium-tabs-container" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => setActiveTab('inscripciones')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: activeTab === 'inscripciones' ? 'linear-gradient(135deg, #356ed8, #2d62c9)' : '#19293a',
                        color: 'white',
                        border: activeTab === 'inscripciones' ? '1px solid #356ed8' : '1px solid rgba(53, 110, 216, 0.2)',
                        boxShadow: activeTab === 'inscripciones' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                        borderRadius: '8px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <ClipboardCheck size={20} />
                    <span>Revisiones de Inscripción</span>
                    {stats.pendientes > 0 && <span style={{ marginLeft: '8px', background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{stats.pendientes}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('equipos')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: activeTab === 'equipos' ? 'linear-gradient(135deg, #356ed8, #2d62c9)' : '#19293a',
                        color: 'white',
                        border: activeTab === 'equipos' ? '1px solid #356ed8' : '1px solid rgba(53, 110, 216, 0.2)',
                        boxShadow: activeTab === 'equipos' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                        borderRadius: '8px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '16px',
                                                        background: equipo.logo ? `url(${equipo.logo})` : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 900,
                                                        fontSize: '1.4rem',
                                                        boxShadow: '0 8px 25px rgba(53, 110, 216, 0.3)',
                                                        border: '2px solid rgba(255, 255, 255, 0.1)'
                                                    }}>
                                                        {!equipo.logo && equipo.nombre?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', marginBottom: '4px' }}>{equipo.nombre}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Representante: {equipo.representante?.nombres || 'Sin asignar'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '6px 12px',
                                                        background: 'rgba(53, 110, 216, 0.1)',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(53, 110, 216, 0.2)'
                                                    }}>
                                                        <Trophy size={16} color="var(--primary)" />
                                                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{equipo.torneo?.nombre || 'General'}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '8px' }}>Estado: Activo</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.9rem', color: '#fff' }}>{equipo.deporte?.nombre}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{equipo.categoria?.nombre || 'Abierta'}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <code style={{ color: 'var(--text-muted)' }}>#{equipo.id}</code>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="pro-btn btn-secondary"
                                                        onClick={() => { setSelectedEquipo(equipo); setIsDetailModalOpen(true); }}
                                                        title="Gestionar Nómina"
                                                        style={{ padding: '12px 16px', borderRadius: '12px' }}
                                                    >
                                                        <Edit size={16} />
                                                        <span>Gestionar</span>
                                                    </button>

                                                    <button
                                                        className="pro-btn btn-danger"
                                                        onClick={() => handleDeleteEquipo(equipo.id)}
                                                        title="Eliminar Equipo"
                                                        style={{ padding: '12px', borderRadius: '12px' }}
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
                torneos={filteredTorneosForModal} // Usar los torneos filtrados
                deportes={deportes}
                categorias={categorias}
                initialTorneoId={torneoId} // Pasar el torneoId de la URL
            />
        </div>
    );
};

export default EquiposInscripciones;

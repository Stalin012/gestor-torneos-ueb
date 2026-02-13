import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Users, Plus, Edit, Trash2, Search, X, Save, Lock, UserCog,
    ShieldCheck, ShieldAlert, UserCheck, Activity, Key, KeyRound
} from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { StatCard } from '../../components/StatsComponents';

import '../../admin_styles.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const rolesSistemaOptions = [
    { value: 'admin', label: 'Administrador', icon: ShieldCheck, color: '#ef4444' },
    { value: 'representante', label: 'Representante', icon: UserCheck, color: '#3b82f6' },
    { value: 'arbitro', label: 'Árbitro', icon: ShieldAlert, color: '#22c55e' },
    { value: 'usuario', label: 'Usuario', icon: Users, color: '#94a3b8' },
];

/* ============================================================
   MODAL CREAR / EDITAR USUARIO DEL SISTEMA PREMIUM
============================================================ */
const UsuarioSistemaModal = ({ isOpen, onClose, initialData, onSave }) => {
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        cedula: '',
        correo: '',
        rol: 'usuario',
        estado: 'Activo',
        nombreCompleto: '',
    });

    const [cedulaMensaje, setCedulaMensaje] = useState('');
    const [verificando, setVerificando] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setCedulaMensaje('');
        } else {
            setFormData({
                cedula: '',
                correo: '',
                rol: 'usuario',
                estado: 'Activo',
                nombreCompleto: '',
            });
            setCedulaMensaje('');
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCedulaBlur = async () => {
        if (isEditMode) return;
        const cedula = formData.cedula.trim();
        if (!cedula) return;

        setVerificando(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE}/usuarios/verificar-persona/${cedula}`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await resp.json();
            if (!resp.ok) {
                setCedulaMensaje(json.message || 'Error al verificar cédula.');
                return;
            }

            if (!json.existe_persona) {
                setCedulaMensaje('⚠️ Persona no encontrada en el sistema.');
                return;
            }

            if (json.es_usuario) {
                setCedulaMensaje('🚫 Esta persona ya tiene acceso.');
                return;
            }

            setFormData(prev => ({
                ...prev,
                nombreCompleto: `${json.persona_data?.nombres ?? ''} ${json.persona_data?.apellidos ?? ''}`,
            }));
            setCedulaMensaje('✅ Persona válida para asignar acceso.');

        } catch (err) {
            console.error(err);
            setCedulaMensaje('Error de conexión.');
        } finally {
            setVerificando(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, isEditMode);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay backdrop-blur-strong fade-in">
            <div className="modal-content scale-in" style={{ maxWidth: '550px', padding: 0, overflow: 'hidden' }}>
                <div className="torneo-header-premium" style={{
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    padding: '1.5rem 2rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: 'rgba(56, 189, 248, 0.2)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <UserCog size={24} color="#38bdf8" />
                            </div>
                            {isEditMode ? 'Editar Acceso' : 'Nuevo Acceso al Sistema'}
                        </h2>
                        <button onClick={onClose} className="btn-icon-close" style={{ color: '#fff' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Cédula de Identidad</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="cedula"
                                    value={formData.cedula}
                                    onChange={handleChange}
                                    onBlur={handleCedulaBlur}
                                    required
                                    disabled={isEditMode}
                                    className="premium-input"
                                    placeholder="0000000000"
                                />
                                {verificando && (
                                    <div style={{ position: 'absolute', right: '12px', top: '12px' }}>
                                        <div className="spinner-premium" style={{ width: '20px', height: '20px', margin: 0 }}></div>
                                    </div>
                                )}
                            </div>
                            {cedulaMensaje && (
                                <small style={{
                                    display: 'block', marginTop: '6px', fontWeight: '600',
                                    color: cedulaMensaje.includes('✅') ? '#22c55e' : '#f59e0b'
                                }}>
                                    {cedulaMensaje}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nombre del Propietario</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-3)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <Users size={20} color="var(--muted)" />
                            <span style={{ fontWeight: '700', color: formData.nombreCompleto ? 'var(--text-1)' : 'var(--muted)' }}>
                                {formData.nombreCompleto || 'Esperando cédula...'}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico de Login</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                            className="premium-input"
                            placeholder="usuario@ejemplo.com"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Rol de Seguridad</label>
                            <select name="rol" value={formData.rol} onChange={handleChange} required className="premium-input">
                                {rolesSistemaOptions.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Estado de Acceso</label>
                            <select name="estado" value={formData.estado} onChange={handleChange} required className="premium-input">
                                <option value="Activo">🔓 Activo</option>
                                <option value="Inactivo">🔒 Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                        <button type="button" className="btn-secondary clickable-scale" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary btn-ripple shadow-glow-accent">
                            <Save size={18} style={{ marginRight: '8px' }} />
                            {isEditMode ? 'Guardar Cambios' : 'Confirmar Acceso'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ============================================================
   MODAL PARA CAMBIAR CONTRASEÑA - PREMIUM DESIGN
============================================================ */
const CambiarPasswordModal = ({ isOpen, onClose, usuario, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setNewPassword('');
            setConfirmPassword('');
            setShowPassword(false);
            setError('');
            setSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Intentar con el endpoint correcto
            const resp = await fetch(`${API_BASE}/usuarios/${usuario.cedula}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    password: newPassword,
                    email: usuario.email,
                    rol: usuario.rol,
                    estado: usuario.estado
                })
            });

            const data = await resp.json();

            if (resp.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSave();
                    onClose();
                }, 1500);
            } else {
                setError(data.message || 'Error al cambiar la contraseña');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !usuario) return null;

    return (
        <div className="modal-overlay backdrop-blur-strong fade-in">
            <div className="modal-content scale-in" style={{ maxWidth: '550px', padding: 0, overflow: 'hidden' }}>
                {/* Header Premium */}
                <div style={{
                    background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                    padding: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
                        <div className="particles-background">
                            {[...Array(3)].map((_, i) => <div key={i} className="particle" />)}
                        </div>
                    </div>

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                <KeyRound size={32} color="#fff" />
                            </div>
                            <div>
                                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>
                                    Resetear Contraseña
                                </h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                                    Configurar nueva contraseña de acceso
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-icon-close" style={{ color: '#fff' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    {/* Usuario Info Card */}
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(245, 158, 11, 0.05))',
                        borderRadius: '12px',
                        border: '1px solid rgba(234, 179, 8, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'rgba(234, 179, 8, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '800', fontSize: '1.2rem', color: '#eab308'
                            }}>
                                {(usuario.persona?.nombres || usuario.cedula).charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                    Usuario Seleccionado
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-1)' }}>
                                    {usuario.persona ? `${usuario.persona.nombres} ${usuario.persona.apellidos}` : usuario.cedula}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {usuario.email} • {usuario.rol}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Inputs */}
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lock size={16} color="var(--primary)" />
                            Nueva Contraseña
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pro-input"
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                            style={{ fontSize: '1rem' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={16} color="var(--primary)" />
                            Confirmar Contraseña
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pro-input"
                            placeholder="Repite la contraseña"
                            required
                            minLength={6}
                            style={{ fontSize: '1rem' }}
                        />
                    </div>

                    {/* Show Password Toggle */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mostrar contraseñas</span>
                        </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="fade-in" style={{
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            borderRadius: '10px',
                            color: '#ef4444',
                            fontSize: '0.9rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <ShieldAlert size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="fade-in" style={{
                            padding: '1rem',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid #22c55e',
                            borderRadius: '10px',
                            color: '#22c55e',
                            fontSize: '0.9rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <ShieldCheck size={20} />
                            <span>¡Contraseña actualizada exitosamente!</span>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="pro-btn btn-secondary" disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading || success} className="pro-btn btn-primary" style={{ background: 'linear-gradient(135deg, #eab308, #f59e0b)' }}>
                            {loading ? (
                                <div className="spinner-premium" style={{ width: '18px', height: '18px' }}></div>
                            ) : success ? (
                                <>
                                    <ShieldCheck size={18} style={{ marginRight: '8px' }} />
                                    Completado
                                </>
                            ) : (
                                <>
                                    <KeyRound size={18} style={{ marginRight: '8px' }} />
                                    Cambiar Contraseña
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ============================================================
   COMPONENTE PRINCIPAL DE GESTIÓN DE USUARIOS
============================================================ */

/* ============================================================
   COMPONENTE PRINCIPAL DE GESTIÓN DE USUARIOS
============================================================ */
const UsuariosSistema = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUsuario, setCurrentUsuario] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    const loadUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE}/usuarios`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
            const json = await resp.json();
            if (resp.ok) setUsuarios(json.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUsuarios(); }, [loadUsuarios]);

    const stats = useMemo(() => {
        const total = usuarios.length;
        const activos = usuarios.filter(u => u.estado).length;
        const admins = usuarios.filter(u => u.rol === 'admin').length;
        return { total, activos, admins };
    }, [usuarios]);

    const handleCreate = () => { setCurrentUsuario(null); setIsModalOpen(true); };

    const handleEdit = (u) => {
        setCurrentUsuario({
            cedula: u.cedula,
            correo: u.email,
            rol: u.rol,
            estado: u.estado ? 'Activo' : 'Inactivo',
            nombreCompleto: u.persona ? `${u.persona.nombres} ${u.persona.apellidos}` : '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (u) => {
        if (!window.confirm(`¿Remover acceso a ${u.persona?.nombres || u.cedula}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE}/usuarios/${u.cedula}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) loadUsuarios();
        } catch (err) { console.error(err); }
    };

    const handleSave = async (data, isEdit) => {
        const token = localStorage.getItem('token');
        const payload = {
            cedula: data.cedula,
            email: data.correo,
            rol: data.rol,
            estado: data.estado === 'Activo'
        };
        if (!isEdit) payload.password = data.cedula;

        const url = isEdit ? `${API_BASE}/usuarios/${data.cedula}` : `${API_BASE}/usuarios`;
        try {
            const resp = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (resp.ok) {
                setIsModalOpen(false);
                loadUsuarios();
            }
        } catch (err) { console.error(err); }
    };

    const handleChangePassword = (u) => {
        setSelectedUsuario(u);
        setIsPasswordModalOpen(true);
    };

    const handlePasswordSaved = () => {
        alert('Contraseña actualizada exitosamente');
    };

    const filtered = usuarios.filter(u => {
        const n = u.persona ? `${u.persona.nombres} ${u.persona.apellidos}` : '';
        return n.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.cedula.includes(searchTerm) ||
            u.rol.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="main-module-content fade-in">
            {/* HERO HEADER PRO */}
            <div className="torneo-header-premium shadow-premium animated-gradient" style={{
                borderRadius: '20px', padding: '2.5rem', marginBottom: '2.5rem', position: 'relative'
            }}>
                <div className="particles-background">
                    {[...Array(5)].map((_, i) => <div key={i} className="particle" />)}
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <ShieldCheck size={40} /> Gestión de Accesos Profesional
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginTop: '10px' }}>
                            Control total sobre la seguridad y roles de tu plataforma deportiva.
                        </p>
                    </div>
                    <button className="btn-primary btn-ripple shadow-glow-accent" onClick={handleCreate} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        <Plus size={22} /> Asignar Acceso
                    </button>
                </div>
            </div>

            {/* KPI STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard title="Usuarios Totales" value={stats.total} icon={Users} color="#38bdf8" />
                <StatCard title="Accesos Activos" value={stats.activos} icon={Activity} color="#22c55e" />
                <StatCard title="Administradores" value={stats.admins} icon={Key} color="#ef4444" />
            </div>

            {/* MAIN TABLE SECTION */}
            <div className="dashboard-section-card shadow-premium" style={{ padding: '2rem' }}>
                <div className="section-header-table" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Directorio de Seguridad</h2>
                    <div className="search-box backdrop-blur" style={{ width: '400px', border: '1px solid var(--border)' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, cédula o rol..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <SkeletonLoader.Table rows={6} columns={6} />
                ) : (
                    <div className="table-container">
                        <table className="admin-table-premium">
                            <thead>
                                <tr>
                                    <th>USUARIO / CÉDULA</th>
                                    <th>CORREO ACCESO</th>
                                    <th>ROL DEL SISTEMA</th>
                                    <th>ESTADO</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '4rem' }}>
                                            <div className="empty-state">
                                                <Lock size={64} className="empty-state-icon" />
                                                <h3>No se hallaron registros</h3>
                                                <p>Intenta con otros términos de búsqueda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(u => (
                                        <tr key={u.cedula} className="clickable-scale">
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '40px', height: '40px', borderRadius: '10px',
                                                        background: 'var(--bg-2)', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: '800', color: 'var(--accent)'
                                                    }}>
                                                        {(u.persona?.nombres || u.cedula).charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700' }}>{u.persona ? `${u.persona.nombres} ${u.persona.apellidos}` : 'Sin nombre'}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>ID: {u.cedula}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '600' }}>{u.email}</td>
                                            <td>
                                                <span className={`badge-premium ${u.rol === 'admin' ? 'badge-danger' :
                                                    u.rol === 'representante' ? 'badge-success' :
                                                        u.rol === 'arbitro' ? 'badge-warning' :
                                                            'badge-info'
                                                    }`}>
                                                    {u.rol === 'admin' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                                    {u.rol.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: u.estado ? '#22c55e' : '#ef4444' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.estado ? '#22c55e' : '#ef4444' }} />
                                                    {u.estado ? 'ACTIVO' : 'INACTIVO'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-icon-edit glow-on-hover" onClick={() => handleEdit(u)} title="Editar usuario"><Edit size={18} /></button>
                                                    <button className="btn-icon-view glow-on-hover" onClick={() => handleChangePassword(u)} title="Cambiar contraseña" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}><KeyRound size={18} /></button>
                                                    <button className="btn-icon-delete glow-on-hover" onClick={() => handleDelete(u)} title="Eliminar usuario"><Trash2 size={18} /></button>
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

            <UsuarioSistemaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={currentUsuario}
                onSave={handleSave}
            />

            <CambiarPasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                usuario={selectedUsuario}
                onSave={handlePasswordSaved}
            />
        </div>
    );
};

export default UsuariosSistema;


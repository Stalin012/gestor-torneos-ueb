import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User, Mail, Tag, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../api';

const UsuarioModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        rol: 'usuario',
        estado: 'activo',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [statusType, setStatusType] = useState('');
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            document.body.classList.remove('modal-open');
            return;
        }

        document.body.classList.add('modal-open');

        // Cerrar con ESC
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);

        if (initialData) {
            setFormData({
                nombres: initialData.persona?.nombres || '',
                apellidos: initialData.persona?.apellidos || '',
                email: initialData.email || '',
                rol: initialData.rol || 'usuario',
                estado: initialData.estado ? 'activo' : 'inactivo',
                password: '',
                password_confirmation: '',
            });
        } else {
            setFormData({
                nombres: '',
                apellidos: '',
                email: '',
                rol: 'usuario',
                estado: 'activo',
                password: '',
                password_confirmation: '',
            });
        }
        setErrors({});
        setStatusType('');
        setStatusText('');
        return () => {
            document.body.classList.remove('modal-open');
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombres) newErrors.nombres = 'El nombre es obligatorio.';
        if (!formData.apellidos) newErrors.apellidos = 'El apellido es obligatorio.';
        if (!formData.email) {
            newErrors.email = 'El email es obligatorio.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido.';
        }
        if (!formData.rol) newErrors.rol = 'El rol es obligatorio.';

        if (!initialData) {
            if (!formData.password) newErrors.password = 'La contraseña es obligatoria.';
            if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Las contraseñas no coinciden.';
            }
        } else if (formData.password && formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const confirmar = window.confirm(
            initialData
                ? '¿Desea guardar los cambios realizados en este operador?'
                : '¿Desea registrar este nuevo operador?'
        );
        if (!confirmar) return;

        setStatusType('info');
        setStatusText('Guardando credenciales del operador...');
        setLoading(true);
        try {
            const dataToSubmit = {
                email: formData.email,
                rol: formData.rol,
                estado: formData.estado === 'activo',
                nombres: formData.nombres,
                apellidos: formData.apellidos,
            };

            if (formData.password) {
                dataToSubmit.password = formData.password;
                dataToSubmit.password_confirmation = formData.password_confirmation;
            }

            const response = initialData
                ? await api.patch(`/usuarios/${initialData.cedula || initialData.id}`, dataToSubmit)
                : await api.post('/usuarios', dataToSubmit);

            if (response.status >= 200 && response.status < 300) {
                setStatusType('success');
                setStatusText('Los datos han sido guardados correctamente');
                if (onSave) await onSave();
                setTimeout(() => onClose(), 600);
            } else {
                setErrors(response.data.errors || { general: 'Error al guardar el usuario.' });
            }
        } catch (err) {
            setErrors({ general: err.response?.data?.message || err.response?.data?.error || 'Error de conexión con el servidor.' });
            console.error('Error al guardar usuario:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="modal-overlay fade-in"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="modal-content modal-lg scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(53, 110, 216, 0.1), rgba(168, 85, 247, 0.05))',
                    borderBottom: '2px solid var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(53, 110, 216, 0.3)'
                        }}>
                            <ShieldCheck size={26} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
                                {initialData ? 'Garantizar Acceso' : 'Nuevo Operador'}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gestión de credenciales y permisos</p>
                            {statusText && (
                                <span className={`modal-badge ${statusType}`} style={{ marginTop: '6px' }}>
                                    {statusText}
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={22} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Nombres</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                <input type="text" name="nombres" className="pro-input" value={formData.nombres} onChange={handleChange} disabled={loading} required placeholder="Nombre Real" />
                                </div>
                                {errors.nombres && <p className="error-message">{errors.nombres}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Apellidos</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                <input type="text" name="apellidos" className="pro-input" value={formData.apellidos} onChange={handleChange} disabled={loading} required placeholder="Apellido Real" />
                                </div>
                                {errors.apellidos && <p className="error-message">{errors.apellidos}</p>}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Correo Electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                <input type="email" name="email" className="pro-input" style={{ paddingLeft: '38px' }} value={formData.email} onChange={handleChange} disabled={loading} required placeholder="institucional@ejemplo.com" />
                            </div>
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Rol del Sistema</label>
                                <div style={{ position: 'relative' }}>
                                    <Tag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                    <select name="rol" className="pro-input" style={{ paddingLeft: '38px' }} value={formData.rol} onChange={handleChange} disabled={loading}>
                                        <option value="admin">Administrador</option>
                                        <option value="representante">representante</option>
                                        <option value="jugador">jugador</option>
                                        <option value="arbitro">arbitro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Estatus de Cuenta</label>
                                <div style={{ position: 'relative' }}>
                                    {formData.estado === 'activo'
                                        ? <CheckCircle size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} />
                                        : <X size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />}
                                    <select name="estado" className="pro-input" style={{ paddingLeft: '38px' }} value={formData.estado} onChange={handleChange} disabled={loading}>
                                        <option value="activo">Activo / Autorizado</option>
                                        <option value="inactivo">Restringido / Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Contraseña {initialData && '(Opcional)'}</label>
                                <input type="password" name="password" className="pro-input" value={formData.password} onChange={handleChange} disabled={loading} placeholder="••••••••" />
                                {errors.password && <p className="error-message">{errors.password}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Reconfirmar</label>
                                <input type="password" name="password_confirmation" className="pro-input" value={formData.password_confirmation} onChange={handleChange} disabled={loading} placeholder="••••••••" />
                                {errors.password_confirmation && <p className="error-message">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        {errors.general && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', textAlign: 'center', fontSize: '0.9rem' }}>
                                {errors.general}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} disabled={loading}>Descartar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading} style={{ minWidth: '180px' }}>
                            {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : <><Save size={18} /> {initialData ? 'Sincronizar Acceso' : 'Certificar Usuario'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default UsuarioModal;

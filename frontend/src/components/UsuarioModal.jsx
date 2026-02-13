import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (!isOpen) return;
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
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
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
                onSave();
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

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content scale-in" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(53, 110, 216, 0.1), rgba(245, 158, 11, 0.05))',
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
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>
                                {initialData ? 'Garantizar Acceso' : 'Nuevo Operador'}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestión de credenciales y permisos</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body p-lg-mobile" style={{ padding: '2.5rem' }}>
                        <div className="flex-mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Nombres</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                                    <input type="text" name="nombres" className="pro-input" style={{ paddingLeft: '40px' }} value={formData.nombres} onChange={handleChange} disabled={loading} required placeholder="Nombre Real" />
                                </div>
                                {errors.nombres && <p className="error-message" style={{ margin: '4px 0 0 0' }}>{errors.nombres}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Apellidos</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                                    <input type="text" name="apellidos" className="pro-input" style={{ paddingLeft: '40px' }} value={formData.apellidos} onChange={handleChange} disabled={loading} required placeholder="Apellido Real" />
                                </div>
                                {errors.apellidos && <p className="error-message" style={{ margin: '4px 0 0 0' }}>{errors.apellidos}</p>}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Correo Electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                                <input type="email" name="email" className="pro-input" style={{ paddingLeft: '40px' }} value={formData.email} onChange={handleChange} disabled={loading} required placeholder="institucional@ejemplo.com" />
                            </div>
                            {errors.email && <p className="error-message" style={{ margin: '4px 0 0 0' }}>{errors.email}</p>}
                        </div>

                        <div className="flex-mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Rol del Sistema</label>
                                <div style={{ position: 'relative' }}>
                                    <Tag size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                                    <select name="rol" className="pro-input" style={{ paddingLeft: '40px' }} value={formData.rol} onChange={handleChange} disabled={loading}>
                                        <option value="admin">Administrador Maestro</option>
                                        <option value="usuario">Operador Común</option>
                                        <option value="arbitro">Cuerpo Técnico</option>
                                        <option value="entrenador">Director Técnico</option>
                                        <option value="jugador">Atleta / Deportista</option>
                                        <option value="representante">Representante Legal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Estatus de Cuenta</label>
                                <div style={{ position: 'relative' }}>
                                    {formData.estado === 'activo' ? <CheckCircle size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#10b981' }} /> : <X size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#ef4444' }} />}
                                    <select name="estado" className="pro-input" style={{ paddingLeft: '40px' }} value={formData.estado} onChange={handleChange} disabled={loading}>
                                        <option value="activo">Activo / Autorizado</option>
                                        <option value="inactivo">Restringido / Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex-mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Contraseña {initialData && '(Opcional)'}</label>
                                <input type="password" name="password" className="pro-input" value={formData.password} onChange={handleChange} disabled={loading} placeholder="••••••••" />
                                {errors.password && <p className="error-message" style={{ margin: '4px 0 0 0' }}>{errors.password}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Reconfirmar</label>
                                <input type="password" name="password_confirmation" className="pro-input" value={formData.password_confirmation} onChange={handleChange} disabled={loading} placeholder="••••••••" />
                                {errors.password_confirmation && <p className="error-message" style={{ margin: '4px 0 0 0' }}>{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        {errors.general && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid #ef4444', color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>
                                {errors.general}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 2.5rem' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} disabled={loading}>Descartar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading} style={{ minWidth: '180px', justifyContent: 'center' }}>
                            {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : <><Save size={20} /> {initialData ? 'Sincronizar Acceso' : 'Certificar Usuario'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsuarioModal;

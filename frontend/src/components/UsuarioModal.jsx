import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User, Mail, Tag, CheckCircle, ShieldCheck, Camera } from 'lucide-react';
import api from '../api';
import { getAssetUrl } from '../utils/helpers';

const UsuarioModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({
        cedula: '',
        nombres: '',
        apellidos: '',
        email: '',
        rol: 'jugador',
        estado: 'activo',
        password: '',
        password_confirmation: '',
    });
    const [personaExiste, setPersonaExiste] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [statusType, setStatusType] = useState('');
    const [statusText, setStatusText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

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
                cedula: initialData.cedula || '',
                nombres: initialData.persona?.nombres || '',
                apellidos: initialData.persona?.apellidos || '',
                email: initialData.email || '',
                rol: initialData.rol || 'jugador',
                estado: initialData.estado ? 'activo' : 'inactivo',
                password: '',
                password_confirmation: '',
            });
            setPersonaExiste(true);
        } else {
            setFormData({
                cedula: '',
                nombres: '',
                apellidos: '',
                email: '',
                rol: 'jugador',
                estado: 'activo',
                password: '',
                password_confirmation: '',
            });
            setPersonaExiste(false);
        }
        setErrors({});
        setStatusType('');
        setStatusText('');
        setSelectedFile(null);
        setPhotoPreview(null);
        return () => {
            document.body.classList.remove('modal-open');
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, initialData]);

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'cedula' && value.length === 10 && !initialData) {
            try {
                const resp = await api.get(`/usuarios/verificar-persona/${value}`);
                if (resp.data.existe_persona) {

                    setFormData(prev => ({
                        ...prev,
                        nombres: resp.data.persona_data.nombres,
                        apellidos: resp.data.persona_data.apellidos,
                        email: resp.data.persona_data.email || prev.email
                    }));
                    setPersonaExiste(true);
                    setStatusType('success');
                    setStatusText('Persona encontrada, datos cargados.');
                } else {
                    setPersonaExiste(false);
                    setStatusType('');
                    setStatusText('');
                }
                if (resp.data.es_usuario) {
                    setErrors({ cedula: 'Esta cédula ya tiene un usuario en el sistema.' });
                } else {
                    setErrors((prev) => ({ ...prev, cedula: null }));
                }
            } catch (err) {
                console.error("Verificando cedula error", err);
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!initialData && (!formData.cedula || formData.cedula.length !== 10)) {
            newErrors.cedula = 'La cédula debe tener 10 dígitos.';
        }
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
                cedula: formData.cedula,
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

            // Si hay una foto seleccionada, subirla por separado a la Persona
            if (response.status >= 200 && response.status < 300 && selectedFile) {
                const personaCedula = response.data.usuario?.cedula || formData.cedula;
                const photoData = new FormData();
                photoData.append('foto', selectedFile);

                await api.post(`/personas/${personaCedula}?_method=PUT`, photoData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.status >= 200 && response.status < 300) {
                setStatusType('success');
                setStatusText('Los datos han sido guardados correctamente');
                if (onSave) await onSave();
                setTimeout(() => onClose(), 600);
            } else {
                setErrors(response.data.errors || { general: 'Error al guardar el usuario.' });
            }
        } catch (err) {
            if (err.response?.status === 422) {
                const apiErrors = err.response.data.errors;
                if (apiErrors) {
                    setErrors(apiErrors);
                    setStatusType('error');
                    setStatusText('Hay errores en los datos ingresados.');
                } else {
                    setErrors({ general: err.response.data.message || 'Error de validación.' });
                }
            } else {
                setErrors({ general: err.response?.data?.message || err.response?.data?.error || 'Error de conexión con el servidor.' });
            }
            console.error('Error al guardar usuario:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" style={{ padding: '10px' }}>
            <div className="modal-content modal-lg" style={{
                onClick: (e) => e.stopPropagation(),
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflowY: 'auto',
                margin: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header" style={{ borderBottom: '2px solid var(--primary)', padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="modal-icon" style={{
                            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                            width: '40px',
                            height: '40px',
                            minWidth: '40px'
                        }}>
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>
                                {initialData ? 'Garantizar Acceso' : 'Nuevo Operador'}
                            </h2>
                            <p className="modal-subtitle" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Gestión de credenciales y permisos</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" type="button" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '24px', background: 'rgba(30, 41, 59, 0.6)', border: '2px dashed rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {(photoPreview || initialData?.persona?.foto_url || initialData?.foto_url || initialData?.foto) ? (
                                    <img
                                        src={photoPreview || getAssetUrl(initialData.persona?.foto_url || initialData.foto_url || initialData.foto)}
                                        alt="Avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <User size={40} color="#64748b" />
                                )}
                                <input
                                    type="file"
                                    id="user-photo-upload"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div
                                    onClick={() => document.getElementById('user-photo-upload').click()}
                                    style={{ position: 'absolute', bottom: 0, right: 0, padding: '4px', background: 'var(--primary)', color: 'white', borderRadius: '8px 0 0 0', cursor: 'pointer' }}
                                >
                                    <Camera size={14} />
                                </div>
                            </div>
                        </div>

                        {statusText && (
                            <div style={{ marginBottom: '1.2rem', padding: '0.8rem', background: statusType === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: statusType === 'success' ? '#10b981' : '#3b82f6', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center' }}>
                                {statusText}
                            </div>
                        )}

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '1.2rem',
                            marginBottom: '1.2rem'
                        }}>
                            <div className="form-group">
                                <label className="form-label">Cédula</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                    <input type="text" name="cedula" className="pro-input" style={{ paddingLeft: '38px' }} maxLength="10" value={formData.cedula} onChange={handleChange} disabled={loading || !!initialData} required placeholder="Cédula Institucional" />
                                </div>
                                {errors.cedula && <p className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{Array.isArray(errors.cedula) ? errors.cedula[0] : errors.cedula}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Correo Electrónico</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                    <input type="email" name="email" className="pro-input" style={{ paddingLeft: '38px' }} value={formData.email} onChange={handleChange} disabled={loading} required placeholder="institucional@ejemplo.com" />
                                </div>
                                {errors.email && <p className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '1.2rem',
                            marginBottom: '1.2rem'
                        }}>
                            <div className="form-group">
                                <label className="form-label">Nombres</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                    <input type="text" name="nombres" className="pro-input" style={{ paddingLeft: '38px' }} value={formData.nombres} onChange={handleChange} disabled={loading || personaExiste} required placeholder="Nombre Real" />
                                </div>
                                {errors.nombres && <p className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{Array.isArray(errors.nombres) ? errors.nombres[0] : errors.nombres}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Apellidos</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                    <input type="text" name="apellidos" className="pro-input" style={{ paddingLeft: '38px' }} value={formData.apellidos} onChange={handleChange} disabled={loading || personaExiste} required placeholder="Apellido Real" />
                                </div>
                                {errors.apellidos && <p className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{Array.isArray(errors.apellidos) ? errors.apellidos[0] : errors.apellidos}</p>}
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '1.2rem',
                            marginBottom: '1.2rem'
                        }}>
                            <div className="form-group">
                                <label className="form-label">Rol del Sistema</label>
                                <div style={{ position: 'relative' }}>
                                    <Tag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                                    <select name="rol" className="pro-input" style={{ paddingLeft: '38px' }} value={formData.rol} onChange={handleChange} disabled={loading}>
                                        <option value="admin">Administrador</option>
                                        <option value="representante">Representante</option>
                                        <option value="jugador">Jugador</option>
                                        <option value="arbitro">Árbitro</option>
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

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '1.2rem'
                        }}>
                            <div className="form-group">
                                <label className="form-label">Contraseña {initialData && '(Opcional)'}</label>
                                <input type="password" name="password" className="pro-input" value={formData.password} onChange={handleChange} disabled={loading} placeholder="••••••••" />
                                {errors.password && <p className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Reconfirmar</label>
                                <input type="password" name="password_confirmation" className="pro-input" value={formData.password_confirmation} onChange={handleChange} disabled={loading} placeholder="••••••••" />
                                {errors.password_confirmation && <p className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</p>}
                            </div>
                        </div>

                        {errors.general && (
                            <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', textAlign: 'center', fontSize: '0.85rem' }}>
                                {errors.general}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer" style={{ padding: '1rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <button type="button" className="pro-btn btn-secondary" style={{ flex: '1', minWidth: '120px' }} onClick={onClose} disabled={loading}>Descartar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading} style={{ flex: '2', minWidth: '200px' }}>
                            {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : <><Save size={18} /> {initialData ? 'Sincronizar' : 'Certificar'}</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>,
        document.body
    );
};

export default UsuarioModal;

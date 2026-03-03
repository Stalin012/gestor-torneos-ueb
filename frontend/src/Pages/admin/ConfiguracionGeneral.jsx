// resources/js/pages/admin/ConfiguracionGeneral.jsx

import React, { useState, useEffect } from 'react';
import {
    Settings, Globe, Lock, Save, Clock, User, Camera, ShieldCheck, Mail, Hash,
    Bell, Database, HardDrive, Cpu, Fingerprint, Activity, Layers, Palette
} from 'lucide-react';
import '../../css/config-styles.css';
import api, { API_BASE } from '../../api';
import { getAssetUrl } from '../../utils/helpers';


// API_BASE importada desde ../../api

// =========================================
// 1. Configuración por defecto (fallback)
// =========================================
const mockConfig = {
    general: {
        nombreSistema: 'Gestor de Torneos UEB',
        emailContacto: 'contacto@ueb.edu.ec',
        logoUrl: '',
        timezone: 'America/Guayaquil',
        registroAbierto: true,
    },
    operacional: {
        maxEquiposPorTorneo: 32,
        defaultEstadoInscripcion: 'Pendiente',
        diasMaximoParaProgramacion: 15,
        activarNotificacionesEmail: true,
    },
    seguridad: {
        longitudMinimaContrasena: 8,
        rolUsuarioPorDefecto: 'Invitado',
        forzar2FA: false,
    }
};

// =========================================
// 2. Sub-Componentes para Pestañas
// =========================================

const ProfileTab = ({ user, onPhotoUpdate }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('foto', file);

            const resp = await api.post('/personas/' + user.cedula, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                params: { _method: 'PUT' }
            });

            onPhotoUpdate(resp.data.data?.foto_url || resp.data.foto_url);
            alert('Foto de perfil actualizada correctamente.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error al subir la foto.');
        } finally {
            setUploading(false);
        }
    };

    const fotoUrl = getAssetUrl(user.persona?.foto_url || user.persona?.foto);

    return (
        <div className="fade-enter config-tab-content-wrapper">
            <div className="tab-header-gradient profile-header" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3>
                        <Fingerprint size={32} /> Identidad Digital
                    </h3>
                    <p>
                        Información personal y seguridad de tu cuenta de acceso
                    </p>
                </div>
            </div>

            <div className="config-grid-container" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Imagen de Perfil</h4>
                        <p>Identificador visual institucional</p>
                    </div>
                    <div className="config-card-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '160px',
                                height: '160px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '5px solid rgba(99, 102, 241, 0.2)',
                                background: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.4)'
                            }}>
                                {uploading ? (
                                    <div className="spinner" style={{ width: '40px', height: '40px' }} />
                                ) : fotoUrl ? (
                                    <img src={fotoUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={80} color="#475569" />
                                )}
                            </div>
                            <label className="photo-upload-badge" style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                background: '#6366f1',
                                color: 'white',
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '3px solid #1e293b',
                                boxShadow: '0 8px 15px rgba(0,0,0,0.4)',
                                transition: 'all 0.2s'
                            }}>
                                <Camera size={20} />
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} disabled={uploading} />
                            </label>
                        </div>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: 800 }}>{user.persona?.nombres} {user.persona?.apellidos}</h4>
                        <span className="modal-badge info" style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800 }}>ADMINISTRADOR</span>
                    </div>
                </div>

                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Credenciales de Acceso</h4>
                        <p>Datos fundamentales protegidos por el sistema</p>
                    </div>
                    <div className="config-card-content">
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Identificación (Cédula)</label>
                                <div style={{ position: 'relative' }}>
                                    <Hash size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: '#64748b' }} />
                                    <input className="pro-input" value={user.cedula || ''} readOnly style={{ paddingLeft: '3rem', opacity: 0.8, cursor: 'not-allowed' }} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Correo Institucional</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: '#64748b' }} />
                                    <input className="pro-input" value={user.email || ''} readOnly style={{ paddingLeft: '3rem', opacity: 0.8, cursor: 'not-allowed' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.25rem',
                            background: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: '16px',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            marginTop: '0.5rem'
                        }}>
                            <ShieldCheck size={24} color="#6366f1" style={{ marginTop: '2px' }} />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>Protección de Datos</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                    Su información de identidad está vinculada a registros académicos oficiales. Para modificaciones, debe realizar una solicitud formal.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Pestaña de Configuración General
const GeneralSettingsTab = ({ config, onUpdate, onLogoUpload }) => {
    const handleChange = (section, key, value) => {
        onUpdate({
            ...config,
            [section]: { ...config[section], [key]: value }
        });
    };

    const logoUrl = config.general.logoUrl;

    return (
        <div className="fade-enter config-tab-content-wrapper">
            <div className="tab-header-gradient" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3>
                        <Layers size={32} /> Parámetros Globales
                    </h3>
                    <p>
                        Control maestro de la identidad y comportamiento del sistema
                    </p>
                </div>
            </div>

            <div className="config-grid-container">
                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Identidad del Sistema</h4>
                        <p>Información básica y branding</p>
                    </div>
                    <div className="config-card-content">
                        <div className="form-group">
                            <label className="form-label" htmlFor="nombreSistema">Nombre del Sistema</label>
                            <input
                                className="pro-input"
                                type="text"
                                id="nombreSistema"
                                value={config.general.nombreSistema || ''}
                                onChange={(e) => handleChange('general', 'nombreSistema', e.target.value)}
                                placeholder="Ej: Gestor de Torneos UEB"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="emailContacto">Email de Contacto</label>
                            <input
                                className="pro-input"
                                type="email"
                                id="emailContacto"
                                value={config.general.emailContacto || ''}
                                onChange={(e) => handleChange('general', 'emailContacto', e.target.value)}
                                placeholder="contacto@institucion.edu.ec"
                            />
                        </div>
                    </div>
                </div>

                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Logo del Sistema</h4>
                        <p>Imagen representativa de la institución</p>
                    </div>
                    <div className="config-card-content">
                        <div className="logo-upload-area">
                            {logoUrl ? (
                                <div className="logo-preview-container">
                                    <div className="logo-preview-box">
                                        <img
                                            src={logoUrl}
                                            alt="Logo actual"
                                            className="logo-preview-image"
                                        />
                                    </div>
                                    <p className="logo-status-text">
                                        ✓ Logo configurado correctamente
                                    </p>
                                </div>
                            ) : (
                                <div className="no-logo-placeholder">
                                    <div className="no-logo-box">
                                        <Globe size={40} className="no-logo-icon" />
                                    </div>
                                    <p className="no-logo-text">
                                        Sin logo configurado
                                    </p>
                                </div>
                            )}
                            <label className="pro-btn btn-primary">
                                <Globe size={18} />
                                {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden-file-input"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            onLogoUpload(file);
                                        }
                                    }}
                                />
                            </label>
                            <div className="logo-recommendations">
                                <strong>Recomendaciones:</strong><br />
                                • Formatos: JPG, PNG, WEBP<br />
                                • Tamaño máximo: 2MB<br />
                                • Dimensiones ideales: 200x200px
                            </div>
                        </div>
                    </div>
                </div>

                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Configuración Regional</h4>
                        <p>Ajustes de localización y acceso</p>
                    </div>
                    <div className="config-card-content">
                        <div className="form-group">
                            <label className="form-label" htmlFor="timezone">Zona Horaria Predeterminada</label>
                            <input
                                className="pro-input"
                                type="text"
                                id="timezone"
                                value={config.general.timezone || ''}
                                onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                                placeholder="America/Guayaquil"
                            />
                            <small className="small-text-muted">
                                Formato: Continente/Ciudad (ej: America/Guayaquil, America/Bogota)
                            </small>
                        </div>

                        <div className="checkbox-card">
                            <div className="checkbox-card-content-wrapper">
                                <input
                                    type="checkbox"
                                    id="registroAbierto"
                                    checked={!!config.general.registroAbierto}
                                    onChange={(e) => handleChange('general', 'registroAbierto', e.target.checked)}
                                />
                                <div>
                                    <label htmlFor="registroAbierto">
                                        Permitir Registro Público de Equipos
                                    </label>
                                    <p>
                                        Los equipos podrán registrarse directamente sin aprobación previa del administrador
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Pestaña de Configuración Operacional
const OperationalSettingsTab = ({ config, onUpdate }) => {
    const handleChange = (section, key, value) => {
        onUpdate({
            ...config,
            [section]: { ...config[section], [key]: value }
        });
    };

    return (
        <div className="fade-enter config-tab-content-wrapper">
            <div className="tab-header-gradient" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3>
                        <Activity size={32} /> Monitor Operacional
                    </h3>
                    <p>
                        Gestión de capacidades, límites y automatización de procesos
                    </p>
                </div>
            </div>

            <div className="config-grid-container">
                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Límites del Sistema</h4>
                        <p>Restricciones y capacidades máximas</p>
                    </div>
                    <div className="config-card-content">
                        <div className="form-group">
                            <label className="form-label" htmlFor="maxEquiposPorTorneo">Máximo de Equipos por Torneo</label>
                            <input
                                className="pro-input"
                                type="number"
                                id="maxEquiposPorTorneo"
                                value={config.operacional.maxEquiposPorTorneo ?? 0}
                                min="2"
                                max="128"
                                onChange={(e) => handleChange('operacional', 'maxEquiposPorTorneo', parseInt(e.target.value || 0))}
                                placeholder="32"
                            />
                            <small className="small-text-muted">
                                Número máximo de equipos que pueden participar en un torneo (mínimo 2, máximo 128)
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="diasMaximoParaProgramacion">Días Máximos para Programación</label>
                            <input
                                className="pro-input"
                                type="number"
                                id="diasMaximoParaProgramacion"
                                value={config.operacional.diasMaximoParaProgramacion ?? 15}
                                min="1"
                                max="365"
                                onChange={(e) => handleChange('operacional', 'diasMaximoParaProgramacion', parseInt(e.target.value || 15))}
                                placeholder="15"
                            />
                            <small className="small-text-muted">
                                Días de anticipación máxima para programar partidos
                            </small>
                        </div>
                    </div>
                </div>

                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Gestión de Inscripciones</h4>
                        <p>Comportamiento por defecto del sistema</p>
                    </div>
                    <div className="config-card-content">
                        <div className="form-group">
                            <label className="form-label" htmlFor="defaultEstadoInscripcion">Estado por Defecto de Inscripciones</label>
                            <select
                                className="pro-input"
                                id="defaultEstadoInscripcion"
                                value={config.operacional.defaultEstadoInscripcion || 'Pendiente'}
                                onChange={(e) => handleChange('operacional', 'defaultEstadoInscripcion', e.target.value)}
                            >
                                <option value="Pendiente">Pendiente de Aprobación</option>
                                <option value="Aprobado">Aprobado Automáticamente</option>
                            </select>
                            <small className="small-text-muted">
                                Define si las nuevas inscripciones requieren aprobación manual o son automáticas
                            </small>
                        </div>
                    </div>
                </div>

                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Notificaciones y Comunicación</h4>
                        <p>Configuración de alertas automáticas</p>
                    </div>
                    <div className="config-card-content">
                        <div className="checkbox-card">
                            <div className="checkbox-card-content-wrapper">
                                <input
                                    type="checkbox"
                                    id="activarNotificacionesEmail"
                                    checked={!!config.operacional.activarNotificacionesEmail}
                                    onChange={(e) => handleChange('operacional', 'activarNotificacionesEmail', e.target.checked)}
                                />
                                <div>
                                    <label htmlFor="activarNotificacionesEmail">
                                        Activar Notificaciones por Email al Staff
                                    </label>
                                    <p>
                                        Envía alertas automáticas por email cuando ocurran eventos importantes en el sistema
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Pestaña de Configuración de Seguridad
const SecurityTab = ({ config, onUpdate }) => {
    const handleChange = (section, key, value) => {
        onUpdate({
            ...config,
            [section]: { ...config[section], [key]: value }
        });
    };

    return (
        <div className="fade-enter config-tab-content-wrapper">
            <div className="tab-header-gradient" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3>
                        <ShieldCheck size={32} /> Fortaleza de Seguridad
                    </h3>
                    <p>
                        Políticas de blindaje, acceso y blindaje de integridad de datos
                    </p>
                </div>
            </div>

            <div className="config-grid-container">
                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Políticas de Contraseñas</h4>
                        <p>Requisitos de seguridad para credenciales</p>
                    </div>
                    <div className="config-card-content">
                        <div className="form-group">
                            <label className="form-label" htmlFor="longitudMinimaContrasena">Longitud Mínima de Contraseña</label>
                            <input
                                className="pro-input"
                                type="number"
                                id="longitudMinimaContrasena"
                                value={config.seguridad.longitudMinimaContrasena ?? 8}
                                min="6"
                                max="32"
                                onChange={(e) => handleChange('seguridad', 'longitudMinimaContrasena', parseInt(e.target.value || 6))}
                                placeholder="8"
                            />
                            <small className="small-text-muted">
                                Número mínimo de caracteres requeridos (recomendado: 8 o más)
                            </small>
                        </div>

                        <div className="security-recommendations-card">
                            <h5>
                                🔒 Recomendaciones de Seguridad
                            </h5>
                            <ul>
                                <li>Mínimo 8 caracteres para seguridad básica</li>
                                <li>12+ caracteres para alta seguridad</li>
                                <li>Combinar letras, números y símbolos</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Control de Acceso</h4>
                        <p>Permisos y roles por defecto</p>
                    </div>
                    <div className="config-card-content">
                        <div className="form-group">
                            <label className="form-label" htmlFor="rolUsuarioPorDefecto">Rol Asignado a Nuevos Usuarios</label>
                            <select
                                className="pro-input"
                                id="rolUsuarioPorDefecto"
                                value={config.seguridad.rolUsuarioPorDefecto || 'Invitado'}
                                onChange={(e) => handleChange('seguridad', 'rolUsuarioPorDefecto', e.target.value)}
                            >
                                <option value="Invitado">Invitado (Solo lectura)</option>
                                <option value="Jugador">Jugador (Gestión de perfil)</option>
                                <option value="Staff">Staff (Acceso limitado)</option>
                            </select>
                            <small className="small-text-muted">
                                Rol que se asigna automáticamente a usuarios recién registrados
                            </small>
                        </div>
                    </div>
                </div>

                <div className="config-card">
                    <div className="config-card-header">
                        <h4>Autenticación Avanzada</h4>
                        <p>Medidas adicionales de protección</p>
                    </div>
                    <div className="config-card-content">
                        <div className="checkbox-card">
                            <div className="checkbox-card-content-wrapper">
                                <input
                                    type="checkbox"
                                    id="forzar2FA"
                                    checked={!!config.seguridad.forzar2FA}
                                    onChange={(e) => handleChange('seguridad', 'forzar2FA', e.target.checked)}
                                />
                                <div>
                                    <label htmlFor="forzar2FA">
                                        Forzar Autenticación de Dos Factores (2FA)
                                    </label>
                                    <p>
                                        Requiere verificación adicional para administradores y staff con permisos elevados
                                    </p>
                                </div>
                            </div>
                        </div>

                        {config.seguridad.forzar2FA && (
                            <div className="security-2fa-warning">
                                <Lock size={20} className="security-2fa-warning-icon" />
                                <p className="security-2fa-warning-text">
                                    La autenticación de dos factores (2FA) añade una capa extra de seguridad.
                                    Asegúrate de que los usuarios estén informados sobre cómo configurarla.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// =========================================
// 3. Componente Principal
// =========================================
const ConfiguracionGeneral = () => {
    const [config, setConfig] = useState(mockConfig);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    // Cargar configuración desde el backend
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const resp = await api.get('/configuracion');
                const json = resp.data;

                // Mezcla básica con mockConfig por si el backend aún no tiene todas las claves
                setConfig({
                    general: {
                        ...mockConfig.general,
                        ...(json.general || {}),
                    },
                    operacional: {
                        ...mockConfig.operacional,
                        ...(json.operacional || {}),
                    },
                    seguridad: {
                        ...mockConfig.seguridad,
                        ...(json.seguridad || {}),
                    },
                });
            } catch (err) {
                console.error(err);
                alert("Error de conexión al servidor al cargar configuración.");
            }
        };

        fetchConfig();
    }, []);

    // Guardar configuración en backend
    const handleSave = async () => {
        try {
            setIsSaving(true);
            const resp = await api.put('/configuracion', config);
            const json = resp.data;

            if (resp.status !== 200) {
                alert(json.message || 'Error al guardar configuración');
                setIsSaving(false);
                return;
            }

            alert("Configuración guardada correctamente.");
            setIsSaving(false);
        } catch (err) {
            console.error(err);
            alert("Error de conexión al servidor al guardar configuración.");
            setIsSaving(false);
        }
    };

    // Subir logo al backend
    const handleLogoUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('logo', file);

            const resp = await api.post('/configuracion/logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const json = resp.data;

            if (resp.status !== 200 && resp.status !== 201) {
                alert(json.message || 'Error al subir el logo.');
                return;
            }

            setConfig(prev => ({
                ...prev,
                general: {
                    ...prev.general,
                    logoUrl: json.logoUrl,
                }
            }));

            alert('Logo actualizado correctamente.');
        } catch (err) {
            console.error(err);
            alert('Error de conexión al subir el logo.');
        }
    };

    const handlePhotoUpdate = (newFotoUrl) => {
        // Update local user state
        const updatedUser = { ...user };
        if (updatedUser.persona) {
            updatedUser.persona.foto_url = newFotoUrl;
        } else {
            updatedUser.persona = { foto_url: newFotoUrl };
        }
        setUser(updatedUser);

        // Sync with localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch event to update navbar/sidebar
        window.dispatchEvent(new Event('user-updated'));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <GeneralSettingsTab
                        config={config}
                        onUpdate={setConfig}
                        onLogoUpload={handleLogoUpload}
                    />
                );
            case 'operacional':
                return <OperationalSettingsTab config={config} onUpdate={setConfig} />;
            case 'seguridad':
                return <SecurityTab config={config} onUpdate={setConfig} />;
            case 'perfil':
                return <ProfileTab user={user} onPhotoUpdate={handlePhotoUpdate} />;
            default:
                return null;
        }
    };

    return (
        <div className="config-container">
            <div className="config-grid-container main-config-layout">
                {/* SIDEBAR TABS */}
                <div className="config-sidebar">
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 className="config-sidebar-title">
                            Configuración
                        </h3>
                        <p style={{
                            color: 'rgba(255,255,255,0.8)',
                            margin: 0,
                            fontSize: '0.85rem'
                        }}>
                            Ajustes del sistema y cuenta
                        </p>
                    </div>

                    <div className="config-tabs-nav" style={{ flex: 1 }}>
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`config-tab-button ${activeTab === 'general' ? 'active' : ''}`}
                        >
                            <Globe size={20} />
                            <div>
                                <div>General</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Identidad del sistema</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('operacional')}
                            className={`config-tab-button ${activeTab === 'operacional' ? 'active' : ''}`}
                        >
                            <Clock size={20} />
                            <div>
                                <div>Operacional</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Reglas y procesos</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('seguridad')}
                            className={`config-tab-button ${activeTab === 'seguridad' ? 'active' : ''}`}
                        >
                            <Lock size={20} />
                            <div>
                                <div>Seguridad</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Acceso y políticas</div>
                            </div>
                        </button>

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

                        <button
                            onClick={() => setActiveTab('perfil')}
                            className={`config-tab-button account-tab ${activeTab === 'perfil' ? 'active' : ''}`}
                        >
                            <User size={20} />
                            <div>
                                <div>Mi Cuenta</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Foto y datos personales</div>
                            </div>
                        </button>
                    </div>

                    <div className="config-actions">
                        <button
                            className="pro-btn"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                background: isSaving ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(10px)',
                                fontWeight: 600
                            }}
                            onClick={handleSave}
                            disabled={isSaving || activeTab === 'perfil'}
                        >
                            <Save size={18} />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="config-main-content">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionGeneral;

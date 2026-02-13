// resources/js/pages/admin/ConfiguracionGeneral.jsx

import React, { useState, useEffect } from 'react';
import {
    Settings, Globe, Lock, Save, Clock
} from 'lucide-react';
import '../../admin_styles.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

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
        <div className="fade-enter" style={{ maxWidth: '800px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Globe size={24} /> Información Básica
            </h3>

            <div className="form-group">
                <label className="form-label" htmlFor="nombreSistema">Nombre del Sistema</label>
                <input
                    className="pro-input"
                    type="text"
                    id="nombreSistema"
                    value={config.general.nombreSistema || ''}
                    onChange={(e) => handleChange('general', 'nombreSistema', e.target.value)}
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
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="timezone">Zona Horaria Predeterminada</label>
                <input
                    className="pro-input"
                    type="text"
                    id="timezone"
                    value={config.general.timezone || ''}
                    onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                />
                <small style={{ color: 'var(--text-muted)' }}>Ej: America/Guayaquil</small>
            </div>

            {/* Logo del sistema */}
            <div className="form-group">
                <label className="form-label">Logo del Sistema</label>
                <div className="pro-card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--border)', background: 'transparent' }}>
                    {logoUrl && (
                        <div style={{ marginBottom: '1rem' }}>
                            <img
                                src={logoUrl}
                                alt="Logo actual"
                                style={{ maxWidth: '150px', maxHeight: '80px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                            />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Logo actual</p>
                        </div>
                    )}
                    <label className="pro-btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <span>Subir nuevo logo</span>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    onLogoUpload(file);
                                }
                            }}
                        />
                    </label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Formatos permitidos: JPG, JPEG, PNG, WEBP. Máx 2MB.
                    </p>
                </div>
            </div>

            <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="checkbox"
                    id="registroAbierto"
                    checked={!!config.general.registroAbierto}
                    onChange={(e) => handleChange('general', 'registroAbierto', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="registroAbierto" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Permitir Registro Público de Equipos
                </label>
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
        <div className="fade-enter" style={{ maxWidth: '800px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Clock size={24} /> Reglas Operacionales
            </h3>

            <div className="form-group">
                <label className="form-label" htmlFor="maxEquiposPorTorneo">Máximo de Equipos por Torneo</label>
                <input
                    className="pro-input"
                    type="number"
                    id="maxEquiposPorTorneo"
                    value={config.operacional.maxEquiposPorTorneo ?? 0}
                    min="2"
                    onChange={(e) => handleChange('operacional', 'maxEquiposPorTorneo', parseInt(e.target.value || 0))}
                />
            </div>

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
            </div>

            <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="checkbox"
                    id="activarNotificacionesEmail"
                    checked={!!config.operacional.activarNotificacionesEmail}
                    onChange={(e) => handleChange('operacional', 'activarNotificacionesEmail', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="activarNotificacionesEmail" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Activar Notificaciones por Email al Staff
                </label>
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
        <div className="fade-enter" style={{ maxWidth: '800px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Lock size={24} /> Políticas de Acceso
            </h3>

            <div className="form-group">
                <label className="form-label" htmlFor="longitudMinimaContrasena">Longitud Mínima de Contraseña</label>
                <input
                    className="pro-input"
                    type="number"
                    id="longitudMinimaContrasena"
                    value={config.seguridad.longitudMinimaContrasena ?? 8}
                    min="6"
                    onChange={(e) => handleChange('seguridad', 'longitudMinimaContrasena', parseInt(e.target.value || 6))}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="rolUsuarioPorDefecto">Rol Asignado a Nuevos Usuarios</label>
                <select
                    className="pro-input"
                    id="rolUsuarioPorDefecto"
                    value={config.seguridad.rolUsuarioPorDefecto || 'Invitado'}
                    onChange={(e) => handleChange('seguridad', 'rolUsuarioPorDefecto', e.target.value)}
                >
                    <option value="Invitado">Invitado</option>
                    <option value="Staff">Staff (Acceso limitado)</option>
                    <option value="Jugador">Jugador (Solo perfil)</option>
                </select>
            </div>

            <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="checkbox"
                    id="forzar2FA"
                    checked={!!config.seguridad.forzar2FA}
                    onChange={(e) => handleChange('seguridad', 'forzar2FA', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="forzar2FA" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Forzar Autenticación de Dos Factores (2FA) para Administradores
                </label>
            </div>
        </div>
    );
};


// =========================================
// 3. Componente Principal
// =========================================
const ConfiguracionGeneral = () => {
    const [config, setConfig] = useState(mockConfig);
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    // Cargar configuración desde el backend
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const token = localStorage.getItem('token');

                const resp = await fetch(`${API_BASE}/configuracion`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const json = await resp.json();

                if (!resp.ok) {
                    alert(json.message || "Error al cargar configuración");
                    return;
                }

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
            const token = localStorage.getItem('token');

            const resp = await fetch(`${API_BASE}/configuracion`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(config),
            });

            const json = await resp.json();

            if (!resp.ok) {
                console.error(json);
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
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('logo', file);

            const resp = await fetch(`${API_BASE}/configuracion/logo`, {
                method: 'POST',
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    // NO poner Content-Type, el navegador lo setea con boundary
                },
                body: formData,
            });

            const json = await resp.json();

            if (!resp.ok) {
                console.error(json);
                alert(json.message || 'Error al subir el logo.');
                return;
            }

            // Actualizamos logoUrl en el estado
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
            default:
                return null;
        }
    };

    return (
        <div className="admin-page-container fade-enter">
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Configuración del Sistema</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Ajustes globales, operacionales y de seguridad.
                    </p>
                </div>
            </div>

            <div className="pro-card" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '600px', overflow: 'hidden' }}>
                {/* SIDEBAR TABS */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRight: '1px solid var(--border)', padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                            onClick={() => setActiveTab('general')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'general' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: activeTab === 'general' ? 600 : 400,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Globe size={18} /> General
                        </button>
                        <button
                            onClick={() => setActiveTab('operacional')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'operacional' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                color: activeTab === 'operacional' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: activeTab === 'operacional' ? 600 : 400,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Clock size={18} /> Operacional
                        </button>
                        <button
                            onClick={() => setActiveTab('seguridad')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'seguridad' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                color: activeTab === 'seguridad' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: activeTab === 'seguridad' ? 600 : 400,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Lock size={18} /> Seguridad
                        </button>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <button
                            className="pro-btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save size={18} />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div style={{ padding: '2rem' }}>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionGeneral;

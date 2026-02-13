import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    Award,
    TrendingUp,
    Shield,
    Hash,
    Camera
} from 'lucide-react';
import "../../css/unified-all.css";
import api from "../../api";
import { getAssetUrl } from "../../utils/helpers";

const Perfil = () => {
    const [user, setUser] = useState({});
    const [stats, setStats] = useState({
        totalPartidos: 0,
        partidosCompletados: 0,
        tarjetasAmarillas: 0,
        tarjetasRojas: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [form, setForm] = useState({
        nombres: "",
        apellidos: "",
        email: "",
        telefono: ""
    });
    const [passwords, setPasswords] = useState({
        password_actual: "",
        password_nueva: "",
        password_confirmacion: ""
    });

    useEffect(() => {
        loadPerfilData();
    }, []);

    const loadPerfilData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

            // Try to get fresh user data
            let userData = storedUser;
            try {
                const { data } = await api.get('/user');
                userData = data;
                setUser(data);
                // Update local storage to keep it in sync
                localStorage.setItem('user', JSON.stringify(data));
            } catch (e) {
                console.warn("Could not fetch fresh user data, using stored", e);
                setUser(storedUser);
            }

            setForm({
                nombres: userData.persona?.nombres || userData.nombres || "",
                apellidos: userData.persona?.apellidos || userData.apellidos || "",
                email: userData.email || "",
                telefono: userData.persona?.telefono || userData.telefono || ""
            });

            // Cargar estadísticas
            const { data: partidosData } = await api.get('/partidos');
            const partidos = Array.isArray(partidosData) ? partidosData : partidosData.data || [];

            const userCedula = userData.cedula;
            // Filter matches for this referee
            const partidosArbitro = partidos.filter(p =>
                String(p.arbitro_id) === String(userCedula) ||
                String(p.arbitro_central_id) === String(userCedula) ||
                p.arbitro?.cedula === userCedula
            );

            setStats({
                totalPartidos: partidosArbitro.length,
                partidosCompletados: partidosArbitro.filter(p => p.estado === 'Finalizado').length,
                tarjetasAmarillas: 0,
                tarjetasRojas: 0
            });

        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            await api.put('/arbitro/perfil', form);
            const userRes = await api.get('/user');
            localStorage.setItem('user', JSON.stringify(userRes.data));
            window.dispatchEvent(new Event('user-updated'));
            setMessage({ type: "success", text: "Perfil actualizado correctamente." });
        } catch (e) {
            setMessage({ type: "error", text: e.response?.data?.message || "Error al actualizar perfil." });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.password_nueva !== passwords.password_confirmacion) {
            setMessage({ type: "error", text: "Las contraseñas no coinciden." });
            return;
        }
        setSaving(true);
        try {
            await api.put('/arbitro/password', passwords);
            setMessage({ type: "success", text: "Contraseña actualizada." });
            setPasswords({ password_actual: "", password_nueva: "", password_confirmacion: "" });
        } catch (e) {
            setMessage({ type: "error", text: e.response?.data?.message || "Error al cambiar contraseña." });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('foto', file);

        setUploading(true);
        try {
            const { data } = await api.post('/arbitro/perfil/foto', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = { ...user };
            if (updatedUser.persona) {
                updatedUser.persona.foto_url = data.foto_url;
                updatedUser.foto_url = data.foto_url;
            } else {
                updatedUser.foto_url = data.foto_url;
            }

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('user-updated'));
            setMessage({ type: "success", text: "Foto actualizada." });

        } catch (error) {
            console.error('Error uploading photo:', error);
            setMessage({ type: "error", text: "Error al subir la foto de perfil." });
        } finally {
            setUploading(false);
        }
    };

    // --- STYLES ---
    const glassCardStyle = {
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        color: '#f8fafc',
        borderRadius: '16px',
        padding: '2rem'
    };

    const inputStyle = {
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        borderRadius: '8px',
        padding: '0.75rem',
        marginTop: '0.25rem',
        width: '100%',
        boxSizing: 'border-box'
    };

    if (loading) {
        return (
            <div className="rep-dashboard-fade" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
                    <div className="animate-spin" style={{ border: '3px solid rgba(16, 185, 129, 0.3)', borderTopColor: '#10b981', borderRadius: '50%', width: '24px', height: '24px' }}></div>
                    Cargando perfil...
                </div>
            </div>
        );
    }

    const fotoUrl = getAssetUrl(user.foto_url || user.persona?.foto_url);

    return (
        <div className="rep-dashboard-fade">
            <header style={{ marginBottom: '2.5rem' }}>
                <small style={{ fontWeight: '700', letterSpacing: '0.5px', color: '#10b981', textTransform: 'uppercase' }}>
                    Mi Cuenta
                </small>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0 0.5rem 0' }}>
                    Perfil Profesional
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
                    Información personal y métricas de desempeño
                </p>
            </header>

            {message.text && (
                <div style={{
                    background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: message.type === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                    color: message.type === 'error' ? '#fca5a5' : '#6ee7b7',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    fontWeight: 500
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* ID CARD / PERSONAL INFO */}
                <div style={glassCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid rgba(16, 185, 129, 0.2)',
                                background: '#1e293b'
                            }}>
                                {uploading ? (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                                        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                    </div>
                                ) : fotoUrl ? (
                                    <img src={fotoUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <User size={48} />
                                    </div>
                                )}
                            </div>

                            <label
                                htmlFor="photo-upload"
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '32px',
                                    height: '32px',
                                    background: '#10b981',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '2px solid #1e293b',
                                    color: 'white'
                                }}
                            >
                                <Camera size={16} />
                            </label>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoUpload}
                                disabled={uploading}
                            />
                        </div>

                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                                {user.persona?.nombres || user.nombres || 'Usuario'} {user.persona?.apellidos || user.apellidos || ''}
                            </h2>
                            <span style={{
                                display: 'inline-block',
                                marginTop: '0.5rem',
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                                ÁRBITRO OFICIAL
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Nombres</label>
                                <input
                                    style={inputStyle}
                                    value={form.nombres}
                                    onChange={e => setForm({ ...form, nombres: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Apellidos</label>
                                <input
                                    style={inputStyle}
                                    value={form.apellidos}
                                    onChange={e => setForm({ ...form, apellidos: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Cédula</label>
                                <input
                                    style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                                    value={user.cedula || ''}
                                    disabled
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Correo</label>
                                <input
                                    style={inputStyle}
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Teléfono</label>
                            <input
                                style={inputStyle}
                                value={form.telefono}
                                onChange={e => setForm({ ...form, telefono: e.target.value })}
                            />
                        </div>

                        <button type="submit" disabled={saving} className="btn-primary" style={{ marginTop: '1rem', background: '#10b981', borderColor: '#10b981' }}>
                            {saving ? "Guardando..." : "Actualizar Información"}
                        </button>
                    </form>
                </div>

                {/* STATS & SECURITY */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* SECURITY CARD */}
                    <div style={glassCardStyle}>
                        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                            <Shield size={22} color="#fbbf24" /> Seguridad
                        </h3>
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="password"
                                placeholder="Contraseña Actual"
                                style={inputStyle}
                                value={passwords.password_actual}
                                onChange={e => setPasswords({ ...passwords, password_actual: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Nueva Contraseña"
                                style={inputStyle}
                                value={passwords.password_nueva}
                                onChange={e => setPasswords({ ...passwords, password_nueva: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Confirmar Contraseña"
                                style={inputStyle}
                                value={passwords.password_confirmacion}
                                onChange={e => setPasswords({ ...passwords, password_confirmacion: e.target.value })}
                            />
                            <button type="submit" disabled={saving} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                                Cambiar Contraseña
                            </button>
                        </form>
                    </div>

                    <div style={{ ...glassCardStyle, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                            <TrendingUp size={24} color="#34d399" /> Desempeño
                        </h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                            <span style={{ color: '#cbd5e1' }}>Total Encuentros</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{stats.totalPartidos}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#cbd5e1' }}>Partidos Finalizados</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{stats.partidosCompletados}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Perfil;

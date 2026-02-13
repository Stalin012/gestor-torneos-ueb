import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Key,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import api from "../../api";
import "../../css/unified-all.css";
import { getAssetUrl } from "../../utils/helpers";

export default function PerfilRepresentante() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    email: "",
    telefono: "",
    nombres: "",
    apellidos: ""
  });

  const [passwords, setPasswords] = useState({
    password_actual: "",
    password_nueva: "",
    password_confirmacion: ""
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/user');
        setForm({
          email: data.email || "",
          telefono: data.telefono || "",
          nombres: data.persona?.nombres || "",
          apellidos: data.persona?.apellidos || ""
        });
        console.log("Foto URL:", data.persona?.foto_url);
        setPreview(data.persona?.foto_url || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await api.put('/representante/perfil', form);
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
      await api.put('/representante/password', passwords);
      setMessage({ type: "success", text: "Contraseña actualizada." });
      setPasswords({ password_actual: "", password_nueva: "", password_confirmacion: "" });
    } catch (e) {
      setMessage({ type: "error", text: e.response?.data?.message || "Error al cambiar contraseña." });
    } finally {
      setSaving(false);
    }
  };

  // --- STYLES FOR DARK THEME COMPATIBILITY ---
  const glassCardStyle = {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    color: '#f8fafc'
  };

  const inputStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '8px',
    boxSizing: 'border-box'
  };

  if (loading) return (
    <div className="rep-scope rep-screen-container rep-loading-container" style={{ flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <RefreshCw size={24} className="animate-spin" color="var(--primary-ocean)" />
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-muted)' }}>Cargando perfil...</p>
      </div>
    </div>
  );

  return (
    <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '2.5rem' }}>

      {/* HEADER SECTION (Top Spanning) */}
      <div style={{ gridColumn: '1 / -1' }}>
        <header className="rep-header-main" style={{ marginBottom: '1rem' }}>
          <div className="header-info">
            <small className="university-label" style={{ fontWeight: '700', letterSpacing: '0.5px', color: 'var(--accent-teal)' }}>Gestión de Cuenta</small>
            <h1 className="content-title" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Mi Perfil Profesional</h1>
            <p className="content-subtitle" style={{ color: '#cbd5e1' }}>Administra tu información personal y seguridad</p>
          </div>
        </header>

        {message.text && (
          <div style={{
            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            border: message.type === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)',
            color: message.type === 'error' ? '#fca5a5' : '#86efac',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500'
          }}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            {message.text}
          </div>
        )}
      </div>

      {/* LEFT COLUMN: PERSONAL INFO */}
      <div className="dashboard-col-left">
        <div className="rep-card-premium" style={{ ...glassCardStyle, borderTop: '5px solid var(--primary-ocean)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <User size={24} color="var(--primary-ocean)" /> Información Personal
          </h2>

          <form onSubmit={handleProfileSubmit}>
            {/* Photo & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.1)' }}>
                  {preview ? <img src={getAssetUrl(preview)} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={48} color="#cbd5e1" />}
                </div>
                <input
                  type="file"
                  id="photo-upload"
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('foto', file);

                    setSaving(true);
                    try {
                      const { data } = await api.post('/representante/perfil/foto', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      setPreview(data.foto_url);

                      // Refresh user context
                      const userRes = await api.get('/user');
                      localStorage.setItem('user', JSON.stringify(userRes.data));
                      window.dispatchEvent(new Event('user-updated'));

                      setMessage({ type: "success", text: "Foto actualizada." });
                    } catch (err) {
                      setMessage({ type: "error", text: "Error al subir imagen." });
                    } finally {
                      setSaving(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('photo-upload').click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, background: '#3b82f6', border: '2px solid #0f172a', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  title="Cambiar foto"
                >
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{form.nombres} {form.apellidos}</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Representante Institucional</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>
                  Nombres
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                  <input
                    className="pro-input"
                    style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
                    value={form.nombres}
                    onChange={e => setForm({ ...form, nombres: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>
                  Apellidos
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                  <input
                    className="pro-input"
                    style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
                    value={form.apellidos}
                    onChange={e => setForm({ ...form, apellidos: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>
                  Correo Institucional
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                  <input
                    className="pro-input"
                    style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>
                  Teléfono Móvil
                </label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                  <input
                    className="pro-input"
                    style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem' }}
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', fontWeight: '700' }}>
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Actualizar Información
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: SECURITY */}
      <div className="dashboard-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="rep-card-premium" style={{ ...glassCardStyle }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Lock size={20} color="#fbbf24" /> Seguridad
          </h2>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>Contraseña Actual</label>
              <input
                type="password"
                className="pro-input"
                style={{ ...inputStyle, width: '100%' }}
                value={passwords.password_actual}
                onChange={e => setPasswords({ ...passwords, password_actual: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>Nueva Contraseña</label>
              <input
                type="password"
                className="pro-input"
                style={{ ...inputStyle, width: '100%' }}
                value={passwords.password_nueva}
                onChange={e => setPasswords({ ...passwords, password_nueva: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700' }}>Confirmar Contraseña</label>
              <input
                type="password"
                className="pro-input"
                style={{ ...inputStyle, width: '100%' }}
                value={passwords.password_confirmacion}
                onChange={e => setPasswords({ ...passwords, password_confirmacion: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', fontWeight: '700' }}>
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
              Actualizar Clave
            </button>
          </form>
        </div>

        <div className="rep-card-premium" style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', border: 'none', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={22} color="rgba(255,255,255,0.9)" /> Cuenta Verificada
          </h2>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.95, lineHeight: '1.6', fontWeight: 500 }}>
            Tu cuenta tiene acceso completo a las funciones de representante. Mantén tus datos actualizados para recibir notificaciones sobre torneos.
          </p>
        </div>
      </div>
    </div>
  );
}

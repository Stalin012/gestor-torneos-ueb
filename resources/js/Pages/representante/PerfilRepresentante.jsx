// resources/js/pages/representante/PerfilRepresentante.jsx

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
  Key,
  Smartphone
} from "lucide-react";
import "../../../css/representante_dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

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
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setForm({
            email: data.email || "",
            telefono: data.telefono || "",
            nombres: data.persona?.nombres || "",
            apellidos: data.persona?.apellidos || ""
          });
          setPreview(data.persona?.foto_url || null);
        }
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
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/representante/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Perfil actualizado correctamente." });
      } else {
        throw new Error("Error al actualizar perfil.");
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
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
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/representante/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(passwords)
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Contraseña actualizada." });
        setPasswords({ password_actual: "", password_nueva: "", password_confirmacion: "" });
      } else {
        throw new Error("Error al cambiar contraseña.");
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="rep-loading-container">
      <Loader2 className="animate-spin" size={48} />
    </div>
  );

  return (
    <div className="rep-scope rep-dashboard-fade">
      <header className="rep-header-main">
        <div className="header-info">
          <small className="university-label">Gestión de Cuenta UEB</small>
          <h1 className="content-title">Mi Perfil Profesional</h1>
          <p className="content-subtitle">Administra tu información personal y seguridad de cuenta</p>
        </div>
      </header>

      {message.text && (
        <div className={`rep-card ${message.type === 'error' ? 'error-card' : 'success-card'} mb-6`}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p>{message.text}</p>
        </div>
      )}

      <div className="dashboard-main-layout">
        <div className="dashboard-col-left">
          <div className="rep-card-premium">
            <h2 className="section-title"><User size={20} color="#3b82f6" /> Información Personal</h2>
            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
              <div className="profile-photo-selector mb-8">
                <div className="photo-preview">
                  {preview ? <img src={preview} alt="Profile" /> : <User size={40} className="text-gray-300" />}
                  <button className="btn-camera-upload"><Camera size={14} /></button>
                </div>
                <div className="photo-info">
                  <span className="font-bold">{form.nombres} {form.apellidos}</span>
                  <small className="muted text-block">Representante Deportivo</small>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="rep-label"><Mail size={14} /> Correo Electrónico</label>
                  <input
                    className="rep-input-premium"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="rep-label"><Smartphone size={14} /> Teléfono de Contacto</label>
                  <input
                    className="rep-input-premium"
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-quick-action mt-6" disabled={saving}>
                <Save size={18} /> Guardar Cambios
              </button>
            </form>
          </div>
        </div>

        <div className="dashboard-col-right">
          <div className="rep-card-premium">
            <h2 className="section-title"><Lock size={20} color="#f59e0b" /> Seguridad</h2>
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div className="form-group">
                <label className="rep-label">Contraseña Actual</label>
                <input
                  type="password"
                  className="rep-input-premium"
                  value={passwords.password_actual}
                  onChange={e => setPasswords({ ...passwords, password_actual: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="rep-label">Nueva Contraseña</label>
                <input
                  type="password"
                  className="rep-input-premium"
                  value={passwords.password_nueva}
                  onChange={e => setPasswords({ ...passwords, password_nueva: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="rep-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  className="rep-input-premium"
                  value={passwords.password_confirmacion}
                  onChange={e => setPasswords({ ...passwords, password_confirmacion: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-block-action mt-6" disabled={saving}>
                <Key size={18} /> Cambiar Contraseña
              </button>
            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .rep-input-premium {
            width: 100%;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            outline: none;
            font-weight: 600;
            transition: all 0.2s;
        }
        .rep-input-premium:focus {
            border-color: #3b82f6;
            background: white;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .profile-photo-selector { display: flex; align-items: center; gap: 20px; }
        .photo-preview { position: relative; width: 100px; height: 100px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justifyContent: center; overflow: hidden; border: 3px solid #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .photo-preview img { width: 100%; height: 100%; object-fit: cover; }
        .btn-camera-upload { position: absolute; bottom: 0; right: 0; background: #3b82f6; color: white; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; }
        
        .success-card { background: #dcfce7; border: 1px solid #10b981; color: #065f46; padding: 16px; border-radius: 16px; display: flex; gap: 12px; align-items: center; }
        .error-card { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: 16px; border-radius: 16px; display: flex; gap: 12px; align-items: center; }
      `}} />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Hash,
  Award,
  Shield,
  QrCode,
  Camera,
  Activity,
  ChevronRight
} from "lucide-react";

import api from "../../api";
import { getAssetUrl } from "../../utils/helpers";
import CarnetModal from "../../components/CarnetModal";
import { useNotification } from "../../context/NotificationContext";
import "../../css/unified-all.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const token = localStorage.getItem("token");

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [carnetData, setCarnetData] = useState(null);
  const [showCarnet, setShowCarnet] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const { data } = await api.get("/jugador/perfil");
      setPerfil(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.response?.data?.error || "Acceso denegado.");
      } else {
        setError("Error al cargar perfil.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    setUploading(true);
    try {
      const { data } = await api.post('/jugador/perfil/foto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local state
      const updatedProfile = { ...perfil, foto_url: data.foto_url };
      setPerfil(updatedProfile);

      // Update user in localStorage to sync header
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.foto_url = data.foto_url;
      if (storedUser.persona) {
        storedUser.persona.foto_url = data.foto_url;
      }
      localStorage.setItem('user', JSON.stringify(storedUser));

      // Dispatch event to update navbar
      window.dispatchEvent(new Event('user-updated'));
      success("Foto Actualizada", "Tu foto de perfil se ha guardado correctamente.");

    } catch (error) {
      console.error('Error uploading photo:', error);
      notifyError("Error de carga", "No se pudo subir la imagen. Intenta con un archivo más pequeño.");
    } finally {
      setUploading(false);
    }
  };

  const verCarnet = async () => {
    try {
      const { data } = await api.get(`/jugadores/${perfil.cedula}/info`);
      setCarnetData(data.data);
      setShowCarnet(true);
    } catch (err) {
      console.error(err);
      alert("Error cargando el carnet");
    }
  };

  const glassCardStyle = {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    color: '#f8fafc',
    borderRadius: '24px',
    padding: '2rem'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <Activity className="animate-spin" size={40} color="#3b82f6" />
        <p style={{ color: '#94a3b8' }}>Cargando perfil del jugador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...glassCardStyle, textAlign: 'center', padding: '4rem', margin: '2rem' }}>
        <Shield size={64} style={{ opacity: 0.2, marginBottom: '1.5rem', color: '#ef4444' }} />
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Acceso Restringido</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 2rem' }}>{error}</p>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Volver al Login
        </button>
      </div>
    );
  }

  const fotoUrl = getAssetUrl(perfil.foto_url);

  return (
    <div className="rep-dashboard-fade">
      {/* HEADER SECTION */}
      <header style={{ marginBottom: '2.5rem' }}>
        <small style={{ fontWeight: '700', letterSpacing: '0.5px', color: '#3b82f6', textTransform: 'uppercase' }}>
          Módulo de Jugador
        </small>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0' }}>
          Mi Perfil Deportivo
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Administra tu identidad digital y revisa tu estado en la liga.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* PROFILE CARD */}
        <div style={glassCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid rgba(59, 130, 246, 0.2)',
                background: '#1e293b',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
              }}>
                {uploading ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                    <Activity className="animate-spin" color="white" size={32} />
                  </div>
                ) : fotoUrl ? (
                  <img src={fotoUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <User size={56} />
                  </div>
                )}
              </div>

              <label
                htmlFor="photo-upload"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '36px',
                  height: '36px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '3px solid #0f172a',
                  color: 'white',
                  transition: 'transform 0.2s hover:scale-110'
                }}
              >
                <Camera size={18} />
              </label>
              <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploading} />
            </div>

            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {perfil.nombres} {perfil.apellidos}
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <span style={{
                  padding: '0.35rem 0.85rem',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  borderRadius: '30px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  textTransform: 'uppercase'
                }}>
                  JUGADOR ACTIVO
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cédula
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '1.15rem', color: '#fff', fontWeight: 500 }}>
                  <Hash size={20} color="#64748b" /> {perfil.cedula}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Correo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '1.15rem', color: '#fff', fontWeight: 500 }}>
                  <Mail size={20} color="#64748b" /> {perfil.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Equipo Actual
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '1.15rem', color: '#fff', fontWeight: 500 }}>
                  <Shield size={20} color="#3b82f6" /> {perfil.equipo || "Agente Libre"}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Disciplina
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '1.15rem', color: '#fff', fontWeight: 500 }}>
                  <Award size={20} color="#fbbf24" /> {perfil.disciplina || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IDENTITY & ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{
            ...glassCardStyle,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2.5rem'
          }}>
            <QrCode size={64} color="white" style={{ marginBottom: '1.5rem', opacity: 0.9 }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>Carnet Digital</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Genera tu identificación oficial para presentarla en los partidos.
            </p>
            <button
              onClick={verCarnet}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'white',
                color: '#1d4ed8',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
              className="hover:scale-105 transition-transform"
            >
              <QrCode size={20} /> Ver Identificación
            </button>
          </div>

          <div style={glassCardStyle}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#fff' }}>Accesos Rápidos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/user/equipos')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  color: '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                className="hover:bg-white/5"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Shield size={18} color="#60a5fa" />
                  <span>Mis Inscripciones</span>
                </div>
                <ChevronRight size={16} />
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  color: '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                className="hover:bg-white/5"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Award size={18} color="#fbbf24" />
                  <span>Calendario Liga</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>

      <CarnetModal
        isOpen={showCarnet}
        onClose={() => setShowCarnet(false)}
        data={carnetData}
      />
    </div>
  );
};

export default UserProfile;

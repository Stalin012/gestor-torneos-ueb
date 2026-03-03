import React, { useState } from "react";
import { X, Download, User, IdCard, Activity } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getAssetUrl } from "../utils/helpers";
import { API_BASE } from "../api";
import "../css/unified-all.css";

const CarnetModal = ({ isOpen, onClose, data, endpointPrefix = "jugadores" }) => {
  const [generating, setGenerating] = useState(false);

  if (!isOpen || !data) return null;

  // Normalización de datos para soportar diferentes fuentes (Admin vs Perfil Usuario)
  const isUser = endpointPrefix === 'usuarios';

  const normalized = {
    cedula: data.cedula || "",
    nombres: data.nombre_completo || (data.persona ? `${data.persona.nombres} ${data.persona.apellidos}` : ""),
    equipo: isUser ? (data.estado ? 'ACCESO LISTO' : 'RESTRINGIDO') : (data.nombre_equipo || data.equipo_nombre || data.equipo?.nombre || "Sin Equipo"),
    torneo: isUser ? (data.email || 'SIN EMAIL') : (data.torneo_nombre || data.equipo?.torneo?.nombre || "Sin Torneo"),
    posicion: isUser ? (data.rol ? data.rol.toUpperCase() : 'USUARIO') : (data.posicion || "N/A"),
    numero: isUser ? (data.rol ? data.rol.substring(0, 3).toUpperCase() : 'USR') : (data.numero || "—"),
    facultad: data.facultad || data.persona?.facultad || "",
    carrera: data.carrera || data.persona?.carrera || "",
    foto: data.foto || (data.persona?.foto_url || data.persona?.foto) || null
  };

  const handleDownloadPdf = () => {
    console.log("Iniciando descarga de carnet...");
    setGenerating(true);
    // Pequeño delay para mostrar el spinner y dar feedback visual
    setTimeout(() => {
      try {
        const url = `${API_BASE}/${endpointPrefix}/${normalized.cedula}/carnet-pdf`;
        console.log("Abriendo URL:", url);
        window.open(url, '_blank');
      } catch (e) {
        console.error("Error al abrir ventana:", e);
        alert("No se pudo abrir la ventana de descarga.");
      } finally {
        setGenerating(false);
      }
    }, 800);
  };

  const fotoUrl = getAssetUrl(normalized.foto);

  // URL absoluta al frontend oficial para evitar escaneos JSON accidentales a la API
  const qrValue = `https://www.deportesueb.com/carnet/${normalized.cedula}`;

  return (
    <div className="modal-overlay backdrop-blur-strong fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content scale-in" style={{ maxWidth: '520px', padding: 0, overflow: 'hidden', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="modal-header" style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '10px' }}>
              <IdCard size={20} color="#3b82f6" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.3px' }}>Identificación Digital</h2>
          </div>
          <button className="btn-icon-close" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={18} />
          </button>
        </div>

        {/* BODY (CARD PREVIEW) */}
        <div className="modal-body" style={{ padding: '2.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>

          <div className="carnet-card-premium" style={{
            width: '100%',
            maxWidth: '420px',
            aspectRatio: '1.6 / 1',
            background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 100%)',
            borderRadius: '20px',
            padding: '20px',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 40px rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>

            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '150px', height: '150px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '0', left: '0', height: '4px', width: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)' }} />

            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{isUser ? 'Credencial Oficial' : 'Certificación Deportiva'}</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>GESTOR <span style={{ color: '#3b82f6' }}>UEB</span></div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 800,
                backdropFilter: 'blur(4px)'
              }}>
                EDICIÓN {new Date().getFullYear()}
              </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'flex', gap: '15px', flex: 1, zIndex: 1 }}>
              {/* Photo Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '85px',
                  height: '105px',
                  background: '#111827',
                  borderRadius: '12px',
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="Deportista" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={40} color="rgba(255,255,255,0.1)" />
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>{isUser ? '' : '#'}{normalized.numero}</div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>{isUser ? 'NIVEL' : 'NÚMERO'}</div>
                </div>
              </div>

              {/* Info Section */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* Name & ID */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    fontSize: normalized.nombres.length > 25 ? '13px' : '16px',
                    fontWeight: 900,
                    color: '#fff',
                    textTransform: 'uppercase',
                    lineHeight: '1.15',
                    letterSpacing: '-0.3px',
                    marginBottom: '3px'
                  }}>
                    {normalized.nombres}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>ID: {normalized.cedula}</div>
                </div>

                {/* Data Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '5px 8px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                    <div style={{ fontSize: '7px', color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>{isUser ? 'Estado' : 'Equipo'}</div>
                    <div style={{ fontSize: '8.5px', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalized.equipo}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '5px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <div style={{ fontSize: '7px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>{isUser ? 'Rol del Sistema' : 'Posición'}</div>
                    <div style={{ fontSize: '8.5px', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalized.posicion}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', background: 'rgba(59, 130, 246, 0.08)', padding: '5px 8px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                    <div style={{ fontSize: '7px', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>{isUser ? 'Correo Institucional' : 'Torneo'}</div>
                    <div style={{ fontSize: '8.5px', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalized.torneo}</div>
                  </div>
                  {(normalized.carrera || normalized.facultad) && (
                    <div style={{ gridColumn: 'span 2', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      {normalized.carrera && (
                        <div style={{ marginBottom: normalized.facultad ? '3px' : '0' }}>
                          <span style={{ fontSize: '7px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '1px' }}>{isUser ? 'Cargo' : 'Carrera'}</span>
                          <span style={{ fontSize: '8px', color: '#e2e8f0', fontWeight: 600, display: 'block', lineHeight: '1.3' }}>{normalized.carrera}</span>
                        </div>
                      )}
                      {normalized.facultad && (
                        <div>
                          <span style={{ fontSize: '7px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '1px' }}>{isUser ? 'Unidad / Departamento' : 'Facultad'}</span>
                          <span style={{ fontSize: '7.5px', color: '#cbd5e1', fontWeight: 500, display: 'block', lineHeight: '1.3' }}>{normalized.facultad}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* QR Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  background: '#fff',
                  padding: '5px',
                  borderRadius: '8px',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
                  border: '2px solid #3b82f6'
                }}>
                  <QRCodeSVG value={qrValue} size={55} level="M" />
                </div>
                <div style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginTop: '6px', letterSpacing: '0.5px' }}>SECURITY QR</div>
              </div>
            </div>

            {/* Virtual watermark */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              top: '40%',
              fontSize: '40px',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.02)',
              transform: 'rotate(-90deg)',
              pointerEvents: 'none'
            }}>{isUser ? 'OFICIAL' : 'DEPORTISTA'}</div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer" style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)', gap: '1.5rem', display: 'flex' }}>
          <button className="pro-btn btn-primary" onClick={onClose} style={{ flex: 1, height: '45px' }}>
            Descartar
          </button>
          <button
            className="pro-btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={generating}
            style={{ flex: 2, height: '45px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}
          >
            {generating ? <Activity className="animate-spin" size={18} /> : <Download size={18} />}
            {generating ? "Generando PDF..." : "Obtener Carnet Oficial"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CarnetModal;
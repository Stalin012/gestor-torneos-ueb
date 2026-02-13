import React, { useState } from "react";
import { X, Download, User, IdCard, Activity } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getAssetUrl } from "../utils/helpers";
import { API_BASE } from "../api";
import "../css/unified-all.css";

const CarnetModal = ({ isOpen, onClose, data }) => {
  const [generating, setGenerating] = useState(false);

  if (!isOpen || !data) return null;

  // Normalización de datos para soportar diferentes fuentes (Admin vs Perfil Usuario)
  const normalized = {
    cedula: data.cedula || "",
    nombres: data.nombre_completo || (data.persona ? `${data.persona.nombres} ${data.persona.apellidos}` : ""),
    equipo: data.nombre_equipo || data.equipo_nombre || "Agente Libre",
    posicion: data.posicion || "N/A",
    numero: data.numero || "—",
    facultad: data.facultad || "",
    carrera: data.carrera || "",
    foto: data.foto || (data.persona?.foto_url || data.persona?.foto) || null
  };

  const handleDownloadPdf = () => {
    console.log("Iniciando descarga de carnet...");
    setGenerating(true);
    // Pequeño delay para mostrar el spinner y dar feedback visual
    setTimeout(() => {
      try {
        const url = `${API_BASE}/jugadores/${normalized.cedula}/carnet-pdf`;
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

  // Generamos un string completo para el QR
  const qrValue = JSON.stringify({
    id: normalized.cedula,
    player: normalized.nombres,
    team: normalized.equipo,
    pos: normalized.posicion,
    num: normalized.numero,
    valid: new Date().getFullYear(),
    domain: window.location.origin
  });

  return (
    <div className="modal-overlay backdrop-blur-strong fade-in" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content scale-in" style={{ maxWidth: '520px', padding: 0, overflow: 'hidden', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
                <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Certificación Deportiva</div>
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
            <div style={{ display: 'flex', gap: '20px', flex: 1, zIndex: 1 }}>
              {/* Photo & Number Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '90px',
                  height: '110px',
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
                    <img src={fotoUrl} alt="Atleta" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={40} color="rgba(255,255,255,0.1)" />
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>#{normalized.numero}</div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>Dorsal</div>
                </div>
              </div>

              {/* Text Info Component */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: normalized.nombres.length > 20 ? '14px' : '18px',
                    fontWeight: 900,
                    color: '#fff',
                    textTransform: 'uppercase',
                    lineHeight: '1.2',
                    letterSpacing: '-0.3px',
                    marginBottom: '2px'
                  }}>
                    {normalized.nombres}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>ID: {normalized.cedula}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <div style={{ fontSize: '7px', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1px' }}>Equipo</div>
                    <div style={{ fontSize: '10px', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalized.equipo}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ fontSize: '7px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1px' }}>Posición</div>
                    <div style={{ fontSize: '10px', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalized.posicion}</div>
                  </div>

                  {(normalized.facultad || normalized.carrera) && (
                    <div style={{ gridColumn: 'span 2', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {normalized.facultad && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '7px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', minWidth: '45px' }}>Facultad</span>
                          <span style={{ fontSize: '9px', color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalized.facultad}</span>
                        </div>
                      )}
                      {normalized.carrera && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '7px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', minWidth: '45px' }}>Carrera</span>
                          <span style={{ fontSize: '9px', color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalized.carrera}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* QR Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                <div style={{
                  background: '#fff',
                  padding: '5px',
                  borderRadius: '10px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  border: '2px solid #3b82f6'
                }}>
                  <QRCodeSVG value={qrValue} size={60} level="M" />
                </div>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginTop: '8px', letterSpacing: '1px' }}>SECURITY QR</div>
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
            }}>ATHLETE</div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)', gap: '1rem' }}>
          <button className="pro-btn btn-secondary" onClick={onClose} style={{ flex: 1, height: '45px' }}>
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
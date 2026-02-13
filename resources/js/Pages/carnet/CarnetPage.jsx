import React, { useEffect, useState, useRef } from "react"; // Añadimos useRef
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle, Shield, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; // Importamos para QR dinámico
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../../../css/Home.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";
const PDF_BASE = import.meta.env?.VITE_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";

const CarnetPage = () => {
  const { cedula } = useParams();
  const navigate = useNavigate();
  const carnetRef = useRef(null); // Referencia para la descarga

  const [jugador, setJugador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchCarnet = async () => {
      try {
        setLoading(true);
        // Usamos el nuevo endpoint público GET
        const res = await fetch(`${API_BASE}/jugadores/${cedula}/info`, {
          headers: { "Accept": "application/json" },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "No se pudo obtener los datos del carnet.");
        }
        const json = await res.json();
        // El controlador devuelve { message: ..., data: { ... } }
        setJugador(json.data);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (cedula) fetchCarnet();
  }, [cedula]);

  // FUNCIÓN DE DESCARGA MEJORADA
  const handleDescargarPdf = async () => {
    const element = carnetRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 3, // Alta definición
        useCORS: true, // Importante para cargar la foto del jugador
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [85, 125], // Tamaño carnet estándar
      });

      pdf.addImage(imgData, "PNG", 0, 0, 85, 125);
      pdf.save(`Carnet_${jugador.cedula}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el archivo. Intente de nuevo.");
    }
  };

  if (loading) return (
    <div className="carnet-page-container" style={{ background: '#0b1120', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="#3b82f6" />
        <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#94a3b8' }}>Generando Carnet Digital...</p>
      </div>
    </div>
  );

  if (errorMsg) return (
    <div className="carnet-page-container" style={{ background: '#0b1120', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem' }}>
      <div style={{ textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: '500px' }}>
        <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>¡Ups! Algo salió mal</h2>
        <p style={{ color: '#fca5a5', marginBottom: '2rem' }}>{errorMsg}</p>
        <button className="btn-primary" onClick={() => navigate("/")} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
          Volver al Inicio
        </button>
      </div>
    </div>
  );

  const fotoUrl = jugador.foto
    ? `${PDF_BASE}/storage/${jugador.foto}`
    : "https://ui-avatars.com/api/?name=" + encodeURIComponent(jugador.nombre_completo) + "&background=3b82f6&color=fff&size=256";

  return (
    <div className="carnet-page-container" style={{ background: '#0b1120', minHeight: '100vh', color: 'white', padding: '2rem' }}>
      <div className="hero-bg" style={{ position: 'fixed', inset: 0, opacity: 0.4, pointerEvents: 'none' }}></div>

      <div className="carnet-page-header" style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => navigate("/")} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1.2rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(10px)' }}>
          <ArrowLeft size={18} /> Inicio
        </button>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={28} color="#3b82f6" fill="#3b82f622" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>UEB<span style={{ color: '#3b82f6' }}>SPORT</span></h2>
        </div>
      </div>

      <div className="carnet-page-main" style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: '3rem', alignItems: 'center' }}>

        <div className="carnet-info-text">
          <div style={{ color: '#3b82f6', fontWeight: 700, letterSpacing: '2px', marginBottom: '1rem' }}>ACREDITACIÓN DIGITAL</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Identificación <span style={{ background: 'linear-gradient(90deg, #3b82f6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Oficial</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '450px', lineHeight: 1.6 }}>
            Esta es tu credencial única para las Ligas Universitarias 2025.
            Válida para todos los encuentros oficiales y acceso a instalaciones deportivas.
          </p>

          <div className="carnet-actions">
            <button className="btn-primary-lg" onClick={handleDescargarPdf} style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}>
              <Download size={20} style={{ marginRight: 8 }} /> Descargar PDF
            </button>
            <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={14} /> Encriptado y validado mediante código QR
            </p>
          </div>
        </div>

        <div className="carnet-wrapper">
          {/* DISEÑO DEL CARNET (LO QUE SE CAPTURA) */}
          <div ref={carnetRef} style={{
            width: '320px',
            height: '500px',
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: '24px',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Holographic effect */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)', pointerEvents: 'none', borderRadius: '24px' }}></div>

            <div className="id-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
              <Shield size={32} color="#3b82f6" fill="#3b82f644" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', color: '#94a3b8' }}>UNIV. ESTATAL DE BOLÍVAR</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#3b82f6' }}>JUGADOR ACREDITADO</span>
              </div>
            </div>

            <div className="id-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="id-photo" style={{ width: '160px', height: '180px', borderRadius: '20px', overflow: 'hidden', border: '3px solid rgba(59, 130, 246, 0.3)', marginBottom: '20px', background: '#1e293b' }}>
                <img src={fotoUrl} alt={jugador.nombre_completo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
              </div>

              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: 'white' }}>{jugador.nombre_completo}</h4>
              <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>{jugador.posicion || "Deportista"}</p>

              <div className="data-grid" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="data-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>CÉDULA</span>
                  <b style={{ fontSize: '0.9rem' }}>{jugador.cedula}</b>
                </div>
                <div className="data-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>EQUIPO</span>
                  <b style={{ fontSize: '0.85rem' }}>{jugador.nombre_equipo || "Libre"}</b>
                </div>
              </div>
            </div>

            <div className="id-footer" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '12px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800 }}>ESTADO</span>
                <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%' }}></div> ACTIVO
                </span>
              </div>
              <div className="qr-box" style={{ padding: '4px', background: 'white' }}>
                <QRCodeSVG
                  value={jugador.url_validacion || `VALIDAR:${jugador.cedula}`}
                  size={60}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .carnet-page-main {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .carnet-info-text {
            order: 2;
          }
          .carnet-wrapper {
            order: 1;
            margin: 0 auto;
          }
          .carnet-info-text h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CarnetPage;
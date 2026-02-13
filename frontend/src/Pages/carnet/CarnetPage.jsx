import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle, Shield, Download, CheckCircle, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import "../../css/home.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";
const PDF_BASE = import.meta.env?.VITE_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";

const CarnetPage = () => {
  const { cedula } = useParams();
  const navigate = useNavigate();
  const carnetRef = useRef(null);

  const [jugador, setJugador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchCarnet = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/jugadores/${cedula}/info`, {
          headers: { "Accept": "application/json" },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "No se pudo obtener los datos del carnet.");
        }
        const json = await res.json();
        setJugador(json.data);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (cedula) fetchCarnet();
  }, [cedula]);

  const handleDescargarPdf = async () => {
    try {
      setGenerating(true);
      window.open(`${API_BASE}/jugadores/${jugador.cedula}/carnet-pdf`, '_blank');
      setTimeout(() => setGenerating(false), 2000);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el archivo. Intente de nuevo.");
      setGenerating(false);
    }
  };

  if (loading) return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite reverse' }}></div>
      </div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', zIndex: 10 }}>
        <div style={{ position: 'relative' }}>
          <img src="/img/logo-ueb.png" alt="Logo UEB" style={{
            width: '120px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 3px rgba(59, 130, 246, 0.3)',
            animation: 'pulse 2s ease-in-out infinite',
            objectFit: 'contain'
          }} />
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', padding: '8px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}>
            <QrCode size={20} color="white" />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1rem' }}>
            <Loader2 className="animate-spin" size={32} color="#3b82f6" />
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>Generando Credencial</span>
          </div>
          <p style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>Procesando datos de identificación deportiva...</p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );

  if (errorMsg) return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '3rem',
        borderRadius: '24px',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        maxWidth: '500px',
        backdropFilter: 'blur(10px)'
      }}>
        <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 800 }}>Credencial No Encontrada</h2>
        <p style={{ color: '#fca5a5', marginBottom: '2rem', lineHeight: 1.6 }}>{errorMsg}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
            transition: 'all 0.2s ease'
          }}
        >
          🏠 Volver al Inicio
        </button>
      </div>
    </div>
  );

  const fotoUrl = jugador.foto
    ? `${PDF_BASE}/storage/${jugador.foto}`
    : "https://ui-avatars.com/api/?name=" + encodeURIComponent(jugador.nombre_completo) + "&background=3b82f6&color=fff&size=256";

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      color: 'white',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite reverse' }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={18} /> Volver al Inicio
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(59, 130, 246, 0.3)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>UEB<span style={{ color: '#3b82f6' }}>SPORT</span></h2>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4rem', alignItems: 'center' }}>
          {/* Left Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              <CheckCircle size={16} color="#22c55e" />
              <span style={{ color: '#22c55e' }}>CREDENCIAL VERIFICADA</span>
            </div>

            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #3b82f6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Identificación<br />Deportiva Oficial
            </h1>

            <p style={{
              color: '#94a3b8',
              fontSize: '1.2rem',
              marginBottom: '2rem',
              maxWidth: '500px',
              lineHeight: 1.6
            }}>
              Credencial digital verificada para <strong style={{ color: '#fff' }}>{jugador.nombre_completo}</strong>.
              Válida para acceso a instalaciones deportivas y participación en eventos oficiales.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6' }}>{jugador.cedula}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>CÉDULA</div>
              </div>
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ec4899' }}>{jugador.nombre_equipo || 'LIBRE'}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>EQUIPO</div>
              </div>
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22c55e' }}>ACTIVO</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>ESTADO</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={handleDescargarPdf}
                disabled={generating}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  opacity: generating ? 0.7 : 1
                }}
              >
                <Download size={20} /> {generating ? 'Generando...' : 'Descargar PDF'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                <Shield size={16} color="#22c55e" />
                <span>Protegido con QR encriptado</span>
              </div>
            </div>
          </div>

          {/* Carnet Display */}
          <div>
            <div ref={carnetRef} style={{
              width: '390px',
              height: '240px',
              background: '#020617',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#fff',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8)',
              position: 'relative',
              overflow: 'hidden',
              margin: '0 auto',
              fontFamily: "'Inter', sans-serif",
              transform: 'perspective(1000px) rotateY(-5deg)',
              animation: 'cardFloat 6s ease-in-out infinite'
            }}>
              {/* Header Institucional */}
              <div style={{
                height: '45px',
                background: '#0f172a',
                borderBottom: '2.5px solid #3b82f6',
                padding: '8px 15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                position: 'relative'
              }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1 }}>GESTOR DEPORTIVO</div>
                  <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Universidad Estatal de Bolívar</div>
                </div>
                <div style={{ background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: '900' }}>
                  TEMPORADA {new Date().getFullYear()}
                </div>
              </div>

              {/* Acento lateral decorativo */}
              <div style={{ position: 'absolute', left: 0, top: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, #3b82f6, #fbbf24)', zIndex: 11 }} />

              {/* Marca de Agua */}
              <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '80px', color: 'rgba(255,255,255,0.02)', fontWeight: '900', zIndex: 0, pointerEvents: 'none' }}>OFICIAL</div>

              {/* Contenedor Principal */}
              <div style={{ display: 'flex', padding: '15px 12px 15px 18px', height: '195px', zIndex: 5, position: 'relative' }}>

                {/* COLUMNA IZQUIERDA: FOTO */}
                <div style={{ width: '85px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    width: '85px',
                    height: '110px',
                    border: '1.5px solid rgba(59, 130, 246, 0.5)',
                    borderRadius: '8px',
                    background: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
                  }}>
                    {jugador.foto ? (
                      <img src={fotoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                    ) : (
                      <div style={{ fontSize: '42px', fontWeight: '900', color: 'rgba(59, 130, 246, 0.15)' }}>
                        {jugador.nombre_completo?.charAt(0) || 'J'}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'center', borderTop: '1px solid rgba(59, 130, 246, 0.1)', paddingTop: '4px' }}>
                    <div style={{ fontSize: '6px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Dorsal</div>
                    <div style={{ color: '#3b82f6', fontWeight: '900', fontSize: '18px', lineHeight: 1 }}>#{jugador.numero || '00'}</div>
                  </div>
                </div>

                {/* COLUMNA CENTRAL: INFORMACIÓN */}
                <div style={{
                  width: '155px',
                  marginLeft: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden'
                }}>
                  <div>
                    <div style={{ fontSize: '7px', color: '#3b82f6', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>Deportista Oficial</div>
                    <div style={{
                      color: '#ffffff',
                      fontWeight: '900',
                      fontSize: (jugador.nombre_completo?.length || 0) > 22 ? '11px' : (jugador.nombre_completo?.length || 0) > 15 ? '13px' : '16px',
                      textTransform: 'uppercase',
                      lineHeight: '1.05',
                      marginBottom: '6px',
                      maxHeight: '45px',
                      overflow: 'hidden'
                    }}>
                      {jugador.nombre_completo}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        <div style={{ fontSize: '6px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Cédula</div>
                        <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '10px' }}>{jugador.cedula}</div>
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '6px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Club / Representativo</div>
                        <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {jugador.nombre_equipo || 'LIBRE'}
                        </div>
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '6px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Posición</div>
                        <div style={{ color: '#f8fafc', fontWeight: '700', fontSize: '9px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {jugador.posicion || 'Deportista'}
                        </div>
                      </div>
                      {jugador.carrera && (
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '6px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Carrera</div>
                          <div style={{ color: '#f8fafc', fontWeight: '700', fontSize: '9px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {jugador.carrera}
                          </div>
                        </div>
                      )}
                      {jugador.facultad && (
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '6px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Facultad</div>
                          <div style={{ color: '#f8fafc', fontWeight: '700', fontSize: '9px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {jugador.facultad}
                          </div>
                        </div>
                      )}
                      {jugador.edad && (
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '6px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Edad</div>
                          <div style={{ color: '#f8fafc', fontWeight: '700', fontSize: '9px' }}>
                            {jugador.edad} años
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ color: 'rgba(148, 163, 184, 0.4)', fontWeight: 'bold', fontSize: '7px' }}>
                    EMISIÓN: {new Date().toLocaleDateString()}
                  </div>
                </div>

                {/* SECCIÓN DERECHA: QR */}
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    background: '#ffffff',
                    padding: '4px',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    border: '1.5px solid #3b82f6',
                    lineHeight: 0
                  }}>
                    <QRCodeSVG
                      value={jugador.url_validacion || `VALIDAR:${jugador.cedula}`}
                      size={65}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    fontSize: '7px',
                    fontWeight: '900',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}>
                    ● Verificado Digital
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes cardFloat {
          0%, 100% { transform: perspective(1000px) rotateY(-5deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateY(-5deg) translateY(-10px); }
        }
        @media (max-width: 768px) {
          .carnet-page-main {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CarnetPage;
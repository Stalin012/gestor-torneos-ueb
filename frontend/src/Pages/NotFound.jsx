import React from 'react';
import { Home, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
            textAlign: 'center',
            padding: '2rem'
        }} className="fade-in">
            {/* Logo UEB Refinado */}
            <div style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                padding: '10px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '30px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <img
                    src="/img/logo-ueb.png"
                    alt="Logo UEB"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))'
                    }}
                />
            </div>

            <div style={{ position: 'relative' }}>
                <h1 style={{
                    fontSize: '8rem',
                    fontWeight: 900,
                    margin: 0,
                    lineHeight: 1,
                    background: 'linear-gradient(to bottom, #fff, #475569)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 0.1,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 0,
                    whiteSpace: 'nowrap'
                }}>404</h1>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '0.5rem 1rem',
                        borderRadius: '100px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '1rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <AlertTriangle size={14} /> Ruta Inexistente
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>Enlace Perdido</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                        Lo sentimos, la página que intentas acceder no existe o ha sido movida temporalmente.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="pro-btn btn-secondary"
                    style={{ padding: '0.85rem 2rem' }}
                >
                    Regresar
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="pro-btn btn-primary"
                    style={{ padding: '0.85rem 2.5rem', minWidth: '200px', justifyContent: 'center' }}
                >
                    <Home size={18} /> Volver al Inicio
                </button>
            </div>

            {/* Decoración sutil */}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.8rem',
                color: 'rgba(148, 163, 184, 0.3)',
                fontWeight: 600,
                letterSpacing: '1px'
            }}>
                UNIVERSIDAD ESTATAL DE BOLÍVAR • GESTOR DEPORTIVO
            </div>
        </div>
    );
};

export default NotFound;

import React from 'react';
import { RefreshCcw } from 'lucide-react';

/**
 * LoadingScreen Premium Component v3.0
 * Proporciona una transición visual profesional durante la carga de datos
 */
const LoadingScreen = ({ message = "SINCRONIZANDO INFORMACIÓN..." }) => {
    return (
        <div className="rep-scope rep-screen-container rep-loading-container" style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-deep)'
        }}>
            <img
                src="/img/logo-ueb.png"
                alt="Logo UEB"
                style={{
                    width: '80px',
                    borderRadius: '14px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RefreshCcw size={24} className="animate-spin" color="var(--primary-ocean)" />
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    {message}
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.95); }
                }
            `}} />
        </div>
    );
};

export default LoadingScreen;

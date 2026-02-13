import React from 'react';
import { Users, Search, Plus, Filter, UserPlus } from "lucide-react";
import "../../css/unified-all.css";

const JugadoresRepresentante = () => {
  return (
    <div className="rep-scope rep-screen-container rep-dashboard-fade">
      <header className="rep-header-main" style={{ marginBottom: '2.5rem' }}>
        <div className="header-info">
          <small className="university-label">Gestión de Talento UEB</small>
          <h1 className="content-title">Directorio de Jugadores</h1>
          <p className="content-subtitle">Administra la base de datos global de deportistas de tu club</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" style={{ boxShadow: '0 8px 20px rgba(53, 110, 216, 0.3)' }}>
            <UserPlus size={18} /> Registrar Nuevo Jugador
          </button>
        </div>
      </header>

      <div className="rep-card-light" style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '6px solid #356ed8' }}>
        <div style={{ background: '#f8fafc', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid #e2e8f0' }}>
          <Users size={48} color="#cbd5e1" />
        </div>
        <h2 style={{ color: '#19293a', fontWeight: 800, fontSize: '1.75rem', marginBottom: '1rem' }}>Módulo en Integración</h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Estamos centralizando la gestión de jugadores. Actualmente puedes gestionar las nóminas por equipo desde la sección de <strong>Nómina</strong>. Próximamente dispondrás de un directorio global aquí.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="btn-secondary" style={{ padding: '0 2rem' }} onClick={() => window.location.href = '/representante/jugadores'}>
            Ir a Nómina de Equipos
          </button>
        </div>
      </div>
    </div>
  );
};

export default JugadoresRepresentante;
import React, { useEffect, useState } from "react";
import { ClipboardList, Shield, Calendar, Activity, Info } from "lucide-react";
import api from "../../api";
import "../../css/unified-all.css";

const EquiposInscritos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInscripciones();
  }, []);

  const loadInscripciones = async () => {
    try {
      const { data } = await api.get("/usuario/equipos-inscritos");
      setEquipos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar tus inscripciones.");
    } finally {
      setLoading(false);
    }
  };

  const glassCardStyle = {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    color: '#f8fafc',
    borderRadius: '20px',
    overflow: 'hidden'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Activity className="animate-spin" size={32} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="rep-dashboard-fade">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClipboardList size={28} color="#3b82f6" /> Mis Inscripciones
        </h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
          Historial de equipos y torneos en los que has participado.
        </p>
      </div>

      {error ? (
        <div style={{ ...glassCardStyle, padding: '2rem', textAlign: 'center', color: '#f87171' }}>
          <Info size={32} style={{ marginBottom: '1rem' }} />
          <p>{error}</p>
        </div>
      ) : equipos.length === 0 ? (
        <div style={{ ...glassCardStyle, padding: '4rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Shield size={64} style={{ opacity: 0.1, marginBottom: '1.5rem', color: '#fff' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Sin registros</h3>
          <p style={{ color: '#94a3b8' }}>Actualmente no tienes equipos registrados en el sistema.</p>
        </div>
      ) : (
        <div style={glassCardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table className="rep-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Equipo</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Torneo</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Estado</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s' }} className="hover:bg-white/5">
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Shield size={16} color="#60a5fa" />
                        </div>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{item.equipo || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1' }}>{item.torneo || "—"}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.estado === 'Aprobada' || item.estado === 'ACTIVO' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.1)',
                        color: item.estado === 'Aprobada' || item.estado === 'ACTIVO' ? '#34d399' : '#94a3b8',
                        border: `1px solid ${item.estado === 'Aprobada' || item.estado === 'ACTIVO' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)'}`
                      }}>
                        {item.estado || "PENDIENTE"}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Calendar size={14} />
                        {item.fecha || "—"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquiposInscritos;

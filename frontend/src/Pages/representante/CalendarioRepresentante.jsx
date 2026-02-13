// resources/js/pages/representante/CalendarioRepresentante.jsx

import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Trophy,
  Users,
  Loader2,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";
import "../../css/unified-all.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const logoutAndRedirect = () => {
  localStorage.clear();
  window.location.href = "/login";
};

const CalendarioRepresentante = () => {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchPartidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/representante/partidos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logoutAndRedirect();
        return;
      }
      if (!res.ok) throw new Error("No se pudieron cargar los partidos.");
      const data = await res.json();
      setPartidos(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartidos();
  }, [fetchPartidos]);

  const events = partidos.map((p) => ({
    id: p.id,
    title: `${p.equipo_local?.nombre || "L"} vs ${p.equipo_visitante?.nombre || "V"}`,
    start: p.fecha + (p.hora ? `T${p.hora}` : ""),
    extendedProps: { ...p },
    backgroundColor: p.estado === "Finalizado" ? "var(--accent-teal)" : "var(--primary-ocean)",
    borderColor: "transparent",
  }));

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  if (loading) {
    return (
      <div className="rep-scope rep-screen-container rep-loading-container" style={{ flexDirection: "column", gap: "1.5rem", justifyContent: "center", alignItems: "center", background: "rgba(var(--background-dark-rgb), 0.2)", backdropFilter: "blur(10px)", height: '100vh' }}>
        <img src="/img/logo-ueb.png" alt="Logo" style={{ width: "80px", borderRadius: "14px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <RefreshCw size={24} className="animate-spin" color="var(--primary-ocean)" />
          <p style={{ margin: 0, fontWeight: 600, color: "var(--text-muted)" }}>Sincronizando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rep-scope rep-screen-container rep-dashboard-fade">
      <header className="rep-header-main" style={{ marginBottom: "2.5rem" }}>
        <div className="header-info">
          <small className="university-label">Agenda Deportiva UEB</small>
          <h1 className="content-title">Calendario de Encuentros</h1>
          <p className="content-subtitle">Cronograma detallado de participación</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchPartidos} className="btn-primary" style={{ boxShadow: "0 8px 20px rgba(53, 110, 216, 0.3)" }}>
            <RefreshCw size={18} /> Sincronizar
          </button>
        </div>
      </header>

      {error && (
        <div className="rep-card-light error-card mb-6" style={{ textAlign: "center", padding: "2rem", borderLeft: "6px solid #ef4444", background: "rgba(var(--background-dark-rgb), 0.2)" }}>
          <AlertTriangle size={32} color="#ef4444" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-main)", fontWeight: 600 }}>{error}</p>
        </div>
      )}

      <div className="rep-card-light calendar-container-premium" style={{ padding: "2.5rem", borderRadius: "30px", border: "1px solid var(--border-light)", background: "rgba(var(--background-dark-rgb), 0.2)", backdropFilter: "blur(10px)" }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={esLocale}
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="23:00:00"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes - Sábado
            startTime: '07:00',
            endTime: '22:00',
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
            hour12: false,
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
            hour12: false,
          }}
        />
      </div>

      {/* MODAL CORREGIDO: Envuelta en Fragment para evitar error de JSX */}
      {selectedEvent && (
        <>
          <div className="modal-overlay backdrop-blur-md" style={{ background: "rgba(var(--background-dark-rgb), 0.4)", position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setSelectedEvent(null)} />
          <div className="modal-content scale-in" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 101, maxWidth: "550px", width: '90%', background: "var(--card-bg, #fff)", borderRadius: "25px", padding: 0, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            
            <div className="modal-header-premium" style={{ background: "linear-gradient(135deg, #19293a, var(--primary-ocean))", padding: "2rem", color: "white", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={24} color="#ffd700" /> Detalle
              </h2>
              <button onClick={() => setSelectedEvent(null)} style={{ color: "white", background: "transparent", border: "none", cursor: 'pointer' }}><X /></button>
            </div>

            <div className="p-8" style={{ padding: '2rem' }}>
              <div className="match-detail-visual" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: "2rem 1rem", background: "rgba(0,0,0,0.03)", borderRadius: "20px", marginBottom: '2rem' }}>
                <div className="vs-team" style={{ textAlign: 'center' }}>
                  <div className="team-badge-large" style={{ width: '60px', height: '60px', margin: '0 auto 10px', background: "#eee", borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedEvent.equipo_local?.nombre?.[0]}</div>
                  <span style={{ fontWeight: 800 }}>{selectedEvent.equipo_local?.nombre}</span>
                </div>
                <div style={{ color: "var(--primary-ocean)", fontSize: "1.5rem", fontWeight: 900 }}>VS</div>
                <div className="vs-team" style={{ textAlign: 'center' }}>
                  <div className="team-badge-large" style={{ width: '60px', height: '60px', margin: '0 auto 10px', background: "#eee", borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedEvent.equipo_visitante?.nombre?.[0]}</div>
                  <span style={{ fontWeight: 800 }}>{selectedEvent.equipo_visitante?.nombre}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <DetailItem icon={<Clock color="var(--primary-ocean)"/>} label="Fecha y Hora" value={`${selectedEvent.fecha} • ${selectedEvent.hora || "--:--"}`} />
                <DetailItem icon={<MapPin color="#d97706"/>} label="Sede" value={selectedEvent.sede || "Por confirmar"} />
                <DetailItem icon={<Trophy color="#1a7f64"/>} label="Torneo" value={selectedEvent.torneo?.nombre} />
                <DetailItem 
                    icon={<Users color="var(--secondary-purple)"/>} 
                    label="Estado" 
                    value={<span style={{ color: selectedEvent.estado === 'Finalizado' ? 'var(--accent-teal)' : 'var(--primary-ocean)' }}>{selectedEvent.estado}</span>} 
                />
              </div>

              <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', height: '50px', borderRadius: '12px' }} onClick={() => setSelectedEvent(null)}>
                Volver al Calendario
              </button>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .fc {
          font-family: inherit;
          --fc-border-color: var(--border);
          --fc-neutral-bg-color: rgba(var(--background-dark-rgb), 0.1);
          --fc-page-bg-color: transparent;
          --fc-today-bg-color: rgba(var(--primary-rgb), 0.1);
          --fc-event-bg-color: var(--primary-ocean);
          --fc-event-border-color: var(--primary-ocean);
          --fc-event-text-color: var(--text-white);
          --fc-daygrid-event-dot-width: 8px;
          --fc-highlight-color: rgba(var(--primary-rgb), 0.2);
        }

        /* Toolbar */
        .fc .fc-toolbar-title {
          font-weight: 800;
          text-transform: capitalize;
          color: var(--text-color);
          font-size: 1.8rem;
        }
        .fc .fc-button-primary {
          background: var(--card-bg);
          border: 1px solid var(--border);
          color: var(--text-color);
          font-weight: 600;
          padding: 8px 15px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .fc .fc-button-primary:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
          color: var(--text-white);
        }
        .fc .fc-button-primary:focus {
          box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.3);
        }
        .fc .fc-button-active {
          background: var(--primary-ocean) !important;
          border-color: var(--primary-ocean) !important;
          color: white !important;
          box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.3);
        }

        /* Day Grid (Month/Week view) */
        .fc-daygrid-day-number {
          color: var(--text-color);
          opacity: 0.7;
        }
        .fc-day-other .fc-daygrid-day-number {
          opacity: 0.3;
        }
        .fc-col-header-cell-cushion {
          color: var(--text-color);
          font-weight: 700;
          padding: 10px 0;
        }

        /* Time Grid (Week/Day view) */
        .fc-timegrid-slot-label-frame {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .fc-timegrid-axis-frame {
          color: var(--text-muted);
        }
        .fc-timegrid-event {
          border-radius: 6px;
          padding: 5px;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .fc-timegrid-event .fc-event-time {
          font-weight: 600;
          margin-bottom: 2px;
        }
        .fc-timegrid-event .fc-event-title {
          font-weight: 700;
        }
        .fc-event-main {
          color: var(--text-white);
        }

        /* Event Styling */
        .fc-event {
          cursor: pointer;
          border: none;
          padding: 2px 5px;
          border-radius: 4px;
          transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
        }
        .fc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        /* Custom event colors based on status */
        .fc-event[style*="background-color: var(--accent-teal)"] {
          background-color: var(--accent-teal) !important;
          border-color: var(--accent-teal) !important;
        }
        .fc-event[style*="background-color: var(--primary-ocean)"] {
          background-color: var(--primary-ocean) !important;
          border-color: var(--primary-ocean) !important;
        }

        /* Modal Animations */
        .scale-in { animation: scaleIn 0.2s ease-out; }
        @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -45%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .fc .fc-toolbar-title {
            font-size: 1.4rem;
          }
          .fc .fc-button-group {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
          }
          .fc .fc-button {
            margin-bottom: 5px;
          }
        }
      `}} />
    </div>
  );
};

// Componente auxiliar para los items del detalle
const DetailItem = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
    <div style={{ background: 'rgba(0,0,0,0.05)', padding: '10px', borderRadius: '10px' }}>{icon}</div>
    <div>
      <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>{label}</small>
      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{value}</div>
    </div>
  </div>
);

export default CalendarioRepresentante;
// resources/js/pages/representante/CalendarioRepresentante.jsx

import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import "../../../css/representante_dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

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

  const events = partidos.map(p => ({
    id: p.id,
    title: `${p.equipo_local?.nombre || 'L'} vs ${p.equipo_visitante?.nombre || 'V'}`,
    start: p.fecha + (p.hora ? `T${p.hora}` : ''),
    extendedProps: {
      ...p
    },
    backgroundColor: p.estado === 'Finalizado' ? '#10b981' : '#3b82f6',
    borderColor: 'transparent'
  }));

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  if (loading) {
    return (
      <div className="rep-loading-container">
        <Loader2 className="animate-spin" size={48} />
        <p>Generando calendario...</p>
      </div>
    );
  }

  return (
    <div className="rep-scope rep-dashboard-fade">
      <header className="rep-header-main">
        <div className="header-info">
          <small className="university-label">Agenda Deportiva UEB</small>
          <h1 className="content-title">Calendario de Encuentros</h1>
          <p className="content-subtitle">Cronograma detallado de participación para tus equipos</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchPartidos} className="btn-outline">
            <RefreshCw size={16} /> Refrescar
          </button>
        </div>
      </header>

      {error && (
        <div className="rep-card error-card mb-6">
          <AlertTriangle size={32} color="#ef4444" />
          <p>{error}</p>
        </div>
      )}

      <div className="rep-card-premium calendar-container-premium">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
          }}
        />
      </div>

      {/* Modal Detalle Partidos */}
      {selectedEvent && (
        <div className="modal-overlay backdrop-blur-sm">
          <div className="modal-content scale-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header-premium" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
              <h2 className="text-white"><Trophy size={20} className="text-blue-400" /> Detalle del Encuentro</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-white"><X /></button>
            </div>
            <div className="p-8">
              <div className="match-detail-visual mb-8">
                <div className="vs-team">
                  <div className="team-badge-large">{selectedEvent.equipo_local?.nombre?.[0]}</div>
                  <span>{selectedEvent.equipo_local?.nombre}</span>
                </div>
                <div className="vs-center">VS</div>
                <div className="vs-team">
                  <div className="team-badge-large">{selectedEvent.equipo_visitante?.nombre?.[0]}</div>
                  <span>{selectedEvent.equipo_visitante?.nombre}</span>
                </div>
              </div>

              <div className="detail-grid mt-6">
                <div className="detail-item">
                  <Clock size={16} className="text-blue-500" />
                  <div>
                    <small>Fecha y Hora</small>
                    <p>{selectedEvent.fecha} • {selectedEvent.hora || '--:--'}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <MapPin size={16} className="text-red-500" />
                  <div>
                    <small>Ubicación / Sede</small>
                    <p>{selectedEvent.sede || 'Por confirmar'}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Trophy size={16} className="text-yellow-500" />
                  <div>
                    <small>Torneo</small>
                    <p>{selectedEvent.torneo?.nombre}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Users size={16} className="text-green-500" />
                  <div>
                    <small>Estado del Partido</small>
                    <p><span className={`status-pill ${selectedEvent.estado?.toLowerCase()}`}>{selectedEvent.estado}</span></p>
                  </div>
                </div>
              </div>

              <button className="btn-quick-action w-full mt-8 justify-center" onClick={() => setSelectedEvent(null)}>
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .fc { font-family: inherit; }
        .fc .fc-toolbar-title { font-weight: 800; font-size: 1.2rem; color: #0f172a; }
        .fc .fc-button-primary { background: white; border: 1px solid #e2e8f0; color: #475569; font-weight: 700; text-transform: capitalize; border-radius: 10px; }
        .fc .fc-button-primary:hover { background: #f8fafc; color: #3b82f6; border-color: #3b82f6; }
        .fc .fc-button-active { background: #3b82f6 !important; border-color: #3b82f6 !important; color: white !important; }
        .fc .fc-event { padding: 4px 8px; border-radius: 8px; font-weight: 600; font-size: 0.8rem; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05); cursor: pointer; }
        .fc .fc-event:hover { opacity: 0.9; transform: translateY(-1px); }
        .calendar-container-premium { padding: 30px; border-radius: 28px; border: 1px solid #f1f5f9; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05); background: white; }
        
        .match-detail-visual { display: flex; justify-content: space-around; align-items: center; text-align: center; }
        .vs-team { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 40%; }
        .vs-team span { font-weight: 800; color: #0f172a; font-size: 0.95rem; }
        .team-badge-large { width: 64px; height: 64px; background: #f1f5f9; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; color: #3b82f6; border: 2px solid #e2e8f0; }
        .vs-center { font-weight: 900; color: #94a3b8; font-style: italic; font-size: 1.2rem; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .detail-item { display: flex; gap: 12px; align-items: flex-start; }
        .detail-item small { display: block; color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
        .detail-item p { margin: 0; color: #1e293b; font-weight: 700; font-size: 0.9rem; }
      `}} />
    </div>
  );
};

export default CalendarioRepresentante;

import React from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Trophy,
  Calendar,
  User,
  TrendingUp
} from "lucide-react";
import { NavLink } from "react-router-dom";

const RepSidebar = () => {
  const item = ({ isActive }) =>
    `lp-item ${isActive ? "active" : ""}`;

  return (
    <aside className="rep-left-panel">
      <div className="lp-brand">
        <span className="lp-title">MENÚ</span>
      </div>

      <nav>
        <NavLink to="/representante/dashboard" className={item}>
          <LayoutDashboard size={18} />
          <span className="lp-label">Dashboard</span>
        </NavLink>

        <NavLink to="/representante/equipos" className={item}>
          <Users size={18} />
          <span className="lp-label">Mis equipos</span>
        </NavLink>

        <NavLink to="/representante/jugadores" className={item}>
          <Shield size={18} />
          <span className="lp-label">Jugadores</span>
        </NavLink>

        <NavLink to="/representante/inscripciones" className={item}>
          <Trophy size={18} />
          <span className="lp-label">Inscripciones</span>
        </NavLink>

        <NavLink to="/representante/partidos" className={item}>
          <Calendar size={18} />
          <span className="lp-label">Calendario</span>
        </NavLink>

        <NavLink to="/representante/estadisticas" className={item}>
          <TrendingUp size={18} />
          <span className="lp-label">Estadísticas</span>
        </NavLink>

        <NavLink to="/representante/perfil" className={item}>
          <User size={18} />
          <span className="lp-label">Mi perfil</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default RepSidebar;

import React from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RepHeader = ({ user }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const nombre =
    user?.persona?.nombres
      ? `${user.persona.nombres} ${user.persona.apellidos}`
      : user?.email || "Representante";

  return (
    <header className="rep-topbar">
      <div className="rep-topbar-inner">
        <div className="rep-brand">
          <div className="rep-logo">R</div>
          <div className="rep-brand-title">
            <strong>Panel Representante</strong>
            <small>Gestión deportiva</small>
          </div>
        </div>

        <div className="rep-top-actions">
          <span className="rep-user-name">
            <User size={16} /> {nombre}
          </span>

          <button className="rep-btn-ghost" onClick={logout}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
};

export default RepHeader;

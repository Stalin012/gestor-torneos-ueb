import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import RepHeader from "./representante/RepHeader";
import RepSidebar from "./representante/RepSidebar";
import "../../css/representante_dashboard.css";

const RepresentanteLayout = () => {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const role = user?.rol?.toLowerCase() || '';
  if (!user || (role !== 'representante' && role !== 'admin')) {
    localStorage.clear();
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="rep-scope rep-screen-container">

      {/* HEADER */}
      <RepHeader
        user={user}
        onToggleSidebar={() => setIsPanelCollapsed(!isPanelCollapsed)}
      />

      {/* BODY */}
      <div className="rep-body-wrapper">

        {/* SIDEBAR */}
        <RepSidebar collapsed={isPanelCollapsed} />

        {/* CONTENIDO */}

        <main className="rep-main-content">
          <section className="rep-main-surface">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default RepresentanteLayout;

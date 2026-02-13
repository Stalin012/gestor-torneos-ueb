

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ClipboardList,
  LogOut,
  Building2,
  IdCard,
  QrCode,
} from "lucide-react";

import "./user_app.css";
import EquiposInscritos from "./EquiposInscritos";
import CarnetModal from "./CarnetModal";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [perfil, setPerfil] = useState(null);
  const [vista, setVista] = useState("perfil");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [carnetData, setCarnetData] = useState(null);
  const [showCarnet, setShowCarnet] = useState(false);



  /* =======================
     PERFIL DEL JUGADOR
  ======================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_BASE}/jugador/perfil`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);

        if (res.status === 401 || res.status === 403) {
          setError(
            json?.error ||
            "Tu usuario no está registrado como jugador."
          );
          setLoading(false);
          return;
        }

        setPerfil(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar perfil.");
        setLoading(false);
      });
  }, [navigate, token]);

  /* =======================
     CARNET DIGITAL (QR REAL)
  ======================= */
  const verCarnet = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/carnet/info/${perfil.cedula}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error cargando carnet");
      }

      const json = await res.json();

      setCarnetData(json.data);
      setShowCarnet(true); // ✅ ESTE ES EL CORRECTO
    } catch (err) {
      console.error(err);
      alert("Error cargando el carnet");
    }
  };


  const cerrarSesion = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return <div className="uni-content">Cargando…</div>;
  }

  if (error) {
    return (
      <div className="uni-layout">
        <main className="uni-content">
          <h2>Acceso restringido</h2>
          <p style={{ color: "#b91c1c" }}>{error}</p>
          <button onClick={cerrarSesion}>Salir</button>
        </main>
      </div>
    );
  }

  return (
    <div className="uni-layout">
      {/* HEADER */}
      <header className="uni-header">
        <div className="uni-brand">
          <Building2 size={22} />
          <strong>Universidad Estatal de Bolívar</strong>
        </div>

        <div className="uni-user">
          <span>{perfil.nombre}</span>
          <button onClick={cerrarSesion}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="uni-body">
        {/* SIDEBAR */}
        <aside className="uni-sidebar">
          <button
            className={`uni-nav ${vista === "perfil" ? "active" : ""}`}
            onClick={() => setVista("perfil")}
          >
            <User size={18} /> Perfil
          </button>

          <button
            className={`uni-nav ${vista === "equipos" ? "active" : ""}`}
            onClick={() => setVista("equipos")}
          >
            <ClipboardList size={18} /> Equipos
          </button>
        </aside>

        {/* CONTENT */}
        <main className="uni-content">
          {vista === "perfil" && (
            <>
              <h1>Perfil del Jugador</h1>

              <div className="uni-card">
                <p><b>Nombre:</b> {perfil.nombre}</p>
                <p><b>Cédula:</b> {perfil.cedula}</p>
                <p><b>Correo:</b> {perfil.email}</p>
                <p><b>Equipo:</b> {perfil.equipo ?? "No asignado"}</p>

                <button className="uni-btn" onClick={verCarnet}>
                  <QrCode size={24} />
                  Ver Carnet Digital
                </button>

              </div>
            </>
          )}

          {vista === "equipos" && <EquiposInscritos />}
        </main>
      </div>

      {/* MODAL CARNET */}
      <CarnetModal
        isOpen={showCarnet}
        onClose={() => setShowCarnet(false)}
        data={carnetData}
      />    </div>
  );
};

export default UserProfile;

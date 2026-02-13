import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const EquiposInscritos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  /* =========================
     CARGAR EQUIPOS INSCRITOS
  ========================= */
  useEffect(() => {
    if (!token) {
      setError("Sesión no válida.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/usuario/equipos-inscritos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "No autorizado");
        }
        return res.json();
      })
      .then((data) => {
        // Protección contra respuestas inválidas
        if (Array.isArray(data)) {
          setEquipos(data);
        } else {
          setEquipos([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los equipos inscritos.");
        setLoading(false);
      });
  }, [token]);

  /* =========================
     ESTADOS DE CARGA
  ========================= */
  if (loading) {
    return (
      <div className="uni-card">
        <p>Cargando equipos inscritos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="uni-card">
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </div>
    );
  }

  if (equipos.length === 0) {
    return (
      <div className="uni-card">
        <h2>
          <ClipboardList size={18} /> Equipos Inscritos
        </h2>
        <p>No estás inscrito en ningún equipo.</p>
      </div>
    );
  }

  /* =========================
     RENDER NORMAL
  ========================= */
  return (
    <div className="uni-card">
      <h2>
        <ClipboardList size={18} /> Equipos Inscritos
      </h2>

      <table className="uni-table">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Torneo</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((item, index) => (
            <tr key={index}>
              <td>{item.equipo || "—"}</td>
              <td>{item.torneo || "—"}</td>
              <td>{item.estado || "—"}</td>
              <td>{item.fecha || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquiposInscritos;

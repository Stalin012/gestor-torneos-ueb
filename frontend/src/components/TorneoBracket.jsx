import React from "react";
import PropTypes from "prop-types";
import { Trophy, Zap, AlertCircle } from "lucide-react";

/**
 * Componente de Bracket/Llaves de Eliminatorias
 * Estilo UEFA Champions League / Copa del Mundo
 */
const TorneoBracket = ({ equipos, partidos, tema }) => {
    if (!equipos || equipos.length < 2) {
        return (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
                <AlertCircle size={60} style={{ opacity: 0.2, marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                    No hay suficientes equipos
                </h3>
                <p>Se necesitan al menos 2 equipos para generar el bracket de eliminatorias</p>
            </div>
        );
    }

    // Determinar estructura del bracket según cantidad de equipos
    const numEquipos = equipos.length;
    let estructura = null;

    if (numEquipos === 2) {
        estructura = { nombre: "FINAL", rondas: 1 };
    } else if (numEquipos <= 4) {
        estructura = { nombre: "SEMIFINALES", rondas: 2 };
    } else if (numEquipos <= 8) {
        estructura = { nombre: "CUARTOS DE FINAL", rondas: 3 };
    } else if (numEquipos <= 16) {
        estructura = { nombre: "OCTAVOS DE FINAL", rondas: 4 };
    } else {
        estructura = { nombre: "DIECISEISAVOS", rondas: 5 };
    }

    // Generar enfrentamientos por ronda
    const generarBracket = () => {
        const bracket = [];
        const equiposDisponibles = [...equipos];

        // Primera ronda: emparejar equipos
        const primeraRonda = [];
        for (let i = 0; i < equiposDisponibles.length; i += 2) {
            if (i + 1 < equiposDisponibles.length) {
                primeraRonda.push({
                    equipo1: equiposDisponibles[i],
                    equipo2: equiposDisponibles[i + 1],
                    ganador: null,
                });
            }
        }

        bracket.push({
            nombre: estructura.nombre,
            enfrentamientos: primeraRonda,
        });

        // Rondas siguientes (simuladas)
        let equiposRonda = primeraRonda.length;
        const nombresRondas = ["SEMIFINALES", "FINAL", "CAMPEÓN"];
        let rondaIdx = 0;

        while (equiposRonda > 1 && rondaIdx < nombresRondas.length) {
            equiposRonda = Math.ceil(equiposRonda / 2);
            bracket.push({
                nombre: nombresRondas[rondaIdx],
                enfrentamientos: Array(equiposRonda).fill({
                    equipo1: null,
                    equipo2: null,
                    ganador: null,
                }),
            });
            rondaIdx++;
        }

        return bracket;
    };

    const bracket = generarBracket();

    // Componente de un enfrentamiento
    const MatchCard = ({ enfrentamiento, esUltimaRonda }) => {
        const { equipo1, equipo2, ganador } = enfrentamiento;

        return (
            <div
                style={{
                    background: "linear-gradient(135deg, var(--bg-3), var(--bg-2))",
                    borderRadius: "12px",
                    padding: "1rem",
                    border: `2px solid ${ganador ? tema.colorPrimario + "88" : "var(--border)"}`,
                    boxShadow: ganador ? `0 4px 20px ${tema.colorPrimario}44` : "none",
                    transition: "all 0.3s",
                    minWidth: "200px",
                }}
            >
                {/* Equipo 1 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        background: ganador === equipo1?.id ? tema.gradiente : "var(--bg-3)",
                        borderRadius: "8px",
                        marginBottom: "0.5rem",
                        color: ganador === equipo1?.id ? "#fff" : "inherit",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: ganador === equipo1?.id ? "#fff" : tema.gradiente,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.9rem",
                                fontWeight: "700",
                                color: ganador === equipo1?.id ? tema.colorPrimario : "#fff",
                            }}
                        >
                            {equipo1?.nombre?.charAt(0) || "?"}
                        </div>
                        <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                            {equipo1?.nombre || "Por definir"}
                        </span>
                    </div>
                    {ganador === equipo1?.id && <Trophy size={18} style={{ color: "#fff" }} />}
                </div>

                {/* VS */}
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                        margin: "0.25rem 0",
                        fontWeight: "600",
                    }}
                >
                    VS
                </div>

                {/* Equipo 2 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        background: ganador === equipo2?.id ? tema.gradiente : "var(--bg-3)",
                        borderRadius: "8px",
                        color: ganador === equipo2?.id ? "#fff" : "inherit",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: ganador === equipo2?.id ? "#fff" : tema.gradiente,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.9rem",
                                fontWeight: "700",
                                color: ganador === equipo2?.id ? tema.colorPrimario : "#fff",
                            }}
                        >
                            {equipo2?.nombre?.charAt(0) || "?"}
                        </div>
                        <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                            {equipo2?.nombre || "Por definir"}
                        </span>
                    </div>
                    {ganador === equipo2?.id && <Trophy size={18} style={{ color: "#fff" }} />}
                </div>
            </div>
        );
    };

    MatchCard.propTypes = {
        enfrentamiento: PropTypes.shape({
            equipo1: PropTypes.object,
            equipo2: PropTypes.object,
            ganador: PropTypes.number,
        }).isRequired,
        esUltimaRonda: PropTypes.bool,
    };

    return (
        <div>
            <div
                style={{
                    marginBottom: "2rem",
                    padding: "1.5rem",
                    background: tema.gradiente,
                    borderRadius: "16px",
                    color: "#fff",
                    textAlign: "center",
                }}
            >
                <h2 style={{ fontSize: "1.8rem", fontWeight: "900", marginBottom: "0.5rem" }}>
                    🏆 BRACKET DE ELIMINATORIAS
                </h2>
                <p style={{ opacity: 0.9 }}>Fase de {estructura.nombre}</p>
                <p style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.5rem" }}>
                    {numEquipos} equipos participantes
                </p>
            </div>

            {/* Renderizar bracket */}
            <div style={{ overflowX: "auto", paddingBottom: "2rem" }}>
                <div
                    style={{
                        display: "flex",
                        gap: "3rem",
                        minWidth: "max-content",
                        padding: "1rem",
                        alignItems: "flex-start",
                    }}
                >
                    {bracket.map((ronda, rondaIdx) => (
                        <div key={rondaIdx} style={{ flex: "0 0 auto" }}>
                            {/* Título de la ronda */}
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: "1.5rem",
                                    padding: "0.75rem 1.5rem",
                                    background: "var(--bg-3)",
                                    borderRadius: "12px",
                                    border: `2px solid ${tema.colorPrimario}44`,
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "0.95rem",
                                        fontWeight: "800",
                                        letterSpacing: "0.05em",
                                        color: tema.colorPrimario,
                                    }}
                                >
                                    {ronda.nombre}
                                </h3>
                                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                                    {ronda.enfrentamientos.length} {ronda.enfrentamientos.length === 1 ? "partido" : "partidos"}
                                </p>
                            </div>

                            {/* Enfrentamientos */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2rem",
                                    alignItems: "center",
                                }}
                            >
                                {ronda.enfrentamientos.map((enfrentamiento, idx) => (
                                    <div key={idx} style={{ position: "relative" }}>
                                        <MatchCard
                                            enfrentamiento={enfrentamiento}
                                            esUltimaRonda={rondaIdx === bracket.length - 1}
                                        />
                                        {/* Conector a siguiente ronda */}
                                        {rondaIdx < bracket.length - 1 && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    right: "-3rem",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    width: "3rem",
                                                    height: "2px",
                                                    background: `linear-gradient(90deg, ${tema.colorPrimario}44, transparent)`,
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leyenda */}
            <div
                style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    background: "var(--bg-3)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                }}
            >
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "1rem" }}>
                    <Zap size={18} style={{ display: "inline", marginRight: "0.5rem", color: tema.colorPrimario }} />
                    Información del Bracket
                </h4>
                <ul style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.8, paddingLeft: "1.5rem" }}>
                    <li>Los enfrentamientos se generan automáticamente según los equipos inscritos</li>
                    <li>Los equipos ganadores avanzan a la siguiente ronda</li>
                    <li>El bracket se actualiza conforme se registran los resultados</li>
                    <li>Vista de eliminación directa estilo Copa del Mundo/Champions League</li>
                </ul>
            </div>
        </div>
    );
};

TorneoBracket.propTypes = {
    equipos: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            nombre: PropTypes.string.isRequired,
        })
    ).isRequired,
    partidos: PropTypes.array,
    tema: PropTypes.shape({
        colorPrimario: PropTypes.string.isRequired,
        colorSecundario: PropTypes.string.isRequired,
        gradiente: PropTypes.string.isRequired,
        icono: PropTypes.string,
    }).isRequired,
};

export default TorneoBracket;

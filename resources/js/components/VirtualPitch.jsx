import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { User, Shield, Zap, Target } from "lucide-react";

/**
 * Componente VirtualPitch - Visualización táctica premium
 * Soporta Fútbol por defecto, adaptable a otros deportes.
 */

const POSITION_MAP = {
    // Fútbol
    "Portero": { x: 50, y: 90, icon: Shield, color: "#f59e0b" },
    "Arquero": { x: 50, y: 90, icon: Shield, color: "#f59e0b" },
    "Defensa Central": { x: 50, y: 75, icon: Shield, color: "#3b82f6" },
    "Defensa Izquierdo": { x: 20, y: 70, icon: Shield, color: "#3b82f6" },
    "Defensa Derecho": { x: 80, y: 70, icon: Shield, color: "#3b82f6" },
    "Lateral Izquierdo": { x: 15, y: 60, icon: Shield, color: "#3b82f6" },
    "Lateral Derecho": { x: 85, y: 60, icon: Shield, color: "#3b82f6" },
    "Mediocampista": { x: 50, y: 50, icon: Zap, color: "#22c55e" },
    "Volante": { x: 50, y: 50, icon: Zap, color: "#22c55e" },
    "Extremo Izquierdo": { x: 20, y: 30, icon: Target, color: "#ef4444" },
    "Extremo Derecho": { x: 80, y: 30, icon: Target, color: "#ef4444" },
    "Delantero": { x: 50, y: 20, icon: Target, color: "#ef4444" },
    "Atacante": { x: 50, y: 20, icon: Target, color: "#ef4444" },
    // Balonmano / Otros
    "Base": { x: 50, y: 80, icon: Zap, color: "#8b5cf6" },
    "Pivot": { x: 50, y: 30, icon: Target, color: "#ec4899" },
};

const PlayerMarker = ({ player, x, y, temaColor }) => {
    const posInfo = useMemo(() => {
        const pos = player.posicion || "";
        // Búsqueda difusa simple
        const key = Object.keys(POSITION_MAP).find(k =>
            pos.toLowerCase().includes(k.toLowerCase())
        );
        return POSITION_MAP[key] || { x: 50, y: 50, icon: User, color: "var(--accent)" };
    }, [player.posicion]);

    // Usar x, y si vienen definidos, sino los del mapa
    const finalX = x ?? posInfo.x;
    const finalY = y ?? posInfo.y;
    const Icon = posInfo.icon;

    return (
        <div
            className="player-marker-container slide-in-up"
            style={{
                position: "absolute",
                left: `${finalX}%`,
                top: `${finalY}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 10,
                cursor: "pointer",
                transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
        >
            <div
                className="player-marker-circle glow-on-hover"
                style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${temaColor || posInfo.color}, #000)`,
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 15px ${temaColor || posInfo.color}66`,
                    color: "#fff",
                    position: "relative"
                }}
            >
                <Icon size={20} />
                <span
                    style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#fff",
                        color: "#000",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "0.7rem",
                        fontWeight: "900",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #000"
                    }}
                >
                    {player.numero || "?"}
                </span>
            </div>
            <div
                style={{
                    background: "rgba(0,0,0,0.8)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    marginTop: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.1)"
                }}
            >
                {player.persona?.nombres?.split(" ")[0] || player.nombre || "Jugador"}
            </div>
        </div>
    );
};

const VirtualPitch = ({ players = [], temaColor = "var(--accent)", sport = "futbol" }) => {
    return (
        <div
            className="virtual-pitch-wrapper fade-in"
            style={{
                width: "100%",
                maxWidth: "800px",
                aspectRatio: "2/3",
                margin: "0 auto",
                position: "relative",
                background: "linear-gradient(180deg, #1a4d2e 0%, #0d2b1a 100%)",
                borderRadius: "20px",
                border: "8px solid #2a5d3e",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 100px rgba(0,0,0,0.5)",
                overflow: "hidden"
            }}
        >
            {/* Hierba - Patrón de franjas */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: "repeating-linear-gradient(0deg, transparent, transparent 10%, rgba(255,255,255,0.1) 10%, rgba(255,255,255,0.1) 20%)",
                pointerEvents: "none"
            }} />

            {/* Marcas de la cancha (Fútbol) */}
            <svg
                viewBox="0 0 100 150"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    opacity: 0.6
                }}
            >
                {/* Línea exterior */}
                <rect x="5" y="5" width="90" height="140" fill="none" stroke="#fff" strokeWidth="1" />

                {/* Línea media */}
                <line x1="5" y1="75" x2="95" y2="75" stroke="#fff" strokeWidth="1" />

                {/* Círculo central */}
                <circle cx="50" cy="75" r="15" fill="none" stroke="#fff" strokeWidth="1" />
                <circle cx="50" cy="75" r="1" fill="#fff" />

                {/* Área grande arriba */}
                <rect x="25" y="5" width="50" height="20" fill="none" stroke="#fff" strokeWidth="1" />
                {/* Área pequeña arriba */}
                <rect x="35" y="5" width="30" height="8" fill="none" stroke="#fff" strokeWidth="1" />
                {/* Punto penal arriba */}
                <circle cx="50" cy="18" r="0.8" fill="#fff" />
                {/* Arco arriba */}
                <path d="M 38 25 A 15 15 0 0 0 62 25" fill="none" stroke="#fff" strokeWidth="1" />

                {/* Área grande abajo */}
                <rect x="25" y="125" width="50" height="20" fill="none" stroke="#fff" strokeWidth="1" />
                {/* Área pequeña abajo */}
                <rect x="35" y="142" width="30" height="8" fill="none" stroke="#fff" strokeWidth="1" />
                {/* Punto penal abajo */}
                <circle cx="50" cy="132" r="0.8" fill="#fff" />
                {/* Arco abajo */}
                <path d="M 38 125 A 15 15 0 0 1 62 125" fill="none" stroke="#fff" strokeWidth="1" />
            </svg>

            {/* Red de partículas tácticas */}
            <div className="particles-background" style={{ opacity: 0.2 }}>
                {[...Array(6)].map((_, i) => <div key={i} className="particle" />)}
            </div>

            {/* Jugadores */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                {players.length === 0 ? (
                    <div style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.3)",
                        textAlign: "center"
                    }}>
                        <Target size={60} style={{ marginBottom: "1rem", opacity: 0.2 }} />
                        <p style={{ fontSize: "1.2rem", fontWeight: "700" }}>SIN ALINEACIÓN</p>
                        <p style={{ fontSize: "0.8rem" }}>Agrega jugadores para visualizar el campo</p>
                    </div>
                ) : (
                    players.map((player, idx) => (
                        <PlayerMarker
                            key={player.id || idx}
                            player={player}
                            temaColor={temaColor}
                        />
                    ))
                )}
            </div>

            {/* Banner de Info */}
            <div style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                right: "20px",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(10px)",
                padding: "10px 15px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "10px", height: "100%", background: temaColor, borderRadius: "2px" }} />
                    <div>
                        <div style={{ fontSize: "0.6rem", color: "var(--muted)", textTransform: "uppercase" }}>Visualización</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#fff" }}>TÁCTICA EN VIVO</div>
                    </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#fff", fontWeight: "600" }}>
                    {players.length} Jugadores
                </div>
            </div>
        </div>
    );
};

VirtualPitch.propTypes = {
    players: PropTypes.array,
    temaColor: PropTypes.string,
    sport: PropTypes.string,
};

export default VirtualPitch;

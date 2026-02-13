import React from "react";
import PropTypes from "prop-types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Componente de Estadística Premium con Visualización de Barra
 */
export const StatCard = ({ title, value, previousValue, icon: Icon, color = "var(--accent)", suffix = "" }) => {
    const calculateChange = () => {
        if (!previousValue || previousValue === 0) return null;
        const change = ((value - previousValue) / previousValue) * 100;
        return change;
    };

    const change = calculateChange();
    const isPositive = change > 0;
    const isNeutral = change === 0;

    return (
        <div
            className="card-3d clickable-scale"
            style={{
                background: "linear-gradient(135deg, var(--bg-3), var(--bg-2))",
                borderRadius: "16px",
                padding: "1.5rem",
                border: `1px solid ${color}33`,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
            }}
        >
            {/* Background decoration */}
            <div
                style={{
                    position: "absolute",
                    top: "-50%",
                    right: "-20%",
                    width: "200px",
                    height: "200px",
                    background: `radial-gradient(circle, ${color}15, transparent)`,
                    borderRadius: "50%",
                }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                        <p style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: "600", marginBottom: "0.5rem" }}>
                            {title}
                        </p>
                        <h3
                            style={{
                                fontSize: "2.5rem",
                                fontWeight: "900",
                                margin: 0,
                                background: `linear-gradient(135deg, ${color}, ${color}88)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            {value}
                            {suffix && <span style={{ fontSize: "1.5rem" }}>{suffix}</span>}
                        </h3>
                    </div>

                    {Icon && (
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "12px",
                                background: `linear-gradient(135deg, ${color}, ${color}88)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 8px 24px ${color}44`,
                            }}
                        >
                            <Icon size={24} color="#fff" />
                        </div>
                    )}
                </div>

                {change !== null && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                        {!isNeutral && (
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    color: isPositive ? "#22c55e" : "#ef4444",
                                    fontWeight: "700",
                                }}
                            >
                                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {Math.abs(change).toFixed(1)}%
                            </span>
                        )}
                        {isNeutral && (
                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--muted)", fontWeight: "700" }}>
                                <Minus size={16} />
                                Sin cambio
                            </span>
                        )}
                        <span style={{ color: "var(--muted)" }}>vs. anterior</span>
                    </div>
                )}
            </div>
        </div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    previousValue: PropTypes.number,
    icon: PropTypes.elementType,
    color: PropTypes.string,
    suffix: PropTypes.string,
};

/**
 * Barra de progreso circular premium
 */
export const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "var(--accent)", label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--bg-3)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: "stroke-dashoffset 1s ease",
                        filter: `drop-shadow(0 0 8px ${color})`,
                    }}
                />
            </svg>

            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span style={{ fontSize: "1.8rem", fontWeight: "900", color }}>{percentage}%</span>
                {label && <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>{label}</span>}
            </div>
        </div>
    );
};

CircularProgress.propTypes = {
    percentage: PropTypes.number.isRequired,
    size: PropTypes.number,
    strokeWidth: PropTypes.number,
    color: PropTypes.string,
    label: PropTypes.string,
};

/**
 * Barra de progreso lineal premium
 */
export const LinearProgress = ({ percentage, height = 8, color = "var(--accent)", showLabel = true, label }) => {
    return (
        <div style={{ width: "100%" }}>
            {showLabel && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--text-2)", fontWeight: "600" }}>{label || "Progreso"}</span>
                    <span style={{ color, fontWeight: "700" }}>{percentage}%</span>
                </div>
            )}

            <div
                style={{
                    width: "100%",
                    height: `${height}px`,
                    background: "var(--bg-3)",
                    borderRadius: `${height / 2}px`,
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        borderRadius: `${height / 2}px`,
                        transition: "width 1s ease",
                        boxShadow: `0 0 12px ${color}88`,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Shimmer effect */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            animation: "shimmer 2s infinite",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

LinearProgress.propTypes = {
    percentage: PropTypes.number.isRequired,
    height: PropTypes.number,
    color: PropTypes.string,
    showLabel: PropTypes.bool,
    label: PropTypes.string,
};

/**
 * Mini gráfico de barras
 */
export const MiniBarChart = ({ data, height = 60, color = "var(--accent)", label }) => {
    const max = Math.max(...data.map((d) => d.value));

    return (
        <div>
            {label && (
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.75rem", fontWeight: "600" }}>{label}</p>
            )}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: `${height}px` }}>
                {data.map((item, idx) => (
                    <div
                        key={idx}
                        className="glow-on-hover"
                        style={{
                            flex: 1,
                            height: `${(item.value / max) * 100}%`,
                            background: `linear-gradient(180deg, ${color}, ${color}66)`,
                            borderRadius: "4px 4px 0 0",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            minHeight: "4px",
                        }}
                        title={`${item.label}: ${item.value}`}
                    />
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--muted)" }}>
                {data.length > 0 && (
                    <>
                        <span>{data[0].label}</span>
                        <span>{data[data.length - 1].label}</span>
                    </>
                )}
            </div>
        </div>
    );
};

MiniBarChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired,
        })
    ).isRequired,
    height: PropTypes.number,
    color: PropTypes.string,
    label: PropTypes.string,
};

const StatsComponents = {
    StatCard,
    CircularProgress,
    LinearProgress,
    MiniBarChart,
};

export default StatsComponents;

import React from "react";
import PropTypes from "prop-types";

/**
 * Skeleton Loader Component Premium
 * Para mostrar estados de carga elegantes
 */

export const SkeletonCard = ({ width = "100%", height = "120px" }) => (
    <div
        className="skeleton-card"
        style={{
            width,
            height,
            background: "linear-gradient(90deg, var(--bg-3) 0%, var(--bg-2) 50%, var(--bg-3) 100%)",
            backgroundSize: "200% 100%",
            animation: "skeleton-loading 1.5s ease-in-out infinite",
            borderRadius: "12px",
        }}
    />
);

SkeletonCard.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
};

export const SkeletonText = ({ width = "100%", height = "16px", rows = 1 }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {Array.from({ length: rows }).map((_, idx) => (
            <div
                key={idx}
                className="skeleton-text"
                style={{
                    width: idx === rows - 1 ? "70%" : width,
                    height,
                    background: "linear-gradient(90deg, var(--bg-3) 0%, var(--bg-2) 50%, var(--bg-3) 100%)",
                    backgroundSize: "200% 100%",
                    animation: "skeleton-loading 1.5s ease-in-out infinite",
                    borderRadius: "8px",
                }}
            />
        ))}
    </div>
);

SkeletonText.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    rows: PropTypes.number,
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "1rem" }}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                    <div
                        key={colIdx}
                        className="skeleton-cell"
                        style={{
                            height: "40px",
                            background: "linear-gradient(90deg, var(--bg-3) 0%, var(--bg-2) 50%, var(--bg-3) 100%)",
                            backgroundSize: "200% 100%",
                            animation: "skeleton-loading 1.5s ease-in-out infinite",
                            animationDelay: `${(rowIdx * columns + colIdx) * 0.05}s`,
                            borderRadius: "8px",
                        }}
                    />
                ))}
            </div>
        ))}
    </div>
);

SkeletonTable.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
};

export const SkeletonDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "2rem" }}>
        {/* Hero skeleton */}
        <SkeletonCard height="200px" />

        {/* Stats grid skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <SkeletonCard height="150px" />
            <SkeletonCard height="150px" />
            <SkeletonCard height="150px" />
            <SkeletonCard height="150px" />
        </div>

        {/* Content grid skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <SkeletonCard height="400px" />
            <SkeletonCard height="400px" />
        </div>
    </div>
);

export const SkeletonBracket = () => (
    <div style={{ display: "flex", gap: "3rem", overflowX: "auto", padding: "2rem" }}>
        {[1, 2, 3, 4].map((round) => (
            <div key={round} style={{ display: "flex", flexDirection: "column", gap: "2rem", minWidth: "250px" }}>
                {Array.from({ length: Math.max(1, 8 / Math.pow(2, round - 1)) }).map((_, idx) => (
                    <SkeletonCard key={idx} height="150px" />
                ))}
            </div>
        ))}
    </div>
);

const SkeletonLoader = {
    Card: SkeletonCard,
    Text: SkeletonText,
    Table: SkeletonTable,
    Dashboard: SkeletonDashboard,
    Bracket: SkeletonBracket,
};

export default SkeletonLoader;

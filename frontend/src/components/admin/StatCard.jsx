import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className="stat-card">
        <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ padding: '8px', background: `color-mix(in srgb, ${color} 15%, transparent)`, borderRadius: '8px', color: color }}>
                    <Icon size={20} />
                </div>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#fff', lineHeight: 1 }}>{value}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 0, lineHeight: 1.2 }}>{label}</p>
            {subtext && <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.7, marginTop: '4px', lineHeight: 1.2 }}>{subtext}</p>}
        </div>
    </div>
);

export default StatCard;

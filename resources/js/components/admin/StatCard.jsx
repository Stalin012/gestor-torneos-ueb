import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ padding: '10px', background: `color-mix(in srgb, ${color} 15%, transparent)`, borderRadius: '10px', color: color }}>
                <Icon size={24} />
            </div>
        </div>
        <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{value}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 0 }}>{label}</p>
        {subtext && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7, marginTop: '4px' }}>{subtext}</p>}
    </div>
);

export default StatCard;

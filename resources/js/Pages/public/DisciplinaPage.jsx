import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Calendar } from 'lucide-react';
import "../../../css/Home.css"; // Reuse premium styles

const DisciplinaPage = () => {
    const { deporte } = useParams();
    const navigate = useNavigate();
    const deporteTitle = deporte ? deporte.charAt(0).toUpperCase() + deporte.slice(1) : 'Deporte';

    return (
        <div className="home-wrapper">
            <div className="hero-bg"></div> {/* Reuses fixed background */}

            <div className="container" style={{ paddingTop: '6rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                        padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <ArrowLeft size={20} /> Volver
                </button>

                <div className="carnet-finder-section" style={{ minHeight: '60vh' }}>
                    <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '4rem', margin: 0 }} className="gradient-text">{deporteTitle}</h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Información y estadísticas de la disciplina</p>
                    </div>

                    <div className="bento-grid">
                        <div className="bento-card large" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Trophy size={48} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                            <h3>Ligas Oficiales</h3>
                            <p>Consulta la tabla de posiciones y resultados de los torneos activos de {deporteTitle}.</p>
                        </div>
                        <div className="bento-card" style={{ padding: '2rem' }}>
                            <Users size={32} color="#ec4899" style={{ marginBottom: '1rem' }} />
                            <h3>Equipos</h3>
                            <p>Clubes registrados</p>
                            <h2 style={{ marginTop: 'auto', fontSize: '2.5rem' }}>12</h2>
                        </div>
                        <div className="bento-card" style={{ padding: '2rem' }}>
                            <Calendar size={32} color="#22c55e" style={{ marginBottom: '1rem' }} />
                            <h3>Próximo Partido</h3>
                            <p>Final Interfacultades</p>
                            <div style={{ marginTop: '1rem', fontWeight: 'bold', color: '#fff' }}>Sábado 15, 10:00 AM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisciplinaPage;

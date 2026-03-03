import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Video, Calendar, Maximize2 } from 'lucide-react';
import "../../css/home.css";
import api from "../../api";
import { getAssetUrl } from "../../utils/helpers";

const GaleriaPublica = () => {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await api.get('/galeria');
            setList(Array.isArray(resp.data) ? resp.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        window.scrollTo(0, 0);
    }, [loadData]);

    if (loading) {
        return (
            <div className="home-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div className="loading-screen" style={{ color: '#fff' }}>Cargando Galería...</div>
            </div>
        );
    }

    return (
        <div className="home-wrapper">
            <nav className="navbar scrolled">
                <div className="nav-content">
                    <div className="brand" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
                        <div className="brand-icon">
                            <img src="/img/logo-ueb.png" alt="Logo UEB" className="brand-logo-img" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: '8.5rem', paddingBottom: '6rem' }}>
                <header style={{ marginBottom: '4rem' }}>
                    <button onClick={() => navigate(-1)} className="nav-btn" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                        <ArrowLeft size={20} /> Volver
                    </button>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Galería <span className="text-highlight">Multimedia</span></h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.25rem' }}>Explora los momentos más memorables de nuestras competiciones.</p>
                </header>

                <div className="gallery-section-wrapper" style={{ background: 'transparent', padding: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {list.map((item, i) => (
                            <div key={i} className="gallery-item" style={{ width: '100%', height: '350px' }}>
                                <img src={getAssetUrl(item.imagen)} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="gallery-overlay" style={{ opacity: 1, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }}>
                                    <div style={{ width: '100%' }}>
                                        <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{item.titulo}</h4>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '5px 0 10px' }}>{item.descripcion}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                            <Calendar size={12} /> {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Reciente'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {list.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                        <ImageIcon size={64} color="#1e293b" style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                        <h2 style={{ color: '#94a3b8' }}>Aún no hay contenido multimedia</h2>
                    </div>
                )}
            </div>

            <footer className="footer" style={{ textAlign: 'center' }}>
                <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '60px', marginBottom: '1.5rem', borderRadius: '8px' }} />
                <p style={{ color: '#94a3b8' }}>&copy; 2025 Universidad Estatal de Bolívar</p>
            </footer>
        </div>
    );
};

export default GaleriaPublica;

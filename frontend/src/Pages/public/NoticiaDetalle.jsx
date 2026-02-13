import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, Clock, Newspaper, ArrowRight } from 'lucide-react';
import "../../css/home.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const NoticiaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentNews, setRecentNews] = useState([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [newsResp, allNewsResp] = await Promise.all([
                fetch(`${API_BASE}/noticias/${id}`),
                fetch(`${API_BASE}/noticias`)
            ]);

            const newsData = await newsResp.json();
            const allNewsData = await allNewsResp.json();

            setNoticia(newsData);
            setRecentNews((Array.isArray(allNewsData) ? allNewsData : []).filter(n => n.id !== parseInt(id)).slice(0, 3));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
        window.scrollTo(0, 0);
    }, [loadData]);

    if (loading) {
        return (
            <div className="home-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '2rem' }}>
                <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '80px', borderRadius: '12px', objectFit: 'contain' }} />
                <div className="loading-screen" style={{ color: '#94a3b8', fontWeight: 600 }}>Cargando noticia...</div>
            </div>
        );
    }

    if (!noticia) {
        return (
            <div className="home-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1.5rem' }}>
                <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '80px', borderRadius: '12px', marginBottom: '1rem', objectFit: 'contain' }} />
                <h2 style={{ color: '#fff', margin: 0 }}>Noticia no encontrada</h2>
                <button onClick={() => navigate('/')} className="pro-btn btn-primary">Volver al inicio</button>
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
            <div className="hero-bg" style={{ fixed: 'fixed', opacity: 0.05, filter: 'blur(100px)' }}></div>

            <div className="container" style={{ paddingTop: '8.5rem', paddingBottom: '6rem', position: 'relative', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} className="nav-btn" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                    <ArrowLeft size={20} /> Volver
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '4rem', alignItems: 'start' }}>
                    {/* Main Content */}
                    <article className="fade-enter">
                        <header style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                                <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                                    COMUNICADO OFICIAL
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <Calendar size={14} /> {new Date(noticia.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '2rem' }}>
                                {noticia.titulo}
                            </h1>
                            {noticia.imagen && (
                                <div style={{ width: '100%', height: '500px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <img src={noticia.imagen} alt={noticia.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </header>

                        <div style={{ color: '#cbd5e1', fontSize: '1.25rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                            {noticia.contenido}
                        </div>

                        <footer style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(59, 130, 246, 0.3)' }} />
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Redacción</div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Prensa Universitaria</div>
                                </div>
                            </div>
                            <button className="pro-btn btn-secondary" style={{ display: 'flex', gap: '8px' }} onClick={() => {
                                navigator.share?.({ title: noticia.titulo, url: window.location.href }).catch(() => { });
                            }}>
                                <Share2 size={18} /> Compartir
                            </button>
                        </footer>
                    </article>

                    {/* Sidebar: Recent News */}
                    <aside className="fade-enter" style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <Newspaper size={20} color="#3b82f6" />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>Noticias Recientes</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {recentNews.map(rn => (
                                <div key={rn.id} onClick={() => navigate(`/noticias/${rn.id}`)} style={{ cursor: 'pointer', padding: '1rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }} className="hover-scale">
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem', lineHeight: '1.4' }}>{rn.titulo}</h4>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(rn.created_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                            <button onClick={() => navigate('/')} className="pro-btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Ver todas <ArrowRight size={18} />
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            <footer className="section" style={{ textAlign: 'center', borderTop: '1px solid var(--glass-border)', padding: '4rem 1rem', marginTop: '4rem' }}>
                <img src="/img/logo-ueb.png" alt="Logo UEB" style={{ width: '60px', marginBottom: '1.5rem', borderRadius: '8px' }} />
                <p style={{ color: '#94a3b8' }}>&copy; 2025 Universidad Estatal de Bolívar</p>
            </footer>
        </div>
    );
};

export default NoticiaDetalle;

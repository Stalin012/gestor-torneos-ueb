import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu, X, Trophy, ChevronDown, Shield, QrCode,
  ExternalLink, Zap, ArrowRight, Calendar, Facebook, Instagram, Youtube
} from "lucide-react";
import api, { apiPublic } from "../api";
import "../css/home.css";

const STORAGE_BASE = import.meta.env?.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage";
const HERO_FALLBACK = "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2669&auto=format&fit=crop";

export default function Home() {
  const navigate = useNavigate();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE}/${path.replace('public/', '')}`;
  };

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [torneos, setTorneos] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [activeStatsTorneo, setActiveStatsTorneo] = useState(null);
  const [aboutInfo, setAboutInfo] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      try {
        const resTorneos = await apiPublic.get('/torneos/publicos');
        const list = Array.isArray(resTorneos.data) ? resTorneos.data : resTorneos.data.data || [];
        setTorneos(list);
        if (list && list.length > 0) await fetchStats(Number(list[0].id));

        const resGaleria = await apiPublic.get('/galeria');
        const galList = Array.isArray(resGaleria.data) ? resGaleria.data : resGaleria.data?.data || [];
        setGaleria(galList);

        const resNoticias = await apiPublic.get('/noticias');
        const notList = Array.isArray(resNoticias.data) ? resNoticias.data : resNoticias.data?.data || [];
        setNoticias(notList);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      }
    };
    initFetch();
  }, []);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const res = await fetch('/acerca.json');
        if (!res.ok) return;
        const data = await res.json();
        setAboutInfo(data);
      } catch (e) {
        console.error('No se pudo cargar acerca.json');
      }
    };
    loadAbout();
  }, []);

  const fetchStats = async (torneoId) => {
    try {
      const res = await apiPublic.get(`/torneos/${torneoId}/tabla-posiciones`);
      setRanking(res.data.tabla || []);
      setActiveStatsTorneo(res.data.torneo);
    } catch (err) {
      console.error("Error al obtener estadísticas");
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="home-wrapper">
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <div className="brand" onClick={() => scrollTo("inicio")}>
            <div className="brand-icon">
              <img src="/img/logo-ueb.png" alt="Logo UEB" className="brand-logo-img" />
            </div>
          </div>

          <ul className="nav-links">
            <li><button onClick={() => scrollTo("inicio")}>Inicio</button></li>
            <li><button onClick={() => scrollTo("disciplinas")}>Disciplinas</button></li>
            <li><button onClick={() => scrollTo("estadisticas")}>Estadísticas</button></li>
            <li><button onClick={() => scrollTo("galeria")}>Galería</button></li>
            <li><button onClick={() => scrollTo("noticias")}>Noticias</button></li>
          </ul>

          <div className="flex items-center gap-4">
            <button className="btn-primary-lg" onClick={() => navigate("/login")}>Acceso Clubes</button>
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <div className={`mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><button onClick={() => scrollTo("inicio")}>Inicio</button></li>
            <li><button onClick={() => scrollTo("disciplinas")}>Disciplinas</button></li>
            <li><button onClick={() => scrollTo("estadisticas")}>Estadísticas</button></li>
            <li><button onClick={() => scrollTo("galeria")}>Galería</button></li>
            <li><button onClick={() => scrollTo("noticias")}>Noticias</button></li>
            <li><button onClick={() => navigate("/login")}>Acceso Clubes</button></li>
          </ul>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="inicio" className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2669&auto=format&fit=crop" alt="Estadio" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 className="hero-title">
            PASIÓN QUE NOS<br />
            UNE
          </h1>
          <p className="hero-desc">Plataforma Oficial</p>
        </div>
      </header>

      {/* DISCIPLINAS BENTO GRID */}
      <section id="disciplinas" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Nuestras <span className="text-highlight">Disciplinas</span></h2>
          </div>
          <div className="bento-grid">
            <div className="bento-card">
              <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80" alt="Fútbol" />
              <div className="bento-content">
                <h3>Fútbol Profesional</h3>
                <p>Interfacultades 2025</p>
              </div>
            </div>
            <div className="bento-card">
              <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80" alt="Basket" />
              <div className="bento-content">
                <h3>Basketball</h3>
              </div>
            </div>
            <div className="bento-card">
              <img src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000&auto=format&fit=crop" alt="Voley" />
              <div className="bento-content">
                <h3>Voley</h3>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ESTADÍSTICAS */}
      <section id="estadisticas" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Estadísticas <span className="text-highlight">En Vivo</span></h2>
            <div className="flex gap-4 items-center mt-4">
              <select className="tournament-select" value={activeStatsTorneo?.id || ''} onChange={(e) => {
                const id = Number(e.target.value);
                if (id) fetchStats(id);
              }}>
                <option value="">Seleccionar torneo...</option>
                {torneos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              <span className="text-slate-400 text-sm">
                {activeStatsTorneo?.nombre || "Selecciona un torneo para ver estadísticas"}
              </span>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <table className="standings-table">
                <thead>
                  <tr><th>Posición / Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr>
                </thead>
                <tbody>
                  {ranking.length > 0 ? ranking.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <div className="team-cell">
                          <div className={`team-rank top-${index + 1}`}>{index + 1}</div>
                          {row.nombre}
                        </div>
                      </td>
                      <td>{row.jugados}</td>
                      <td style={{ color: '#22c55e' }}>{row.ganados || 0}</td>
                      <td style={{ color: '#fbbf24' }}>{row.empatados || 0}</td>
                      <td style={{ color: '#ef4444' }}>{row.perdidos || 0}</td>
                      <td>{row.goles_favor || 0}</td>
                      <td>{row.goles_contra || 0}</td>
                      <td style={{ color: (row.goles_favor - row.goles_contra) > 0 ? '#22c55e' : '#ef4444' }}>
                        {(row.goles_favor || 0) - (row.goles_contra || 0)}
                      </td>
                      <td><strong>{row.puntos}</strong></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        {activeStatsTorneo ? 'No hay datos disponibles' : 'Selecciona un torneo'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Stats Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="stat-card player-star-card">
                <div className="player-avatar-large">
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white' }}>🏆</div>
                </div>
                <div className="stat-highlight">{ranking.length > 0 ? ranking[0]?.puntos || 0 : 0}</div>
                <span className="stat-label">Puntos Líder</span>
                <h3 style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{ranking.length > 0 ? ranking[0]?.nombre || 'Equipo Líder' : 'Sin Datos'}</h3>
              </div>

              <div className="stat-card player-star-card">
                <div className="player-avatar-large">
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white' }}>⚽</div>
                </div>
                <div className="stat-highlight">{ranking.reduce((total, team) => total + (team.goles_favor || 0), 0)}</div>
                <span className="stat-label">Goles Totales</span>
                <h3 style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>En el Torneo</h3>
              </div>

              <div className="stat-card player-star-card">
                <div className="player-avatar-large">
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ec4899, #be185d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white' }}>🔥</div>
                </div>
                <div className="stat-highlight">{Math.max(...ranking.map(team => team.goles_favor || 0), 0)}</div>
                <span className="stat-label">Más Goleador</span>
                <h3 style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {ranking.find(team => team.goles_favor === Math.max(...ranking.map(t => t.goles_favor || 0)))?.nombre || 'Sin Datos'}
                </h3>
              </div>

              <div className="stat-card player-star-card">
                <div className="player-avatar-large">
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white' }}>🛡️</div>
                </div>
                <div className="stat-highlight">{Math.min(...ranking.map(team => team.goles_contra || 0).filter(gc => gc >= 0), 999)}</div>
                <span className="stat-label">Mejor Defensa</span>
                <h3 style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {ranking.find(team => team.goles_contra === Math.min(...ranking.map(t => t.goles_contra || 0).filter(gc => gc >= 0)))?.nombre || 'Sin Datos'}
                </h3>
              </div>

              <div className="stat-card player-star-card">
                <div className="player-avatar-large">
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white' }}>🎯</div>
                </div>
                <div className="stat-highlight">{ranking.reduce((total, team) => total + (team.jugados || 0), 0)}</div>
                <span className="stat-label">Partidos Jugados</span>
                <h3 style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Total General</h3>
              </div>

              <div className="stat-card player-star-card">
                <div className="player-avatar-large">
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white' }}>📊</div>
                </div>
                <div className="stat-highlight">{ranking.length}</div>
                <span className="stat-label">Equipos</span>
                <h3 style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Participantes</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" className="section">
        <div className="container">
          <div className="section-header"><h2>Galería <span className="text-highlight">Multimedia</span></h2></div>
          <div className="gallery-grid">
            {galeria.map((item, i) => (
              <div key={i} className="gallery-item">
                <img src={getImageUrl(item.imagen)} alt={item.titulo} />
                <div className="gallery-overlay">
                  <div><h4>{item.titulo}</h4></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOTICIAS */}
      <section id="noticias" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Crónicas y <span className="text-highlight">Noticias</span></h2>
            <p>Mantente al día con lo último</p>
          </div>
          <div className="news-grid">
            {noticias.slice(0, 3).map((item, i) => (
              <div key={i} className="news-card" onClick={() => navigate(`/noticias/${item.id}`)}>
                <div className="news-image" style={{ backgroundImage: item.imagen ? `url(${item.imagen})` : 'none' }}>
                  <div className="news-badge">NUEVO</div>
                </div>
                <div className="news-content">
                  <div className="news-meta">
                    <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <h3 className="news-title">{item.titulo}</h3>
                  <p className="news-excerpt">{item.contenido}</p>
                  <div className="news-link">
                    Leer más <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {noticias.length === 0 && <div className="tournament-empty">
            <h3>No hay noticias recientes</h3>
            <p>No hay noticias recientes para mostrar.</p>
          </div>}
        </div>
      </section>



      {/* FOOTER */}
      <footer id="footer" className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-about">
              <h4>{aboutInfo?.universidad?.nombre || 'Universidad Estatal de Bolívar'}</h4>
              <p>{aboutInfo?.universidad?.descripcion || 'Institución pública de educación superior en Bolívar, Ecuador.'}</p>
              <div className="footer-about-grid">
                {aboutInfo?.universidad?.mision && <p><strong>Misión:</strong> {aboutInfo.universidad.mision}</p>}
                {aboutInfo?.universidad?.vision && <p><strong>Visión:</strong> {aboutInfo.universidad.vision}</p>}
              </div>

            </div>
            <div className="footer-links">
              <a href="/acerca.json" target="_blank" rel="noopener noreferrer" className="footer-cta">Acerca de</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© {new Date().getFullYear()} Todos los derechos reservados.</div>
            <div className="footer-social">
              <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>
              <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
              <a href="#" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

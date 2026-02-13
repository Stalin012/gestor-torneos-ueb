import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu, X, Trophy, ChevronDown, Shield, QrCode, Search,
  ExternalLink, Zap, ArrowRight, Calendar
} from "lucide-react";
import api from "../api";
import "../../css/home.css";

const STORAGE_BASE = import.meta.env?.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage";
const HERO_FALLBACK = "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2669&auto=format&fit=crop";

const Home = () => {
  const navigate = useNavigate();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE}/${path.replace('public/', '')}`;
  };

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [busquedaCedula, setBusquedaCedula] = useState("");
  const [torneos, setTorneos] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [activeStatsTorneo, setActiveStatsTorneo] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      try {
        const resTorneos = await api.get('/torneos/publicos');
        const list = Array.isArray(resTorneos.data) ? resTorneos.data : resTorneos.data.data || [];
        setTorneos(list);
        if (list.length > 0) fetchStats(list[0].id);

        const resGaleria = await api.get('/galeria');
        setGaleria(Array.isArray(resGaleria.data) ? resGaleria.data : []);

        const resNoticias = await api.get('/noticias');
        setNoticias(Array.isArray(resNoticias.data) ? resNoticias.data : []);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      }
    };
    initFetch();
  }, []);

  const fetchStats = async (torneoId) => {
    try {
      const res = await api.get(`/torneos/${torneoId}/tabla-posiciones`);
      setRanking(res.data.tabla || []);
      setActiveStatsTorneo(res.data.torneo);
    } catch (err) {
      console.error("Error al obtener estadísticas");
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    if (busquedaCedula.length === 10) navigate(`/carnet/${busquedaCedula}`);
    else alert("Ingrese una cédula válida de 10 dígitos");
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
            <div className="brand-icon"><Shield size={24} fill="currentColor" /></div>
            <div className="brand-text"><h2>UEB<span>SPORT</span></h2></div>
          </div>

          <ul className="nav-links">
            <li><button className="nav-btn" onClick={() => scrollTo("inicio")}>Inicio</button></li>
            <li><button className="nav-btn" onClick={() => scrollTo("disciplinas")}>Disciplinas</button></li>
            <li><button className="nav-btn" onClick={() => scrollTo("estadisticas")}>Estadísticas</button></li>
            <li><button className="nav-btn" onClick={() => scrollTo("galeria")}>Galería</button></li>
            <li><button className="nav-btn" onClick={() => scrollTo("noticias")}>Noticias</button></li>
            <li><button className="nav-btn" onClick={() => scrollTo("torneos")}>Resultados</button></li>
          </ul>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-login" onClick={() => navigate("/login")}>Acceso Clubes</button>
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="inicio" className="hero">
        <div className="hero-bg" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(11, 17, 32, 0.6), #0b1120), url('${HERO_FALLBACK}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        <div className="hero-content" style={{ zIndex: 10 }}>
          <div className="pill-badge"><Zap size={16} fill="currentColor" /> LIGAS UNIVERSITARIAS 2025</div>
          <h1 className="hero-title">
            <span className="gradient-text">PASIÓN QUE</span><br />
            <span className="text-highlight">NOS UNE</span>
          </h1>
          <p className="hero-desc">La plataforma oficial de deportes de la Universidad Estatal de Bolívar.</p>
          <div className="hero-buttons">
            <button className="btn-primary-lg" onClick={() => scrollTo("carnets")}><QrCode size={20} /> Carnet Digital</button>
            <button className="btn-outline-lg" onClick={() => scrollTo("torneos")}>Ver Fixtures</button>
          </div>
        </div>
      </header>

      {/* DISCIPLINAS BENTO GRID */}
      <section id="disciplinas" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Nuestras <span className="text-highlight">Disciplinas</span></h2>
          </div>
          <div className="bento-grid">
            <div className="bento-card large">
              <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80" alt="Fútbol" />
              <div className="bento-content"><h3>Fútbol Profesional</h3><p>Interfacultades 2025</p></div>
            </div>
            <div className="bento-card">
              <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80" alt="Basket" />
              <div className="bento-content"><h3>Basketball</h3></div>
            </div>
            <div className="bento-card">
              <img src="https://images.unsplash.com/photo-1592656094267-764a4515957e?q=80" alt="Voley" />
              <div className="bento-content"><h3>Voley</h3></div>
            </div>
          </div>
        </div>
      </section>

      {/* CARNET FINDER */}
      <section id="carnets" className="section">
        <div className="container">
          <div className="carnet-finder-section">
            <div className="carnet-grid">
              <div className="finder-content">
                <div style={{ color: '#3b82f6', fontWeight: 700, marginBottom: '1rem' }}>SISTEMA DE ACREDITACIÓN</div>
                <h2>Tu Carnet <span className="text-highlight">Digital</span></h2>
                <form className="search-wrapper" onSubmit={handleBuscar}>
                  <Search className="search-icon" size={20} />
                  <input
                    type="text" className="search-input" placeholder="Cédula..."
                    value={busquedaCedula} onChange={e => setBusquedaCedula(e.target.value)} maxLength={10}
                  />
                  <button type="submit" className="btn-search">Generar</button>
                </form>
              </div>
              <div className="id-preview-card">
                <div className="carnet-card-realistic">
                  <div className="cc-header">
                    <Shield size={28} color="#3b82f6" />
                    <div className="cc-chip"></div>
                  </div>
                  <div className="cc-body">
                    <div className="cc-number">020XXXXXXX</div>
                    <div className="cc-info">
                      <div>
                        <div className="cc-label">Deportista</div>
                        <div className="cc-value">ATLETA UEB</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="cc-label">Estado</div>
                        <div className="cc-value" style={{ color: '#4ade80' }}>Activo</div>
                      </div>
                    </div>
                  </div>
                </div>
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
            <p>{activeStatsTorneo?.nombre || "Cargando datos..."}</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <table className="standings-table">
                <thead>
                  <tr><th>Posición / Equipo</th><th>PJ</th><th>PTS</th></tr>
                </thead>
                <tbody>
                  {ranking.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <div className="team-cell">
                          <div className={`team-rank top-${index + 1}`}>{index + 1}</div>
                          {row.nombre}
                        </div>
                      </td>
                      <td>{row.jugados}</td>
                      <td><strong>{row.puntos}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="stat-card player-star-card">
              <div className="player-avatar-large">
                <img src="https://ui-avatars.com/api/?name=UEB&background=3b82f6&color=fff" alt="Top Scorer" />
              </div>
              <div className="stat-highlight">15</div>
              <span className="stat-label">Goles Marcados</span>
              <h3 style={{ marginTop: '1rem' }}>Líder de Goleo</h3>
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
            <p>Mantente al día con lo último de UEB SPORT</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {noticias.slice(0, 3).map((item, i) => (
              <div key={i} className="pro-card match-card hover-scale"
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onClick={() => navigate(`/noticias/${item.id}`)}>
                <div style={{ height: '200px', background: item.imagen ? `url(${item.imagen}) center/cover` : 'var(--bg-darkest)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(59,130,246,0.8)', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                    NUEVO
                  </div>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff', lineHeight: 1.4 }}>{item.titulo}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.contenido}
                  </p>
                  <div style={{ marginTop: 'auto', color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Leer más <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {noticias.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No hay noticias recientes para mostrar.</div>}
        </div>
      </section>

      {/* TORNEOS */}
      <section id="torneos" className="section">
        <div className="container">
          <div className="section-header"><h2>Torneos <span className="text-highlight">Activos</span></h2></div>
          <div className="tournaments-list">
            {torneos.map(t => (
              <div key={t.id} className="tournament-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <Trophy size={24} color="#3b82f6" />
                  <div><h4 style={{ margin: 0 }}>{t.nombre}</h4></div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span className="status-badge"><span className="status-dot"></span> EN CURSO</span>
                  <button className="btn-outline-lg" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate(`/torneos/${t.id}`)}>
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="section" style={{ textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <p>&copy; 2025 UEB SPORT - Universidad Estatal de Bolívar</p>
      </footer>
    </div>
  );
};

export default Home;
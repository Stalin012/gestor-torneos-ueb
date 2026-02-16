import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Calendar,
  Activity,
  Award,
  Zap,
  Target,
  BarChart3,
  Clock,
  MapPin,
  Star,
  Plus,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Menu
} from "lucide-react";

import LoadingScreen from "../../components/LoadingScreen";
import { StatCard } from "../../components/StatCards";
import api from "../../api";
import "../../css/dashboard-styles.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    torneos: { total: 0, activos: 0, finalizados: 0 },
    partidos: { total: 0, hoy: 0, pendientes: 0, finalizados: 0 },
    equipos: { total: 0, nuevos: 0 },
    jugadores: { total: 0, activos: 0 },
    deportes: { total: 0 },
    categorias: { total: 0 },
  });

  const [torneos, setTorneos] = useState([]);
  const [proximosPartidos, setProximosPartidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const [torneosData, partidosData, equiposData, jugadoresData, deportesData, categoriasData] = await Promise.all([
        api.get('/torneos').catch(() => ({ data: [] })),
        api.get('/partidos').catch(() => ({ data: [] })),
        api.get('/equipos').catch(() => ({ data: [] })),
        api.get('/jugadores').catch(() => ({ data: [] })),
        api.get('/deportes').catch(() => ({ data: [] })),
        api.get('/categorias').catch(() => ({ data: [] })),
      ]);

      const torneosArray = Array.isArray(torneosData?.data) ? torneosData.data : (Array.isArray(torneosData) ? torneosData : []);
      const partidosArray = Array.isArray(partidosData?.data) ? partidosData.data : (Array.isArray(partidosData) ? partidosData : []);
      const equiposArray = Array.isArray(equiposData?.data) ? equiposData.data : (Array.isArray(equiposData) ? equiposData : []);
      const jugadoresArray = Array.isArray(jugadoresData?.data) ? jugadoresData.data : (Array.isArray(jugadoresData) ? jugadoresData : []);
      const deportesArray = Array.isArray(deportesData?.data) ? deportesData.data : (Array.isArray(deportesData) ? deportesData : []);
      const categoriasArray = Array.isArray(categoriasData?.data) ? categoriasData.data : (Array.isArray(categoriasData) ? categoriasData : []);

      setTorneos(torneosArray.slice(0, 5));
      setProximosPartidos(partidosArray.filter(p => p.estado === "Programado").slice(0, 6));

      setStats({
        torneos: {
          total: torneosArray.length,
          activos: torneosArray.filter(t => t.estado === "Activo").length,
          finalizados: torneosArray.filter(t => t.estado === "Finalizado").length,
        },
        partidos: {
          total: partidosArray.length,
          hoy: 0,
          pendientes: partidosArray.filter(p => p.estado === "Programado").length,
          finalizados: partidosArray.filter(p => p.estado === "Finalizado").length,
        },
        equipos: {
          total: equiposArray.length,
          nuevos: 0,
        },
        jugadores: {
          total: jugadoresArray.length,
          activos: jugadoresArray.filter(j => j.activo !== false).length,
        },
        deportes: {
          total: deportesArray.length,
        },
        categorias: {
          total: categoriasArray.length,
        },
      });

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <LoadingScreen message="SINCRONIZANDO PANEL DE CONTROL..." />;
  }

  const quickActions = [
    { icon: Trophy, label: "Nuevo Torneo", path: "/admin/torneos-deportes", color: "#3b82f6" },
    { icon: Calendar, label: "Programar Partido", path: "/admin/partidos", color: "#10b981" },
    { icon: Users, label: "Registrar Equipo", path: "/admin/equipos", color: "#8b5cf6" },
    { icon: Star, label: "Nuevo Jugador", path: "/admin/jugadores", color: "#f59e0b" },
  ];

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '100%', 
      padding: '0', 
      margin: '0',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="dashboard-header-layout">
          <div>
            <span style={{ 
              color: 'var(--primary)', 
              fontWeight: 800, 
              fontSize: '0.75rem', 
              letterSpacing: '2px', 
              textTransform: 'uppercase' 
            }}>Sistema Integral</span>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              color: 'var(--text-primary)', 
              margin: '0.5rem 0',
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Panel Administrativo</h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem',
              margin: 0
            }}>Gestión centralizada de la actividad deportiva institucional</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              className="pro-card"
              onClick={() => navigate(action.path)}
              style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{
                background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)`,
                padding: '12px',
                borderRadius: '12px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: '1rem', 
                  color: 'var(--text-primary)' 
                }}>{action.label}</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          )
        })}
      </div>

      {/* STATS SECTION (KPIs) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div className="pro-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '1rem' 
          }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={24} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            color: '#3b82f6', 
            marginBottom: '0.5rem' 
          }}>{stats.torneos.total}</div>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: 'var(--text-secondary)' 
          }}>Torneos Totales</div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginTop: '0.25rem' 
          }}>{stats.torneos.activos} activos</div>
        </div>
        
        <div className="pro-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '1rem' 
          }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #10b981, #047857)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={24} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            color: '#10b981', 
            marginBottom: '0.5rem' 
          }}>{stats.partidos.pendientes}</div>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: 'var(--text-secondary)' 
          }}>Partidos Pendientes</div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginTop: '0.25rem' 
          }}>{stats.partidos.total} total</div>
        </div>
        
        <div className="pro-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '1rem' 
          }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            color: '#8b5cf6', 
            marginBottom: '0.5rem' 
          }}>{stats.equipos.total}</div>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: 'var(--text-secondary)' 
          }}>Equipos Inscritos</div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginTop: '0.25rem' 
          }}>En competencia</div>
        </div>
        
        <div className="pro-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '1rem' 
          }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={24} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            color: '#f59e0b', 
            marginBottom: '0.5rem' 
          }}>{stats.jugadores.total}</div>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: 'var(--text-secondary)' 
          }}>Total Atletas</div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginTop: '0.25rem' 
          }}>{stats.jugadores.activos} activos</div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '2rem'
      }}>
        {/* PROXIMOS PARTIDOS */}
        <div className="pro-card">
          <div className="pro-card-header">
            <h2 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              <Activity size={24} style={{ color: '#3b82f6' }} /> 
              Próximos Encuentros
            </h2>
            <button 
              className="pro-btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              onClick={() => navigate('/admin/partidos')}
            >
              Ver Todos <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {proximosPartidos.length > 0 ? (
              proximosPartidos.map((p) => (
                <div 
                  key={p.id} 
                  className="pro-card"
                  style={{ 
                    padding: '1.25rem', 
                    cursor: 'pointer', 
                    marginBottom: 0,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => navigate(`/admin/partidos/${p.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    color: 'var(--text-muted)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} /> 
                      {p.fecha?.split('T')[0]} • {p.hora?.substring(0, 5)}
                    </span>
                    <span style={{ color: '#3b82f6' }}>{p.torneo?.nombre}</span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '1rem' 
                  }}>
                    <div style={{ 
                      flex: 1, 
                      textAlign: 'right', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)' 
                    }}>
                      {p.equipoLocal?.nombre || 'Local'}
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '20px',
                      color: '#3b82f6',
                      fontWeight: 900,
                      fontSize: '0.875rem'
                    }}>
                      VS
                    </div>
                    <div style={{ 
                      flex: 1, 
                      textAlign: 'left', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)' 
                    }}>
                      {p.equipoVisitante?.nombre || 'Visita'}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginTop: '1rem', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)' 
                  }}>
                    <MapPin size={14} /> 
                    {p.lugar || 'Cancha Central'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Calendar size={48} style={{ 
                  margin: '0 auto 1rem', 
                  opacity: 0.2,
                  color: 'var(--text-muted)'
                }} />
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  No hay partidos próximos programados
                </p>
                <button 
                  className="pro-btn btn-primary"
                  onClick={() => navigate('/admin/partidos')}
                >
                  <Plus size={18} /> Programar Ahora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TORNEOS RECIENTES */}
        <div className="pro-card">
          <div className="pro-card-header">
            <h2 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              <Trophy size={24} style={{ color: '#f59e0b' }} /> 
              Torneos Activos
            </h2>
            <button 
              className="pro-btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              onClick={() => navigate('/admin/torneos-deportes')}
            >
              Gestionar <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Torneo</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {torneos.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t.nombre}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-muted)', 
                        fontWeight: 500 
                      }}>
                        {t.deporte?.nombre}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="icon-btn"
                        onClick={() => navigate(`/admin/torneos/${t.id}`)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#3b82f6';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {torneos.length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: 'var(--text-muted)' 
                    }}>
                      Sin torneos activos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
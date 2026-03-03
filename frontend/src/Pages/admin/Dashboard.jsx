import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Users, Calendar, Activity, Award, Zap, Target, BarChart3, Clock, MapPin, Star, Plus,
  ChevronRight, ShieldCheck, TrendingUp, Menu, Layout, UserCheck, Shield, GraduationCap, ArrowRight,
  TrendingDown, Info, AlertCircle
} from "lucide-react";
import LoadingScreen from "../../components/LoadingScreen";
import api from "../../api";

// ================= HELPERS =====================
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="pro-card dashboard-fade" style={{
    padding: '2rem',
    borderRadius: '28px',
    background: 'rgba(30, 41, 59, 0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    overflow: 'hidden',
    transition: '0.4s'
  }}>
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: `${color}10`, borderRadius: '50%', filter: 'blur(40px)' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={28} />
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
          <TrendingUp size={14} /> {trend}
        </div>
      )}
    </div>
    <div style={{ marginTop: '1.5rem', position: 'relative' }}>
      <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>{value}</h3>
      <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>{title}</p>
    </div>
  </div>
);

// ================= MAIN COMPONENT =====================
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    torneos: 0,
    partidos: 0,
    equipos: 0,
    jugadores: 0,
    arbitros: 0
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [t, p, e, j, a] = await Promise.all([
        api.get('/torneos'),
        api.get('/partidos'),
        api.get('/equipos'),
        api.get('/jugadores'),
        api.get('/arbitros')
      ]);
      setStats({
        torneos: (t.data?.data || t.data || []).length,
        partidos: (p.data?.data || p.data || []).filter(item => item.estado === 'Programado').length,
        equipos: (e.data?.data || e.data || []).length,
        jugadores: (j.data?.data || j.data || []).length,
        arbitros: (a.data?.data || a.data || []).length
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingScreen message="Sincronizando Inteligencia Deportiva..." />;

  const quickActions = [
    { label: 'Torneos', icon: Trophy, path: '/admin/torneos', color: '#6366f1', desc: 'Gestionar competencias' },
    { label: 'Equipos', icon: Users, path: '/admin/equipos', color: '#10b981', desc: 'Control de clubes' },
    { label: 'Encuentros', icon: Calendar, path: '/admin/partidos', color: '#f59e0b', desc: 'Logística de partidos' },
    { label: 'Nómina', icon: GraduationCap, path: '/admin/jugadores', color: '#3b82f6', desc: 'Base de deportistas' }
  ];

  return (
    <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* HEADER HERO */}
      <header style={{
        padding: '3rem',
        borderRadius: '32px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1541252260730-0412e3e2107e?auto=format&fit=crop&q=80&w=1200") center/cover',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6366f1', marginBottom: '1rem' }}>
            <Zap size={20} fill="#6366f1" />
            <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Gestión Deportiva UEB</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>Panel de Control</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginTop: '1rem', maxWidth: '600px' }}>Supervisión centralizada del contingente deportivo, logística operativa y rendimiento de torneos institucionales.</p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            <button
              onClick={() => navigate('/admin/torneos')}
              className="pro-btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '1rem 2rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}
            >
              Ver Torneos Activos <ArrowRight size={18} style={{ marginLeft: '10px' }} />
            </button>
            <button
              onClick={() => navigate('/admin/configuracion')}
              className="pro-btn btn-secondary"
              style={{ padding: '1rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Configuración General
            </button>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <div style={{ color: '#10b981', fontWeight: 900, fontSize: '2rem' }}>{stats.partidos}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>Próximos Partidos</div>
          </div>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <div style={{ color: '#3b82f6', fontWeight: 900, fontSize: '2rem' }}>{stats.jugadores}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>Deportistas Registrados</div>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <StatCard title="Torneos Totales" value={stats.torneos} icon={Trophy} color="#6366f1" trend="+12%" />
        <StatCard title="Clubes Afiliados" value={stats.equipos} icon={Users} color="#10b981" trend="+5%" />
        <StatCard title="Jueces Certificados" value={stats.arbitros} icon={ShieldCheck} color="#3b82f6" trend="Ok" />
      </div>

      {/* QUICK ACTIONS & MODULES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>

        {/* ACCESOS DIRECTOS */}
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Layout size={24} color="#6366f1" /> Módulos Operativos
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {quickActions.map(action => (
              <div
                key={action.label}
                onClick={() => navigate(action.path)}
                style={{
                  padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.3s',
                  display: 'flex', alignItems: 'center', gap: '1.5rem'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <action.icon size={24} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{action.label}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{action.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM INFO */}
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info size={20} color="#3b82f6" /> Estado del Sistema
          </h3>

          <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Base de Datos</span>
              </div>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>Sincronizado</span>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={18} color="#3b82f6" />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>API Backend</span>
              </div>
              <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 800 }}>Latencia: 24ms</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '24px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Aviso de Operación</span>
                <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>Existen 12 inscripciones de equipos pendientes de revisión técnica para el próximo torneo.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;

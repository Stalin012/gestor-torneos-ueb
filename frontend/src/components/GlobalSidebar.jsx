import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import { 
    LayoutDashboard, 
    Trophy, 
    Users, 
    User, 
    Settings, 
    Calendar, 
    FileText, 
    Shield,
    Image,
    Activity,
    ClipboardList
} from 'lucide-react';
import '../css/unified-all.css';
import '../css/unified-navigation.css';

const getIcon = (label) => {
  if (!label) return <FileText size={20} />;
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('dashboard')) return <LayoutDashboard size={20} />;
  if (lowerLabel.includes('torneo')) return <Trophy size={20} />;
  if (lowerLabel.includes('equipo')) return <Users size={20} />;
  if (lowerLabel.includes('jugador')) return <User size={20} />;
  if (lowerLabel.includes('nómina')) return <ClipboardList size={20} />;
  if (lowerLabel.includes('perfil')) return <User size={20} />;
  if (lowerLabel.includes('config')) return <Settings size={20} />;
  if (lowerLabel.includes('calendario')) return <Calendar size={20} />;
  if (lowerLabel.includes('inscrip')) return <FileText size={20} />;
  if (lowerLabel.includes('partido')) return <Activity size={20} />;
  if (lowerLabel.includes('árbitro')) return <Shield size={20} />;
  if (lowerLabel.includes('galería')) return <Image size={20} />;
  if (lowerLabel.includes('estadística')) return <Activity size={20} />;
  return <FileText size={20} />;
};

const GlobalSidebar = memo(({ links, role, onLogout, isOpen, isCollapsed }) => {
  return (
    <aside className={`global-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <Logo size="sm" showText={false} />
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link, index) => (
          <NavLink
            key={index}
            to={link.to}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
            title={!isOpen ? link.label : ''}
          >
            {getIcon(link.label)}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
});

export default GlobalSidebar;
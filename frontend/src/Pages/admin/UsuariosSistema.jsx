import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Search, User, CheckCircle,
    Shield, Mail, ArrowUpDown, Users, UserPlus, ShieldCheck,
    Filter, X, Save, Lock, Smartphone, MoreHorizontal, GraduationCap, ChevronRight, IdCard, UserCheck
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import api from '../../api';
import UsuarioModal from '../../components/UsuarioModal';
import CarnetModal from '../../components/CarnetModal';
import { useNotification } from '../../context/NotificationContext';
import { getAssetUrl } from '../../utils/helpers';

// ================= HELPERS / CONSTANTS =====================
const ROLES = ['Administrador', 'Representante', 'Árbitro', 'Jugador'];

// ================= MAIN COMPONENT =====================
const UsuariosSistema = () => {
    const { addNotification } = useNotification();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUsuario, setCurrentUsuario] = useState(null);
    const [carnetUsuario, setCarnetUsuario] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await api.get('/usuarios');
            setUsuarios(Array.isArray(resp.data) ? resp.data : (resp.data?.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async (data, isEdit) => {
        // Since UsuarioModal handles its own internal saving or we pass a callback
        // Usually, in this codebase, the modal might call an API or we handle it here.
        // I'll keep the existing logic structure if it involves a separate component.
        loadData();
    };

    const handleDelete = async (cedula) => {
        if (!confirm("¿Deseas revocar el acceso a este usuario definitivamente?")) return;
        setLoading(true);
        try {
            await api.delete(`/usuarios/${cedula}`);
            addNotification('Acceso revocado', 'success');
            loadData();
        } catch (err) {
            addNotification('Error al eliminar usuario.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsuarios = (usuarios || []).filter(u => {
        if (!u) return false;
        const nombreCompleto = `${u.persona?.nombres || ''} ${u.persona?.apellidos || ''}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        return nombreCompleto.includes(search) ||
            (u.email || '').toLowerCase().includes(search) ||
            (u.cedula || '').includes(searchTerm);
    });

    if (loading && usuarios.length === 0) return <LoadingScreen message="Verificando Protocolos de Acceso..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* HEADER */}
            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div className="header-info" style={{ minWidth: '300px', flex: '1' }}>
                        <small className="university-label" style={{ color: '#f59e0b', fontWeight: 800 }}>Seguridad & Permisos</small>
                        <h1 className="content-title" style={{ color: '#fff', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                            <ShieldCheck size={32} color="#f59e0b" /> Usuarios del Sistema
                        </h1>
                        <p className="content-subtitle" style={{ color: '#94a3b8' }}>Control de identidades, roles administrativos y auditoría de accesos corporativos</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button className="pro-btn btn-secondary" style={{ padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>
                            <Lock size={18} /> Roles
                        </button>
                        <button className="pro-btn btn-primary" onClick={() => { setCurrentUsuario(null); setIsModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '0.8rem 1.5rem', borderRadius: '14px', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)', whiteSpace: 'nowrap' }}>
                            <UserPlus size={20} /> Nuevo Operador
                        </button>
                    </div>
                </div>
            </header>

            {/* SEARCH AND STATS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                alignItems: 'start'
            }}>
                <div className="search-wrapper" style={{ margin: 0, width: '100%' }}>
                    <Search size={20} className="search-icon" style={{ color: '#f59e0b' }} />
                    <input
                        className="pro-input"
                        placeholder="Filtrar por nombre, CI o email..."
                        style={{ paddingLeft: '3.5rem', height: '54px', borderRadius: '20px', width: '100%' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '1rem',
                    width: '100%'
                }}>
                    {[
                        { label: 'Cuentas Activas', value: usuarios.filter(u => u.estado).length, icon: UserCheck, color: '#10b981' },
                        { label: 'Administradores', value: usuarios.filter(u => u.rol?.toLowerCase().includes('admin')).length, icon: Shield, color: '#3b82f6' },
                        { label: 'Protocolos de Respaldo', value: '2FA', icon: Smartphone, color: '#6366f1' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            padding: '1rem',
                            background: 'rgba(30, 41, 59, 0.4)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                minWidth: '36px',
                                borderRadius: '10px',
                                background: `${stat.color}15`,
                                color: stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <stat.icon size={18} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{stat.value}</div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* USERS LIST (TABLE VIEW) */}
            <div className="rep-content-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
                <div style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <tr>
                                <th style={{ padding: '1.2rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Identidad / Usuario</th>
                                <th style={{ padding: '1.2rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Email Institucional</th>
                                <th style={{ padding: '1.2rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Rol Académico</th>
                                <th style={{ padding: '1.2rem', textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>Estatus</th>
                                <th style={{ padding: '1.2rem', textAlign: 'right', color: '#94a3b8', fontWeight: 800 }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsuarios.map(u => (
                                <tr key={u.cedula} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', overflow: 'hidden' }}>
                                                {u.persona?.foto_url || u.foto_url || u.foto ? (
                                                    <img
                                                        src={getAssetUrl(u.persona?.foto_url || u.foto_url || u.foto)}
                                                        alt="Foto"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = u.persona?.nombres?.charAt(0) || u.nombres?.charAt(0) || 'U';
                                                        }}
                                                    />
                                                ) : (
                                                    u.persona?.nombres?.charAt(0) || u.nombres?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                    {u.persona?.nombres || u.nombres} {u.persona?.apellidos || u.apellidos}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>CI: {u.cedula}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Mail size={14} /> {u.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        <span style={{ padding: '4px 10px', background: u.estado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: u.estado ? '#10b981' : '#ef4444', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>
                                            {u.estado ? 'ACTIVO' : 'RESTRINGIDO'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="pro-btn btn-secondary" style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none' }} title="Generar Credencial" onClick={() => setCarnetUsuario(u)}><IdCard size={15} /></button>
                                            <button className="pro-btn btn-secondary" style={{ padding: '8px', borderRadius: '10px' }} onClick={() => { setCurrentUsuario(u); setIsModalOpen(true); }}><Edit size={15} /></button>
                                            <button className="pro-btn btn-danger" style={{ padding: '8px', borderRadius: '10px' }} onClick={() => handleDelete(u.cedula)}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            <UsuarioModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); loadData(); }}
                initialData={currentUsuario}
            />


            <CarnetModal
                isOpen={!!carnetUsuario}
                onClose={() => setCarnetUsuario(null)}
                data={carnetUsuario}
                endpointPrefix="usuarios"
            />

        </div>
    );
};

export default UsuariosSistema;

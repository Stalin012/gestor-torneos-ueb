import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Search, User, CheckCircle,
    Shield, Mail, ArrowUpDown, Users, UserPlus, ShieldCheck
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import api from '../../api';
import UsuarioModal from '../../components/UsuarioModal';
import { StatCard } from "../../components/StatsComponents";

const UsuariosSistema = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUsuario, setCurrentUsuario] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [sortColumn, setSortColumn] = useState('cedula');
    const [sortDirection, setSortDirection] = useState('asc');

    const loadUsuarios = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const resp = await api.get(`/usuarios?page=${page}&search=${searchTerm}&sort_by=${sortColumn}&sort_direction=${sortDirection}`);
            const json = resp.data;
            setUsuarios(json.data || []);
            setPagination({
                current_page: json.current_page || 1,
                last_page: json.last_page || 1,
                total: json.total || (json.data ? json.data.length : 0),
            });
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, sortColumn, sortDirection]);

    useEffect(() => {
        loadUsuarios(pagination.current_page);
    }, [loadUsuarios, pagination.current_page]);

    const stats = useMemo(() => ({
        total: pagination.total,
        activos: usuarios.filter(u => u.estado).length,
        admins: usuarios.filter(u => u.rol?.toLowerCase().includes('admin')).length
    }), [usuarios, pagination.total]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleDeleteUsuario = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
        try {
            await api.delete(`/usuarios/${id}`);
            loadUsuarios(pagination.current_page);
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
        }
    };

    if (loading && usuarios.length === 0) {
        return <LoadingScreen message="Sincronizando base de usuarios..." />;
    }

    return (
        <div className="admin-page-container module-entrance">
            <header className="page-header-responsive" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Seguridad de Acceso</span>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0' }}>Sistemas y Usuarios</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Configuración de credenciales, roles y permisos administrativos</p>
                </div>
                <button className="pro-btn btn-primary" style={{ width: 'auto' }} onClick={() => { setCurrentUsuario(null); setIsModalOpen(true); }}>
                    <Plus size={20} /> Nuevo Operador
                </button>
            </header>

            <div className="responsive-grid" style={{ marginBottom: '3rem' }}>
                <StatCard title="Total Usuarios" value={stats.total} icon={Users} color="#356ed8" />
                <StatCard title="Cuentas Activas" value={stats.activos} icon={ShieldCheck} color="#10b981" />
                <StatCard title="Administradores" value={stats.admins} icon={Shield} color="#f59e0b" />
            </div>

            <div className="pro-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-darkest)', padding: '0.5rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '450px' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar operador por nombre, ID o email..."
                            className="pro-search-input"
                            style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem 0', width: '100%', outline: 'none' }}
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                        Resultados: <span style={{ color: '#fff' }}>{usuarios.length}</span> activos
                    </div>
                </div>

                <div className="table-responsive-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('cedula')} style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Documento <ArrowUpDown size={14} opacity={sortColumn === 'cedula' ? 1 : 0.4} />
                                    </div>
                                </th>
                                <th>Nombre y Apellido</th>
                                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Contacto / Email <ArrowUpDown size={14} opacity={sortColumn === 'email' ? 1 : 0.4} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('rol')} style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Rol <ArrowUpDown size={14} opacity={sortColumn === 'rol' ? 1 : 0.4} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('estado')} style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Estatus <ArrowUpDown size={14} opacity={sortColumn === 'estado' ? 1 : 0.4} />
                                    </div>
                                </th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length > 0 ? (
                                usuarios.map((usuario) => (
                                    <tr key={usuario.cedula}>
                                        <td><span style={{ fontWeight: 800, color: 'var(--primary)' }}>{usuario.cedula}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '10px',
                                                    background: 'rgba(53, 110, 216, 0.1)', color: 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 900, fontSize: '0.9rem', border: '1px solid rgba(53, 110, 216, 0.2)'
                                                }}>
                                                    {usuario.persona?.nombres?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#fff' }}>
                                                        {usuario.persona?.nombres} {usuario.persona?.apellidos}
                                                    </div>
                                                    <div className="hide-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operador de Sistema</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hide-mobile">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                                <Mail size={14} /> {usuario.email}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="status-pill info" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                                {usuario.rol}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${usuario.estado ? 'success' : 'danger'}`}>
                                                {usuario.estado ? 'Activo' : 'Restringido'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                <button className="icon-btn" onClick={() => { setCurrentUsuario(usuario); setIsModalOpen(true); }} title="Editar">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteUsuario(usuario.cedula)} title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                        <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.1, margin: '0 auto' }} />
                                        <p>No se encontraron registros que coincidan con la búsqueda.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1rem 0 1rem', borderTop: '1px solid var(--border)' }}>
                        <button className="pro-btn btn-secondary" onClick={() => loadUsuarios(pagination.current_page - 1)} disabled={pagination.current_page === 1}>
                            Anterior
                        </button>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Página <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{pagination.current_page}</span> de {pagination.last_page}
                        </div>
                        <button className="pro-btn btn-secondary" onClick={() => loadUsuarios(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            <UsuarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={currentUsuario}
                onSave={() => { setIsModalOpen(false); loadUsuarios(); }}
            />
        </div>
    );
};

export default UsuariosSistema;

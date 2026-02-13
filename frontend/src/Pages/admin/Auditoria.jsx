// resources/js/pages/admin/Auditoria.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Search, User, Clock, CheckCircle, X, AlertTriangle,
    Activity, FileText, Database, Settings, Eye, Filter, Calendar,
    Download, RefreshCw
} from 'lucide-react';

import LoadingScreen from '../../components/LoadingScreen';
import api from '../../api';

const Auditoria = () => {
    console.log('Auditoria component rendered');
    const navigate = useNavigate();
    const [auditLog, setAuditLog] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterEntity, setFilterEntity] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, today: 0, errors: 0, users: 0 });
    const [totalItems, setTotalItems] = useState(0);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAuditEntry, setSelectedAuditEntry] = useState(null);

    // Action type mapping for badges and icons
    const getActionConfig = (action) => {
        if (!action) return { class: 'badge-neutral', icon: null };

        const actionLower = action.toLowerCase();

        if (actionLower.includes('login') || actionLower.includes('acceso')) {
            return { class: 'badge-success', icon: <CheckCircle size={14} /> };
        }
        if (actionLower.includes('logout') || actionLower.includes('salida')) {
            return { class: 'badge-warning', icon: <X size={14} /> };
        }
        if (actionLower.includes('crear') || actionLower.includes('creación')) {
            return { class: 'badge-success', icon: <CheckCircle size={14} /> };
        }
        if (actionLower.includes('actualizar') || actionLower.includes('modificar')) {
            return { class: 'badge-info', icon: <Settings size={14} /> };
        }
        if (actionLower.includes('eliminar') || actionLower.includes('borrar')) {
            return { class: 'badge-danger', icon: <X size={14} /> };
        }
        if (actionLower.includes('error') || actionLower.includes('fallo')) {
            return { class: 'badge-danger', icon: <AlertTriangle size={14} /> };
        }

        return { class: 'badge-neutral', icon: <Activity size={14} /> };
    };

    // Load audit data from API
    const loadAuditData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                q: searchTerm,
                filterAction: filterAction,
                filterEntity: filterEntity,
                startDate: dateRange.start,
                endDate: dateRange.end,
            };

            const response = await api.get('/auditoria', { params });

            const apiData = response.data;
            let data = [];

            if (Array.isArray(apiData)) {
                // If the API returns a direct array (non-paginated)
                data = apiData;
                setTotalItems(apiData.length);
            } else if (apiData && Array.isArray(apiData.data)) {
                // If the API returns paginated data (e.g., { data: [...], last_page: N, total: M })
                data = apiData.data;
                setTotalItems(apiData.total || 0);
            }


            console.log('Audit data received:', data);

            if (Array.isArray(data)) {
                const normalizedData = data.map(item => ({
                    id: item.id || Math.random().toString(36).substr(2, 9), // ID único si no existe
                    timestamp: item.timestamp || item.created_at || new Date().toISOString(),
                    user: item.usuario ?
                        `${item.usuario.persona?.nombres || ''} ${item.usuario.persona?.apellidos || ''} (${item.usuario.cedula})`.trim() :
                        item.usuario_cedula || item.username || item.user || 'Sistema',
                    action: item.accion || item.action || 'Desconocida',
                    entity: item.entidad || item.entity || 'General',
                    entityId: item.entidad_id || item.entity_id || item.id_entidad || item.id_entity || '-',
                    detail: item.detalle || item.detail || item.descripcion || item.description || '',
                    ip: item.ip_address || item.ip || item.direccion_ip || '-',
                    userAgent: item.user_agent || item.navegador || '-',
                    status: item.estado || item.status || 'completado',
                    module: item.modulo || item.module || 'General',
                    originalData: item // Guardar datos originales para acceso completo
                }));

                setAuditLog(normalizedData);
                console.log('Normalized Audit Data:', normalizedData);

                // Calculate comprehensive stats
                const today = new Date().toDateString();
                const todayCount = normalizedData.filter(item =>
                    new Date(item.timestamp).toDateString() === today
                ).length;

                const errorCount = normalizedData.filter(item =>
                    item.action?.toLowerCase().includes('error') ||
                    item.action?.toLowerCase().includes('fallo') ||
                    item.action?.toLowerCase().includes('failed') ||
                    item.status?.toLowerCase().includes('error')
                ).length;

                const uniqueUsers = new Set(normalizedData.map(item => item.user)).size;
                const uniqueEntities = new Set(normalizedData.map(item => item.entity)).size;
                const uniqueModules = new Set(normalizedData.map(item => item.module)).size;

                setStats({
                    total: normalizedData.length,
                    today: todayCount,
                    errors: errorCount,
                    users: uniqueUsers,
                    entities: uniqueEntities,
                    modules: uniqueModules
                });
            } else {
                setAuditLog([]);
            }
        } catch (err) {
            console.error('Error loading audit data:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Filter and sort audit log
    const filteredAuditLog = useMemo(() => {
        const filtered = auditLog
            .filter(entry => {
                const searchMatch = !searchTerm ||
                    entry.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.detail?.toLowerCase().includes(searchTerm.toLowerCase());

                const actionMatch = !filterAction || entry.action === filterAction;
                const entityMatch = !filterEntity || entry.entity === filterEntity;

                const dateMatch = (!dateRange.start || new Date(entry.timestamp) >= new Date(dateRange.start)) &&
                    (!dateRange.end || new Date(entry.timestamp) <= new Date(dateRange.end));

                return searchMatch && actionMatch && entityMatch && dateMatch;
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log('Filtered Audit Log:', filtered);
        return filtered;
    }, [auditLog, searchTerm, filterAction, filterEntity, dateRange]);

    // Get unique actions and entities for filters
    const uniqueActions = useMemo(() =>
        [...new Set(auditLog.map(item => item.action).filter(Boolean))],
        [auditLog]
    );

    const uniqueEntities = useMemo(() =>
        [...new Set(auditLog.map(item => item.entity).filter(Boolean))],
        [auditLog]
    );

    useEffect(() => {
        loadAuditData();
    }, [loadAuditData]);

    const formatDateTime = (timestamp) => {
        if (!timestamp) return '-';
        try {
            return new Date(timestamp).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return timestamp;
        }
    };

    if (loading) return <LoadingScreen message="AUDITANDO EVENTOS..." />;

    return (
        <div className="admin-page-container fade-enter" style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>

            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ fontSize: '2.25rem', fontWeight: 700, color: '#e2e8f0' }}>
                    <Shield size={32} style={{ marginRight: '0.75rem', color: '#60a5fa' }} />
                    Auditoría del Sistema
                </h1>
                {/* Detail Modal */}
                {showDetailModal && selectedAuditEntry && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="modal-content" style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '1.5rem', width: '80%', maxWidth: '800px', minWidth: '0px', minHeight: '0px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)' }}>
                            <h2 className="modal-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0px', borderBottom: '1px solid #334155', paddingBottom: '0px' }}>
                                Detalles del Evento de Auditoría
                            </h2>
                            <div className="modal-body" style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: '1rem', minWidth: '0px', minHeight: '0px' }}>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>ID del Evento:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>{selectedAuditEntry.id}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>Fecha y Hora:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>{formatDateTime(selectedAuditEntry.timestamp)}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>Usuario:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>{selectedAuditEntry.user}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>Acción:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>{selectedAuditEntry.action}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>Entidad:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>{selectedAuditEntry.entity}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>ID de Entidad:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>{selectedAuditEntry.entityId}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>Detalle:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{selectedAuditEntry.detail}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>Dirección IP:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>{selectedAuditEntry.ip}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>User Agent:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{selectedAuditEntry.userAgent}</p>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '0px' }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>Módulo:</p>
                                    <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>{selectedAuditEntry.module}</p>
                                </div>
                                {selectedAuditEntry.originalData && (
                                    <div className="detail-item" style={{ marginBottom: '0px' }}>
                                        <p style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '0px' }}>Datos Originales:</p>
                                        <pre style={{ backgroundColor: '#0f172a', color: '#FFFFFF', padding: '0px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.8rem' }}>
                                            {JSON.stringify(selectedAuditEntry.originalData, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0px', paddingTop: '0px', borderTop: '1px solid #334155' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{
                                        backgroundColor: '#475569',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 600
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#64748b'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#475569'}
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="card-grid" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
                <div className="mini-card" style={{ width: '100px', height: '100px', padding: '0.75rem', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div className="mini-card-icon" style={{ backgroundColor: '#3468c0', color: 'white', borderRadius: '4px', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                        <FileText size={14} />
                    </div>
                    <div className="mini-card-title" style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.125rem' }}>Total Registros</div>
                    <div className="mini-card-value" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>{stats.total}</div>
                </div>

                <div className="mini-card" style={{ width: '100px', height: '100px', padding: '0.75rem', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div className="mini-card-icon" style={{ backgroundColor: '#28a745', color: 'white', borderRadius: '4px', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                        <Calendar size={14} />
                    </div>
                    <div className="mini-card-title" style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.125rem' }}>Hoy</div>
                    <div className="mini-card-value" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>{stats.today}</div>
                    <div className="mini-card-trend trend-up" style={{ fontSize: '0.55rem', color: '#28a745', marginTop: '0.125rem' }}>Actividad diaria</div>
                </div>

                <div className="mini-card" style={{ width: '100px', height: '100px', padding: '0.75rem', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div className="mini-card-icon" style={{ backgroundColor: '#dc3545', color: 'white', borderRadius: '4px', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                        <X size={14} />
                    </div>
                    <div className="mini-card-title" style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.125rem' }}>Errores</div>
                    <div className="mini-card-value" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>{stats.errors}</div>
                    <div className="mini-card-trend trend-down" style={{ fontSize: '0.55rem', color: '#dc3545', marginTop: '0.125rem' }}>Eventos fallidos</div>
                </div>

                <div className="mini-card" style={{ width: '100px', height: '100px', padding: '0.75rem', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div className="mini-card-icon" style={{ backgroundColor: '#6f42c1', color: 'white', borderRadius: '4px', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                        <User size={14} />
                    </div>
                    <div className="mini-card-title" style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.125rem' }}>Usuarios Únicos</div>
                    <div className="mini-card-value" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>{stats.users}</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="fixtures-card" style={{ padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b' }}>
                {/* Filters */}
                <div className="filters-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="filter-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Buscar eventos</label>
                        <div className="search-input" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                            <input
                                type="text"
                                className="pro-input"
                                style={{
                                    paddingLeft: '40px',
                                    borderRadius: '8px',
                                    border: '1px solid #334155',
                                    backgroundColor: '#0f172a',
                                    color: '#e2e8f0',
                                    height: '40px',
                                    transition: 'border-color 0.2s, box-shadow 0.2s'
                                }}
                                placeholder="Usuario, acción, entidad..."
                                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.5)'}
                                onBlur={(e) => e.target.style.boxShadow = 'none'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="filter-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Tipo de Acción</label>
                        <select
                            className="pro-input"
                            style={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0', height: '40px', appearance: 'none', padding: '0 12px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.5)'}
                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                        >
                            <option value="">Todas las acciones</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="filter-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Entidad</label>
                        <select
                            className="pro-input"
                            style={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0', height: '40px', appearance: 'none', padding: '0 12px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                            value={filterEntity}
                            onChange={(e) => setFilterEntity(e.target.value)}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.5)'}
                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                        >
                            <option value="">Todas las entidades</option>
                            {uniqueEntities.map(entity => (
                                <option key={entity} value={entity}>{entity}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="filter-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Fecha Inicio</label>
                        <input
                            type="date"
                            className="pro-input"
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: '#e2e8f0',
                                height: '40px',
                                padding: '0 12px',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.5)'}
                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="filter-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Fecha Fin</label>
                        <input
                            type="date"
                            className="pro-input"
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: '#e2e8f0',
                                height: '40px',
                                padding: '0 12px',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.5)'}
                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <label className="filter-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Acciones</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={loadAuditData}
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#60a5fa';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <RefreshCw size={16} />
                                Actualizar
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterAction('');
                                    setFilterEntity('');
                                    setDateRange({ start: '', end: '' });
                                    // loadAuditData will be called by useEffect due to state changes
                                }}
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    backgroundColor: 'transparent',
                                    color: '#94a3b8',
                                    border: '1px solid #64748b',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a8a29e'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#64748b'}
                            >
                                <Filter size={16} />
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit Table */}
                {filteredAuditLog.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Shield size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#e2e8f0' }}>No hay registros</h3>
                        <p style={{ margin: 0, fontSize: '1rem' }}>No se encontraron registros de auditoría con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto', marginTop: '2rem', borderRadius: '12px', border: '1px solid #334155' }}>
                        <table className="glass-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, backgroundColor: '#1e293b' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>Fecha/Hora</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>Usuario</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>Acción</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>Entidad</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>ID Entidad</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>Módulo</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>IP</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>Detalle</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #334155' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAuditLog.map((entry) => {
                                    const actionConfig = getActionConfig(entry.action);
                                    return (
                                        <tr key={entry.id} className="match-row" style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.3s ease' }}>
                                            <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                                <div className="match-datetime" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Clock size={14} style={{ color: '#94a3b8' }} />
                                                    <span>{formatDateTime(entry.timestamp)}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <User size={14} style={{ color: '#94a3b8' }} />
                                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                                        {entry.user}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`match-status ${actionConfig.class.replace('badge-', 'status-')}`}>
                                                    {actionConfig.icon}
                                                    {entry.action}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="tournament-badge">
                                                    {entry.entity || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'white' }}>
                                                    {entry.detail || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="tournament-badge" style={{ fontSize: '0.8rem' }}>
                                                    {entry.module || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                                    {entry.ip || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`match-status status-${entry.status?.toLowerCase().replace(' ', '-')}`}>
                                                    {entry.status || '-'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.9rem', color: '#0b293b' }}>
                                                {entry.detail || '-'}
                                            </td>
                                            <td>
                                                <button
                                                    className="action-btn"
                                                    title="Ver detalles completos"
                                                    onClick={() => {
                                                        setSelectedAuditEntry(entry);
                                                        setShowDetailModal(true);
                                                    }}
                                                    style={{
                                                        backgroundColor: '#475569',
                                                        color: 'white',
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: 'none',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#64748b'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#475569'}
                                                >
                                                    <Eye size={14} />
                                                    Ver Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
            </div>


        </div>
    );
};

export default Auditoria;

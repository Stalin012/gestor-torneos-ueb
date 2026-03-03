import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
    Shield, Search, User, Clock, CheckCircle, X, AlertTriangle,
    Activity, FileText, Database, Settings, Eye, Filter, Calendar,
    Download, RefreshCw, Smartphone, Globe, Layers, MoreHorizontal,
    ChevronRight, ArrowRight, ShieldAlert, ShieldCheck
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import api from '../../api';

// ================= HELPERS =====================
const getActionColor = (action) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('crear') || act.includes('login')) return '#10b981';
    if (act.includes('eliminar') || act.includes('error')) return '#ef4444';
    if (act.includes('actualizar') || act.includes('modificar')) return '#3b82f6';
    return '#94a3b8';
};

// ================= MODALS =====================
const DetailModal = ({ isOpen, onClose, entry }) => {
    if (!isOpen || !entry) return null;

    return createPortal(
        <div className="modal-overlay fade-in" style={{ zIndex: 1200 }}>
            <div className="modal-content modal-md scale-in" onClick={e => e.stopPropagation()} style={{ borderRadius: '32px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ color: '#fff' }}>Registro Analítico</h2>
                            <p className="modal-subtitle">ID: #{entry.id}</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose} style={{ color: '#fff' }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                <small style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Operador</small>
                                <div style={{ color: '#fff', fontWeight: 700, marginTop: '5px' }}>{entry.user}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                <small style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Timestamp</small>
                                <div style={{ color: '#fff', fontWeight: 700, marginTop: '5px' }}>{new Date(entry.timestamp).toLocaleString()}</div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Acción Ejecutada:</span>
                                <span style={{ color: getActionColor(entry.action), fontWeight: 900, textTransform: 'uppercase', fontSize: '0.85rem' }}>{entry.action}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Entidad Afectada:</span>
                                <span style={{ color: '#fff', fontWeight: 700 }}>{entry.entity} (Ref: {entry.entityId})</span>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '1rem 0' }} />
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>Descripción Técnica:</div>
                            <div style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.5 }}>{entry.detail || 'Sin detalles adicionales registrados.'}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Globe size={16} color="#64748b" />
                                <div>
                                    <small style={{ color: '#64748b', fontSize: '0.6rem', display: 'block' }}>Dirección IP</small>
                                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>{entry.ip}</span>
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Smartphone size={16} color="#64748b" />
                                <div>
                                    <small style={{ color: '#64748b', fontSize: '0.6rem', display: 'block' }}>Navegador / Agente</small>
                                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '120px' }} title={entry.userAgent}>{entry.userAgent}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem 2rem' }}>
                    <button className="pro-btn btn-secondary" onClick={onClose} style={{ border: 'none', width: '100%' }}>Finalizar Revisión</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ================= MAIN COMPONENT =====================
const Auditoria = () => {
    const navigate = useNavigate();
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await api.get('/auditoria');
            const data = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);

            // Normalize data
            const normalized = data.map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                timestamp: item.timestamp || item.created_at || new Date().toISOString(),
                user: item.usuario ? `${item.usuario.persona?.nombres} ${item.usuario.persona?.apellidos}` : (item.usuario_cedula || 'Sistema'),
                action: item.accion || 'General',
                entity: item.entidad || '-',
                entityId: item.entidad_id || '-',
                detail: item.detalle || item.observacion || '',
                ip: item.ip || item.ip_address || '-',
                userAgent: item.user_agent || '-',
                status: item.estado || 'OK'
            }));

            setAuditLog(normalized);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredLog = auditLog.filter(item =>
        item.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.entity?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (loading && auditLog.length === 0) return <LoadingScreen message="Consolidando Registros de Seguridad..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* HEADER */}
            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div className="header-info">
                        <small className="university-label" style={{ color: '#ef4444', fontWeight: 800 }}>Caja Negra de Operaciones</small>
                        <h1 className="content-title" style={{ color: '#fff', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Shield size={42} color="#ef4444" /> Auditoría del Sistema
                        </h1>
                        <p className="content-subtitle" style={{ color: '#94a3b8' }}>Monitorización de transacciones, trazabilidad de eventos y cumplimiento de protocolos institucionales</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="pro-btn btn-secondary" onClick={loadData} style={{ padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <RefreshCw size={18} /> Sincronizar
                        </button>
                        <button className="pro-btn btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: '0.8rem 1.5rem', borderRadius: '14px', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}>
                            <Download size={20} /> Exportar Logs
                        </button>
                    </div>
                </div>
            </header>

            {/* FILTERS & STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'center' }}>
                <div className="search-wrapper" style={{ margin: 0 }}>
                    <Search size={20} className="search-icon" style={{ color: '#ef4444' }} />
                    <input
                        className="pro-input"
                        placeholder="Buscar por usuario, acción o entidad..."
                        style={{ paddingLeft: '3.5rem', height: '54px', borderRadius: '20px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {[
                        { label: 'Eventos Totales', value: auditLog.length, icon: Layers, color: '#94a3b8' },
                        { label: 'Actividad Hoy', value: auditLog.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length, icon: Activity, color: '#3b82f6' },
                        { label: 'Inicios de Sesión', value: auditLog.filter(a => a.action?.toLowerCase().includes('login')).length, icon: ShieldCheck, color: '#10b981' }
                    ].map((stat, i) => (
                        <div key={i} style={{ flex: 1, padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>{stat.value}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AUDIT TABLE */}
            <div className="rep-content-wrapper">
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <tr>
                                <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Fecha / Hora</th>
                                <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Operador</th>
                                <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Acción Realizada</th>
                                <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Entidad</th>
                                <th style={{ padding: '1.5rem', textAlign: 'right', color: '#94a3b8', fontWeight: 800 }}>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLog.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                                            <Clock size={14} color="#64748b" /> {new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ fontWeight: 800, color: '#fff' }}>{item.user}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>IP: {item.ip}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <span style={{ color: getActionColor(item.action), fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                            {item.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem', color: '#94a3b8', fontWeight: 600 }}>
                                        {item.entity}
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => { setSelectedEntry(item); setIsModalOpen(true); }}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px 12px', borderRadius: '10px', color: '#fff', cursor: 'pointer', transition: '0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <DetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} entry={selectedEntry} />

        </div>
    );
};

export default Auditoria;

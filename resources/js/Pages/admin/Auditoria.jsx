// resources/js/pages/admin/Auditoria.jsx

import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Search, User, Clock, CheckCircle, XCircle
} from 'lucide-react';
import '../../admin_styles.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const Auditoria = () => {
    const [log, setLog] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Mapear accion → clase de badge
    const getActionBadgeClass = (action) => {
        if (!action) return 'badge-info';

        if (
            action.includes('Creación') ||
            action.includes('Aprobación') ||
            action.includes('Exitoso')
        ) {
            return 'badge-success';
        }
        if (
            action.includes('Eliminación') ||
            action.includes('Fallido')
        ) {
            return 'badge-danger';
        }
        if (action.includes('Modificación')) {
            return 'badge-primary';
        }
        return 'badge-info';
    };

    const getActionIcon = (action) => {
        if (!action) return null;

        if (action.includes('Exitoso') || action.includes('Aprobación')) {
            return <CheckCircle size={14} style={{ marginRight: '5px' }} />;
        }
        if (action.includes('Fallido') || action.includes('Eliminación')) {
            return <XCircle size={14} style={{ marginRight: '5px' }} />;
        }
        return null;
    };

    // Cargar desde API
    useEffect(() => {
        const fetchAuditoria = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                const resp = await fetch(`${API_BASE}/auditoria`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!resp.ok) {
                    const errorJson = await resp.json().catch(() => ({}));
                    console.error('Error API auditoría:', errorJson);
                    alert(errorJson.message || 'Error al cargar el log de auditoría.');
                    setLoading(false);
                    return;
                }

                const json = await resp.json();

                // json es paginado: { data: [...], ... }
                const registros = Array.isArray(json.data) ? json.data : [];

                const normalized = registros.map((item) => {
                    // Construir texto de usuario con relación usuario→persona si existe
                    let userText = 'Sistema';
                    if (item.usuario) {
                        const persona = item.usuario.persona;
                        const nombre = persona
                            ? `${persona.nombres} ${persona.apellidos}`
                            : item.usuario.cedula;
                        userText = `${nombre} (${item.usuario.cedula})`;
                    } else if (item.usuario_cedula) {
                        userText = `Usuario ${item.usuario_cedula}`;
                    }

                    return {
                        id: item.id,
                        timestamp: item.timestamp || item.created_at,
                        user: userText,
                        action: item.accion,
                        entity: item.entidad,
                        entityId: item.entidad_id,
                        detail: item.detalle,
                    };
                });

                setLog(normalized);
            } catch (err) {
                console.error(err);
                alert('Error de conexión al cargar la auditoría.');
            } finally {
                setLoading(false);
            }
        };

        fetchAuditoria();
    }, []);

    // Filtrado en cliente
    const filteredLog = log
        .filter(entry => {
            const term = searchTerm.toLowerCase();
            return (
                (entry.user || '').toLowerCase().includes(term) ||
                (entry.action || '').toLowerCase().includes(term) ||
                (entry.entity || '').toLowerCase().includes(term) ||
                (entry.detail || '').toLowerCase().includes(term)
            );
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="admin-page-container fade-enter">
            {/* HEADER */}
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Log de Auditoría</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Registro completo de acciones y eventos del sistema.
                    </p>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="pro-card">
                {/* TOOLBAR */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Eventos Recientes ({filteredLog.length})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-darkest)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            className="pro-input"
                            style={{ background: 'transparent', border: 'none', padding: '0', width: '300px' }}
                            type="text"
                            placeholder="Buscar por Usuario, Acción, o Detalle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="table-container">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th style={{ width: '180px' }}>Fecha/Hora</th>
                                <th style={{ width: '200px' }}>Usuario</th>
                                <th style={{ width: '150px' }}>Acción</th>
                                <th style={{ width: '100px' }}>Entidad</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLog.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        {loading
                                            ? <div className="spinner"></div>
                                            : 'No se encontraron registros de auditoría que coincidan con la búsqueda.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredLog.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                                {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} style={{ color: 'var(--primary)' }} />
                                                <span style={{ fontWeight: 500, color: '#f8fafc' }}>{entry.user}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getActionBadgeClass(entry.action)}`}>
                                                {getActionIcon(entry.action)} {entry.action}
                                            </span>
                                        </td>
                                        <td><span className="status-badge badge-neutral">{entry.entity || '-'}</span></td>
                                        <td style={{ color: 'var(--text-muted)' }} title={entry.detail || ''}>{entry.detail || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Auditoria;

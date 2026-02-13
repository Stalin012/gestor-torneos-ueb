import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    Shield, Plus, Edit, Trash2, Search, X, Save, Star,
    Award, UserCheck, ShieldAlert, Activity
} from 'lucide-react';

import LoadingScreen from '../../components/LoadingScreen';
import api from '../../api';
import { StatCard } from "../../components/StatsComponents";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/* ============================================================
   1. Opciones de especialidades
   ============================================================ */
const especialidadesOptions = ['Fútbol', 'Básquet', 'Vóley', 'Tenis', 'Natación'];

/* ============================================================
   2. Modal de creación / edición de árbitro
   ============================================================ */
const ArbitroModal = memo(({ isOpen, onClose, initialData, onSave }) => {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState({
        cedula: '',
        experiencia: 0,
        especialidad: '',
        estado: 'Certificado',
    });
    const [personaData, setPersonaData] = useState({ nombres: '', apellidos: '', correo: '' });
    const [verificando, setVerificando] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            setFormData({
                cedula: initialData.cedula,
                experiencia: initialData.experiencia ?? 0,
                especialidad: initialData.especialidad || '',
                estado: initialData.estado || 'Certificado',
            });
            setPersonaData({
                nombres: initialData.persona?.nombres || '',
                apellidos: initialData.persona?.apellidos || '',
                correo: initialData.persona?.email || initialData.persona?.correo || '',
            });
        } else {
            setFormData({ cedula: '', experiencia: 0, especialidad: '', estado: 'Certificado' });
            setPersonaData({ nombres: '', apellidos: '', correo: '' });
        }
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'cedula' && value.length === 10 && !isEditMode) {
            verificarCedula(value);
        } else if (name === 'cedula' && value.length < 10) {
            setPersonaData({ nombres: '', apellidos: '', correo: '' });
        }
    };

    const verificarCedula = async (cedula) => {
        setVerificando(true);
        try {
            const resp = await api.get(`/personas/${cedula}`);
            const data = resp.data?.data || resp.data;
            setPersonaData({
                nombres: data.nombres || '',
                apellidos: data.apellidos || '',
                correo: data.email || data.correo || '',
            });
        } catch (err) {
            console.error('Error verificando cédula:', err);
            setPersonaData({ nombres: 'No encontrada', apellidos: '', correo: '' });
        } finally {
            setVerificando(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = {
                cedula: formData.cedula,
                experiencia: Number(formData.experiencia) || 0,
                especialidad: formData.especialidad,
                estado: formData.estado,
                nombres: personaData.nombres,
                apellidos: personaData.apellidos,
            };
            await onSave(payload, isEditMode);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content scale-in" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(16, 185, 129, 0.05))',
                    borderBottom: '2px solid var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
                        }}>
                            <Shield size={28} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>
                                {isEditMode ? 'Expediente Técnico' : 'Registro de Oficial'}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gestión de autoridades y certificaciones</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '2.5rem' }}>
                    <form id="arbitro-form" onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Nro. Identificación</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="cedula"
                                        value={formData.cedula}
                                        onChange={handleChange}
                                        required
                                        disabled={isEditMode}
                                        className="pro-input"
                                        placeholder="0000000000"
                                        style={{ fontSize: '1.1rem', fontWeight: 700 }}
                                    />
                                    {verificando && (
                                        <div className="spinner" style={{ position: 'absolute', right: '12px', top: '12px', width: '22px', height: '22px' }}></div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Identidad Vinculada</label>
                                <div style={{
                                    height: '46px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 1rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: personaData.nombres && personaData.nombres !== 'No encontrada' ? '#fff' : 'var(--text-muted)',
                                    fontWeight: 700
                                }}>
                                    {personaData.nombres === 'No encontrada' ? '⚠️ Persona no registrada' : (personaData.nombres ? `${personaData.nombres} ${personaData.apellidos}` : 'Validando...')}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Especialidad / DISCIPLINA</label>
                                <select name="especialidad" value={formData.especialidad} onChange={handleChange} required className="pro-input">
                                    <option value="">Seleccione especialidad...</option>
                                    {especialidadesOptions.map((esp) => (
                                        <option key={esp} value={esp}>{esp}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 800 }}>Años de Experiencia</label>
                                <input type="number" name="experiencia" min="0" value={formData.experiencia} onChange={handleChange} required className="pro-input" style={{ textAlign: 'center', fontWeight: 800 }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 800 }}>Estatus Profesional</label>
                            <select name="estado" value={formData.estado} onChange={handleChange} required className="pro-input">
                                <option value="Certificado">Certificado / Activo</option>
                                <option value="En Formación">En Formación / Aspirante</option>
                                <option value="Suspendido">Retirado / Suspendido</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 2.5rem' }}>
                    <button type="button" className="pro-btn btn-secondary" onClick={onClose}>Descartar</button>
                    <button type="submit" form="arbitro-form" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '200px', justifyContent: 'center' }}>
                        {isSubmitting ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : <><Save size={18} /> {isEditMode ? 'Actualizar Expediente' : 'Finalizar Registro'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
});

/* ============================================================
   3. Componente Principal
============================================================ */
const Arbitros = () => {
    const [arbitros, setArbitros] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArbitro, setCurrentArbitro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    const loadArbitros = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const resp = await api.get(`/arbitros?page=${page}`);
            const json = resp.data;

            if (Array.isArray(json)) {
                setArbitros(json);
                setPagination({ current_page: 1, last_page: 1, total: json.length });
            } else {
                setArbitros(json.data || []);
                setPagination({
                    current_page: json.current_page || 1,
                    last_page: json.last_page || 1,
                    total: json.total || (json.data ? json.data.length : 0),
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadArbitros(1); }, [loadArbitros]);

    const stats = useMemo(() => ({
        total: arbitros.length,
        expertos: arbitros.filter(a => (a.experiencia || 0) >= 10).length,
        activos: arbitros.filter(a => a.estado === 'Certificado').length
    }), [arbitros]);

    const handleSave = async (data, isEditMode) => {
        try {
            const method = isEditMode ? 'put' : 'post';
            const url = isEditMode ? `/arbitros/${data.cedula}` : `/arbitros`;
            await api[method](url, data);
            setIsModalOpen(false);
            loadArbitros(pagination.current_page);
        } catch (err) {
            alert(err.response?.data?.message || 'Error al procesar la solicitud.');
        }
    };

    const handleDelete = async (cedula) => {
        if (!window.confirm("¿Seguro que desea eliminar este registro arbitral?")) return;
        try {
            await api.delete(`/arbitros/${cedula}`);
            loadArbitros(pagination.current_page);
        } catch (err) {
            alert('Error al eliminar registro.');
        }
    };

    const filteredArbitros = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return arbitros.filter(a => {
            const nombre = `${a.persona?.nombres || ''} ${a.persona?.apellidos || ''}`.toLowerCase();
            return nombre.includes(term) || a.cedula.includes(term) || a.especialidad?.toLowerCase().includes(term);
        });
    }, [arbitros, searchTerm]);

    if (loading && arbitros.length === 0) return <LoadingScreen message="Sincronizando cuerpo arbitral..." />;

    return (
        <div className="admin-page-container module-entrance">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Cuerpo Técnico</span>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0' }}>Árbitros y Réferis</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gestión profesional de autoridades de campo y certificaciones deportivas</p>
                </div>
                <button className="pro-btn btn-primary" onClick={() => { setCurrentArbitro(null); setIsModalOpen(true); }}>
                    <Plus size={20} /> Registrar Oficial
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Total Réferis" value={stats.total} icon={Shield} color="#356ed8" />
                <StatCard title="Nivel Experto (+10a)" value={stats.expertos} icon={Award} color="#f59e0b" />
                <StatCard title="Oficialmente Certificados" value={stats.activos} icon={UserCheck} color="#10b981" />
            </div>

            <div className="pro-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-darkest)', padding: '0.5rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            className="pro-search-input"
                            style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem 0', width: '100%', outline: 'none' }}
                            type="text"
                            placeholder="Filtrar por nombre o especialidad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Cédula</th>
                                <th>Autoridad / Réferi</th>
                                <th>Disciplina</th>
                                <th>Trayectoria</th>
                                <th>Estatus</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArbitros.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                        <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.1, margin: '0 auto' }} />
                                        <p>No se registran réferis con los criterios de búsqueda</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredArbitros.map((a) => (
                                    <tr key={a.cedula}>
                                        <td><code style={{ color: 'var(--text-muted)' }}>{a.cedula}</code></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(53, 110, 216, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                                    {a.persona?.nombres?.charAt(0)}
                                                </div>
                                                <div style={{ fontWeight: 800, color: '#fff' }}>{a.persona ? `${a.persona.nombres} ${a.persona.apellidos}` : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td><span className="status-pill info" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{a.especialidad}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Star size={14} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} />
                                                <span style={{ fontWeight: 700 }}>{a.experiencia || 0} Años</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${a.estado === 'Certificado' ? 'success' : a.estado === 'Suspendido' ? 'danger' : 'info'}`}>
                                                {a.estado}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="icon-btn" onClick={() => { setCurrentArbitro(a); setIsModalOpen(true); }} title="Editar Perfil">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(a.cedula)} title="Eliminar Registro">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div className="pagination-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button className="pro-btn btn-secondary" disabled={pagination.current_page === 1} onClick={() => loadArbitros(pagination.current_page - 1)}>Anterior</button>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>Página {pagination.current_page} de {pagination.last_page}</span>
                        <button className="pro-btn btn-secondary" disabled={pagination.current_page === pagination.last_page} onClick={() => loadArbitros(pagination.current_page + 1)}>Siguiente</button>
                    </div>
                )}
            </div>

            <ArbitroModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={currentArbitro}
                onSave={handleSave}
            />
        </div>
    );
};

export default Arbitros;

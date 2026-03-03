import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Shield, Plus, Edit, Trash2, Search, X, Save, Star,
    Award, UserCheck, ShieldAlert, Activity, ShieldCheck,
    Filter, MoreHorizontal, GraduationCap, ChevronRight,
    Search as SearchIcon, Info, Users
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

// ================= HELPERS / CONSTANTS =====================
const ESPECIALIDADES = ['Fútbol', 'Básquet', 'Vóley', 'Ajeres', 'Tenis', 'Natación'];
const ESTATUS = ['Certificado', 'En Formación', 'Suspendido', 'Retirado'];

// ================= MODALS =====================
const ArbitroModal = ({ isOpen, onClose, initialData, onSave, loading }) => {
    const isEditMode = !!initialData;
    const [form, setForm] = useState({
        cedula: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        especialidad: '',
        experiencia: 0,
        estado: 'Certificado'
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                cedula: initialData.cedula || '',
                nombres: initialData.persona?.nombres || '',
                apellidos: initialData.persona?.apellidos || '',
                email: initialData.persona?.email || '',
                telefono: initialData.persona?.telefono || '',
                fecha_nacimiento: initialData.persona?.fecha_nacimiento?.split('T')[0] || '',
                especialidad: initialData.especialidad || '',
                experiencia: initialData.experiencia || 0,
                estado: initialData.estado || 'Certificado'
            });
        } else {
            setForm({
                cedula: '', nombres: '', apellidos: '', email: '', telefono: '',
                fecha_nacimiento: '', especialidad: '', experiencia: 0, estado: 'Certificado'
            });
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            return () => document.body.classList.remove('modal-open');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15.px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h2 className="modal-title">{isEditMode ? "Expediente de Oficial" : "Registro de Autoridad"}</h2>
                            <p className="modal-subtitle" style={{ color: '#94a3b8' }}>Certificación y habilitación de jueces</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" type="button" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={e => {
                    e.preventDefault();
                    if (window.confirm(isEditMode ? '¿Actualizar expediente de autoridad?' : '¿Registrar nueva autoridad?')) {
                        onSave(form, isEditMode);
                    }
                }}>
                    <div className="modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Identificación (Cédula)</label>
                                <input className="pro-input" required value={form.cedula} onChange={e => setForm({ ...form, cedula: e.target.value })} disabled={isEditMode} placeholder="0000000000" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Correo Electrónico</label>
                                <input type="email" className="pro-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="oficial@ueb.edu.ec" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nombres</label>
                                <input className="pro-input" required value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Apellidos</label>
                                <input className="pro-input" required value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Disciplina Principal</label>
                                <select className="pro-input" required value={form.especialidad} onChange={e => setForm({ ...form, especialidad: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Años de Trayectoria</label>
                                <input type="number" className="pro-input" required value={form.experiencia} onChange={e => setForm({ ...form, experiencia: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Estatus</label>
                                <select className="pro-input" required value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                                    {ESTATUS.map(est => <option key={est} value={est}>{est}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono</label>
                                <input className="pro-input" required value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem 2rem' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} style={{ border: 'none' }}>Cancelar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '0.9rem 2.5rem', borderRadius: '16px' }}>
                            {loading ? <div className="spinner-sm" /> : <Save size={18} />} Guardar Expediente
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ================= MAIN COMPONENT =====================
const Arbitros = () => {
    const { addNotification } = useNotification();
    const [arbitros, setArbitros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArbitro, setEditingArbitro] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await api.get('/arbitros');
            setArbitros(Array.isArray(resp.data) ? resp.data : (resp.data?.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (form, isEdit) => {
        setLoading(true);
        try {
            const url = isEdit ? `/arbitros/${form.cedula}` : '/arbitros';
            const method = isEdit ? 'put' : 'post';
            await api[method](url, form);
            addNotification(isEdit ? 'Expediente actualizado' : 'Autoridad registrada con éxito', 'success');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            addNotification('Error al procesar registro arbitral.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cedula) => {
        if (!confirm("¿Eliminar autoridad del sistema? Esto anulará sus designaciones pendientes.")) return;
        setLoading(true);
        try {
            await api.delete(`/arbitros/${cedula}`);
            addNotification('Autoridad removida del sistema', 'success');
            fetchData();
        } catch (err) {
            addNotification('Error al eliminar registro.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredArbitros = arbitros.filter(a =>
        a.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.persona?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.cedula.includes(searchTerm)
    );

    if (loading && arbitros.length === 0) return <LoadingScreen message="Garantizando Neutralidad..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* HEADER */}
            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div className="header-info">
                        <small className="university-label" style={{ color: '#3b82f6', fontWeight: 800 }}>Cuerpo Colegiado</small>
                        <h1 className="content-title" style={{ color: '#fff', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Shield size={42} color="#3b82f6" /> Jueces & Árbitros
                        </h1>
                        <p className="content-subtitle" style={{ color: '#94a3b8' }}>Supervisión de autoridades deportivas y asignación de credenciales federativas</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="pro-btn btn-secondary" style={{ padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Filter size={18} /> Filtrar
                        </button>
                        <button className="pro-btn btn-primary" onClick={() => { setEditingArbitro(null); setIsModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '0.8rem 1.5rem', borderRadius: '14px', boxShadow: '0 8px 20px rgba(59, 130, 241, 0.3)' }}>
                            <Plus size={20} /> Registrar Oficial
                        </button>
                    </div>
                </div>
            </header>

            {/* SEARCH AND KPI */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'center' }}>
                <div className="search-wrapper" style={{ margin: 0 }}>
                    <SearchIcon size={20} className="search-icon" style={{ color: '#3b82f6' }} />
                    <input
                        className="pro-input"
                        placeholder="Buscar por cédula o nombre..."
                        style={{ paddingLeft: '3.5rem', height: '54px', borderRadius: '20px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {[
                        { label: 'Total Oficiales', value: arbitros.length, icon: Award, color: '#3b82f6' },
                        { label: 'Certificados', value: arbitros.filter(a => a.estado === 'Certificado').length, icon: ShieldCheck, color: '#10b981' },
                        { label: 'En Formación', value: arbitros.filter(a => a.estado === 'En Formación').length, icon: Activity, color: '#f59e0b' }
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

            {/* GRID OF REFEREES */}
            <div className="rep-content-wrapper">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {filteredArbitros.map(a => (
                        <div key={a.cedula} className="pro-card" style={{
                            padding: '1.5rem',
                            borderRadius: '28px',
                            background: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            transition: '0.4s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                                        {a.persona?.nombres?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{a.persona?.nombres} {a.persona?.apellidos}</h3>
                                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>CI: {a.cedula}</div>
                                    </div>
                                </div>
                                <span style={{ padding: '4px 10px', background: a.estado === 'Certificado' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: a.estado === 'Certificado' ? '#10b981' : '#f59e0b', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>
                                    {a.estado}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '18px', marginBottom: '1.5rem' }}>
                                <div>
                                    <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800 }}>Disciplina</small>
                                    <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{a.especialidad || 'General'}</div>
                                </div>
                                <div>
                                    <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800 }}>Trayectoria</small>
                                    <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{a.experiencia || 0} Años exp.</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                    <Users size={16} /> 12 Partidos
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="pro-btn btn-secondary" style={{ padding: '10px', borderRadius: '12px' }} onClick={() => { setEditingArbitro(a); setIsModalOpen(true); }}><Edit size={16} /></button>
                                    <button className="pro-btn btn-danger" style={{ padding: '10px', borderRadius: '12px' }} onClick={() => handleDelete(a.cedula)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ArbitroModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingArbitro}
                onSave={handleSave}
                loading={loading}
            />

        </div>
    );
};

export default Arbitros;

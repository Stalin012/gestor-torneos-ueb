import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    Newspaper,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    Image as ImageIcon,
    Calendar,
    Search,
    ChevronRight,
    Type,
    Clock,
    User,
    ArrowRight,
    MessageSquare,
    Share2,
    MoreHorizontal
} from 'lucide-react';

import LoadingScreen from '../../components/LoadingScreen';
import api, { API_BASE } from '../../api';
import { getAssetUrl } from '../../utils/helpers';

// ================= FORM MODAL =====================
const NoticiaModal = ({ isOpen, onClose, initialData, onSave, loading }) => {
    const isEditMode = !!initialData;
    const [form, setForm] = useState({
        titulo: '',
        contenido: '',
        imagen: ''
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                titulo: initialData.titulo || '',
                contenido: initialData.contenido || '',
                imagen: initialData.imagen || ''
            });
        } else {
            setForm({ titulo: '', contenido: '', imagen: '' });
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
        <div className="modal-overlay fade-in" style={{ zIndex: 1200 }}>
            <div className="modal-content modal-lg scale-in" onClick={e => e.stopPropagation()} style={{ borderRadius: '32px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            <Newspaper size={28} />
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ color: '#fff' }}>{isEditMode ? "Redactar Noticia" : "Nueva Publicación"}</h2>
                            <p className="modal-subtitle">Comunicación institucional y novedades</p>
                        </div>
                    </div>
                    <button type="button" className="btn-icon-close" onClick={onClose} style={{ color: '#fff' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={e => {
                    e.preventDefault();
                    if (window.confirm(isEditMode ? '¿Actualizar contenido de la noticia?' : '¿Confirmar publicación de la noticia?')) {
                        onSave(form, isEditMode, initialData?.id);
                    }
                }}>
                    <div className="modal-body" style={{ padding: '2rem' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 800, color: '#94a3b8' }}>Encabezado Principal</label>
                            <input
                                type="text"
                                className="pro-input"
                                value={form.titulo}
                                onChange={e => setForm({ ...form, titulo: e.target.value })}
                                required
                                placeholder="Escriba un título impactante..."
                                style={{ fontSize: '1.25rem', fontWeight: 800, padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.3)' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 800, color: '#94a3b8' }}>Imagen de Portada (Opcional)</label>
                            <input
                                type="file"
                                className="pro-input"
                                onChange={e => setForm({ ...form, imagen: e.target.files[0] })}
                                accept="image/*"
                                style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem' }}
                            />
                            {form.imagen && typeof form.imagen === 'string' && (
                                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#6366f1' }}>
                                    URL actual: {form.imagen.substring(0, 50)}...
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 800, color: '#94a3b8' }}>Cuerpo de la Noticia</label>
                            <textarea
                                className="pro-input"
                                value={form.contenido}
                                onChange={e => setForm({ ...form, contenido: e.target.value })}
                                required
                                rows={10}
                                placeholder="Desarrolle el contenido de la publicación..."
                                style={{ resize: 'none', lineHeight: '1.6', background: 'rgba(0,0,0,0.3)', padding: '1.5rem' }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem 2rem' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} style={{ border: 'none' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading} style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', padding: '1rem 2.5rem', borderRadius: '16px' }}>
                            {loading ? <div className="spinner-sm"></div> : <Save size={18} />}
                            {isEditMode ? "Actualizar Publicación" : "Publicar Ahora"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ================= MAIN COMPONENT =====================
const Noticias = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNoticias = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await api.get('/noticias');
            const data = resp.data;
            setNoticias(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNoticias();
    }, [fetchNoticias]);

    const handleSave = async (form, isEdit, id) => {
        setLoading(true);
        try {
            const url = isEdit ? `/noticias/${id}` : '/noticias';

            const formData = new FormData();
            formData.append('titulo', form.titulo);
            formData.append('contenido', form.contenido);
            if (form.imagen instanceof File) {
                formData.append('imagen', form.imagen);
            } else if (form.imagen) {
                formData.append('imagen', form.imagen);
            }

            let resp;
            if (isEdit) {
                formData.append('_method', 'PUT');
                resp = await api.post(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                resp = await api.post(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (resp.status === 200 || resp.status === 201) {
                setIsModalOpen(false);
                setEditingItem(null);
                fetchNoticias();
            } else {
                alert("Error al guardar");
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Ocurrió un error al procesar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Deseas eliminar definitivamente esta noticia?")) return;
        setLoading(true);
        try {
            const resp = await api.delete(`/noticias/${id}`);
            if (resp.status === 200) fetchNoticias();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredNoticias = noticias.filter(n =>
        n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.contenido.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && noticias.length === 0) return <LoadingScreen message="Actualizando Boletín..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div className="header-info">
                        <small className="university-label" style={{ color: '#f59e0b', fontWeight: 800 }}>Módulo de Comunicación</small>
                        <h1 className="content-title" style={{ color: '#fff', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Newspaper size={42} color="#f59e0b" /> Centro de Noticias
                        </h1>
                        <p className="content-subtitle" style={{ color: '#94a3b8' }}>Redacción y publicación de boletines oficiales e información deportiva</p>
                    </div>

                    <button className="pro-btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', padding: '1rem 2rem', borderRadius: '18px', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)' }}>
                        <Plus size={22} /> Nueva Noticia
                    </button>
                </div>
            </header>

            <div style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                padding: '1.25rem',
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div className="search-wrapper" style={{ flex: 1, margin: 0 }}>
                    <Search size={20} className="search-icon" style={{ color: '#f59e0b' }} />
                    <input
                        type="text"
                        className="pro-input"
                        placeholder="Filtrar boletines por título o palabras clave..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3.5rem', height: '54px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
                {filteredNoticias.map(noticia => (
                    <div key={noticia.id} className="pro-card" style={{
                        padding: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '28px',
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.4s ease'
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                    >
                        <div style={{
                            height: '240px',
                            background: noticia.imagen ? `url("${getAssetUrl(noticia.imagen)}") center/cover` : 'linear-gradient(135deg, #1e293b, #0f172a)',
                            position: 'relative'
                        }}>
                            {!noticia.imagen && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.05)' }}><Newspaper size={80} /></div>}

                            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderRadius: '12px', color: '#fff' }}>
                                    <MoreHorizontal size={18} />
                                </div>
                            </div>

                            <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '10px' }}>
                                <span style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', borderRadius: '12px', fontSize: '0.75rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Calendar size={14} /> {noticia.created_at ? new Date(noticia.created_at).toLocaleDateString() : 'Reciente'}
                                </span>
                            </div>
                        </div>

                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem', fontWeight: 900, lineHeight: '1.3', color: '#fff', letterSpacing: '-0.5px' }}>{noticia.titulo}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.7' }}>
                                {noticia.contenido}
                            </p>

                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                                    <User size={14} /> Redacción UEB
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="pro-btn" style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '12px' }} onClick={() => { setEditingItem(noticia); setIsModalOpen(true); }} title="Editar">
                                        <Edit size={18} />
                                    </button>
                                    <button className="pro-btn" style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }} onClick={() => handleDelete(noticia.id)} title="Eliminar">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && filteredNoticias.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '8rem 2rem',
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '32px',
                    border: '2px dashed rgba(255,255,255,0.05)',
                    marginTop: '2rem'
                }}>
                    <Newspaper size={80} color="#64748b" opacity={0.2} style={{ marginBottom: '2rem' }} />
                    <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800 }}>Sin registros en el boletín</h2>
                    <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto 2rem' }}>No se han encontrado noticias que coincidan con su búsqueda o la base de datos está vacía.</p>
                    <button className="pro-btn btn-primary" onClick={() => setIsModalOpen(true)}>Crear Primera Publicación</button>
                </div>
            )}

            <NoticiaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
                onSave={handleSave}
                loading={loading}
            />
        </div>
    );
};

export default Noticias;

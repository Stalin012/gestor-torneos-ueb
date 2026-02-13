import React, { useState, useEffect, useCallback } from 'react';
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
    Type
} from 'lucide-react';
import '../../admin_styles.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

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

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form, isEditMode, initialData?.id);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "800px" }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                            <Newspaper size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0 }}>{isEditMode ? "Editar Noticia" : "Publicar Noticia"}</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completa los campos para informar a la comunidad.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon-close"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div className="form-group">
                        <label><Type size={16} /> Título de la Noticia</label>
                        <input
                            type="text"
                            className="pro-input"
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                            placeholder="Ej: Gran Inauguración del Torneo 2025"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label><ImageIcon size={16} /> URL de Imagen de Portada</label>
                        <input
                            type="text"
                            className="pro-input"
                            value={form.imagen}
                            onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        {form.imagen && (
                            <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', height: '150px', border: '1px solid var(--border)' }}>
                                <img src={form.imagen} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Contenido de la Noticia</label>
                        <textarea
                            className="pro-input"
                            style={{ minHeight: '200px', lineHeight: '1.6' }}
                            value={form.contenido}
                            onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                            placeholder="Escribe aquí el cuerpo de la noticia..."
                            required
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '2rem' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading}>
                            {loading ? <div className="spinner-sm"></div> : <Save size={18} />}
                            {isEditMode ? "Actualizar Publicación" : "Publicar Ahora"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
            const resp = await fetch(`${API_BASE}/noticias`);
            const data = await resp.json();
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
            const token = localStorage.getItem("token");
            const url = isEdit ? `${API_BASE}/noticias/${id}` : `${API_BASE}/noticias`;
            const method = isEdit ? "PUT" : "POST";

            const resp = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await resp.json();
            if (resp.ok) {
                setIsModalOpen(false);
                setEditingItem(null);
                fetchNoticias();
            } else {
                alert(data.message || "Error al guardar");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Seguro que deseas eliminar esta noticia?")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${API_BASE}/noticias/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) fetchNoticias();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredNoticias = noticias.filter(n => n.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="admin-page-container fade-enter">
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Periodismo y Noticias</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Gestiona las crónicas deportivas y comunicados oficiales.
                    </p>
                </div>
            </div>

            <div className="pro-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="search-wrapper" style={{ flex: 1, maxWidth: '400px', margin: 0 }}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar noticias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="pro-btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                        <Plus size={18} /> Nueva Noticia
                    </button>
                </div>

                {loading && noticias.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando portal...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {filteredNoticias.map(noticia => (
                            <div key={noticia.id} className="pro-card match-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '180px', background: noticia.imagen ? `url(${noticia.image || noticia.imagen}) center/cover` : 'var(--bg-darkest)', position: 'relative' }}>
                                    {!noticia.imagen && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Newspaper size={48} opacity={0.2} /></div>}
                                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                                        <span style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderRadius: '8px', fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>
                                            <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            {new Date(noticia.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 700, lineHeight: '1.4', color: '#fff' }}>{noticia.titulo}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
                                        {noticia.contenido}
                                    </p>
                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        <button className="pro-btn" style={{ padding: 0, color: 'var(--primary)', background: 'none' }}>
                                            Leer más <ChevronRight size={16} />
                                        </button>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="pro-btn btn-secondary" style={{ padding: '8px' }} onClick={() => { setEditingItem(noticia); setIsModalOpen(true); }}><Edit size={16} /></button>
                                            <button className="pro-btn btn-danger" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={() => handleDelete(noticia.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredNoticias.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <Newspaper size={64} opacity={0.1} style={{ marginBottom: '1rem' }} />
                        <p>No se encontraron noticias publicadas.</p>
                    </div>
                )}
            </div>

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

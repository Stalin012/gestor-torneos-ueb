import React, { useState, useEffect } from 'react';
import {
    Image as ImageIcon,
    Trash2,
    Edit,
    Plus,
    X,
    Save,
    FileText,
    Video
} from 'lucide-react';

import '../../admin_styles.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getIconForType = (url) => {
    if (!url) return <FileText size={28} />;
    const lower = url.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|webp|gif)$/)) return <ImageIcon size={28} />;
    if (lower.match(/\.(mp4|mov|mkv|avi|webm)$/)) return <Video size={28} />;
    return <FileText size={28} />;
};

// ================= Modal =====================
const MediaModal = ({ isOpen, onClose, initialData, onSave }) => {
    const isEditMode = !!initialData;

    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        archivo: null
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                titulo: initialData.titulo,
                descripcion: initialData.descripcion,
                archivo: null
            });
        } else {
            setForm({ titulo: '', descripcion: '', archivo: null });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.titulo) return alert("Título obligatorio");
        if (!isEditMode && !form.archivo) return alert("Debe seleccionar un archivo");

        onSave(form, isEditMode, initialData?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "600px" }}>
                <div className="modal-header">
                    <h2>{isEditMode ? "Editar elemento" : "Nuevo elemento"}</h2>
                    <button onClick={onClose} className="btn-icon-close"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            rows="3"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Archivo {isEditMode ? "(opcional)" : ""}</label>
                        <input
                            type="file"
                            accept="image/*,video/*,.pdf,.docx"
                            onChange={(e) => setForm({ ...form, archivo: e.target.files[0] })}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            <Save size={18} /> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ================= Card =====================
const MediaCard = ({ item, onDelete, onEdit }) => {
    const isImage = item.imagen.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
        <div className="pro-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div
                style={{
                    height: '180px',
                    width: '100%',
                    background: isImage ? `url(${item.imagen}) center/cover no-repeat` : 'var(--bg-darkest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                }}
            >
                {!isImage && getIconForType(item.imagen)}
            </div>

            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{item.titulo}</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {item.descripcion || 'Sin descripción'}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                        className="pro-btn btn-secondary"
                        style={{ padding: '6px' }}
                        onClick={() => onEdit(item)}
                        title="Editar"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className="pro-btn btn-danger"
                        style={{ padding: '6px' }}
                        onClick={() => onDelete(item.id)}
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// =============== MAIN COMPONENT ===============
const GaleriaMedia = () => {
    const [list, setList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const loadData = async () => {
        const resp = await fetch(`${API_BASE}/galeria`);
        const data = await resp.json();
        setList(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (form, isEdit, id) => {
        const fd = new FormData();
        fd.append("titulo", form.titulo);
        fd.append("descripcion", form.descripcion);

        if (form.archivo) {
            fd.append("archivo", form.archivo);
        }

        const method = isEdit ? "POST" : "POST";
        const url = isEdit
            ? `${API_BASE}/galeria/${id}?_method=PUT`
            : `${API_BASE}/galeria`;

        const resp = await fetch(url, {
            method,
            body: fd
        });

        const json = await resp.json();

        if (resp.ok) {
            alert(json.message);
            setIsModalOpen(false);
            setEditingItem(null);
            loadData();
        } else {
            alert(json.message || "Error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este elemento?")) return;

        const resp = await fetch(`${API_BASE}/galeria/${id}`, {
            method: "DELETE",
        });

        const json = await resp.json();

        if (resp.ok) {
            alert(json.message);
            loadData();
        } else {
            alert(json.message);
        }
    };

    return (
        <div className="admin-page-container fade-enter">
            {/* HEADER */}
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Galería Multimedia</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Gestiona las imágenes, videos y documentos públicos.
                    </p>
                </div>
            </div>

            {/* CONTENT */}
            <div className="pro-card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ImageIcon size={20} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Archivos Multimedia ({list.length})</span>
                    </div>

                    <button
                        className="pro-btn btn-primary"
                        onClick={() => {
                            setEditingItem(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={18} /> Nuevo Archivo
                    </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {list.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No hay elementos multimedia en la galería.
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {list.map((item) => (
                                <MediaCard
                                    key={item.id}
                                    item={item}
                                    onEdit={(i) => {
                                        setEditingItem(i);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <MediaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
                onSave={handleSave}
            />
        </div>
    );
};

export default GaleriaMedia;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Image as ImageIcon, Trash2, Edit, Plus, X, FileText, Video, Search,
    Filter, LayoutGrid, Type, Calendar, Clock, AlertCircle, Save, Eye,
    Maximize2, Download, CloudUpload, Info
} from 'lucide-react';
import { createPortal } from 'react-dom';
import LoadingScreen from '../../components/LoadingScreen';
import api from '../../api';
import { getAssetUrl } from '../../utils/helpers';
import { useNotification } from '../../context/NotificationContext';

const getIconForType = (url) => {
    if (!url) return <FileText size={32} />;
    const lower = url.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|webp|gif)$/)) return <ImageIcon size={32} />;
    if (lower.match(/\.(mp4|mov|mkv|avi|webm)$/)) return <Video size={32} />;
    return <FileText size={32} />;
};

// ================= MODAL DE MEDIOS =====================
const MediaModal = ({ isOpen, onClose, initialData, onSave, loading }) => {
    const isEditMode = !!initialData;
    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        archivo: null
    });

    useEffect(() => {
        if (initialData && isOpen) {
            setForm({
                titulo: initialData.titulo || '',
                descripcion: initialData.descripcion || '',
                archivo: null
            });
        } else if (!isEditMode && isOpen) {
            setForm({ titulo: '', descripcion: '', archivo: null });
        }
    }, [initialData, isOpen, isEditMode]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" style={{ padding: '15px' }}>
            <div className="modal-content modal-lg" style={{
                maxWidth: '700px',
                margin: 'auto',
                maxHeight: '95vh',
                overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ borderBottom: '2px solid #6366f1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: '40px', height: '40px' }}>
                            {isEditMode ? <Edit size={22} /> : <CloudUpload size={22} />}
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>{isEditMode ? "Editar Recurso" : "Nuevo Multimedia"}</h2>
                            <p className="modal-subtitle" style={{ fontSize: '0.8rem' }}>Gestión de activos visuales</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}><X size={22} /></button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (window.confirm('¿Desea guardar los cambios en la galería?')) {
                        onSave(form, isEditMode, initialData?.id);
                    }
                }}>
                    <div className="modal-body" style={{ padding: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Título del Recurso</label>
                            <div style={{ position: 'relative' }}>
                                <Type size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                                <input
                                    type="text"
                                    className="pro-input"
                                    placeholder="Nombre descriptivo de la imagen o video..."
                                    style={{ paddingLeft: '45px' }}
                                    value={form.titulo}
                                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descripción / Detalles</label>
                            <textarea
                                className="pro-input"
                                rows="3"
                                placeholder="Añada contexto sobre este contenido multimedia..."
                                style={{ resize: 'none' }}
                                value={form.descripcion}
                                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Carga de Archivo {isEditMode && '(Opcional si no cambia)'}</label>
                            <div style={{
                                border: '2px dashed rgba(99, 102, 241, 0.2)',
                                borderRadius: '20px',
                                padding: '2rem',
                                textAlign: 'center',
                                background: 'rgba(99, 102, 241, 0.02)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }} onClick={() => document.getElementById('file-input').click()}>
                                <input
                                    type="file"
                                    id="file-input"
                                    hidden
                                    accept="image/*,video/*"
                                    onChange={e => setForm({ ...form, archivo: e.target.files[0] })}
                                />
                                <div style={{ marginBottom: '1rem' }}>
                                    <CloudUpload size={48} color={form.archivo ? '#10b981' : '#6366f1'} style={{ opacity: 0.8 }} />
                                </div>
                                <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px' }}>
                                    {form.archivo ? form.archivo.name : "Haga clic para seleccionar archivo"}
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Máx. 50MB (JPG, PNG, WEBP, MP4, MOV)</p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ padding: '1.2rem 1.5rem' }}>
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                            {loading ? <div className="spinner-sm" /> : <><Save size={18} /> {isEditMode ? "Actualizar" : "Publicar Recurso"}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ================= TARJETA DE MEDIO =====================
const MediaCard = ({ item, onDelete, onEdit }) => {
    const isImage = item.imagen && item.imagen.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const assetUrl = getAssetUrl(item.imagen);

    return (
        <div className="pro-card dashboard-card-hover" style={{
            padding: '0',
            overflow: 'hidden',
            borderRadius: '24px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease'
        }}>
            <div style={{
                height: '220px',
                width: '100%',
                background: isImage ? `url("${assetUrl}") center/cover no-repeat` : '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                {!isImage && <div style={{ color: '#6366f1', opacity: 0.6 }}>{getIconForType(item.imagen)}</div>}

                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                    color: '#fff',
                    fontWeight: 800,
                    backdropFilter: 'blur(4px)'
                }}>
                    {isImage ? 'IMAGEN' : 'VIDEO'}
                </div>
            </div>

            <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.titulo}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.4rem' }}>
                    {item.descripcion || 'Sin descripción detallada.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#64748b', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} /> {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Reciente'}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button className="pro-btn" style={{
                        flex: 1, padding: '8px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', justifyContent: 'center'
                    }} onClick={() => onEdit(item)}><Edit size={16} /></button>
                    <button className="pro-btn" style={{
                        padding: '8px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444'
                    }} onClick={() => onDelete(item.id)}><Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    );
};

// ================= COMPONENTE PRINCIPAL =====================
const GaleriaMedia = () => {
    const { addNotification } = useNotification();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await api.get('/galeria');
            setList(Array.isArray(resp.data) ? resp.data : []);
        } catch (e) {
            console.error(e);
            addNotification('Error al cargar la galería.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async (form, isEdit, id) => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("titulo", form.titulo);
            fd.append("descripcion", form.descripcion || "");
            if (form.archivo) fd.append("archivo", form.archivo);

            if (isEdit) {
                fd.append("_method", "PUT");
                await api.post(`/galeria/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                addNotification('Recurso actualizado con éxito', 'success');
            } else {
                await api.post('/galeria', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                addNotification('Nuevo recurso publicado', 'success');
            }

            setIsModalOpen(false);
            setEditingItem(null);
            loadData();
        } catch (err) {
            console.error(err);
            addNotification('Error al guardar: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Deseas eliminar este archivo de la galería?")) return;
        setLoading(true);
        try {
            await api.delete(`/galeria/${id}`);
            addNotification('Recurso eliminado correctamente.', 'info');
            loadData();
        } catch (e) {
            console.error(e);
            addNotification('Error al eliminar el recurso.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredList = useMemo(() => {
        return list.filter(item =>
            item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [list, searchTerm]);

    if (loading && list.length === 0) return <LoadingScreen message="Sincronizando Galería Premium..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>

            {/* CABECERA */}
            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ minWidth: '280px', flex: 1 }}>
                        <small style={{ color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Módulo de Contenido</small>
                        <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.5rem 0' }}>
                            <ImageIcon size={36} color="#6366f1" /> Gestión de Galería
                        </h1>
                        <p style={{ color: '#94a3b8', maxWidth: '600px', fontSize: '0.9rem' }}>Administre y organice los activos visuales y videos institucionales del portal.</p>
                    </div>

                    <button className="pro-btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '12px 24px' }}>
                        <Plus size={22} /> Nuevo Recurso
                    </button>
                </div>
            </header>

            {/* FILTROS Y BÚSQUEDA */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.2rem',
                background: 'rgba(30,32,44,0.3)',
                padding: '1.2rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                    <input
                        className="pro-input"
                        placeholder="Buscar por título o etiqueta..."
                        style={{ paddingLeft: '45px', background: 'rgba(15,17,26,0.5)', width: '100%' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        <Info size={16} color="#6366f1" /> {filteredList.length} elementos encontrados
                    </div>
                </div>
            </div>

            {/* CUADRICULA DE MEDIOS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                gap: '1.5rem'
            }}>
                {filteredList.length > 0 ? (
                    filteredList.map(item => (
                        <MediaCard
                            key={item.id}
                            item={item}
                            onEdit={(i) => { setEditingItem(i); setIsModalOpen(true); }}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', background: 'rgba(30,41,59,0.2)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                        <ImageIcon size={64} color="#1e293b" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <h3 style={{ color: '#fff' }}>Sin resultados en la galería</h3>
                        <p style={{ color: '#64748b' }}>Cargue nuevos recursos para dinamizar el portal institucional.</p>
                    </div>
                )}
            </div>

            <MediaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
                onSave={handleSave}
                loading={loading}
            />
        </div>
    );
};

export default GaleriaMedia;


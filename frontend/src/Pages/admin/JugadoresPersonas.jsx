import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    UserCheck, Plus, Edit, Trash2, Search, X, User, Save,
    IdCard, Layout, List, Users, Activity, Target, ShieldCheck, FileText, Download, Upload, Camera
} from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";
import SkeletonLoader from "../../components/SkeletonLoader";
import VirtualPitch from "../../components/VirtualPitch";
import { StatCard } from "../../components/StatsComponents";
import CarnetModal from "../../components/CarnetModal";
import { X as CloseIcon } from "lucide-react";
import api, { apiPublic, API_BASE } from "../../api";
import { useNotification } from "../../context/NotificationContext";

// Determinar la base para las imágenes (quita el /api del final)
const IMG_BASE = API_BASE.replace('/api', '');

const resolveImgUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
    const base = IMG_BASE;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`;
    const fullUrl = `${base.endsWith('/') ? base : base + '/'}${storagePath}`;
    return fullUrl;
};

const PlayerImage = ({ src, iconSize = 20, className = "" }) => {
    const [error, setError] = useState(false);
    const resolved = resolveImgUrl(src);

    useEffect(() => { setError(false); }, [src]);

    if (!resolved || error) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                background: 'var(--bg-main)'
            }} className={className}>
                <User size={iconSize} />
            </div>
        );
    }

    return (
        <img
            src={resolved}
            alt="Deportista"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            className={className}
            onError={() => setError(true)}
        />
    );
};

/* ============================================================
   COMPONENTES DE APOYO (MODALES)
============================================================ */




// 2. MODAL REGISTRO/EDICIÓN
const JugadorModal = ({ isOpen, onClose, initialData, equipos, onSave }) => {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState({ cedula: "", equipo_id: "", posicion: "", numero: "", carrera: "", facultad: "" });
    const [personaData, setPersonaData] = useState({ cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", email: "" });
    const [personaExiste, setPersonaExiste] = useState(null);
    const [verificando, setVerificando] = useState(false);
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            setFormData({
                cedula: initialData.cedula,
                equipo_id: initialData.equipo_id || "",
                posicion: initialData.posicion || "",
                numero: initialData.numero || "",
                carrera: initialData.carrera || "",
                facultad: initialData.facultad || "",
            });
            setPersonaExiste(true);
            setPersonaData({
                cedula: initialData.cedula,
                nombres: initialData.persona?.nombres || "",
                apellidos: initialData.persona?.apellidos || "",
                fecha_nacimiento: initialData.persona?.fecha_nacimiento || "",
                telefono: initialData.persona?.telefono || "",
                email: initialData.persona?.email || "",
                foto: initialData.persona?.foto_url || initialData.persona?.foto || ""
            });
        } else {
            setFormData({ cedula: "", equipo_id: "", posicion: "", numero: "", carrera: "", facultad: "" });
            setPersonaData({ cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", email: "" });
            setPersonaExiste(null);
            setFotoFile(null);
            setFotoPreview(null);
        }
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, [initialData, isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "cedula" || name === "numero") {
            setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, "") }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const verificarCedula = async () => {
        if (isEditMode || formData.cedula.length !== 10) return;
        setVerificando(true);
        try {
            const resp = await api.get(`/personas/${formData.cedula}`);
            setPersonaExiste(true);
            setPersonaData(resp.data.data || resp.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setPersonaExiste(false);
                setPersonaData(p => ({ ...p, cedula: formData.cedula }));
            }
        } finally { setVerificando(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSave(formData, isEditMode, personaData, personaExiste, fotoFile);
            onClose();
        } finally { setIsSubmitting(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content scale-in" style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.05))',
                    borderBottom: '2px solid var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(53, 110, 216, 0.3)'
                        }}>
                            <User size={28} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>{isEditMode ? "Ficha Técnica Atleta" : "Registro de Talento"}</h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gestión integral de perfiles y habilitaciones</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}>
                        <CloseIcon size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '2.5rem' }}>
                    <form id="jugador-form" onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '160px',
                                            height: '200px',
                                            margin: '0 auto',
                                            borderRadius: '24px',
                                            border: '2px dashed var(--primary)',
                                            background: 'rgba(53, 110, 216, 0.05)',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {fotoPreview ? (
                                            <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <PlayerImage src={personaData.foto} iconSize={60} />
                                        )}
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Camera size={18} color="#fff" />
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mín. 400x500px • JPG/PNG</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 800 }}>Nro. Identificación</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="text" name="cedula" maxLength={10} value={formData.cedula} onChange={handleChange} onBlur={verificarCedula} required disabled={isEditMode} className="pro-input" placeholder="0000000000" style={{ fontSize: '1.2rem', fontWeight: 700 }} />
                                        {verificando && <div className="spinner" style={{ position: 'absolute', right: '12px', top: '12px', width: '24px', height: '24px' }} />}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {personaExiste === true && (
                                    <div style={{ padding: '1.2rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '16px', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <UserCheck size={24} color="#22c55e" />
                                        <div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{personaData.nombres} {personaData.apellidos}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Perfil institucional verificado</div>
                                        </div>
                                    </div>
                                )}

                                {personaExiste === false && (
                                    <div className="premium-card" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}><Users size={18} /> Datos Personales</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group"><label>Nombres</label><input type="text" value={personaData.nombres} onChange={e => setPersonaData({ ...personaData, nombres: e.target.value.toUpperCase() })} className="pro-input" required /></div>
                                            <div className="form-group"><label>Apellidos</label><input type="text" value={personaData.apellidos} onChange={e => setPersonaData({ ...personaData, apellidos: e.target.value.toUpperCase() })} className="pro-input" required /></div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 800 }}>Club / Unidad Operativa</label>
                                        <select name="equipo_id" value={formData.equipo_id} onChange={handleChange} className="pro-input">
                                            <option value="">Agente Libre (Sin Equipo)</option>
                                            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 800 }}>Dorsal</label>
                                        <input type="text" name="numero" maxLength={2} value={formData.numero} onChange={handleChange} className="pro-input" placeholder="00" style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 800 }}>Especialización Deportiva (Posición)</label>
                                    <input type="text" name="posicion" value={formData.posicion} onChange={handleChange} className="pro-input" placeholder="Ej: Mediocentro / Ala Pívot" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 800 }}>Facultad</label>
                                        <input type="text" name="facultad" value={formData.facultad} onChange={handleChange} className="pro-input" placeholder="Facultad del Atleta" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 800 }}>Carrera</label>
                                        <input type="text" name="carrera" value={formData.carrera} onChange={handleChange} className="pro-input" placeholder="Carrera Académica" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 2.5rem' }}>
                    <button type="button" className="pro-btn btn-secondary" onClick={onClose}>Descartar</button>
                    <button type="submit" form="jugador-form" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '180px', justifyContent: 'center' }}>
                        {isSubmitting ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : <><Save size={18} /> {isEditMode ? "Guardar Cambios" : "Validar y Registrar"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
};


/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
const JugadoresPersonas = () => {
    const navigate = useNavigate();
    const { success, error } = useNotification();
    const [jugadores, setJugadores] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("list");

    // Estados Modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCarnetOpen, setIsCarnetOpen] = useState(false);
    const [currentJugador, setCurrentJugador] = useState(null);
    const [pitchTeamId, setPitchTeamId] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [jData, eData] = await Promise.all([
                api.get('/jugadores'),
                api.get('/equipos')
            ]);
            setJugadores(Array.isArray(jData.data) ? jData.data : []);
            setEquipos(Array.isArray(eData.data?.data) ? eData.data.data : Array.isArray(eData.data) ? eData.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const stats = useMemo(() => {
        const total = jugadores.length;
        const arqueros = jugadores.filter(j => j.posicion?.toLowerCase().includes("arquer") || j.posicion?.toLowerCase().includes("porter")).length;
        const sinEquipo = jugadores.filter(j => !j.equipo_id).length;
        return { total, arqueros, sinEquipo };
    }, [jugadores]);

    const filtered = jugadores.filter(j => {
        const n = j.persona ? `${j.persona.nombres} ${j.persona.apellidos}` : "";
        return n.toLowerCase().includes(searchTerm.toLowerCase()) || j.cedula.includes(searchTerm);
    });

    const handleSave = async (formData, isEdit, personaData, personaExiste, fotoFile) => {
        try {
            // 1. Manejar la Persona (Crear o Actualizar)
            // Siempre intentamos actualizar o crear la persona para asegurar que nombres/foto se guarden
            const fd = new FormData();

            // Añadir campos de persona
            fd.append('cedula', personaData.cedula || formData.cedula);
            fd.append('nombres', personaData.nombres);
            fd.append('apellidos', personaData.apellidos);
            if (personaData.email) fd.append('email', personaData.email);
            if (personaData.telefono) fd.append('telefono', personaData.telefono);
            if (personaData.fecha_nacimiento) fd.append('fecha_nacimiento', personaData.fecha_nacimiento);

            // Si hay foto nueva, la incluimos
            if (fotoFile instanceof File || fotoFile instanceof Blob) {
                fd.append('foto', fotoFile);
            }

            if (personaExiste === false) {
                // Nueva Persona: POST /personas
                // Dejamos que Axios maneje el Content-Type automáticamente con FormData
                await api.post('/personas', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Persona existente: PATCH /personas/{cedula}
                // Laravel requiere _method=PUT para procesar archivos vía POST si el route es PUT
                fd.append('_method', 'PUT');
                await api.post(`/personas/${personaData.cedula || formData.cedula}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // 2. Manejar el Jugador
            const jugadorPayload = {
                cedula: formData.cedula,
                equipo_id: formData.equipo_id || null,
                posicion: formData.posicion,
                numero: formData.numero,
                carrera: formData.carrera,
                facultad: formData.facultad
            };

            const jugadorResp = await api[isEdit ? 'put' : 'post'](
                isEdit ? `/jugadores/${formData.cedula}` : '/jugadores',
                jugadorPayload
            );

            if (jugadorResp.status === 200 || jugadorResp.status === 201) {
                success("Operación Exitosa", "Los datos del jugador han sido guardados correctamente.");
                setIsModalOpen(false);
                setTimeout(loadData, 500); // 500ms delay to allow FS sync
            }
        } catch (err) {
            console.error('Error in handleSave:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al procesar la solicitud.";
            error("Error al guardar", errorMsg);
        }
    };

    const handleDelete = async (cedula) => {
        if (!window.confirm("¿Seguro que desea eliminar esta ficha de jugador?")) return;
        try {
            await api.delete(`/jugadores/${cedula}`);
            success("Jugador Eliminado", "La ficha del jugador ha sido eliminada.");
            loadData();
        } catch (err) {
            console.error(err);
            alert("No se pudo eliminar el jugador. Es posible que tenga estadísticas asociadas.");
        }
    };

    const handleViewCarnet = (player) => {
        setCurrentJugador(player);
        setIsCarnetOpen(true);
    };

    if (loading) return <LoadingScreen message="OBTENIENDO PLANTILLAS..." />;

    return (
        <div className="admin-page-container fade-enter">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', display: 'flex', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setViewMode("list")}
                            style={{
                                padding: '8px 12px',
                                border: 'none',
                                background: viewMode === "list" ? 'var(--primary)' : 'transparent',
                                color: '#fff',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode("pitch")}
                            style={{
                                padding: '8px 12px',
                                border: 'none',
                                background: viewMode === "pitch" ? 'var(--primary)' : 'transparent',
                                color: '#fff',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Layout size={20} />
                        </button>
                    </div>
                    <button className="pro-btn btn-primary" onClick={() => { setCurrentJugador(null); setIsModalOpen(true); }}>
                        <Plus size={18} /> Registrar Jugador
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <StatCard title="Total Jugadores" value={stats.total} icon={Users} color="#38bdf8" />
                <StatCard title="Guardametas" value={stats.arqueros} icon={ShieldCheck} color="#f59e0b" />
                <StatCard title="Sin Equipo" value={stats.sinEquipo} icon={Activity} color="#ef4444" />
            </div>

            <div className="pro-card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{viewMode === "list" ? "Directorio" : "Mapa Táctico"}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-darkest)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            className="pro-input"
                            style={{ background: 'transparent', border: 'none', padding: '0', width: '300px' }}
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? <SkeletonLoader.Table rows={6} columns={6} /> : (
                    viewMode === "list" ? (
                        <div className="table-container">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>FOTO</th>
                                        <th>JUGADOR</th>
                                        <th>CÉDULA</th>
                                        <th>EQUIPO</th>
                                        <th>CARRERA / FACULTAD</th>
                                        <th>POSICIÓN / DORSAL</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(j => (
                                        <tr key={j.cedula}>
                                            <td>
                                                <div style={{ width: '45px', height: '45px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                                                    <PlayerImage src={j.persona?.foto_url || j.persona?.foto} iconSize={20} />
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#fff' }}>
                                                {j.persona?.nombres} {j.persona?.apellidos}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)' }}>{j.cedula}</td>
                                            <td>
                                                <span className={`status-pill ${j.equipo?.nombre ? "info" : "warning"}`}>
                                                    {j.equipo?.nombre || "LIBRE"}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <div style={{ color: '#fff' }}>{j.carrera || "-"}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{j.facultad || "-"}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 600 }}>{j.posicion || "-"}</span>
                                                    {j.numero && (
                                                        <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900 }}>
                                                            #{j.numero}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button className="icon-btn" onClick={() => handleViewCarnet(j)} title="Ver Carnet"><IdCard size={18} /></button>
                                                    <button className="icon-btn" style={{ color: "var(--primary)" }} onClick={() => { setCurrentJugador(j); setIsModalOpen(true); }}><Edit size={18} /></button>
                                                    <button className="icon-btn" style={{ color: "var(--danger)" }} onClick={() => handleDelete(j.cedula)}><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem' }}>
                            <VirtualPitch players={filtered.filter(p => !pitchTeamId ? true : String(p.equipo_id) === String(pitchTeamId))} />
                        </div>
                    )
                )}
            </div>

            {/* MODAL FORMULARIO */}
            <JugadorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                equipos={equipos}
                initialData={currentJugador}
                onSave={handleSave}
            />

            {/* MODAL CARNET (QR + PDF) */}
            <CarnetModal
                isOpen={isCarnetOpen}
                data={currentJugador}
                onClose={() => setIsCarnetOpen(false)}
            />
        </div>
    );
};

export default JugadoresPersonas;

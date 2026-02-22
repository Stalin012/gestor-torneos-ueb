import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from 'react-dom';
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
    const FACULTADES_CARRERAS = {
        "Facultad de Ciencias Administrativas, Gestión Empresarial e Informática": [
            "Administración de Empresas (Presencial y En línea)",
            "Contabilidad y Auditoría",
            "Mercadotecnia",
            "Marketing Digital (En línea)",
            "Software",
            "Tecnologías de la Información (TICS)",
            "Emprendimiento e Innovación Social (En línea)"
        ],
        "Facultad de Ciencias de la Salud y del Ser Humano": [
            "Enfermería",
            "Terapia Física",
            "Psicología"
        ],
        "Facultad de Ciencias Agropecuarias, Recursos Naturales y del Ambiente": [
            "Agronomía",
            "Agroindustria",
            "Medicina Veterinaria",
            "Ingeniería en Gestión de Riesgos"
        ],
        "Facultad de Jurisprudencia, Ciencias Sociales y Políticas": [
            "Derecho",
            "Sociología",
            "Comunicación",
            "Criminalística",
            "Turismo y Hotelería"
        ],
        "Facultad de Ciencias de la Educación, Sociales, Filosóficas y Humanísticas": [
            "Educación Básica",
            "Educación Inicial",
            "Educación Intercultural Bilingüe",
            "Pedagogía de la Informática",
            "Pedagogía de las Matemáticas y la Física",
            "Pedagogía de los Idiomas Nacionales y Extranjeros"
        ]
    };

    const POSICIONES_POR_DEPORTE = {
        "Fútbol": [
            { grupo: "Posiciones", posiciones: ["Portero", "Defensa Central", "Lateral Derecho", "Lateral Izquierdo", "Mediocentro Defensivo", "Mediocentro", "Volante", "Extremo Derecho", "Extremo Izquierdo", "Media Punta", "Delantero"] }
        ],
        "Baloncesto": [
            { grupo: "Posiciones", posiciones: ["Base (1)", "Escolta (2)", "Alero (3)", "Ala-Pívot (4)", "Pívot (5)"] }
        ],
        "Ecuavóley": [
            { grupo: "Posiciones", posiciones: ["Colocador", "Servidor", "Volador"] }
        ]
    };
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState({
        cedula: "",
        equipo_id: "",
        posicion: "",
        numero: "",
        carrera: "",
        facultad: "",
        nombres: "", // Added for new form structure
        apellidos: "", // Added for new form structure
        fecha_nacimiento: "", // Added for new form structure
        sexo: "", // Added for new form structure
        carrera_id: "", // Added for new form structure, assuming it's different from 'carrera'
        estado: "ACTIVO", // Added for new form structure
        email: "", // Added for new form structure
        telefono: "", // Added for new form structure
    });
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
                nombres: initialData.persona?.nombres || "",
                apellidos: initialData.persona?.apellidos || "",
                fecha_nacimiento: initialData.persona?.fecha_nacimiento || "",
                sexo: initialData.persona?.sexo || "",
                facultad: initialData.facultad || initialData.persona?.facultad || "",
                carrera: initialData.carrera || initialData.persona?.carrera || "",
                estado: initialData.estado || "ACTIVO",
                email: initialData.persona?.email || "",
                telefono: initialData.persona?.telefono || "",
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
            setFotoPreview(initialData.persona?.foto_url || initialData.persona?.foto || null);
        } else {
            setFormData({
                cedula: "",
                equipo_id: "",
                posicion: "",
                numero: "",
                carrera: "",
                facultad: "",
                nombres: "",
                apellidos: "",
                fecha_nacimiento: "",
                sexo: "",
                carrera_id: "",
                estado: "ACTIVO",
                email: "",
                telefono: "",
            });
            setPersonaData({ cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", email: "" });
            setPersonaExiste(null);
            setFotoFile(null);
            setFotoPreview(null);
        }
        if (isOpen) {
            document.body.classList.add('modal-open');
            return () => document.body.classList.remove('modal-open');
        }
    }, [initialData, isOpen]);

    const handlePhotoChange = (e) => {
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
            setFormData(prev => ({
                ...prev,
                nombres: resp.data.data?.nombres || resp.data?.nombres || "",
                apellidos: resp.data.data?.apellidos || resp.data?.apellidos || "",
                fecha_nacimiento: resp.data.data?.fecha_nacimiento || resp.data?.fecha_nacimiento || "",
                sexo: resp.data.data?.sexo || resp.data?.sexo || "",
                facultad: resp.data.data?.facultad || resp.data?.facultad || "",
                carrera: resp.data.data?.carrera || resp.data?.carrera || "",
                email: resp.data.data?.email || resp.data?.email || "",
                telefono: resp.data.data?.telefono || resp.data?.telefono || "",
            }));
            setFotoPreview(resp.data.data?.foto_url || resp.data.data?.foto || null);
        } catch (err) {
            if (err.response?.status === 404) {
                setPersonaExiste(false);
                setPersonaData(p => ({ ...p, cedula: formData.cedula }));
                setFormData(prev => ({
                    ...prev,
                    nombres: "",
                    apellidos: "",
                    fecha_nacimiento: "",
                    sexo: "",
                    facultad: "",
                    carrera: "",
                    email: "",
                    telefono: "",
                }));
                setFotoPreview(null);
            }
        } finally { setVerificando(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Confirmación antes de guardar
        const confirmar = window.confirm(
            isEditMode
                ? "¿Desea guardar los cambios realizados en la ficha del atleta?"
                : "¿Desea registrar este nuevo jugador?"
        );

        if (!confirmar) return;

        setIsSubmitting(true);
        try {
            await onSave(formData, isEditMode, personaData, personaExiste, fotoFile);
            onClose();
        } finally { setIsSubmitting(false); }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content modal-xl scale-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.05))',
                    borderBottom: '2px solid var(--primary)',
                    padding: '0.75rem 1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(53, 110, 216, 0.2)'
                        }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{isEditMode ? "Ficha Técnica Atleta" : "Registro de Jugador"}</h2>
                            <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gestión integral de perfiles y habilitaciones</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" onClick={onClose}>
                        <CloseIcon size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <form id="jugador-form" onSubmit={handleSubmit}>
                        <div className="responsive-grid" style={{ gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '160px',
                                            height: '200px',
                                            margin: '0 auto',
                                            borderRadius: '24px',
                                            border: '2px dashed rgba(53, 110, 216, 0.3)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            overflow: 'hidden',
                                            background: 'rgba(53, 110, 216, 0.05)',
                                            position: 'relative'
                                        }}
                                        className="photo-upload-container"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handlePhotoChange}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                        {fotoPreview ? (
                                            <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <>
                                                <Camera size={40} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cargar Foto</span>
                                            </>
                                        )}
                                    </div>
                                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mín. 400x500px • JPG/PNG</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Cédula de Identidad</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            className="pro-input"
                                            name="cedula"
                                            maxLength={10}
                                            value={formData.cedula}
                                            onChange={handleChange}
                                            onBlur={verificarCedula}
                                            disabled={isEditMode}
                                            required
                                            placeholder="Ingrese número de documento"
                                            style={{ fontSize: '1.2rem', fontWeight: 700 }}
                                        />
                                        {verificando && <div className="spinner" style={{ position: 'absolute', right: '12px', top: '12px', width: '24px', height: '24px' }} />}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nombres Completos</label>
                                    <input
                                        type="text"
                                        className="pro-input"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Apellidos Completos</label>
                                    <input
                                        type="text"
                                        className="pro-input"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            className="pro-input"
                                            value={formData.fecha_nacimiento}
                                            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sexo</label>
                                        <select
                                            className="pro-input"
                                            value={formData.sexo}
                                            onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 800 }}>Facultad Académica</label>
                                        <select
                                            className="pro-input"
                                            value={formData.facultad}
                                            onChange={(e) => setFormData({ ...formData, facultad: e.target.value, carrera: "" })}
                                            required
                                        >
                                            <option value="">Selecciones Facultad...</option>
                                            {Object.keys(FACULTADES_CARRERAS).map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 800 }}>Carrera Universitaria</label>
                                        <select
                                            className="pro-input"
                                            value={formData.carrera}
                                            onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                                            required
                                            disabled={!formData.facultad}
                                        >
                                            <option value="">{formData.facultad ? "Seleccione Carrera..." : "Elija Facultad"}</option>
                                            {formData.facultad && FACULTADES_CARRERAS[formData.facultad].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Estado de Habilitación</label>
                                    <select
                                        className="pro-input"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    >
                                        <option value="ACTIVO">Activo - Habilitado</option>
                                        <option value="INACTIVO">Inactivo - Sancionado</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="pro-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="usuario@ejemplo.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Teléfono de Contacto</label>
                                    <input
                                        type="tel"
                                        className="pro-input"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 800 }}>Club / Unidad Operativa</label>
                                        <select name="equipo_id" value={formData.equipo_id} onChange={handleChange} className="pro-input">
                                            <option value="">Sin Equipo</option>
                                            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 800 }}>Número</label>
                                        <input type="text" name="numero" maxLength={2} value={formData.numero} onChange={handleChange} className="pro-input" placeholder="00" style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 800 }}>Posición</label>
                                    <select name="posicion" value={formData.posicion} onChange={handleChange} className="pro-input">
                                        <option value="">Seleccione una posición...</option>
                                        {(() => {
                                            const equipoSeleccionado = equipos.find(eq => String(eq.id) === String(formData.equipo_id));
                                            const deporteNombre = equipoSeleccionado?.deporte?.nombre;
                                            const posiciones = POSICIONES_POR_DEPORTE[deporteNombre];

                                            if (posiciones) {
                                                return posiciones.map(grupo => (
                                                    <optgroup key={grupo.grupo} label={grupo.grupo}>
                                                        {grupo.posiciones.map(pos => (
                                                            <option key={pos} value={pos}>{pos}</option>
                                                        ))}
                                                    </optgroup>
                                                ));
                                            }
                                            return null;
                                        })()}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" className="pro-btn btn-secondary" onClick={onClose}>Descartar</button>
                    <button type="submit" form="jugador-form" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '180px' }}>
                        {isSubmitting ? <div className="spinner" /> : <><Save size={18} /> {isEditMode ? "Guardar Cambios" : "Validar y Registrar"}</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
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
                success(
                    isEdit ? "Datos Actualizados" : "Registro Exitoso",
                    isEdit
                        ? "Los datos del atleta han sido actualizados correctamente."
                        : "El jugador ha sido registrado exitosamente en el sistema."
                );
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
                    <button
                        className="pro-btn btn-primary"
                        onClick={() => { setCurrentJugador(null); setIsModalOpen(true); }}
                        style={{ padding: '0.42rem 0.65rem', fontSize: '0.8rem', minHeight: '34px', width: 'auto', whiteSpace: 'nowrap' }}
                    >
                        <Plus size={14} /> Registrar Jugador
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <StatCard title="Total Jugadores" value={stats.total} icon={Users} color="#38bdf8" />
                <StatCard title="Portero" value={stats.arqueros} icon={ShieldCheck} color="#f59e0b" />
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
                                        <th>POSICIÓN / NÚMERO</th>
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
                                                    {j.equipo?.nombre || "Sin Equipo"}
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

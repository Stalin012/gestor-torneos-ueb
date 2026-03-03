import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from 'react-dom';
import CarnetModal from "../../components/CarnetModal";
import {
    UserCheck, Plus, Edit, Trash2, Search, X, User, Save,
    IdCard, Layout, List, Users, Activity, Target, ShieldCheck, FileText, Download, Upload, Camera,
    ChevronRight, Filter, MoreHorizontal, GraduationCap, Phone, Mail, Calendar, MapPin, Grid
} from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import LoadingScreen from "../../components/LoadingScreen";
import api, { API_BASE } from "../../api";
import { useNotification } from "../../context/NotificationContext";
import { getAssetUrl } from "../../utils/helpers";

// ================= HELPERS / CONSTANTS =====================
const FACULTADES_CARRERAS = {
    "Ciencias Administrativas e Informática": [
        "Software",
        "Tecnologías de la Información",
        "Administración de Empresas",
        "Contabilidad y Auditoría"
    ],
    "Ciencias de la Salud": [
        "Enfermería",
        "Terapia Física",
        "Psicología"
    ],
    "Jurisprudencia y Sociales": [
        "Derecho",
        "Sociología",
        "Comunicación"
    ],
    "Ciencias Agropecuarias": [
        "Agronomía",
        "Veterinaria"
    ]
};

const POSICIONES_DEPORTE = {
    futbol: [
        'Arquero',
        'Lateral Derecho',
        'Defensa Central 1',
        'Defensa Central 2',
        'Lateral Izquierdo',
        'Volante de Marca',
        'Volante Mixto',
        'Volante Creativo',
        'Extremo Derecho',
        'Extremo Izquierdo',
        'Centrodelantero'
    ],
    basquet: [
        'Base (Armador)',
        'Alero',
        'Poste (Pívot)'
    ],
    voley: [
        'Armador',
        'Rematador',
        'Central',
        'Líbero',
        'Zaguero'
    ]
};

const DEPORTES_INFO = [
    { key: 'futbol', label: '⚽ Fútbol', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { key: 'basquet', label: '🏀 Básquet', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { key: 'voley', label: '🏐 Vóley', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' }
];

// ================= MODALS =====================
const PlayerModal = ({ isOpen, onClose, initialData, equipos, deportes, onSave, loading }) => {
    const isEditMode = !!initialData;
    const [form, setForm] = useState({
        cedula: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        sexo: 'M',
        equipo_id: '',
        facultad: '',
        carrera: '',
        posicion: '',
        numero: ''
    });
    const [deporteModal, setDeporteModal] = useState(''); // SOLO para controlar el selector de posiciones
    const [fotoFile, setFotoFile] = useState(null); // Nuevo estado para el archivo de la foto
    const [fotoPreview, setFotoPreview] = useState(null); // Nuevo estado para la vista previa de la foto

    useEffect(() => {
        console.log("Initial Data received by PlayerModal:", initialData);
        if (initialData) {
            setForm({
                cedula: initialData.cedula || '',
                nombres: initialData.persona?.nombres || '',
                apellidos: initialData.persona?.apellidos || '',
                email: initialData.persona?.email || '',
                telefono: initialData.persona?.telefono || '',
                fecha_nacimiento: initialData.persona?.fecha_nacimiento ? new Date(initialData.persona.fecha_nacimiento).toISOString().split('T')[0] : '',
                sexo: initialData.persona?.sexo || 'M',
                equipo_id: initialData.equipo_id || '',
                facultad: initialData.facultad || '',
                carrera: initialData.carrera || '',
                posicion: initialData.posicion || '',
                numero: initialData.numero || ''
            });
            // Detectar el deporte por la posicion guardada
            const savedPos = initialData.posicion || '';
            const detectedDeporte = POSICIONES_DEPORTE.futbol.includes(savedPos) ? 'futbol'
                : POSICIONES_DEPORTE.basquet.includes(savedPos) ? 'basquet'
                    : POSICIONES_DEPORTE.voley.includes(savedPos) ? 'voley'
                        : '';
            setDeporteModal(detectedDeporte);
            const existingFoto = initialData.persona?.foto_url || initialData.persona?.foto;
            setFotoPreview(existingFoto ? getAssetUrl(existingFoto) : null);
            setFotoFile(null);
        } else {
            setForm({
                cedula: '', nombres: '', apellidos: '', email: '', telefono: '',
                fecha_nacimiento: '', sexo: 'M', equipo_id: '', facultad: '',
                carrera: '', posicion: '', numero: ''
            });
            setDeporteModal('');
            setFotoFile(null); // Limpiar archivo al crear
            setFotoPreview(null); // Limpiar vista previa al crear
        }
    }, [initialData, isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoFile(file);
            setFotoPreview(URL.createObjectURL(file)); // Crear URL para vista previa
        } else {
            setFotoFile(null);
            setFotoPreview(null);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15.px' }}>
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            <UserCheck size={28} />
                        </div>
                        <div>
                            <h2 className="modal-title">{isEditMode ? "Modificar Deportista" : "Alta de Deportista"}</h2>
                            <p className="modal-subtitle" style={{ color: '#94a3b8' }}>Registro oficial en base de datos universitaria</p>
                        </div>
                    </div>
                    <button className="btn-icon-close" type="button" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={e => {
                    e.preventDefault();
                    onSave(form, fotoFile, isEditMode);
                }}>
                    <div className="modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                            {/* Campo de subida de foto */}
                            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Foto del Deportista</label>
                                <div
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        background: fotoPreview ? `url(${fotoPreview}) center/cover` : 'rgba(255,255,255,0.05)',
                                        border: '2px dashed rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        marginBottom: '1rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => document.getElementById('foto-upload').click()}
                                >
                                    {!fotoPreview && <Camera size={40} color="#94a3b8" />}
                                    <input
                                        type="file"
                                        id="foto-upload"
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {fotoPreview && (
                                    <button
                                        type="button"
                                        onClick={() => { setFotoFile(null); setFotoPreview(null); }}
                                        className="pro-btn btn-secondary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                    >
                                        Quitar Foto
                                    </button>
                                )}
                            </div>
                            {/* Fin Campo de subida de foto */}

                            <div className="form-group">
                                <label className="form-label">Identificación (Cédula)</label>
                                <input className="pro-input" required value={form.cedula} onChange={e => setForm({ ...form, cedula: e.target.value })} disabled={isEditMode} placeholder="0000000000" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Correo Electrónico</label>
                                <input type="email" className="pro-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ejemplo@ueb.edu.ec" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nombres Completos</label>
                                <input className="pro-input" required value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Apellidos Completos</label>
                                <input className="pro-input" required value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono Móvil</label>
                                <input className="pro-input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="0900000000" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fecha de Nacimiento</label>
                                <input type="date" className="pro-input" required value={form.fecha_nacimiento} onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Equipo de Destino</label>
                                <select className="pro-input" value={form.equipo_id} onChange={e => setForm({ ...form, equipo_id: e.target.value })}>
                                    <option value="">Ninguno / Independiente</option>
                                    {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Posición Predilecta</label>
                                <select
                                    className="pro-input"
                                    value={form.posicion}
                                    onChange={e => setForm({ ...form, posicion: e.target.value })}
                                >
                                    <option value="">Seleccione posición...</option>
                                    {(() => {
                                        // Determinar el deporte del equipo seleccionado
                                        let activeDeporteKey = null;
                                        if (form.equipo_id && equipos.length > 0 && deportes && deportes.length > 0) {
                                            const eq = equipos.find(e => e.id.toString() === form.equipo_id.toString());
                                            if (eq && eq.deporte_id) {
                                                const dep = deportes.find(d => d.id.toString() === eq.deporte_id.toString());
                                                if (dep) {
                                                    const dName = dep.nombre.toLowerCase();
                                                    if (dName.includes('futbol') || dName.includes('fútbol')) activeDeporteKey = 'futbol';
                                                    else if (dName.includes('basquet') || dName.includes('básquet')) activeDeporteKey = 'basquet';
                                                    else if (dName.includes('voley') || dName.includes('vóley') || dName.includes('ecuavoley')) activeDeporteKey = 'voley';
                                                }
                                            }
                                        }

                                        if (activeDeporteKey) {
                                            // Mostrar solo las del deporte detectado
                                            return (
                                                <optgroup label={DEPORTES_INFO.find(d => d.key === activeDeporteKey)?.label || "Posiciones"}>
                                                    {POSICIONES_DEPORTE[activeDeporteKey].map(pos => (
                                                        <option key={pos} value={pos}>{pos}</option>
                                                    ))}
                                                </optgroup>
                                            );
                                        } else {
                                            // Mostrar todas si no hay equipo seleccionado o el deporte no calza
                                            return (
                                                <>
                                                    <optgroup label="⚽ Fútbol">
                                                        {POSICIONES_DEPORTE.futbol.map(pos => (
                                                            <option key={pos} value={pos}>{pos}</option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="🏀 Básquet">
                                                        {POSICIONES_DEPORTE.basquet.map(pos => (
                                                            <option key={pos} value={pos}>{pos}</option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="🏐 Vóley">
                                                        {POSICIONES_DEPORTE.voley.map(pos => (
                                                            <option key={pos} value={pos}>{pos}</option>
                                                        ))}
                                                    </optgroup>
                                                </>
                                            );
                                        }
                                    })()}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Numero</label>
                                <input type="number" className="pro-input" value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} placeholder="00" />
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#3b82f6', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <GraduationCap size={18} /> Datos Académicos
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Facultad</label>
                                    <select className="pro-input" value={form.facultad} onChange={e => setForm({ ...form, facultad: e.target.value })}>
                                        <option value="">Seleccione Facultad...</option>
                                        {Object.keys(FACULTADES_CARRERAS).map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Carrera</label>
                                    <select className="pro-input" value={form.carrera} onChange={e => setForm({ ...form, carrera: e.target.value })}>
                                        <option value="">Seleccione Carrera...</option>
                                        {form.facultad && FACULTADES_CARRERAS[form.facultad]?.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="pro-btn btn-primary" disabled={loading}>
                            {loading ? <div className="spinner-sm" /> : <Save size={18} />} Finalizar Registro
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ================= MAIN COMPONENT =====================
const JugadoresPersonas = () => {
    const { addNotification } = useNotification();
    const [players, setPlayers] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [deportes, setDeportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [deporteFilter, setDeporteFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [carnetPlayer, setCarnetPlayer] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pResp, eResp, dResp] = await Promise.all([
                api.get('/jugadores'),
                api.get('/equipos'),
                api.get('/deportes')
            ]);
            setPlayers(Array.isArray(pResp.data) ? pResp.data : (pResp.data?.data || []));
            setEquipos(Array.isArray(eResp.data) ? eResp.data : (eResp.data?.data || []));
            setDeportes(Array.isArray(dResp.data) ? dResp.data : (dResp.data?.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (form, fotoFile, isEdit) => {
        // Validar campos obligatorios antes de enviar
        const mandatoryFields = {
            cedula: 'Identificación (Cédula)',
            nombres: 'Nombres',
            apellidos: 'Apellidos',
            email: 'Correo Electrónico',
            fecha_nacimiento: 'Fecha de Nacimiento'
        };

        const missing = Object.entries(mandatoryFields)
            .filter(([key]) => !form[key] || form[key].toString().trim() === '')
            .map(([, label]) => label);

        if (missing.length > 0) {
            addNotification(`Por favor complete los campos obligatorios: ${missing.join(', ')}`, 'warning');
            return;
        }

        const confirmMsg = isEdit
            ? '¿Desea actualizar los datos del deportista?'
            : '¿Desea certificar el alta del nuevo deportista?';

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const url = isEdit ? `/jugadores/${form.cedula}` : '/jugadores';
            const method = 'post';

            const formData = new FormData();
            for (const key in form) {
                if (form[key] !== null && form[key] !== undefined) {
                    formData.append(key, form[key]);
                }
            }
            if (fotoFile) {
                formData.append('foto', fotoFile);
            }
            if (isEdit) {
                formData.append('_method', 'PUT');
            }

            await api[method](url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            addNotification('Los datos han sido guardados correctamente', 'success');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            addNotification(err.response?.data?.message || 'Error al procesar el registro.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cedula) => {
        if (!confirm("¿Deseas eliminar definitivamente este deportista?")) return;
        setLoading(true);
        try {
            await api.delete(`/jugadores/${cedula}`);
            addNotification('Registro removido exitosamente', 'success');
            fetchData();
        } catch (err) {
            addNotification('Error al eliminar registro.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredPlayers = players.filter(p => {
        const matchSearch =
            p.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.persona?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.cedula.includes(searchTerm);

        const matchDeporte = !deporteFilter || (() => {
            if (!p.equipo_id || !equipos.length || !deportes.length) return false;
            const eq = equipos.find(e => e.id.toString() === p.equipo_id.toString());
            if (!eq || !eq.deporte_id) return false;
            const dep = deportes.find(d => d.id.toString() === eq.deporte_id.toString());
            if (!dep) return false;

            const dName = dep.nombre.toLowerCase();
            if (deporteFilter === 'futbol' && (dName.includes('futbol') || dName.includes('fútbol'))) return true;
            if (deporteFilter === 'basquet' && (dName.includes('basquet') || dName.includes('básquet'))) return true;
            if (deporteFilter === 'voley' && (dName.includes('voley') || dName.includes('vóley') || dName.includes('ecuavoley'))) return true;

            return false;
        })();

        return matchSearch && matchDeporte;
    });

    if (loading && players.length === 0) return <LoadingScreen message="Sincronizando Nómina Universitaria..." />;

    return (
        <div className="rep-scope rep-screen-container rep-dashboard-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* HEADER */}
            <header className="rep-header-main" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div className="header-info">
                        <small className="university-label" style={{ color: '#10b981', fontWeight: 800 }}>Módulo de Capital Humano</small>
                        <h1 className="content-title" style={{ color: '#fff', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <IdCard size={42} color="#10b981" /> Nómina Deportiva
                        </h1>
                        <p className="content-subtitle" style={{ color: '#94a3b8' }}>Administración de personas, deportistas habilitados y vinculación académica</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="pro-btn btn-secondary" style={{ padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Upload size={18} /> Importar
                        </button>
                        <button className="pro-btn btn-primary" onClick={() => { setEditingPlayer(null); setIsModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.8rem 1.5rem', borderRadius: '14px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
                            <Plus size={20} /> Nuevo Deportista
                        </button>
                    </div>
                </div>
            </header>

            {/* SPORT FILTER BUTTONS */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setDeporteFilter('')}
                    style={{
                        padding: '9px 18px', borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                        border: `1.5px solid ${!deporteFilter ? '#fff' : 'rgba(255,255,255,0.1)'}`,
                        background: !deporteFilter ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: !deporteFilter ? '#fff' : '#64748b', transition: 'all 0.2s'
                    }}
                >
                    🏅 Todos
                </button>
                {DEPORTES_INFO.map(dep => (
                    <button
                        key={dep.key}
                        onClick={() => setDeporteFilter(dep.key === deporteFilter ? '' : dep.key)}
                        style={{
                            padding: '9px 18px', borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                            border: `1.5px solid ${deporteFilter === dep.key ? dep.color : 'rgba(255,255,255,0.1)'}`,
                            background: deporteFilter === dep.key ? dep.bg : 'transparent',
                            color: deporteFilter === dep.key ? dep.color : '#64748b', transition: 'all 0.2s'
                        }}
                    >
                        {dep.label}
                    </button>
                ))}
            </div>

            {/* SEARCH + VIEW TOGGLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="search-wrapper" style={{
                    flex: '1 1 300px',
                    maxWidth: '100%',
                    margin: 0,
                    position: 'relative'
                }}>
                    <Search size={20} className="search-icon" style={{
                        color: '#10b981',
                        position: 'absolute',
                        left: '1.25rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10
                    }} />
                    <input
                        className="pro-input"
                        placeholder="Buscar por cédula, nombres o apellidos..."
                        style={{ paddingLeft: '3.5rem', height: '54px', borderRadius: '20px', width: '100%' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '20px',
                    padding: '0.4rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    alignSelf: 'flex-end'
                }}>
                    <button className={`pro-btn ${viewMode === 'grid' ? 'btn-primary' : ''}`} onClick={() => setViewMode('grid')} style={{ padding: '10px 15px', borderRadius: '14px', color: viewMode === 'grid' ? '#fff' : '#64748b', background: viewMode === 'grid' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent', border: 'none' }}>
                        <Grid size={18} />
                    </button>
                    <button className={`pro-btn ${viewMode === 'list' ? 'btn-primary' : ''}`} onClick={() => setViewMode('list')} style={{ padding: '10px 15px', borderRadius: '14px', color: viewMode === 'list' ? '#fff' : '#64748b', background: viewMode === 'list' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent', border: 'none' }}>
                        <List size={18} />
                    </button>
                </div>
            </div>
            {/* PLAYER CONTENT */}
            <div className="rep-content-wrapper">
                {viewMode === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {filteredPlayers.map(player => (
                            <div key={player.cedula} className="pro-card" style={{
                                padding: '1.5rem',
                                borderRadius: '28px',
                                background: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                transition: '0.4s'
                            }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '24px', overflow: 'hidden',
                                        background: player.persona?.foto_url ? `url(${getAssetUrl(player.persona.foto_url)}) center/cover` : 'rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
                                    }}>
                                        {!player.persona?.foto && <User size={40} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{player.persona?.nombres} {player.persona?.apellidos}</h3>
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>CI: {player.cedula}</span>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            <span style={{ padding: '2px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>#{player.numero || 'TBD'}</span>
                                            <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>{player.posicion || 'General'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '18px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                        <Users size={14} /> {player.equipo?.nombre || 'Selección Libre'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.8rem' }}>
                                        <GraduationCap size={14} /> {player.carrera || 'Unidad Académica'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                        <Mail size={14} /> {player.persona?.email || 'N/A'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.8rem' }}>
                                        <Calendar size={14} /> {player.persona?.fecha_nacimiento ? new Date(player.persona.fecha_nacimiento).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="pro-btn" style={{ padding: '8px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} title="WhatsApp"><Phone size={14} /></button>
                                        <button className="pro-btn" style={{ padding: '8px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} title="Email"><Mail size={14} /></button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="pro-btn btn-secondary" style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }} title="Ver Carnet" onClick={() => setCarnetPlayer(player)}><IdCard size={16} /></button>
                                        <button className="pro-btn btn-secondary" style={{ padding: '10px', borderRadius: '12px' }} onClick={() => { setEditingPlayer(player); setIsModalOpen(true); }}><Edit size={16} /></button>
                                        <button className="pro-btn btn-danger" style={{ padding: '10px', borderRadius: '12px' }} onClick={() => handleDelete(player.cedula)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        borderRadius: '32px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto', width: '100%' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                                    <tr>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Deportista</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Identidad / CI</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Numero</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 800 }}>Equipo / Facultad</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'right', color: '#94a3b8', fontWeight: 800 }}>Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPlayers.map(p => (
                                        <tr key={p.cedula} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }} className="table-row-hover">
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{
                                                        width: '56px',
                                                        height: '56px',
                                                        borderRadius: '16px',
                                                        overflow: 'hidden',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}>
                                                        {p.persona?.foto_url || p.persona?.foto ? (
                                                            <img
                                                                src={getAssetUrl(p.persona.foto_url || p.persona.foto)}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                alt={`${p.persona?.nombres}`}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = '<div style="color: #64748b"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <User size={24} color="#64748b" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{p.persona?.nombres} {p.persona?.apellidos}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Posición: {p.posicion || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{p.cedula}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#3b82f6',
                                                    padding: '4px 12px',
                                                    borderRadius: '8px',
                                                    display: 'inline-block',
                                                    fontWeight: 800,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    #{p.numero || '--'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ color: '#10b981', fontWeight: 800 }}>{p.equipo?.nombre || 'Independiente'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.carrera || p.facultad || 'General'}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button className="pro-btn btn-secondary" style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none' }} title="Ver Carnet" onClick={() => setCarnetPlayer(p)}><IdCard size={18} /></button>
                                                    <button className="pro-btn btn-secondary" style={{ padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }} onClick={() => { setEditingPlayer(p); setIsModalOpen(true); }}><Edit size={18} /></button>
                                                    <button className="pro-btn btn-danger" style={{ padding: '10px', borderRadius: '12px', border: 'none' }} onClick={() => handleDelete(p.cedula)}><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <PlayerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingPlayer}
                equipos={equipos}
                deportes={deportes}
                onSave={handleSave}
                loading={loading}
            />

            <CarnetModal
                isOpen={!!carnetPlayer}
                onClose={() => setCarnetPlayer(null)}
                data={carnetPlayer}
            />

        </div>
    );
};

export default JugadoresPersonas;

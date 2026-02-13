import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    UserCheck, Plus, Edit, Trash2, Search, X, User, Save,
    IdCard, Layout, List, Users, Activity, Target, ShieldCheck, FileText, Download
} from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../../components/SkeletonLoader";
import VirtualPitch from "../../components/VirtualPitch";
import { StatCard } from "../../components/StatsComponents";

import "../../admin_styles.css";
import api from "../../api";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/* ============================================================
   COMPONENTES DE APOYO (MODALES)
============================================================ */

// 1. MODAL DEL CARNET (QR + PDF)
const CarnetModal = ({ isOpen, player, onClose }) => {
    const carnetRef = useRef(null);
    const [generating, setGenerating] = useState(false);
    const [carnetData, setCarnetData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && player) {
            loadCarnetData();
        }
    }, [isOpen, player]);

    const loadCarnetData = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/jugadores/${player.cedula}/generar-carnet`);
            setCarnetData(response.data.data);
        } catch (err) {
            console.error('Error cargando datos del carnet:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !player) return null;

    const handleOpenPDF = async () => {
        setGenerating(true);
        window.open(`${API_BASE}/jugadores/${player.cedula}/carnet-pdf`, '_blank');
        setTimeout(() => setGenerating(false), 2000);
    };

    return (
        <div className="modal-overlay backdrop-blur-strong fade-in" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="modal-content scale-in" style={{ maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <div className="modal-header" style={{ background: 'var(--bg-card)', borderRadius: '12px 12px 0 0', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--white)' }}>
                        <IdCard size={20} className="text-accent" /> Credencial Deportiva Profesional
                    </h3>
                    <button className="btn-icon-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '0 0 12px 12px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ margin: '0 auto' }}></div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando datos del sistema...</p>
                        </div>
                    ) : carnetData ? (
                        <>
                            <div
                                ref={carnetRef}
                                style={{
                                    width: '350px',
                                    height: '210px',
                                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                    borderRadius: '16px',
                                    border: '2px solid #3b82f6',
                                    color: '#fff',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    margin: '0 auto',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    display: 'flex',
                                    padding: '20px'
                                }}
                            >
                                {/* Watermark */}
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '60px', color: 'rgba(255,255,255,0.03)', fontWeight: '900', zIndex: 0, pointerEvents: 'none', whiteSpace: 'nowrap' }}>OFICIAL</div>
                                
                                {/* Contenido con Z-Index superior */}
                                <div style={{ display: 'flex', width: '100%', zIndex: 1 }}>
                                    {/* Left Section */}
                                    <div style={{ flex: 1, paddingRight: '15px' }}>
                                        {/* Photo Frame */}
                                        <div style={{ width: '75px', height: '95px', border: '2px solid #3b82f6', borderRadius: '8px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                                            {carnetData.foto ? (
                                                <img src={carnetData.foto} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#3b82f6' }}>
                                                    {carnetData.nombre_completo?.charAt(0) || 'J'}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Info Fields */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre Jugador</div>
                                            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', lineHeight: '1.1' }}>{carnetData.nombre_completo}</div>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Cédula</div>
                                                <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '11px' }}>{carnetData.cedula}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Dorsal</div>
                                                <div style={{ color: '#3b82f6', fontWeight: '900', fontSize: '14px' }}>#{carnetData.numero}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Right Section */}
                                    <div style={{ width: '90px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {/* QR Container Premium */}
                                        <div style={{ background: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', marginBottom: '10px' }}>
                                            {carnetData.qr_svg ? (
                                                <div dangerouslySetInnerHTML={{ __html: carnetData.qr_svg }} style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                                            ) : (
                                                <QRCodeCanvas value={carnetData.qr_text || `https://gestor.ueb.edu.ec/jugador/${carnetData.cedula}`} size={70} />
                                            )}
                                        </div>
                                        
                                        <div style={{ width: '100%' }}>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{carnetData.edad} años</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>ID: {carnetData.cedula.slice(-4)}</div>
                                            <div style={{ color: '#22c55e', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>VÁLIDO 2024</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '2.5rem' }}>
                                <button className="pro-btn btn-secondary" onClick={onClose} style={{ padding: '12px' }}>Cerrar Vista</button>
                                <button className="pro-btn btn-primary btn-ripple" onClick={handleOpenPDF} disabled={generating} style={{ padding: '12px', gap: '8px' }}>
                                    <FileText size={20} /> {generating ? 'Generando...' : 'Descargar PDF Oficial'}
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

// 2. MODAL REGISTRO/EDICIÓN
const JugadorModal = ({ isOpen, onClose, initialData, equipos, onSave }) => {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState({ cedula: "", equipo_id: "", posicion: "", numero: "" });
    const [personaData, setPersonaData] = useState({ cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", email: "" });
    const [personaExiste, setPersonaExiste] = useState(null);
    const [verificando, setVerificando] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                cedula: initialData.cedula,
                equipo_id: initialData.equipo_id || "",
                posicion: initialData.posicion || "",
                numero: initialData.numero || "",
            });
            setPersonaExiste(true);
            setPersonaData({
                cedula: initialData.cedula,
                nombres: initialData.persona?.nombres || "",
                apellidos: initialData.persona?.apellidos || "",
                fecha_nacimiento: initialData.persona?.fecha_nacimiento || "",
                telefono: initialData.persona?.telefono || "",
                email: initialData.persona?.email || ""
            });
        } else {
            setFormData({ cedula: "", equipo_id: "", posicion: "", numero: "" });
            setPersonaData({ cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", email: "" });
            setPersonaExiste(null);
        }
    }, [initialData, isOpen]);

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
            const token = localStorage.getItem("token");
            const resp = await fetch(`${API_BASE}/personas/${formData.cedula}`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });
            if (resp.status === 404) {
                setPersonaExiste(false);
                setPersonaData(p => ({ ...p, cedula: formData.cedula }));
            } else {
                const json = await resp.json();
                setPersonaExiste(true);
                setPersonaData(json.data || json);
            }
        } catch (err) { console.error(err); }
        finally { setVerificando(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "600px" }}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserCheck size={24} style={{ color: 'var(--primary)' }} />
                        {isEditMode ? 'Ficha de Jugador' : 'Registro de Jugador'}
                    </h2>
                    <button onClick={onClose} className="btn-icon-close"><X size={24} /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSave(formData, isEditMode, personaData, personaExiste); }} style={{ padding: "1.5rem" }}>
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Cédula (Persona)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="cedula"
                                    maxLength={10}
                                    value={formData.cedula}
                                    onChange={handleChange}
                                    onBlur={verificarCedula}
                                    required
                                    disabled={isEditMode}
                                    className="pro-input"
                                />
                                {verificando && (
                                    <div className="spinner" style={{ position: 'absolute', right: '10px', top: '10px', width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                )}
                            </div>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Equipo Asignado</label>
                            <select name="equipo_id" value={formData.equipo_id} onChange={handleChange} className="pro-input">
                                <option value="">Sin equipo</option>
                                {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    {personaExiste === true && (
                        <div className="status-badge badge-success" style={{ width: "100%", padding: "12px", justifyContent: "center", marginBottom: "1rem", fontSize: '0.95rem' }}>
                            <UserCheck size={18} style={{ marginRight: '8px' }} /> Persona Vinculada: {personaData.nombres} {personaData.apellidos}
                        </div>
                    )}

                    {personaExiste === false && (
                        <div style={{ padding: "1.5rem", background: "rgba(245, 158, 11, 0.1)", border: "1px dashed var(--warning-text)", borderRadius: '12px', marginBottom: "1rem" }}>
                            <h4 style={{ color: "var(--warning-text)", marginBottom: "1rem", display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                                <Activity size={18} /> Registrar Datos de Persona
                            </h4>
                            <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Nombres</label>
                                    <input type="text" value={personaData.nombres} onChange={e => setPersonaData({ ...personaData, nombres: e.target.value })} className="pro-input" required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Apellidos</label>
                                    <input type="text" value={personaData.apellidos} onChange={e => setPersonaData({ ...personaData, apellidos: e.target.value })} className="pro-input" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fecha de Nacimiento</label>
                                <input type="date" value={personaData.fecha_nacimiento} onChange={e => setPersonaData({ ...personaData, fecha_nacimiento: e.target.value })} className="pro-input" />
                            </div>
                        </div>
                    )}

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Posición Táctica</label>
                            <input type="text" name="posicion" value={formData.posicion} onChange={handleChange} className="pro-input" placeholder="Ej: Delantero" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Número Dorsal</label>
                            <input type="text" name="numero" maxLength={2} value={formData.numero} onChange={handleChange} className="pro-input" placeholder="00" />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="pro-btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="pro-btn btn-primary">
                            <Save size={18} style={{ marginRight: "8px" }} />
                            {isEditMode ? "Actualizar Ficha" : "Registrar Jugador"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
const JugadoresPersonas = () => {
    const navigate = useNavigate();
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
            setJugadores(jData.data?.data || jData.data || []);
            setEquipos(eData.data?.data || eData.data || []);
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

    const handleSave = async (formData, isEdit, personaData, personaExiste) => {
        try {
            if (personaExiste === false) {
                const pResp = await api.post('/personas', personaData);
                if (!pResp.status || pResp.status !== 201) return alert("Error al crear la persona.");
            }

            const response = await api[isEdit ? 'patch' : 'post'](
                isEdit ? `/jugadores/${formData.cedula}` : '/jugadores',
                formData
            );
            if (response.status === 200 || response.status === 201) {
                setIsModalOpen(false);
                loadData();
            } else {
                alert(response.data?.message || "Error al guardar el jugador.");
            }
        } catch (err) {
            console.error(err);
            alert("Error al guardar el jugador.");
        }
    };

    const handleDelete = async (cedula) => {
        if (!window.confirm("¿Seguro que desea eliminar este jugador?")) return;
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${API_BASE}/jugadores/${cedula}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) loadData();
        } catch (err) { console.error(err); }
    };

    const handleViewCarnet = (player) => {
        setCurrentJugador(player);
        setIsCarnetOpen(true);
    };

    return (
        <div className="admin-page-container fade-enter">
            {/* HEADERS */}
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Gestión de Jugadores</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Administración de plantillas y carnets.
                    </p>
                </div>
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
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>JUGADOR</th>
                                        <th>EQUIPO</th>
                                        <th>POSICIÓN</th>
                                        <th>DORSAL</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(j => (
                                        <tr key={j.cedula}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg-3), var(--bg-1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                                                        {(j.persona?.nombres || "J").charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: "600", color: '#fff' }}>{j.persona?.nombres} {j.persona?.apellidos}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{j.cedula}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={`status-badge ${j.equipo?.nombre ? "badge-info" : "badge-warning"}`}>{j.equipo?.nombre || "LIBRE"}</span></td>
                                            <td style={{ fontWeight: "500" }}>{j.posicion || "-"}</td>
                                            <td><div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', border: '1px solid var(--border)', width: 'fit-content' }}>{j.numero || "--"}</div></td>
                                            <td>
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button className="pro-btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleViewCarnet(j)} title="Ver Carnet"><IdCard size={16} /></button>
                                                    <button className="pro-btn btn-secondary" style={{ padding: '6px' }} onClick={() => { setCurrentJugador(j); setIsModalOpen(true); }}><Edit size={16} /></button>
                                                    <button className="pro-btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDelete(j.cedula)}><Trash2 size={16} /></button>
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
                player={currentJugador}
                onClose={() => setIsCarnetOpen(false)}
            />
        </div>
    );
};

export default JugadoresPersonas;
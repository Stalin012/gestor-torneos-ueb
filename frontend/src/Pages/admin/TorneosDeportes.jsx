import React, { useState, useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Swords, Plus, Edit, Trash2, X, Save, Box, Zap,
  AlertCircle, CheckCircle, Eye, Layout, List, Search,
  Activity, Target, Calendar, MapPin, Info, Shield, ShieldCheck
} from "lucide-react";

import LoadingScreen from "../../components/LoadingScreen";
import SkeletonLoader from "../../components/SkeletonLoader";
import { StatCard } from "../../components/StatsComponents";
import { useNotifications } from "../../components/NotificationCenter";

import api, { apiPublic } from "../../api";

const ESTADOS_TORNEO = {
  ACTIVO: "Activo",
  FINALIZADO: "Finalizado",
};

const FILTER_OPTIONS = {
  TODOS: "todos",
  ACTIVO: "Activo",
  FINALIZADO: "Finalizado",
};

// =========================================================
// UTILITIES
// =========================================================
const formatDateDisplay = (dateString) => {
  if (!dateString) return "-";
  return String(dateString).split("T")[0].split(" ")[0];
};

const toId = (value) => (value === null || value === undefined ? "" : String(value));

const getDisplayDate = (dataField) => {
  if (!dataField) return "";
  const s = String(dataField);
  if (s.includes("T")) return s.split("T")[0];
  return s.split(" ")[0];
};

const formatApiDate = (date) => (date ? `${date} 00:00:00` : null);

const getSportImage = (sportName) => {
  const name = sportName?.toLowerCase() || "";
  if (name.includes("fútbol") || name.includes("futbol") || name.includes("soccer"))
    return "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800";
  if (name.includes("básquet") || name.includes("basquet") || name.includes("basket") || name.includes("baloncesto"))
    return "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800";
  if (name.includes("volley") || name.includes("vóley") || name.includes("voley"))
    return "https://images.unsplash.com/photo-1592656673322-be2e1744b409?auto=format&fit=crop&q=80&w=800";
  if (name.includes("tenis") || name.includes("tennis"))
    return "https://images.unsplash.com/photo-1595435066311-64906f235588?auto=format&fit=crop&q=80&w=800";
  if (name.includes("natación") || name.includes("natacion") || name.includes("swim"))
    return "https://images.unsplash.com/photo-1530549387631-6c12946b9c9d?auto=format&fit=crop&q=80&w=800";
  if (name.includes("ajedrez") || name.includes("chess"))
    return "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=800";
  if (name.includes("atletismo") || name.includes("running") || name.includes("atletics"))
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800";
  if (name.includes("ciclismo") || name.includes("cycling") || name.includes("bicicleta"))
    return "https://images.unsplash.com/photo-1541625602330-2277a7c2f219?auto=format&fit=crop&q=80&w=800";
  if (name.includes("ping pong") || name.includes("table tennis") || name.includes("tenis de mesa"))
    return "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=800";
  return "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800";
};

// =========================================================
// MODALS
// =========================================================

/**
 * Modal para Crear / Editar Torneo con diseño Elite
 */
const CreateTorneoModal = ({
  isOpen, onClose, deportes, categorias, onSaved, initialData,
  draftSelection, setDraftSelection
}) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    nombre: "", deporte_id: "", categoria_id: "",
    fecha_inicio: "", fecha_fin: "", ubicacion: "",
    descripcion: "", estado: ESTADOS_TORNEO.ACTIVO
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        deporte_id: toId(initialData.deporte_id || initialData.deporte?.id || ""),
        categoria_id: toId(initialData.categoria_id || initialData.categoria_relacion?.id || ""),
        fecha_inicio: getDisplayDate(initialData.fecha_inicio),
        fecha_fin: getDisplayDate(initialData.fecha_fin),
        ubicacion: initialData.ubicacion || "",
        descripcion: initialData.descripcion || "",
        estado: initialData.estado || ESTADOS_TORNEO.ACTIVO,
      });
    } else {
      setFormData(prev => ({
        ...prev,
        nombre: "",
        deporte_id: toId(draftSelection?.deporte_id || ""),
        categoria_id: toId(draftSelection?.categoria_id || ""),
        fecha_inicio: "", fecha_fin: "", ubicacion: "", descripcion: ""
      }));
    }
  }, [isOpen, initialData, draftSelection]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    }
  }, [isOpen]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (!isEditMode && setDraftSelection && (name === "deporte_id" || name === "categoria_id")) {
      setDraftSelection(prev => ({ ...prev, [name]: value }));
    }
  }, [isEditMode, setDraftSelection]);

  const categoriasFiltradas = useMemo(() => {
    if (!formData.deporte_id) return [];
    return (categorias || []).filter(cat => String(cat.deporte_id) === String(formData.deporte_id));
  }, [categorias, formData.deporte_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.nombre?.trim() || !formData.deporte_id || !formData.categoria_id) {
      addNotification("Por favor complete los campos obligatorios", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        nombre: formData.nombre.trim(),
        deporte_id: Number(formData.deporte_id),
        categoria_id: Number(formData.categoria_id),
        fecha_inicio: formatApiDate(formData.fecha_inicio),
        fecha_fin: formatApiDate(formData.fecha_fin),
      };

      await api[isEditMode ? 'put' : 'post'](
        isEditMode ? `/torneos/${initialData.id}` : '/torneos',
        payload
      );

      addNotification(`Torneo ${isEditMode ? 'actualizado' : 'creado'} con éxito`, "success");
      onSaved();
      onClose();
    } catch (err) {
      addNotification(err.response?.data?.message || "Error al guardar torneo", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-content scale-in" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.05))',
          borderBottom: '2px solid var(--primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary), #10b981)',
              color: 'white',
              boxShadow: '0 8px 20px rgba(53, 110, 216, 0.3)'
            }}>
              <Trophy size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>
                {isEditMode ? 'Editar Competición' : 'Nueva Competición'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Defina los parámetros generales del torneo deportivo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '2.5rem' }}>
          <form id="torneo-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}>Nombre del Evento <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="pro-input" placeholder="Ej: Copa de Invierno 2025" style={{ fontSize: '1.1rem', fontWeight: 700 }} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}>Descripción / Reglamento</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="pro-input" placeholder="Información adicional relevante..." rows={4} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 800 }}>Disciplina <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="deporte_id" value={formData.deporte_id} onChange={handleChange} required className="pro-input">
                      <option value="">Seleccione...</option>
                      {deportes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 800 }}>Categoría <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required className="pro-input" disabled={!formData.deporte_id}>
                      <option value="">{formData.deporte_id ? 'Seleccione...' : 'Elegir Deporte'}</option>
                      {categoriasFiltradas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Logística y Tiempos</h4>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}><Calendar size={16} style={{ marginRight: 8 }} /> Fecha de Inicio</label>
                  <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} className="pro-input" />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}><Calendar size={16} style={{ marginRight: 8 }} /> Fecha de Cierre</label>
                  <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} className="pro-input" />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}><MapPin size={16} style={{ marginRight: 8 }} /> Sede Central</label>
                  <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="pro-input" placeholder="Ej: Polideportivo Sur" />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}>Estado Operativo</label>
                  <select name="estado" value={formData.estado} onChange={handleChange} className="pro-input">
                    <option value={ESTADOS_TORNEO.ACTIVO}>Activo / En Curso</option>
                    <option value={ESTADOS_TORNEO.FINALIZADO}>Finalizado / Histórico</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer" style={{ padding: '1.5rem 2.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button type="button" onClick={onClose} className="pro-btn btn-secondary">Descartar</button>
          <button type="submit" form="torneo-form" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '180px', justifyContent: 'center' }}>
            {isSubmitting ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><Save size={18} /> {isEditMode ? 'Actualizar Evento' : 'Publicar Torneo'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};


/**
 * Modal para Crear / Editar Deporte
 */
const CreateDeporteModal = ({ isOpen, onClose, onSaved, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ nombre: initialData.nombre || "", descripcion: initialData.descripcion || "" });
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    } else if (isOpen) {
      setFormData({ nombre: "", descripcion: "" });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api[isEditMode ? 'put' : 'post'](
        isEditMode ? `/deportes/${initialData.id}` : "/deportes",
        formData
      );
      addNotification(`Disciplina ${isEditMode ? 'actualizada' : 'creada'} con éxito`, "success");
      onSaved();
      onClose();
    } catch (err) {
      addNotification(err.response?.data?.message || "Error al guardar disciplina", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content scale-in" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05))',
          borderBottom: '2px solid #8b5cf6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: 'white',
              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
            }}>
              <Swords size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
                {isEditMode ? 'Configurar Disciplina' : 'Nueva Disciplina'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestión de ramas deportivas oficiales</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Nombre de la Disciplina</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="pro-input" placeholder="Ej: Vóleibol de Playa" style={{ fontSize: '1.1rem' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Descripción de la Rama</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="pro-input" placeholder="Breve descripción técnica o histórica..." rows={4} />
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              <button type="button" onClick={onClose} className="pro-btn btn-secondary">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="pro-btn" style={{ background: '#8b5cf6', color: 'white', minWidth: '160px', justifyContent: 'center' }}>
                {isSubmitting ? <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <><Save size={18} /> {isEditMode ? 'Guardar Cambios' : 'Registrar'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


/**
 * Modal para Crear / Editar Carrera
 */
const CreateCarreraModal = ({ isOpen, onClose, onSaved, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ nombre: initialData.nombre || "", descripcion: initialData.descripcion || "" });
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    } else if (isOpen) {
      setFormData({ nombre: "", descripcion: "" });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api[isEditMode ? 'put' : 'post'](
        isEditMode ? `/carreras/${initialData.id}` : "/carreras",
        formData
      );
      addNotification(`Carrera académica ${isEditMode ? 'actualizada' : 'creada'} con éxito`, "success");
      onSaved();
      onClose();
    } catch (err) {
      addNotification(err.response?.data?.message || "Error al registrar carrera", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content scale-in" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, rgba(53, 110, 216, 0.1), rgba(16, 185, 129, 0.05))',
          borderBottom: '2px solid var(--primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
              color: 'white',
              boxShadow: '0 8px 20px rgba(53, 110, 216, 0.3)'
            }}>
              <Target size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
                {isEditMode ? 'Editar Carrera' : 'Nueva Carrera'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Filiación académica del sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Denominación Oficial</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="pro-input" placeholder="Ej: Facultad de Ingeniería" style={{ fontSize: '1.1rem' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Detalles Adicionales</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="pro-input" placeholder="Campo opcional..." rows={3} />
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              <button type="button" onClick={onClose} className="pro-btn btn-secondary">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '160px', justifyContent: 'center' }}>
                {isSubmitting ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><Save size={18} /> {isEditMode ? 'Actualizar' : 'Guardar'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateCategoriaModal = ({ isOpen, onClose, onSaved, initialData, deportes, onViewTorneos }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", deporte_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        deporte_id: initialData.deporte_id || ""
      });
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    } else if (isOpen) {
      setFormData({ nombre: "", descripcion: "", deporte_id: "" });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api[isEditMode ? 'put' : 'post'](
        isEditMode ? `/categorias/${initialData.id}` : "/categorias",
        formData
      );
      addNotification(`Categoría ${isEditMode ? 'actualizada' : 'creada'} con éxito`, "success");
      onSaved();
      onClose();
    } catch (err) {
      addNotification(err.response?.data?.message || "Error al guardar categoría", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-content scale-in" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.05))',
          borderBottom: '2px solid #a855f7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: 'white',
              boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)'
            }}>
              <Box size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
                {isEditMode ? 'Configurar Categoría' : 'Nueva Categoría'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Segmentación de competencia</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Nombre de la Categoría</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="pro-input" placeholder="Ej: Masculino Libre" style={{ fontSize: '1.1rem' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Disciplina Vinculada</label>
              <select value={formData.deporte_id} onChange={(e) => setFormData({ ...formData, deporte_id: e.target.value })} className="pro-input">
                <option value="">Uso General (Todas las Disciplinas)</option>
                {deportes?.map(deporte => <option key={deporte.id} value={deporte.id}>{deporte.nombre}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Descripción de Alcance</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="pro-input" placeholder="Ej: Atletas mayores de 18 años..." rows={3} />
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              <button type="button" onClick={onClose} className="pro-btn btn-secondary">Descartar</button>
              <button type="submit" disabled={isSubmitting} className="pro-btn" style={{ background: '#a855f7', color: 'white', minWidth: '160px', justifyContent: 'center' }}>
                {isSubmitting ? <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <><Save size={18} /> {isEditMode ? 'Actualizar' : 'Crear'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


/**
 * Modal de Confirmación Mejorado
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  isLoading = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const config = {
    danger: { icon: Trash2, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    success: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    info: { icon: Info, color: '#356ed8', bg: 'rgba(53, 110, 216, 0.1)' },
    warning: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
  }[type] || { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };

  const Icon = config.icon;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="modal-content scale-in" style={{ maxWidth: '480px', borderRadius: '24px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ height: '8px', background: config.color }} />
        <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', background: config.bg, borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            border: `2px solid ${config.color}33`
          }}>
            <Icon size={40} style={{ color: config.color }} />
          </div>
          <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.5rem', fontWeight: 800 }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem 0', lineHeight: 1.6 }}>{message}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '1rem' }}>
            <button className="pro-btn btn-secondary" onClick={onClose} disabled={isLoading}>{cancelText}</button>
            <button className="pro-btn" onClick={onConfirm} disabled={isLoading} style={{ background: config.color, color: 'white', justifyContent: 'center' }}>
              {isLoading ? <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// =========================================================
// MAIN COMPONENT
// =========================================================

const TorneosDeportes = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState("torneos");
  const [viewMode, setViewMode] = useState("cards"); // "table" or "cards"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState(FILTER_OPTIONS.TODOS);
  const [categoriaFilter, setCategoriaFilter] = useState("");

  const [torneos, setTorneos] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTorneoModalOpen, setIsTorneoModalOpen] = useState(false);
  const [isDeporteModalOpen, setIsDeporteModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [isCarreraModalOpen, setIsCarreraModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentTorneo, setCurrentTorneo] = useState(null);
  const [currentDeporte, setCurrentDeporte] = useState(null);
  const [currentCategoria, setCurrentCategoria] = useState(null);
  const [currentCarrera, setCurrentCarrera] = useState(null);
  const [draftSelection, setDraftSelection] = useState({ deporte_id: "", categoria_id: "" });
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tData, dData, cData] = await Promise.all([
        api.get('/torneos'),
        api.get('/deportes'),
        api.get('/categorias')
      ]);
      setTorneos(tData.data?.data || tData.data || []);
      setDeportes(dData.data || []);
      setCategorias(cData.data || []);
    } catch (err) {
      addNotification("Error cargando los datos", "error");
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = useMemo(() => ({
    total: torneos.length,
    activos: torneos.filter(t => t.estado === ESTADOS_TORNEO.ACTIVO).length,
    finalizados: torneos.filter(t => t.estado === ESTADOS_TORNEO.FINALIZADO).length,
    deportesCount: deportes.length
  }), [torneos, deportes]);

  const filteredTorneos = useMemo(() => {
    return torneos.filter(t => {
      const matchesSearch = t.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterEstado === FILTER_OPTIONS.TODOS || t.estado === filterEstado;
      const matchesCategoria = !categoriaFilter || String(t.categoria_id) === String(categoriaFilter);
      return matchesSearch && matchesFilter && matchesCategoria;
    });
  }, [torneos, searchTerm, filterEstado, categoriaFilter]);

  // Helper para abrir modal de confirmación
  const openConfirmModal = (title, message, type = 'warning', confirmText = 'Confirmar', action) => {
    setConfirmConfig({ title, message, type, confirmText });
    setConfirmAction(() => action);
    setIsConfirmModalOpen(true);
  };

  // Handler para confirmar acción
  const handleConfirmAction = async () => {
    if (confirmAction) {
      setIsConfirmModalOpen(false);
      await confirmAction();
    }
  };

  const handleDeleteTorneo = async (id) => {
    const torneo = torneos.find(t => t.id === id);
    openConfirmModal(
      'Eliminar Torneo',
      `¿Estás seguro de eliminar "${torneo?.nombre}"? Esta acción no se puede deshacer y eliminará todos los partidos asociados.`,
      'danger',
      'Eliminar Torneo',
      async () => {
        try {
          await api.delete(`/torneos/${id}`);
          addNotification("Torneo eliminado exitosamente", "success");
          loadData();
        } catch (err) {
          addNotification(err.response?.data?.message || "Error al eliminar torneo", "error");
        }
      }
    );
  };

  const handleDeleteDeporte = async (id) => {
    const deporte = deportes.find(d => d.id === id);
    openConfirmModal(
      'Eliminar Disciplina',
      `¿Estás seguro de eliminar "${deporte?.nombre}"? Esta acción puede afectar torneos existentes.`,
      'danger',
      'Eliminar Disciplina',
      async () => {
        try {
          await api.delete(`/deportes/${id}`);
          addNotification("Disciplina eliminada exitosamente", "success");
          loadData();
        } catch (err) {
          addNotification(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : err.response?.data?.message || "Error al eliminar disciplina", "error");
        }
      }
    );
  };

  const handleDeleteCategoria = async (id) => {
    const categoria = categorias.find(c => c.id === id);
    openConfirmModal(
      'Eliminar Categoría',
      `¿Estás seguro de eliminar "${categoria?.nombre}"? Esta acción puede afectar torneos existentes.`,
      'danger',
      'Eliminar Categoría',
      async () => {
        try {
          await api.delete(`/categorias/${id}`);
          addNotification("Categoría eliminada exitosamente", "success");
          loadData();
        } catch (err) {
          addNotification(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : err.response?.data?.message || "Error al eliminar categoría", "error");
        }
      }
    );
  };

  if (loading) return <LoadingScreen message="CARGANDO TORNEOS..." />;

  return (
    <div className="admin-page-container fade-enter">
      <div className="dashboard-hero-header premium-header">
        <div className="hero-content">
        </div>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => { setCurrentTorneo(null); setIsTorneoModalOpen(true); }}>
            <Plus size={20} /> Crear Torneo
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <StatCard title="Total Torneos" value={stats.total} icon={Trophy} color="#3b82f6" className="premium-card" />
        <StatCard title="Disciplinas" value={stats.deportesCount} icon={Swords} color="#8b5cf6" className="premium-card" />
        <StatCard title="En Curso" value={stats.activos} icon={Activity} color="#10b981" trend={{ value: "En Vivo", isPositive: true }} className="premium-card" />
        <StatCard title="Finalizados" value={stats.finalizados} icon={CheckCircle} color="#f59e0b" className="premium-card" />
      </div>

      {/* TABS */}
      <div className="premium-card" style={{ marginBottom: '2rem', padding: '0', overflow: 'hidden', borderRadius: '20px', border: '1px solid rgba(53, 110, 216, 0.2)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(53, 110, 216, 0.1)', background: 'rgba(25, 41, 58, 0.4)', padding: '0 1rem' }}>
          <button
            className={`tab-btn ${activeTab === 'torneos' ? 'active' : ''}`}
            onClick={() => setActiveTab('torneos')}
          >
            <Trophy size={20} /> Torneos
          </button>
          <button
            className={`tab-btn ${activeTab === 'deportes' ? 'active' : ''}`}
            onClick={() => setActiveTab('deportes')}
          >
            <Swords size={20} /> Disciplinas
          </button>
          <button
            className={`tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
            onClick={() => setActiveTab('categorias')}
          >
            <Box size={20} /> Categorías
          </button>
        </div>

        <div className="main-module-content" style={{ padding: '2rem' }}>
          {activeTab === "torneos" && (
            <div className="fade-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Competiciones</h2>
                  <p style={{ color: '#a1b0c1', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                    {categoriaFilter ? `Mostrando torneos de la categoría: ${categorias.find(c => String(c.id) === String(categoriaFilter))?.nombre || 'Desconocida'}` : 'Visualización y control de eventos deportivos.'}
                  </p>
                  {categoriaFilter && (
                    <button
                      className="pro-btn btn-secondary"
                      onClick={() => setCategoriaFilter('')}
                      style={{ marginTop: '0.5rem', padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      Limpiar Filtro
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="search-box" style={{ width: "300px" }}>
                    <Search size={18} />
                    <input type="text" placeholder="Buscar torneo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pro-input" style={{ border: 'none', background: 'transparent' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', background: '#19293a', borderRadius: '8px', padding: '4px' }}>
                    <button
                      className={`pro-btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setViewMode("table")}
                      style={{ padding: '6px 12px' }}
                    >
                      <List size={18} />
                    </button>
                    <button
                      className={`pro-btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setViewMode("cards")}
                      style={{ padding: '6px 12px' }}
                    >
                      <Layout size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {loading ? <SkeletonLoader.Table rows={6} columns={6} /> : (
                viewMode === "table" ? (
                  <div className="table-container">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Competición</th>
                          <th>Disciplina</th>
                          <th>Categoría</th>
                          <th>Fechas</th>
                          <th>Estado</th>
                          <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTorneos.map(t => (
                          <tr key={t.id}>
                            <td>
                              <div style={{ fontWeight: '600' }}>{t.nombre}</div>
                              <div style={{ fontSize: '0.85rem', color: '#a1b0c1', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <MapPin size={12} /> {t.ubicacion || 'Sin ubicación'}
                              </div>
                            </td>
                            <td>
                              <span className="status-badge badge-success" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{t.deporte?.nombre || '-'}</span>
                            </td>
                            <td style={{ color: '#a1b0c1' }}>{t.categoria_relacion?.nombre || '-'}</td>
                            <td style={{ fontSize: '0.9rem', color: '#a1b0c1' }}>
                              {formatDateDisplay(t.fecha_inicio)} → {formatDateDisplay(t.fecha_fin)}
                            </td>
                            <td>
                              <span className={`status-badge ${t.estado === ESTADOS_TORNEO.ACTIVO ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                {t.estado}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button className="pro-btn btn-secondary" style={{ padding: '6px' }} onClick={() => navigate(`/admin/torneos/${t.id}`)} title="Ver Detalles">
                                  <Eye size={16} />
                                </button>
                                <button className="pro-btn btn-secondary" style={{ padding: '6px' }} onClick={() => { setCurrentTorneo(t); setIsTorneoModalOpen(true); }}>
                                  <Edit size={16} />
                                </button>
                                <button className="pro-btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteTorneo(t.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid-cards-premium fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {filteredTorneos.map(t => (
                      <div key={t.id} className="elite-tournament-card" onClick={() => navigate(`/admin/torneos/${t.id}`)}>
                        <div className="card-bg-image" style={{ backgroundImage: `url(${getSportImage(t.deporte?.nombre)})` }}></div>
                        <div className="card-glass-overlay"></div>
                        <div className="card-content-relative">
                          <div className="card-top-info">
                            <span className={`status-dot ${t.estado === ESTADOS_TORNEO.ACTIVO ? 'active' : ''}`} />
                            <span className="sport-tag">{t.deporte?.nombre}</span>
                          </div>
                          <h3 className="tournament-title">{t.nombre}</h3>
                          <div className="card-details">
                            <div className="detail-item"><Box size={14} /> {t.categoria_relacion?.nombre || 'General'}</div>
                            <div className="detail-item"><Calendar size={14} /> {formatDateDisplay(t.fecha_inicio)}</div>
                            <div className="detail-item"><MapPin size={14} /> {t.ubicacion || 'TBD'}</div>
                          </div>
                          <div className="card-actions-overlay">
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/torneos/${t.id}`); }}><Eye size={18} /> Ver Panel</button>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentTorneo(t); setIsTorneoModalOpen(true); }}><Edit size={18} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {!loading && filteredTorneos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#a1b0c1', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                  <Trophy size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No se encontraron torneos</h3>
                  <p>Ajusta los filtros o crea una nueva competición.</p>
                </div>
              )}
            </div>
          )}

          {activeTab !== "torneos" && (
            <div className="fade-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                  {activeTab === "deportes" ? "Gestión de Disciplinas" : "Gestión de Categorías"}
                </h2>
                <button className="pro-btn btn-primary" onClick={() => {
                  if (activeTab === "deportes") {
                    setCurrentDeporte(null);
                    setIsDeporteModalOpen(true);
                  } else {
                    setCurrentCategoria(null);
                    setIsCategoriaModalOpen(true);
                  }
                }}>
                  <Plus size={18} style={{ marginRight: '6px' }} /> {activeTab === "deportes" ? "Nueva Disciplina" : "Nueva Categoría"}
                </button>
              </div>
              {loading ? <SkeletonLoader.Table rows={5} columns={3} /> : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        {activeTab === "categorias" && <th>Disciplina</th>}
                        <th style={{ width: '150px', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === "deportes" ? deportes : categorias).map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: '600' }}>{item.nombre}</td>
                          {activeTab === "categorias" && (
                            <td><span className="status-badge badge-success" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{item.deporte?.nombre}</span></td>
                          )}
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button className="pro-btn btn-secondary" style={{ padding: '6px' }} onClick={() => {
                                if (activeTab === "categorias") {
                                  setCategoriaFilter(item.id);
                                  setActiveTab('torneos');
                                }
                              }} title="Ver Torneos de esta Categoría">
                                <Eye size={16} />
                              </button>
                              <button className="pro-btn btn-secondary" style={{ padding: '6px' }} onClick={() => {
                                if (activeTab === "deportes") {
                                  setCurrentDeporte(item);
                                  setIsDeporteModalOpen(true);
                                } else {
                                  setCurrentCategoria(item);
                                  setIsCategoriaModalOpen(true);
                                }
                              }}><Edit size={16} /></button>
                              <button className="pro-btn btn-danger" style={{ padding: '6px' }} onClick={() => {
                                if (activeTab === "deportes") {
                                  handleDeleteDeporte(item.id);
                                } else {
                                  handleDeleteCategoria(item.id);
                                }
                              }}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateTorneoModal
        isOpen={isTorneoModalOpen}
        onClose={() => setIsTorneoModalOpen(false)}
        deportes={deportes}
        categorias={categorias}
        onSaved={loadData}
        initialData={currentTorneo}
        draftSelection={draftSelection}
        setDraftSelection={setDraftSelection}
      />

      <CreateDeporteModal
        isOpen={isDeporteModalOpen}
        onClose={() => setIsDeporteModalOpen(false)}
        onSaved={loadData}
        initialData={currentDeporte}
      />

      <CreateCategoriaModal
        isOpen={isCategoriaModalOpen}
        onClose={() => setIsCategoriaModalOpen(false)}
        onSaved={loadData}
        initialData={currentCategoria}
        deportes={deportes}
        onViewTorneos={(categoriaId) => {
          setCategoriaFilter(categoriaId);
          setActiveTab('torneos');
        }}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
      />

      <style>{`
        .hero-icon-box {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05));
          padding: 1rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .modal-overlay.fade-in {
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: #19293a;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(53, 110, 216, 0.2);
        }

        .modal-header {
          position: relative;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(53, 110, 216, 0.2);
          background: #19293a;
        }

        .btn-icon-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(53, 110, 216, 0.1);
          border: 1px solid rgba(53, 110, 216, 0.2);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          color: #a1b0c1;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon-close:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: #ef4444;
        }

        .pro-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(53, 110, 216, 0.2);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          background: #19293a;
          color: #eaeaea;
        }

        .pro-input:focus {
          outline: none;
          border-color: #356ed8;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .pro-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #356ed8, #2d62c9);
          color: white;
          border: 1px solid #356ed8;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2d62c9, #356ed8);
        }

        .btn-secondary {
          background: #19293a;
          color: #eaeaea;
          border: 1px solid rgba(53, 110, 216, 0.2);
          font-weight: 500;
        }

        .btn-secondary:hover {
          background: rgba(53, 110, 216, 0.1);
          border-color: #356ed8;
          color: #356ed8;
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: 1px solid #ef4444;
          font-weight: 600;
        }

        .btn-danger:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
        }

        /* Botones de acción en tablas - más visibles */
        .glass-table .pro-btn {
          background: #19293a;
          border: 1px solid rgba(53, 110, 216, 0.2);
          color: #a1b0c1;
          padding: 6px 10px;
          font-size: 0.75rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .glass-table .pro-btn:hover {
          background: rgba(53, 110, 216, 0.1);
          border-color: #356ed8;
          color: #356ed8;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .glass-table .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .glass-table .btn-danger:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #dc2626;
          border-color: #ef4444;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #eaeaea;
          margin-bottom: 0.5rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .badge-neutral {
          background: rgba(107, 114, 128, 0.15);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .badge-info {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .badge-danger {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid rgba(53, 110, 216, 0.2);
          background: #19293a;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid rgba(53, 110, 216, 0.2);
        }

        .glass-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .glass-table th,
        .glass-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(53, 110, 216, 0.2);
        }

        .glass-table th {
          background: #19293a;
          font-weight: 600;
          color: #eaeaea;
          position: sticky;
          top: 0;
        }

        .glass-table tbody tr:hover {
          background: rgba(53, 110, 216, 0.1);
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: #19293a;
          border: 1px solid rgba(53, 110, 216, 0.2);
          border-radius: 8px;
          overflow: hidden;
        }

        .search-box svg {
          margin-left: 0.75rem;
          color: #a1b0c1;
        }

        .search-box input {
          border: none;
          padding: 0.5rem 1rem;
          flex: 1;
          background: transparent;
          color: #eaeaea;
        }

        .search-box input:focus {
          outline: none;
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border-radius: 8px 8px 0 0;
        }

        .tab-btn:hover {
          background: rgba(59, 130, 246, 0.05);
        }

        .tab-btn.active {
          background: #19293a;
          color: #356ed8;
          border-bottom: 2px solid #356ed8;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
        }

        .elite-tournament-card {
          background: #19293a;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(53, 110, 216, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .elite-tournament-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #10b981);
        }

        .elite-tournament-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a1b0c1;
        }

        .status-dot.active {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }

        .sport-tag {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tournament-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #eaeaea;
          margin: 0 0 1rem 0;
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .card-actions-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .elite-tournament-card:hover .card-actions-overlay {
          opacity: 1;
        }

        .card-actions-overlay button {
          background: #19293a;
          color: #eaeaea;
          border: 1px solid rgba(53, 110, 216, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .card-actions-overlay button:hover {
          background: rgba(53, 110, 216, 0.1);
          border-color: #356ed8;
          color: #356ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .grid-cards-premium {
          display: grid;
          gap: 1.5rem;
        }

        .admin-page-container {
          padding: 2.5rem;
          max-width: 1600px;
          margin: 0 auto;
          background: #19293a;
          min-height: 100vh;
        }

        .premium-header {
          background: linear-gradient(135deg, rgba(53, 110, 216, 0.1), rgba(25, 41, 58, 0.4));
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem 2.5rem;
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(53, 110, 216, 0.2);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .tab-btn {
          padding: 1rem 2rem;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #a1b0c1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          opacity: 0.7;
        }

        .tab-btn:hover {
          color: #eaeaea;
          opacity: 1;
        }

        .tab-btn.active {
          color: #3b82f6;
          opacity: 1;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40%;
          height: 3px;
          background: #3b82f6;
          border-radius: 3px 3px 0 0;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }

        .elite-tournament-card {
          background: #1e3147;
          border-radius: 24px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .card-bg-image {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .elite-tournament-card:hover .card-bg-image {
          transform: scale(1.15) rotate(2deg);
        }

        .card-glass-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(25, 41, 58, 0.4) 0%, rgba(25, 41, 58, 0.7) 40%, rgba(15, 23, 42, 0.95) 100%);
          z-index: 2;
          transition: background 0.3s ease;
        }

        .elite-tournament-card:hover .card-glass-overlay {
          background: linear-gradient(180deg, rgba(25, 41, 58, 0.2) 0%, rgba(25, 41, 58, 0.6) 40%, rgba(15, 23, 42, 0.98) 100%);
        }

        .card-content-relative {
          position: relative;
          z-index: 3;
        }

        .elite-tournament-card:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1);
        }

        .elite-tournament-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.03), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .elite-tournament-card:hover::before {
          transform: translateX(100%);
        }

        .card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #6b7280;
          position: relative;
        }

        .status-dot.active {
          background: #10b981;
          box-shadow: 0 0 12px #10b981;
        }

        .status-dot.active::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid #10b981;
          animation: pulse-ring 2s infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .sport-tag {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .tournament-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 1.25rem;
          line-height: 1.2;
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .detail-item svg {
          color: #3b82f6;
        }

        .card-actions-overlay {
          display: flex;
          gap: 0.75rem;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .elite-tournament-card:hover .card-actions-overlay {
          opacity: 1;
          transform: translateY(0);
        }

        .card-actions-overlay button {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.6rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(5px);
          transition: all 0.2s ease;
        }

        .card-actions-overlay button:hover {
          background: #3b82f6;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
        }

        @media (max-width: 768px) {
          .admin-page-container { padding: 1rem; }
          .premium-header { flex-direction: column; gap: 1.5rem; padding: 1.5rem; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default TorneosDeportes;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import { useNotification } from "../../context/NotificationContext";

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
  const { addNotification } = useNotification();

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
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
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

  return createPortal(
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-content modal-lg scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="modal-icon" style={{ background: 'linear-gradient(135deg, var(--primary), #10b981)' }}>
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="modal-title">
                {isEditMode ? 'Editar Competición' : 'Nueva Competición'}
              </h2>
              <p className="modal-subtitle">
                Defina los parámetros generales del torneo deportivo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <form id="torneo-form" onSubmit={handleSubmit}>
            <div className="responsive-grid" style={{ gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}>Nombre del Evento <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="pro-input" placeholder="Ej: Copa de Invierno 2025" style={{ fontSize: '1.05rem', fontWeight: 700 }} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}>Descripción / Reglamento</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="pro-input" placeholder="Información adicional relevante..." rows={3} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1.25rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                height: 'fit-content'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Logística y Tiempos</h4>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}><Calendar size={14} style={{ marginRight: 6 }} /> Inicio</label>
                  <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} className="pro-input" style={{ padding: '0.5rem 0.75rem' }} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}><Calendar size={14} style={{ marginRight: 6 }} /> Cierre</label>
                  <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} className="pro-input" style={{ padding: '0.5rem 0.75rem' }} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}><MapPin size={14} style={{ marginRight: 6 }} /> Sede</label>
                  <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="pro-input" placeholder="Ej: Polideportivo" style={{ padding: '0.5rem 0.75rem' }} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>Estatus</label>
                  <select name="estado" value={formData.estado} onChange={handleChange} className="pro-input" style={{ padding: '0.5rem 0.75rem' }}>
                    <option value={ESTADOS_TORNEO.ACTIVO}>Activo</option>
                    <option value={ESTADOS_TORNEO.FINALIZADO}>Finalizado</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="pro-btn btn-secondary">Descartar</button>
          <button type="submit" form="torneo-form" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '160px' }}>
            {isSubmitting ? <div className="spinner" /> : <><Save size={18} /> {isEditMode ? 'Actualizar' : 'Publicar'}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


/**
 * Modal para Crear / Editar Deporte
 */
const CreateDeporteModal = ({ isOpen, onClose, onSaved, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ nombre: initialData.nombre || "", descripcion: initialData.descripcion || "" });
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

  return createPortal(
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-content modal-md scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '2px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              <Swords size={28} />
            </div>
            <div>
              <h2 className="modal-title">
                {isEditMode ? 'Configurar Disciplina' : 'Nueva Disciplina'}
              </h2>
              <p className="modal-subtitle">Gestión de ramas deportivas oficiales</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Nombre de la Disciplina</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="pro-input" placeholder="Ej: Vóleibol de Playa" style={{ fontSize: '1.05rem' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Descripción de la Rama</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="pro-input" placeholder="Breve descripción técnica o histórica..." rows={3} />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="pro-btn btn-secondary">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '150px' }}>
                {isSubmitting ? <div className="spinner" /> : <><Save size={18} /> {isEditMode ? 'Guardar' : 'Registrar'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};


/**
 * Modal para Crear / Editar Carrera
 */
const CreateCarreraModal = ({ isOpen, onClose, onSaved, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ nombre: initialData.nombre || "", descripcion: initialData.descripcion || "" });
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

  return createPortal(
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-content modal-md scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="modal-icon">
              <Target size={28} />
            </div>
            <div>
              <h2 className="modal-title">
                {isEditMode ? 'Editar Carrera' : 'Nueva Carrera'}
              </h2>
              <p className="modal-subtitle">Filiación académica del sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Denominación Oficial</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="pro-input" placeholder="Ej: Facultad de Ingeniería" style={{ fontSize: '1.05rem' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Detalles Adicionales</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="pro-input" placeholder="Campo opcional..." rows={3} />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="pro-btn btn-secondary">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '150px' }}>
                {isSubmitting ? <div className="spinner" /> : <><Save size={18} /> {isEditMode ? 'Actualizar' : 'Guardar'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CreateCategoriaModal = ({ isOpen, onClose, onSaved, initialData, deportes, onViewTorneos }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", deporte_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        deporte_id: initialData.deporte_id || ""
      });
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

  return createPortal(
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-content modal-md scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '2px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
              <Box size={28} />
            </div>
            <div>
              <h2 className="modal-title">
                {isEditMode ? 'Configurar Categoría' : 'Nueva Categoría'}
              </h2>
              <p className="modal-subtitle">Segmentación de competencia</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Nombre de la Categoría</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="pro-input" placeholder="Ej: Masculino Libre" style={{ fontSize: '1.05rem' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Disciplina Vinculada</label>
              <select value={formData.deporte_id} onChange={(e) => setFormData({ ...formData, deporte_id: e.target.value })} className="pro-input">
                <option value="">Uso General (Todas las Disciplinas)</option>
                {deportes?.map(deporte => <option key={deporte.id} value={deporte.id}>{deporte.nombre}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Descripción de Alcance</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="pro-input" placeholder="Ej: Atletas mayores de 18 años..." rows={3} />
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="pro-btn btn-secondary">Descartar</button>
              <button type="submit" disabled={isSubmitting} className="pro-btn btn-primary" style={{ minWidth: '150px' }}>
                {isSubmitting ? <div className="spinner" /> : <><Save size={18} /> {isEditMode ? 'Actualizar' : 'Crear'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
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
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'danger': return { icon: <Trash2 size={40} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'success': return { icon: <CheckCircle size={40} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'warning': return { icon: <AlertCircle size={40} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      default: return { icon: <Info size={40} />, color: 'var(--primary)', bg: 'rgba(53, 110, 216, 0.1)' };
    }
  };

  const theme = getTheme();

  return createPortal(
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-content modal-sm scale-in" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '24px' }}>
        <div className="modal-body" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', background: theme.bg, color: theme.color,
            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', border: `1px solid ${theme.color}44`
          }}>
            {theme.icon}
          </div>
          <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem 0', lineHeight: 1.6, fontSize: '0.95rem' }}>{message}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '1rem' }}>
            <button className="pro-btn btn-secondary" onClick={onClose} style={{ justifyContent: 'center' }}>
              Cancelar
            </button>
            <button
              className="pro-btn"
              onClick={() => { onConfirm(); onClose(); }}
              style={{
                background: theme.color, color: '#fff', justifyContent: 'center', fontWeight: 700,
                boxShadow: `0 8px 20px ${theme.color}44`
              }}
            >
              {confirmText || 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};


// =========================================================
// MAIN COMPONENT
// =========================================================

const TorneosDeportes = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

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
          <h1>Panel Administrativo</h1>
          <p className="hero-subtitle">Gestiona competiciones, disciplinas y categorías deportivas.</p>
        </div>
        <div className="hero-actions">
          <button className="pro-btn btn-primary" onClick={() => { setCurrentTorneo(null); setIsTorneoModalOpen(true); }}>
            <Plus size={20} /> Crear Torneo
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div
        className="stats-grid"
        style={{
          marginBottom: "1rem",
          gap: "0.75rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))"
        }}
      >
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
                  <div className="grid-cards-premium fade-in">
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
    </div>
  );
};

export default TorneosDeportes;

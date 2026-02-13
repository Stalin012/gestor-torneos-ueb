import React, { useState, useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Swords, Plus, Edit, Trash2, X, Save, Box, Zap,
  AlertCircle, CheckCircle, Eye, Layout, List, Search,
  Activity, Target, Calendar, MapPin, Info, Shield, ShieldCheck
} from "lucide-react";

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

  const validateForm = () => {
    const errors = [];

    if (!formData.nombre?.trim()) {
      errors.push("El nombre del torneo es obligatorio");
    }

    if (!formData.deporte_id) {
      errors.push("Debe seleccionar un deporte");
    }

    if (!formData.categoria_id) {
      errors.push("Debe seleccionar una categoría");
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const startDate = new Date(formData.fecha_inicio);
      const endDate = new Date(formData.fecha_fin);
      if (endDate < startDate) {
        errors.push("La fecha de fin no puede ser anterior a la fecha de inicio");
      }
    }

    return errors;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      addNotification(validationErrors.join('. '), "error");
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

      const response = await api[isEditMode ? 'put' : 'post'](
        isEditMode ? `/torneos/${initialData.id}` : '/torneos',
        payload
      );

      addNotification(
        `Torneo "${formData.nombre}" ${isEditMode ? 'actualizado' : 'creado'} con éxito`,
        "success"
      );
      onSaved();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || "Error al guardar torneo";

      addNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content scale-in"
        style={{
          maxWidth: '700px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
          borderRadius: '16px 16px 0 0',
          padding: '1.5rem 2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              color: 'white'
            }}>
              <Trophy size={24} />
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-main)'
              }}>
                {isEditMode ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}>
                {isEditMode ? 'Modifica los detalles de la competición' : 'Configura una nueva competición deportiva'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon-close"
            type="button"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ef4444';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.9)';
              e.target.style.color = 'inherit';
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {/* Información del torneo */}
          {!isEditMode && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: '#10b981' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>
                  Configuración de Nueva Competición
                </h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Completa toda la información requerida para crear el torneo. Los campos marcados con * son obligatorios.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Información básica */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={16} />
                Información Básica
              </h4>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500 }}>
                  Nombre del Torneo <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="pro-input"
                  placeholder="Ej: Campeonato Nacional 2025"
                />
              </div>
            </div>

            {/* Disciplina y categoría */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Trophy size={16} />
                Disciplina y Categoría
              </h4>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 500 }}>
                    Deporte <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="deporte_id"
                    value={formData.deporte_id}
                    onChange={handleChange}
                    required
                    className="pro-input"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.95rem',
                      background: 'white'
                    }}
                  >
                    <option value="">Selecciona un deporte</option>
                    {deportes.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 500 }}>
                    Categoría <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleChange}
                    required
                    className="pro-input"
                    disabled={!formData.deporte_id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.95rem',
                      background: formData.deporte_id ? 'white' : '#f9fafb',
                      opacity: formData.deporte_id ? 1 : 0.6
                    }}
                  >
                    <option value="">
                      {formData.deporte_id ? 'Selecciona una categoría' : 'Primero selecciona deporte'}
                    </option>
                    {categoriasFiltradas.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={16} />
                Programación
              </h4>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 500 }}>
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    className="pro-input"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 500 }}>
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    className="pro-input"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={16} />
                Ubicación
              </h4>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500 }}>
                  Lugar del Torneo
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  className="pro-input"
                  placeholder="Ej: Estadio Nacional, Quito"
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            {/* Footer con acciones */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '2rem',
              marginTop: '2rem',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={onClose}
                className="pro-btn btn-secondary"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: '1px solid #d1d5db'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="pro-btn btn-primary"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    {isEditMode ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEditMode ? 'Actualizar Torneo' : 'Crear Torneo'}
                  </>
                )}
              </button>
            </div>
          </form>
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
    } else if (isOpen) {
      setFormData({ nombre: "", descripcion: "" });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `/deportes/${initialData.id}` : "/deportes";
      const response = await api[method.toLowerCase()](url, formData);
      addNotification(`Deporte ${isEditMode ? 'actualizado' : 'creado'} con éxito`, "success");
      onSaved();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : err.response?.data?.message || "Error al guardar deporte";
      addNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Swords size={24} style={{ color: 'var(--primary)' }} />
            {isEditMode ? 'Editar Deporte' : 'Nuevo Deporte'}
          </h2>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre del Deporte</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="pro-input" placeholder="Ej: Fútbol" />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción (Opcional)</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="pro-input" placeholder="Descripción del deporte" rows={3} />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="pro-btn btn-secondary">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="pro-btn btn-primary">
                {isSubmitting ? '...' : <><Save size={16} style={{ marginRight: '6px' }} /> {isEditMode ? 'Actualizar' : 'Crear Deporte'}</>}
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
    } else if (isOpen) {
      setFormData({ nombre: "", descripcion: "" });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `/carreras/${initialData.id}` : "/carreras";
      const response = await api[method.toLowerCase()](url, formData);
      addNotification(`Carrera ${isEditMode ? 'actualizada' : 'creada'} con éxito`, "success");
      onSaved();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : err.response?.data?.message || "Error al guardar carrera";
      addNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={24} style={{ color: 'var(--primary)' }} />
            {isEditMode ? 'Editar Carrera' : 'Nueva Carrera'}
          </h2>
          <button onClick={onClose} className="btn-icon-close" type="button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre de la Carrera</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="pro-input" placeholder="Ej: Ingeniería en Sistemas" />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción (Opcional)</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="pro-input" placeholder="Descripción de la carrera" rows={3} />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="pro-btn btn-secondary">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="pro-btn btn-primary">
                {isSubmitting ? '...' : <><Save size={16} style={{ marginRight: '6px' }} /> {isEditMode ? 'Actualizar' : 'Crear Carrera'}</>}
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
    } else if (isOpen) {
      setFormData({ nombre: "", descripcion: "", deporte_id: "" });
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
      return () => {
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `/categorias/${initialData.id}` : "/categorias";
      const response = await api[method.toLowerCase()](url, formData);
      addNotification(`Categoría ${isEditMode ? 'actualizada' : 'creada'} con éxito`, "success");
      onSaved();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : err.response?.data?.message || "Error al guardar categoría";
      addNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 2000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div
        className="modal-content scale-in"
        style={{
          maxWidth: '550px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '16px',
          position: 'relative',
          zIndex: 2001
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
          borderRadius: '16px 16px 0 0',
          padding: '1.5rem 2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              color: 'white'
            }}>
              <Box size={24} />
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--text-main)'
              }}>
                {isEditMode ? 'Editar Categoría' : 'Crear Nueva Categoría'}
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}>
                {isEditMode ? 'Modifica los detalles de la categoría' : 'Define una nueva categoría para los torneos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon-close"
            type="button"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--bg-hover)';
              e.target.style.color = 'var(--text-muted)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Información básica */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Box size={16} />
                Información de la Categoría
              </h4>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 500 }}>
                  Nombre de la Categoría <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="pro-input"
                  placeholder="Ej: Masculino, Femenino, Sub-18"
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 500 }}>
                  Disciplina Asociada
                </label>
                <select
                  value={formData.deporte_id}
                  onChange={(e) => setFormData({ ...formData, deporte_id: e.target.value })}
                  className="pro-input"
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="">Sin disciplina específica</option>
                  {deportes?.map(deporte => (
                    <option key={deporte.id} value={deporte.id}>
                      {deporte.nombre}
                    </option>
                  ))}
                </select>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  Opcional: Asocia esta categoría a una disciplina deportiva específica
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500 }}>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="pro-input"
                  placeholder="Describe las características de esta categoría..."
                  rows={3}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Navegación a torneos */}
              {isEditMode && onViewTorneos && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onViewTorneos(initialData.id);
                      onClose();
                    }}
                    className="pro-btn btn-primary"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Eye size={16} />
                    Ver Torneos de esta Categoría
                  </button>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '2rem',
              marginTop: '2rem',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={onClose}
                className="pro-btn btn-secondary"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: '1px solid #d1d5db'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="pro-btn btn-primary"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  border: '1px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  color: 'white',
                  minWidth: '140px',
                  justifyContent: 'center'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    {isEditMode ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEditMode ? 'Actualizar Categoría' : 'Crear Categoría'}
                  </>
                )}
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

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: '#ef4444'
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10b981'
        };
      case 'info':
        return {
          icon: Info,
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3b82f6'
        };
      default:
        return {
          icon: AlertCircle,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: '#f59e0b'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content scale-in"
        style={{
          maxWidth: '420px',
          border: `2px solid ${config.borderColor}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${config.borderColor}20`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-body" style={{
          textAlign: 'center',
          background: `linear-gradient(135deg, ${config.bgColor}, rgba(0,0,0,0.02))`,
          borderBottom: `1px solid ${config.borderColor}30`
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: config.bgColor,
            border: `2px solid ${config.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: `0 8px 24px ${config.color}30`
          }}>
            <IconComponent size={32} style={{ color: config.color }} />
          </div>
          <h2 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1f2937'
          }}>
            {title}
          </h2>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '0.95rem',
            lineHeight: 1.5
          }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="pro-btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 500
            }}
          >
            {cancelText}
          </button>
          <button
            className={`pro-btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: type === 'danger' ? '#ef4444' : config.color,
              border: `1px solid ${type === 'danger' ? '#dc2626' : config.borderColor}`
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Procesando...
              </>
            ) : (
              <>
                {confirmText}
              </>
            )}
          </button>
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

  return (
    <div className="admin-page-container fade-enter">
      <div className="dashboard-hero-header">
        <div className="hero-content">
        </div>
        <div className="hero-actions">
          <button className="hero-btn" onClick={() => { setCurrentTorneo(null); setIsTorneoModalOpen(true); }}>
            <Plus size={20} /> Crear Torneo
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <StatCard title="Total Torneos" value={stats.total} icon={Trophy} color="#38bdf8" className="premium-card" />
        <StatCard title="En Curso" value={stats.activos} icon={Activity} color="#f59e0b" trend={{ value: "Live", isPositive: true }} className="premium-card" />
        <StatCard title="Finalizados" value={stats.finalizados} icon={CheckCircle} color="#10b981" className="premium-card" />
        <StatCard title="Disciplinas" value={stats.deportesCount} icon={Swords} color="#8b5cf6" className="premium-card" />
      </div>

      {/* TABS */}
      <div className="premium-card" style={{ marginBottom: '2rem', padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          <button
            className={`tab-btn ${activeTab === 'torneos' ? 'active' : ''}`}
            onClick={() => setActiveTab('torneos')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'torneos' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'torneos' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'torneos' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Trophy size={18} /> Torneos
          </button>
          <button
            className={`tab-btn ${activeTab === 'deportes' ? 'active' : ''}`}
            onClick={() => setActiveTab('deportes')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'deportes' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'deportes' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'deportes' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Swords size={18} /> Disciplinas
          </button>
          <button
            className={`tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
            onClick={() => setActiveTab('categorias')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'categorias' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'categorias' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'categorias' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Box size={18} /> Categorías
          </button>
        </div>

        <div className="main-module-content" style={{ padding: '2rem' }}>
          {activeTab === "torneos" && (
            <div className="fade-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Competiciones</h2>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
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
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', borderRadius: '8px', padding: '4px' }}>
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
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <MapPin size={12} /> {t.ubicacion || 'Sin ubicación'}
                              </div>
                            </td>
                            <td>
                              <span className="status-badge badge-success" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{t.deporte?.nombre || '-'}</span>
                            </td>
                            <td style={{ color: 'var(--text-muted)' }}>{t.categoria_relacion?.nombre || '-'}</td>
                            <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
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
                    ))}
                  </div>
                )
              )}

              {!loading && filteredTorneos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
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
          background: var(--bg-card);
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border);
        }

        .modal-header {
          position: relative;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-panel);
        }

        .btn-icon-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          color: var(--text-muted);
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
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          background: var(--bg-card);
          color: var(--text-main);
        }

        .pro-input:focus {
          outline: none;
          border-color: var(--primary);
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
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          border: 1px solid var(--primary);
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
        }

        .btn-secondary {
          background: var(--bg-card);
          color: var(--text-main);
          border: 1px solid var(--border);
          font-weight: 500;
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
          border-color: var(--primary);
          color: var(--primary);
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
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 6px 10px;
          font-size: 0.75rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .glass-table .pro-btn:hover {
          background: var(--bg-hover);
          border-color: var(--primary);
          color: var(--primary);
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
          color: var(--text-main);
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
          border-top: 1px solid var(--border);
          background: var(--bg-panel);
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid var(--border);
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
          border-bottom: 1px solid var(--border);
        }

        .glass-table th {
          background: var(--bg-panel);
          font-weight: 600;
          color: var(--text-main);
          position: sticky;
          top: 0;
        }

        .glass-table tbody tr:hover {
          background: var(--bg-hover);
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .search-box svg {
          margin-left: 0.75rem;
          color: var(--text-muted);
        }

        .search-box input {
          border: none;
          padding: 0.5rem 1rem;
          flex: 1;
          background: transparent;
          color: var(--text-main);
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
          background: var(--bg-card);
          color: var(--primary);
          border-bottom: 2px solid var(--primary);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
        }

        .elite-tournament-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
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
          background: var(--text-muted);
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
          color: var(--text-main);
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
          background: var(--bg-card);
          color: var(--text-main);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .card-actions-overlay button:hover {
          background: var(--bg-hover);
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .grid-cards-premium {
          display: grid;
          gap: 1.5rem;
        }

        .admin-page-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .page-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .pro-card {
          background: var(--bg-card);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .main-module-content {
          padding: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          50% { transform: translate(-50%, -50%) rotate(180deg); }
        }

        .avatar-circle-sm {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }

        @media (max-width: 768px) {
          .admin-page-container {
            padding: 1rem;
          }

          .admin-page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .modal-content {
            margin: 1rem;
            max-width: calc(100vw - 2rem);
          }

          .form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TorneosDeportes;

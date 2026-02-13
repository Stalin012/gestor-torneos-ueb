// resources/js/pages/admin/Arbitros.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, Plus, Edit, Trash2, Search, X, Save, Star
} from 'lucide-react';
import '../../admin_styles.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/* ============================================================
   1. Opciones de especialidades
   ============================================================ */
const especialidadesOptions = ['Fútbol', 'Básquet', 'Vóley', 'Tenis', 'Natación'];

/* ============================================================
   2. Modal de creación / edición de árbitro
   ============================================================ */
const ArbitroModal = ({ isOpen, onClose, initialData, onSave }) => {
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        correo: '',
        experiencia: 0,
        especialidad: '',
        estado: 'Certificado',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                cedula: initialData.cedula,
                nombre: initialData.nombre || '',
                correo: initialData.correo || '',
                experiencia: initialData.experiencia ?? 0,
                especialidad: initialData.especialidad || '',
                estado: initialData.estado || 'Certificado',
            });
        } else {
            setFormData({
                cedula: '',
                nombre: '',
                correo: '',
                experiencia: 0,
                especialidad: '',
                estado: 'Certificado',
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.cedula || !formData.especialidad) {
            alert('Cédula y Especialidad son obligatorios.');
            return;
        }

        // Solo enviamos lo que la API necesita
        const payload = {
            cedula: formData.cedula,
            experiencia: Number(formData.experiencia) || 0,
            especialidad: formData.especialidad,
            estado: formData.estado,
        };

        onSave(payload, isEditMode);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '650px' }}>
                <div className="modal-header">
                    <h2>
                        <Shield size={24} style={{ marginRight: '10px' }} />{" "}
                        {isEditMode ? `Editar Árbitro: ${formData.nombre || formData.cedula}` : 'Registrar Nuevo Árbitro'}
                    </h2>
                    <button className="btn-icon-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="cedula">Cédula</label>
                            <input
                                type="text"
                                id="cedula"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleChange}
                                required
                                disabled={isEditMode} // no cambiar PK en edición
                                placeholder="Cédula de la persona (debe existir en personas/usuarios)"
                            />
                            {!isEditMode && (
                                <small style={{ color: 'var(--info)' }}>
                                    La API validará que la cédula exista en la tabla de personas/usuarios.
                                </small>
                            )}
                        </div>

                        <div className="form-group" style={{ flex: 2 }}>
                            <label>Nombre (solo lectura)</label>
                            <input
                                type="text"
                                value={formData.nombre || 'Se mostrará a partir de la relación persona.'}
                                disabled
                                className="disabled-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="especialidad">Especialidad Deportiva</label>
                            <select
                                id="especialidad"
                                name="especialidad"
                                value={formData.especialidad}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione...</option>
                                {especialidadesOptions.map((esp) => (
                                    <option key={esp} value={esp}>
                                        {esp}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="experiencia">Años de Experiencia</label>
                            <input
                                type="number"
                                id="experiencia"
                                name="experiencia"
                                min="0"
                                value={formData.experiencia}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="estado">Estado del Árbitro</label>
                        <select
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            required
                        >
                            <option value="Certificado">Certificado</option>
                            <option value="En Formación">En Formación</option>
                            <option value="Suspendido">Suspendido</option>
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            <Save size={18} style={{ marginRight: '8px' }} />{" "}
                            {isEditMode ? 'Guardar Cambios' : 'Registrar Árbitro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ============================================================
   3. Componente Principal
   ============================================================ */
const Arbitros = () => {
    const [arbitros, setArbitros] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArbitro, setCurrentArbitro] = useState(null);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const token = localStorage.getItem('token');

    /* ---------------- Cargar árbitros desde API ---------------- */
    const loadArbitros = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                const resp = await fetch(`${API_BASE}/arbitros?page=${page}`, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const json = await resp.json();

                if (!resp.ok) {
                    console.error(json);
                    alert(json.message || 'Error al cargar árbitros.');
                    return;
                }

                // Soporta tanto respuesta paginada como simple
                if (Array.isArray(json)) {
                    setArbitros(json);
                    setPagination({
                        current_page: 1,
                        last_page: 1,
                        total: json.length,
                    });
                } else {
                    setArbitros(json.data || []);
                    setPagination({
                        current_page: json.current_page || 1,
                        last_page: json.last_page || 1,
                        total: json.total || (json.data ? json.data.length : 0),
                    });
                }
            } catch (err) {
                console.error(err);
                alert('Error de conexión al cargar árbitros.');
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    useEffect(() => {
        loadArbitros(1);
    }, [loadArbitros]);

    /* ---------------- CRUD ---------------- */
    const handleCreate = () => {
        setCurrentArbitro(null);
        setIsModalOpen(true);
    };

    const handleEdit = (arbitro) => {
        const nombre = arbitro.persona
            ? `${arbitro.persona.nombres || ''} ${arbitro.persona.apellidos || ''}`.trim()
            : arbitro.nombre || '';

        const correo =
            arbitro.persona?.correo ||
            arbitro.persona?.email ||
            arbitro.correo ||
            '';

        setCurrentArbitro({
            cedula: arbitro.cedula,
            nombre,
            correo,
            experiencia: arbitro.experiencia,
            especialidad: arbitro.especialidad,
            estado: arbitro.estado,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula, nombreLabel) => {
        if (
            !window.confirm(
                `¿Seguro que desea eliminar el rol de Árbitro a ${nombreLabel}?`
            )
        )
            return;

        try {
            const resp = await fetch(`${API_BASE}/arbitros/${cedula}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await resp.json();

            if (!resp.ok) {
                console.error(json);
                alert(json.message || 'Error al eliminar árbitro.');
                return;
            }

            alert(json.message || 'Árbitro eliminado correctamente.');
            loadArbitros(pagination.current_page);
        } catch (err) {
            console.error(err);
            alert('Error de conexión al eliminar árbitro.');
        }
    };

    const handleSave = async (data, isEditMode) => {
        try {
            const url = isEditMode
                ? `${API_BASE}/arbitros/${data.cedula}`
                : `${API_BASE}/arbitros`;

            const method = isEditMode ? 'PUT' : 'POST';

            const resp = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const json = await resp.json();

            if (!resp.ok) {
                console.error(json);
                let msg = json.message || 'Error al guardar árbitro.';
                if (json.errors) {
                    msg += '\n' + Object.values(json.errors).flat().join('\n');
                }
                alert(msg);
                return;
            }

            alert(json.message || 'Árbitro guardado correctamente.');
            setIsModalOpen(false);
            loadArbitros(pagination.current_page);
        } catch (err) {
            console.error(err);
            alert('Error de conexión al guardar árbitro.');
        }
    };

    /* ---------------- Búsqueda local ---------------- */
    const filteredArbitros = arbitros.filter((arbitro) => {
        const nombre = arbitro.persona
            ? `${arbitro.persona.nombres || ''} ${arbitro.persona.apellidos || ''}`.trim().toLowerCase()
            : (arbitro.nombre || '').toLowerCase();

        const term = (searchTerm || '').trim().toLowerCase();

        // Si no hay término de búsqueda, mostramos todos
        if (!term) return true;

        const cedulaStr = (arbitro.cedula || '').toString().toLowerCase();

        return (
            nombre.includes(term) ||
            cedulaStr.includes(term) ||
            (arbitro.especialidad || '').toLowerCase().includes(term)
        );
    });

    /* ---------------- Render ---------------- */
    return (
        <div className="admin-page-container fade-enter">
            {/* COMPONENT HEADER */}
            <div className="admin-page-header">
                <div>
                    <h1 className="page-title">Gestión de Árbitros</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Administra el registro y certificación de árbitros.
                    </p>
                </div>
            </div>

            {/* MAIN CONTENT CARD */}
            <div className="pro-card">

                {/* TOOLBAR */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>

                    {/* SEARCH INPUT */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-darkest)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            className="pro-input"
                            style={{ background: 'transparent', border: 'none', padding: '0', width: '300px' }}
                            type="text"
                            placeholder="Buscar por Nombre, Cédula o Especialidad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* NEW BUTTON */}
                    <button className="pro-btn btn-primary" onClick={handleCreate}>
                        <Plus size={18} />
                        <span>Registrar Nuevo Árbitro</span>
                    </button>
                </div>

                {/* TABLA DE ARBITROS */}
                <div className="table-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Especialidad</th>
                                    <th>Experiencia</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArbitros.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No se encontraron árbitros que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredArbitros.map((arbitro) => {
                                        const nombreMostrado = arbitro.persona
                                            ? `${arbitro.persona.nombres || ''} ${arbitro.persona.apellidos || ''
                                                }`.trim()
                                            : arbitro.nombre || '';

                                        return (
                                            <tr key={arbitro.cedula}>
                                                <td><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{arbitro.cedula}</span></td>
                                                <td><strong style={{ color: '#fff' }}>{nombreMostrado}</strong></td>
                                                <td>
                                                    <span className="status-badge badge-neutral">{arbitro.especialidad || '—'}</span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Star size={14} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                                                        <span style={{ fontWeight: 600 }}>{arbitro.experiencia ?? 0} años</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`status-badge badge-${arbitro.estado === 'Certificado' ? 'success'
                                                            : arbitro.estado === 'Suspendido' ? 'danger'
                                                                : 'info'
                                                            }`}
                                                    >
                                                        {arbitro.estado}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="pro-btn btn-secondary"
                                                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                            onClick={() => handleEdit(arbitro)}
                                                            title="Editar"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="pro-btn btn-danger"
                                                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                            onClick={() => handleDelete(arbitro.cedula, nombreMostrado)}
                                                            title="Eliminar Rol"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PAGINACIÓN */}
                {pagination.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                        <button
                            className="pro-btn btn-secondary"
                            disabled={pagination.current_page <= 1}
                            onClick={() => loadArbitros(pagination.current_page - 1)}
                            style={{ opacity: pagination.current_page <= 1 ? 0.5 : 1, cursor: pagination.current_page <= 1 ? 'default' : 'pointer' }}
                        >
                            <span style={{ fontSize: '0.9rem' }}>← Anterior</span>
                        </button>

                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Página <strong style={{ color: '#fff' }}>{pagination.current_page}</strong> de {pagination.last_page}
                        </span>

                        <button
                            className="pro-btn btn-secondary"
                            disabled={pagination.current_page >= pagination.last_page}
                            onClick={() => loadArbitros(pagination.current_page + 1)}
                            style={{ opacity: pagination.current_page >= pagination.last_page ? 0.5 : 1, cursor: pagination.current_page >= pagination.last_page ? 'default' : 'pointer' }}
                        >
                            <span style={{ fontSize: '0.9rem' }}>Siguiente →</span>
                        </button>
                    </div>
                )}
            </div>

            <ArbitroModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={currentArbitro}
                onSave={handleSave}
            />
        </div>
    );
};

export default Arbitros;

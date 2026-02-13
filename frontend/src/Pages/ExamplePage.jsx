import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import '../css/unified-all.css';
import '../css/tables-modals.css';
import '../css/role-overrides.css';

/**
 * EJEMPLO DE PÁGINA PROFESIONAL CON TABLA Y MODAL
 * Copia este componente como referencia para crear nuevas páginas
 */

const ExamplePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', estado: 'activo' });

  // Datos de ejemplo
  const mockData = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', estado: 'Activo', inscripciones: 5 },
    { id: 2, nombre: 'María García', email: 'maria@example.com', estado: 'Pendiente', inscripciones: 3 },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', estado: 'Inactivo', inscripciones: 0 },
    { id: 4, nombre: 'Ana Martínez', email: 'ana@example.com', estado: 'Activo', inscripciones: 8 },
    { id: 5, nombre: 'Pedro Sánchez', email: 'pedro@example.com', estado: 'Activo', inscripciones: 2 },
  ];

  // Definición de columnas
  const columns = [
    { 
      key: 'nombre', 
      label: 'Nombre', 
      sortable: true,
      render: (val) => <strong>{val}</strong>
    },
    { 
      key: 'email', 
      label: 'Correo Electrónico', 
      sortable: true 
    },
    { 
      key: 'estado', 
      label: 'Estado', 
      sortable: true,
      render: (val) => {
        let className = 'table-badge';
        if (val === 'Activo') className += ' success';
        else if (val === 'Pendiente') className += ' warning';
        else className += ' danger';
        return <span className={className}>{val}</span>;
      }
    },
    { 
      key: 'inscripciones', 
      label: 'Inscripciones', 
      sortable: true,
      render: (val) => <span style={{ fontWeight: '500', color: 'var(--primary)' }}>{val}</span>
    },
    { 
      key: 'acciones', 
      label: 'Acciones',
      render: (_, row) => (
        <div className="table-actions">
          <button 
            className="table-btn"
            onClick={() => handleView(row)}
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>
          <button 
            className="table-btn"
            onClick={() => handleEdit(row)}
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button 
            className="table-btn danger"
            onClick={() => handleDelete(row)}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const handleCreate = () => {
    setSelectedItem(null);
    setFormData({ nombre: '', email: '', estado: 'activo' });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({ nombre: item.nombre, email: item.email, estado: item.estado });
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    alert(`Viewing: ${item.nombre}\nEmail: ${item.email}`);
  };

  const handleDelete = (item) => {
    if (confirm(`¿Está seguro de que desea eliminar a ${item.nombre}?`)) {
      alert('Eliminado exitosamente');
    }
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.email) {
      alert('Por favor complete todos los campos');
      return;
    }
    alert(`${selectedItem ? 'Actualizado' : 'Creado'}: ${formData.nombre}`);
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: 'var(--spacing-xl)' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary-light)' }}>
          Gestión de Usuarios
        </h1>
        <p style={{ color: 'var(--text-muted-light)', marginBottom: '1.5rem' }}>
          Administra la lista completa de usuarios del sistema
        </p>
      </div>

      {/* Stats Row */}
      <div className="action-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-box">
          <div className="stat-label">Total Usuarios</div>
          <div className="stat-value">5</div>
          <div className="stat-change positive">↑ 2 este mes</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Activos</div>
          <div className="stat-value">3</div>
          <div className="stat-change positive">60%</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Pendientes</div>
          <div className="stat-value">1</div>
          <div className="stat-change negative">20%</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Inactivos</div>
          <div className="stat-value">1</div>
          <div className="stat-change">20%</div>
        </div>
      </div>

      {/* Alert */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center' }}>ℹ️</div>
        <div className="alert-content">
          <div className="alert-title">Información</div>
          <div className="alert-message">
            Puedes crear, editar y eliminar usuarios usando los botones de abajo
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <Plus size={18} />
          Crear Nuevo Usuario
        </button>
      </div>

      {/* Data Table */}
      <div style={{ background: 'white', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <DataTable 
          columns={columns} 
          data={mockData}
          rowsPerPage={10}
          selectable={true}
          onSelectionChange={(selected) => console.log('Selected:', selected)}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
            >
              {selectedItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo:</label>
            <input 
              type="text" 
              id="nombre"
              placeholder="Ingrese el nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input 
              type="email" 
              id="email"
              placeholder="usuario@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado:</label>
            <select 
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            >
              <option value="activo">Activo</option>
              <option value="pendiente">Pendiente</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamplePage;

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Loader2,
  AlertCircle,
  Users,
  RefreshCcw,
  Download,
  Search,
  Plus,
  Trash2,
  X,
  CheckCircle,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  FileText,
  Edit,
  DollarSign,
  Shield,
  CloudUpload,
  IdCard
} from "lucide-react";
import { jsPDF } from "jspdf";
import api from "../../api";
import "../../css/unified-all.css";

export default function NominaRepresentante() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [equipos, setEquipos] = useState([]);
  const [equipoId, setEquipoId] = useState("");

  const [nominaList, setNominaList] = useState([]);
  const [q, setQ] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ---- Modal Agregar ----
  const [showModal, setShowModal] = useState(false);
  const [savingJugador, setSavingJugador] = useState(false);
  const [formJugador, setFormJugador] = useState({ equipo_id: "", cedula: "", numero: "", posicion: "", salario_base: "", bonificaciones: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentJugador, setCurrentJugador] = useState(null);

  // ---- Importación ----
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showImportSummary, setShowImportSummary] = useState(false);

  // 1. Cargar Equipos
  const loadEquipos = useCallback(async () => {
    try {
      const { data } = await api.get('/representante/equipos');
      setEquipos(data || []);
      // Eliminada lógica de auto-selección para permitir ver "Todos los Equipos" por defecto
    } catch (err) {
      console.error("Error loading equipos", err);
    }
  }, []);

  // 2. Cargar Nómina
  const loadNomina = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url = '/representante/equipo/jugadores/nomina';
      if (equipoId) {
        url += `?equipo_id=${equipoId}`;
      }
      const { data } = await api.get(url);

      let players = [];
      if (data.equipos) {
        data.equipos.forEach(eq => {
          if (eq.jugadores) {
            eq.jugadores.forEach(j => {
              players.push({
                ...j,
                equipo_nombre: eq.nombre,
                equipo_id: eq.id
              });
            });
          }
        });
      } else if (Array.isArray(data)) {
        players = data;
      }

      setNominaList(players);
    } catch (err) {
      console.error("Error loading nomina", err);
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => {
    loadEquipos();
  }, [loadEquipos]);

  useEffect(() => {
    loadNomina();
  }, [loadNomina]);


  // ---- Derived State for Table ----
  const filteredRows = useMemo(() => {
    let rows = nominaList;
    const term = q.toLowerCase().trim();
    if (term) {
      rows = rows.filter(r =>
        (r.persona?.nombres || "").toLowerCase().includes(term) ||
        (r.persona?.apellidos || "").toLowerCase().includes(term) ||
        (r.cedula || "").includes(term) ||
        (r.equipo_nombre || "").toLowerCase().includes(term)
      );
    }

    if (sortColumn) {
      rows = [...rows].sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        if (sortColumn === 'completo') {
          aVal = `${a.persona?.nombres} ${a.persona?.apellidos}`;
          bVal = `${b.persona?.nombres} ${b.persona?.apellidos}`;
        }

        if (aVal === null || aVal === undefined) return sortDirection === "asc" ? 1 : -1;
        if (bVal === null || bVal === undefined) return sortDirection === "asc" ? -1 : 1;

        if (typeof aVal === "string") {
          return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return rows;
  }, [nominaList, q, sortColumn, sortDirection]);

  const { paginatedRows, totalPages } = useMemo(() => {
    const total = filteredRows.length;
    const pages = Math.ceil(total / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginated = filteredRows.slice(startIndex, startIndex + rowsPerPage);
    return { paginatedRows: paginated, totalPages: pages };
  }, [filteredRows, currentPage, rowsPerPage]);

  const kpis = useMemo(() => {
    const totalJugadores = nominaList.length;
    const equiposCount = new Set(nominaList.map(j => j.equipo_id)).size;
    return { totalJugadores, equiposCount };
  }, [nominaList]);


  // ---- Handlers ----

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleModalOpen = (isEdit = false, player = null) => {
    setIsEditing(isEdit);
    setCurrentJugador(player);
    if (isEdit && player) {
      setFormJugador({
        equipo_id: player.equipo_id,
        cedula: player.cedula,
        numero: player.numero || "",
        posicion: player.posicion || "",
        salario_base: player.salario_base || "",
        bonificaciones: player.bonificaciones || ""
      });
    } else {
      setFormJugador({ equipo_id: equipoId || "", cedula: "", numero: "", posicion: "", salario_base: "", bonificaciones: "" });
    }
    setShowModal(true);
  };

  const handleSubmitJugador = async (e) => {
    e.preventDefault();
    setSavingJugador(true);
    setSuccess("");
    setError("");

    try {
      await api.post('/representante/equipo/jugadores', formJugador);
      setSuccess(isEditing ? "Ficha del jugador actualizada." : "Jugador agregado a la nómina.");

      setShowModal(false);
      loadNomina();
    } catch (err) {
      console.error(err);
      setError("Error al guardar. Verifique los datos o si la cédula ya existe en otro equipo.");
    } finally {
      setSavingJugador(false);
    }
  };

  const handleRemoveJugador = async (cedula) => {
    if (!confirm("¿Estás seguro de quitar a este jugador de la nómina?")) return;
    try {
      await api.delete(`/representante/equipo/jugadores/${cedula}`);
      setSuccess("Jugador eliminado de la nómina.");
      loadNomina();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el jugador.");
    }
  };

  const handleDownloadCarnet = async (cedula) => {
    try {
      const response = await api.get(`/jugadores/${cedula}/carnet-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carnet_${cedula}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError("No se pudo descargar el carnet. Verifique si el jugador tiene foto.");
    }
  };

  const handleImportFile = async (file) => {
    if (!file || !equipoId) return;
    setImporting(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('equipo_id', equipoId);

    try {
      const { data } = await api.post('/representante/equipo/jugadores/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(data);
      setShowImportSummary(true);
      setSuccess("Importación procesada.");
      loadNomina();
    } catch (err) {
      console.error(err);
      setError("Error en la importación del archivo.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // CLIENT-SIDE TEMPLATE GENERATION
  const handleDownloadTemplate = () => {
    try {
      const headers = ['cedula', 'nombres', 'apellidos', 'numero', 'posicion', 'email', 'telefono'];
      const csvContent = headers.join(',') + "\n";

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_jugadores.csv'); // standard logical name
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("No se pudo generar la plantilla.");
    }
  };

  // CLIENT-SIDE EXPORT PDF/CSV
  const handleExportNomina = (format) => {
    if (nominaList.length === 0) {
      setError("No hay datos para exportar.");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `nomina_${equipoId || 'general'}_${timestamp}`;

    if (format === 'csv') {
      const headers = ['Cedula', 'Nombres', 'Apellidos', 'Dorsal', 'Posicion', 'Equipo'];
      const escapeCsv = (field) => {
        const str = String(field || '');
        if (str.includes(',')) return `"${str}"`;
        return str;
      };

      const rows = nominaList.map(p => [
        escapeCsv(p.cedula),
        escapeCsv(p.persona?.nombres),
        escapeCsv(p.persona?.apellidos),
        escapeCsv(p.numero),
        escapeCsv(p.posicion),
        escapeCsv(p.equipo_nombre)
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess("Exportación CSV completada.");

    } else if (format === 'pdf') {
      try {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text("Reporte de Nómina", 14, 22);

        // Metadata
        doc.setFontSize(11);
        doc.setTextColor(100);
        const dateStr = new Date().toLocaleDateString();
        const timeStr = new Date().toLocaleTimeString();
        doc.text(`Fecha de emisión: ${dateStr} ${timeStr}`, 14, 30);
        doc.text(`Total Jugadores: ${nominaList.length}`, 14, 36);

        // Setup Table Header
        let y = 45;
        const lineHeight = 10;
        const pageHeight = doc.internal.pageSize.height;

        const colX = [14, 40, 110, 130, 170]; // X positions for columns
        const colTitles = ["Cédula", "Nombre Completo", "Dorsal", "Posición", "Equipo"];

        // Draw Header Function
        const drawHeader = (posY) => {
          doc.setFillColor(240, 240, 240); // Light gray bg
          doc.rect(10, posY - 6, 190, 8, 'F');
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0);
          colTitles.forEach((title, i) => doc.text(title, colX[i], posY));
          doc.line(10, posY + 2, 200, posY + 2);
        };

        drawHeader(y);
        y += lineHeight;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50);

        nominaList.forEach((p) => {
          // Check page break
          if (y + lineHeight > pageHeight - 15) {
            doc.addPage();
            y = 20;
            drawHeader(y);
            y += lineHeight;
            doc.setTextColor(50); // Reset color
            doc.setFont(undefined, 'normal');
          }

          const nombre = `${p.persona?.nombres || ''} ${p.persona?.apellidos || ''}`.substring(0, 35);

          doc.text(p.cedula || "-", colX[0], y);
          doc.text(nombre, colX[1], y);
          doc.text(String(p.numero || "-"), colX[2], y);
          doc.text((p.posicion || "-").substring(0, 15), colX[3], y);
          doc.text((p.equipo_nombre || "-").substring(0, 15), colX[4], y);

          y += 8; // Row height
        });

        doc.save(`${filename}.pdf`);
        setSuccess("PDF generado correctamente.");
      } catch (err) {
        console.error("PDF Generation Error", err);
        setError("Error al generar el PDF.");
      }
    }
  };

  if (loading && nominaList.length === 0) {
    return (
      <div className="rep-scope rep-screen-container rep-loading-container" style={{ flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCcw size={24} className="animate-spin" color="var(--primary-ocean)" />
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-muted)' }}>Sincronizando nómina...</p>
        </div>
      </div>
    );
  }

  // --- STYLES FOR DARK THEME COMPATIBILITY ---
  const glassCardStyle = {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    color: '#f8fafc'
  };

  const inputStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '8px',
    boxSizing: 'border-box'
  };

  return (
    <div className="rep-scope rep-screen-container rep-dashboard-fade">
      {/* HEADER */}
      <header className="rep-header-main page-header-responsive" style={{ marginBottom: '2.5rem' }}>
        <div className="header-info">
          <small className="university-label" style={{ fontWeight: '700', letterSpacing: '0.5px', color: 'var(--accent-teal)' }}>Gestión de Talento</small>
          <h1 className="content-title" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Nómina de Jugadores</h1>
          <p className="content-subtitle" style={{ color: '#cbd5e1' }}>Administración centralizada de atletas y cuerpos técnicos</p>
        </div>
        <div className="header-actions" style={{ width: 'auto' }}>
          <button onClick={() => handleModalOpen(false)} className="pro-btn btn-primary" style={{ boxShadow: 'var(--shadow-primary-button)' }}>
            <Plus size={18} /> Registrar Jugador
          </button>
        </div>
      </header>

      {/* ALERTS */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#86efac', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
          <CheckCircle size={20} /> {success}
        </div>
      )}

      {/* KPI GRID */}
      <div className="responsive-grid mb-8" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card rep-card-premium stat-card-primary-ocean-border" style={{ ...glassCardStyle }}>
          <div className="stat-card-header">
            <h3 style={{ color: '#cbd5e1', fontWeight: '700' }}>Total Atletas</h3>
            <Users size={20} color="var(--primary-ocean)" />
          </div>
          <p className="stat-value" style={{ color: '#fff', fontWeight: '900' }}>{kpis.totalJugadores}</p>
          <p className="stat-desc" style={{ color: '#94a3b8', fontWeight: '500' }}>Registrados en el sistema</p>
        </div>

        <div className="stat-card rep-card-premium stat-card-accent-teal-border" style={{ ...glassCardStyle }}>
          <div className="stat-card-header">
            <h3 style={{ color: '#cbd5e1', fontWeight: '700' }}>Equipos Activos</h3>
            <Shield size={20} color="var(--accent-teal)" />
          </div>
          <p className="stat-value" style={{ color: '#fff', fontWeight: '900' }}>{kpis.equiposCount}</p>
          <p className="stat-desc" style={{ color: '#94a3b8', fontWeight: '500' }}>Con nómina cargada</p>
        </div>

        <div className="stat-card rep-card-premium" style={{ ...glassCardStyle, borderTop: '5px solid #f59e0b' }}>
          <div className="stat-card-header">
            <h3 style={{ color: '#cbd5e1', fontWeight: '700' }}>Estado Documental</h3>
            <FileText size={20} color="#f59e0b" />
          </div>
          <p className="stat-value" style={{ color: '#fff', fontWeight: '900' }}>98%</p>
          <div className="perf-bar-bg mt-3" style={{ height: '8px', background: 'rgba(255,255,255,0.1)' }}>
            <div className="perf-bar-fill" style={{ width: `98%`, background: '#f59e0b', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="responsive-grid" style={{ gap: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="dashboard-col-left">
          <div className="rep-card-premium" style={{ padding: '0', overflow: 'hidden', ...glassCardStyle }}>
            {/* TOOLBAR */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} color="var(--primary-ocean)" fill="rgba(var(--primary-rgb), 0.1)" /> Gestión de Nómina
                  </h2>
                  <span className="hide-mobile" style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></span>
                  <div className="hide-mobile" style={{ color: '#94a3b8', fontSize: '1rem' }}>
                    <strong>{filteredRows.length}</strong> resultados
                  </div>
                </div>

                <div className="flex-mobile-col" style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '100%', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="search-box" style={{ ...inputStyle, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                    <Search size={18} color="#94a3b8" />
                    <input
                      placeholder="Buscar jugador..."
                      value={q}
                      onChange={e => setQ(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '0.95rem', outline: 'none', width: '100%', color: '#fff' }}
                    />
                  </div>
                  <select
                    value={equipoId}
                    onChange={e => setEquipoId(e.target.value)}
                    className="pro-input"
                    style={{ ...inputStyle, padding: '0.5rem 1rem', fontSize: '0.95rem', fontWeight: '500', width: 'auto', minWidth: '180px' }}
                  >
                    <option value="" style={{ color: '#333' }}>Todos los Equipos</option>
                    {equipos.map(eq => <option key={eq.id} value={eq.id} style={{ color: '#333' }}>{eq.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="table-responsive-wrapper">
              <table className="rep-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(0,0,0,0.2)', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <tr>
                    <th onClick={() => handleSort('completo')} style={{ padding: '1rem 1.5rem', textAlign: 'left', cursor: 'pointer', fontWeight: '700' }}>Jugador</th>
                    <th onClick={() => handleSort('cedula')} className="hide-mobile" style={{ padding: '1rem 1.5rem', textAlign: 'left', cursor: 'pointer', fontWeight: '700' }}>Identificación</th>
                    <th onClick={() => handleSort('numero')} style={{ padding: '1rem 1.5rem', textAlign: 'left', cursor: 'pointer', fontWeight: '700' }}>Dorsal</th>
                    <th onClick={() => handleSort('posicion')} className="hide-mobile" style={{ padding: '1rem 1.5rem', textAlign: 'left', cursor: 'pointer', fontWeight: '700' }}>Posición</th>
                    <th onClick={() => handleSort('equipo')} className="hide-mobile" style={{ padding: '1rem 1.5rem', textAlign: 'left', cursor: 'pointer', fontWeight: '700' }}>Equipo</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((r) => (
                      <tr key={r.id || r.cedula} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(53, 110, 216, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem', border: '1px solid rgba(53, 110, 216, 0.3)' }}>
                              {r.persona?.nombres?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>{r.persona?.nombres} {r.persona?.apellidos}</div>
                              <small style={{ color: '#94a3b8', fontWeight: '500' }}>{r.torneo_nombre || 'Torneo 2024'}</small>
                            </div>
                          </div>
                        </td>
                        <td className="hide-mobile" style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: '600' }}>{r.cedula}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ display: 'inline-block', padding: '0.35rem 0.85rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>
                            {r.numero || '-'}
                          </span>
                        </td>
                        <td className="hide-mobile" style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: '600' }}>{r.posicion}</td>
                        <td className="hide-mobile" style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ display: 'inline-block', padding: '0.35rem 1rem', background: 'rgba(53, 110, 216, 0.15)', color: '#60a5fa', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid rgba(53, 110, 216, 0.3)' }}>
                            {r.equipo_nombre}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button onClick={() => handleDownloadCarnet(r.cedula)} title="Descargar Carnet" style={{ padding: '0.6rem', borderRadius: '8px', color: '#a78bfa', border: 'none', background: 'rgba(139, 92, 246, 0.1)', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-purple-500/20 hover:text-purple-300">
                              <IdCard size={18} />
                            </button>
                            <button onClick={() => handleModalOpen(true, r)} title="Editar" style={{ padding: '0.6rem', borderRadius: '8px', color: '#94a3b8', border: 'none', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-white/10 hover:text-white">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleRemoveJugador(r.cedula)} title="Eliminar" style={{ padding: '0.6rem', borderRadius: '8px', color: '#fca5a5', border: 'none', background: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-red-500/20">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <Users size={56} style={{ opacity: 0.1, color: '#fff' }} />
                          <p style={{ fontWeight: '600', fontSize: '1.1rem', color: '#94a3b8' }}>No se encontraron jugadores en la nómina.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setCurrentPage(c => Math.max(1, c - 1))} disabled={currentPage === 1} className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}>Anterior</button>
              <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
              <button onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} disabled={currentPage === totalPages} className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}>Siguiente</button>
            </div>
          </div>
        </div>

        <div className="dashboard-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ACTIONS PANEL */}
          <div className="rep-card-premium" style={{ padding: '1.5rem', ...glassCardStyle }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCcw size={20} color="var(--primary-ocean)" /> Acciones Rápidas
            </h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#cbd5e1', fontWeight: '700', fontSize: '0.95rem' }}>
                  <FileSpreadsheet size={18} /> Importar CSV
                </div>
                <input type="file" ref={fileRef} accept=".csv" className="hidden" style={{ display: 'none' }} onChange={e => handleImportFile(e.target.files[0])} />
                <button onClick={() => fileRef.current?.click()} className="btn-primary" style={{ width: '100%', fontSize: '0.9rem', padding: '0.75rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                  {importing ? <Loader2 className="animate-spin" size={18} /> : "Subir Archivo"}
                </button>
                <button onClick={handleDownloadTemplate} className="btn-secondary" style={{ width: '100%', fontSize: '0.9rem', padding: '0.75rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', fontWeight: '600' }}>
                  Descargar Plantilla
                </button>
              </div>

              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#cbd5e1', fontWeight: '700', fontSize: '0.95rem' }}>
                  <Download size={18} /> Exportar Data
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => handleExportNomina('csv')} className="btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', fontWeight: '600' }}>CSV</button>
                  <button onClick={() => handleExportNomina('pdf')} className="btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', fontWeight: '600' }}>PDF</button>
                </div>
              </div>
            </div>
          </div>

          {/* INFO PANEL */}
          <div className="rep-card-premium" style={{ background: 'linear-gradient(135deg, #0366D6, #10B981)', color: 'white', border: 'none', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} /> Requisitos
            </h3>
            <ul style={{ paddingLeft: '1.25rem', listStyle: 'disc', fontSize: '0.9rem', opacity: 0.95, lineHeight: '1.7', fontWeight: '500' }}>
              <li>Cédula de identidad legible</li>
              <li>Fotografía tamaño carnet fondo blanco</li>
              <li>Formulario de inscripción firmado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#0f172a', borderRadius: '24px', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', animation: 'fadeIn 0.3s ease-out', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{isEditing ? 'Actualizar Ficha' : 'Nuevo Jugador'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#cbd5e1' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitJugador} style={{ padding: '2rem' }}>
              <div className="flex-mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '700' }}>Equipo</label>
                  <select className="pro-input" value={formJugador.equipo_id} onChange={e => setFormJugador({ ...formJugador, equipo_id: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', fontWeight: '500' }} required disabled={isEditing}>
                    <option value="">Seleccione...</option>
                    {equipos.map(eq => <option key={eq.id} value={eq.id} style={{ color: '#fff', background: '#1e293b' }}>{eq.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '700' }}>Cédula</label>
                  <input className="pro-input" value={formJugador.cedula} onChange={e => setFormJugador({ ...formJugador, cedula: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', fontWeight: '500' }} placeholder="ID Nacional" required disabled={isEditing} />
                </div>
              </div>
              <div className="flex-mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '700' }}>Dorsal</label>
                  <input type="number" className="pro-input" value={formJugador.numero} onChange={e => setFormJugador({ ...formJugador, numero: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', fontWeight: '500' }} placeholder="#" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '700' }}>Posición</label>
                  <input className="pro-input" value={formJugador.posicion} onChange={e => setFormJugador({ ...formJugador, posicion: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', fontWeight: '500' }} placeholder="Ej. Defensa" />
                </div>
              </div>
              <div className="flex-mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '700' }}>Salario Base</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                    <input type="number" step="0.01" className="pro-input" value={formJugador.salario_base} onChange={e => setFormJugador({ ...formJugador, salario_base: e.target.value })} style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', fontWeight: '500' }} placeholder="0.00" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '700' }}>Incentivos</label>
                  <div style={{ position: 'relative' }}>
                    <TrendingUp size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
                    <input type="number" step="0.01" className="pro-input" value={formJugador.bonificaciones} onChange={e => setFormJugador({ ...formJugador, bonificaciones: e.target.value })} style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', fontWeight: '500' }} placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.85rem 1.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#cbd5e1', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }} disabled={savingJugador}>
                  {savingJugador && <Loader2 className="animate-spin" size={20} />}
                  {isEditing ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Summary Modal */}
      {showImportSummary && importResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ background: '#1e293b', borderRadius: '24px', width: '90%', maxWidth: '450px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CloudUpload size={28} color="var(--primary-ocean)" /> Resultado de Importación
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', fontSize: '1rem' }}>
              <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle size={22} color="#10B981" /> <strong>{importResult.inserted || 0}</strong> registros creados.</li>
              <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><TrendingUp size={22} color="#F59E0B" /> <strong>{importResult.updated || 0}</strong> registros actualizados.</li>
              <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><AlertCircle size={22} color="#EF4444" /> <strong>{importResult.failed || 0}</strong> errores.</li>
            </ul>

            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', maxHeight: '150px', overflowY: 'auto' }}>
                <p style={{ color: '#fca5a5', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Detalles:</p>
                {importResult.errors.map((e, i) => <div key={i} style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '4px' }}>• {e}</div>)}
              </div>
            )}

            <button onClick={() => setShowImportSummary(false)} className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontWeight: '700', borderRadius: '12px' }}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}

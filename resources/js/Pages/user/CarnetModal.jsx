import React, { useRef } from "react";
import { X, Download, User, Award, Calendar, Hash } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./carnet.css";

const CarnetModal = ({ isOpen, onClose, data }) => {
  const carnetRef = useRef(null);

  if (!isOpen || !data) return null;

  const qrValue = data.qr_text || `JUGADOR:${data.cedula}`;

  const handleDownloadPdf = async () => {
    const element = carnetRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [90, 140],
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Carnet_${data.cedula || "Jugador"}.pdf`);
    } catch (error) {
      console.error("Error generando el PDF:", error);
      alert("No se pudo generar el PDF. Revisa la consola.");
    }
  };

  return (
    <div className="carnet-overlay" onClick={onClose}>
      <div className="carnet-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="carnet-header">
          <div className="header-text">
            <span className="carnet-inst">{data.institucion || 'Universidad Estatal de Bolívar'}</span>
            <h3>Carnet de Jugador</h3>
          </div>
          <button onClick={onClose} className="carnet-close-btn">
            <X size={24} />
          </button>
        </div>

        <div ref={carnetRef} className="carnet-capture-area">
          <div className="carnet-body">
            
            <div className="carnet-top">
              <div className="carnet-avatar">
                {data.foto ? (
                  <img src={data.foto} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <User size={48} />
                )}
              </div>
              <div className="carnet-info">
                <h4>{data.nombre_completo || "Nombre del Jugador"}</h4>
                <p><Hash size={14} style={{ display: 'inline', marginRight: 4 }} /><b>Cédula:</b> {data.cedula || "0000000000"}</p>
                <p><Award size={14} style={{ display: 'inline', marginRight: 4 }} /><b>Equipo:</b> {data.nombre_equipo || "N/A"}</p>
              </div>
            </div>

            <div className="carnet-meta">
              <div className="meta-item">
                <span>Posición</span>
                <b>{data.posicion || "N/A"}</b>
              </div>
              <div className="meta-item">
                <span>Número</span>
                <b>{data.numero || "S/N"}</b>
              </div>
              <div className="meta-item">
                <span>Edad</span>
                <b>{data.edad || "N/A"} años</b>
              </div>
            </div>

            <div className="carnet-stats">
              <div className="stat-box">
                <span className="stat-label">Victorias</span>
                <span className="stat-value">{data.victorias || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Empates</span>
                <span className="stat-value">{data.empates || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Derrotas</span>
                <span className="stat-value">{data.derrotas || 0}</span>
              </div>
            </div>

            <div className="qr-section">
              <div className="qr-container">
                {data.qr_svg ? (
                  <div dangerouslySetInnerHTML={{ __html: data.qr_svg }} />
                ) : (
                  <QRCodeSVG value={qrValue} size={120} level="H" />
                )}
              </div>
              <p className="qr-footer-text">
                <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                Generado: {data.fecha_generacion || new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="carnet-actions">
          <button className="download-button" onClick={handleDownloadPdf}>
            <Download size={20} />
            Descargar en formato PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarnetModal;
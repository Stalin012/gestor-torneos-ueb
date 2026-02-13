// c:\gestor\frontend\src\utils\report.service.js

import AuthService from "./auth.service";

const generateReport = async (reportType, equipoId) => {
  const token = AuthService.getTokenOrThrow();
  const headers = { Authorization: `Bearer ${token}` };
  let url = '';
  let filename = '';

  if (reportType === 'nomina_report') {
    url = `${AuthService.API_BASE}/representante/reportes/nomina?format=pdf${equipoId ? `&equipo_id=${equipoId}` : ''}`;
    filename = `informe_nomina_${new Date().toISOString().slice(0, 10)}.pdf`;
  } else if (reportType === 'payment_receipts') {
    url = `${AuthService.API_BASE}/representante/reportes/recibos_pago?format=pdf${equipoId ? `&equipo_id=${equipoId}` : ''}`;
    filename = `recibos_pago_${new Date().toISOString().slice(0, 10)}.pdf`;
  } else {
    throw new Error('Tipo de reporte no válido.');
  }

  const res = await fetch(url, { headers });

  if (!res.ok) throw new Error(await AuthService.parseErrorResponse(res));

  const blob = await res.blob();
  const urlBlob = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlBlob;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(urlBlob);
};

const ReportService = {
  generateReport,
};

export default ReportService;

// c:\gestor\frontend\src\utils\export.service.js

import AuthService from "./auth.service";

const exportPlayerNomina = async (format, equipoId) => {
  const token = AuthService.getTokenOrThrow();
  const headers = { Authorization: `Bearer ${token}` };
  const url = `${AuthService.API_BASE}/representante/equipo/jugadores/export?format=${format}${equipoId ? `&equipo_id=${equipoId}` : ''}`;

  const res = await fetch(url, { headers });

  if (!res.ok) throw new Error(await AuthService.parseErrorResponse(res));

  const blob = await res.blob();
  const filename = `nomina_jugadores_${new Date().toISOString().slice(0, 10)}.${format}`;
  const urlBlob = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlBlob;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(urlBlob);
};

const ExportService = {
  exportPlayerNomina,
};

export default ExportService;

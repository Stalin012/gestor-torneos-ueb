// c:\gestor\frontend\src\utils\import.service.js

import AuthService from "./auth.service";

const importPlayers = async (equipoId, file) => {
  const token = AuthService.getTokenOrThrow();
  const form = new FormData();
  form.append("equipo_id", equipoId);
  form.append("file", file);

  const res = await fetch(`${AuthService.API_BASE}/representante/equipo/jugadores/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) throw new Error(await AuthService.parseErrorResponse(res));
  return res.json();
};

const downloadTemplate = async () => {
  const token = AuthService.getTokenOrThrow();
  const res = await fetch(`${AuthService.API_BASE}/representante/equipo/jugadores/template`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await AuthService.parseErrorResponse(res));

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_jugadores.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const ImportService = {
  importPlayers,
  downloadTemplate,
};

export default ImportService;

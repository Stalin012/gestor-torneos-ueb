// c:\gestor\frontend\src\utils\payroll.service.js

import AuthService from "./auth.service";

const getPlayerPayroll = async (equipoId) => {
  const token = AuthService.getTokenOrThrow();
  const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };
  const response = await fetch(`${AuthService.API_BASE}/representante/equipo/jugadores/nomina${equipoId ? `?equipo_id=${equipoId}` : ""}`, { headers });

  if (!response.ok) throw new Error(await AuthService.parseErrorResponse(response));

  return response.json();
};

const PayrollService = {
  getPlayerPayroll,
};

export default PayrollService;

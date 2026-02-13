// c:\gestor\frontend\src\utils\team.service.js

import AuthService from "./auth.service";

const getTeams = async () => {
  const token = AuthService.getTokenOrThrow();
  const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };
  const response = await fetch(`${AuthService.API_BASE}/representante/equipos`, { headers });

  if (response.status === 401) AuthService.logoutAndRedirect();
  if (!response.ok) throw new Error(await AuthService.parseErrorResponse(response));

  return response.json();
};

const TeamService = {
  getTeams,
};

export default TeamService;

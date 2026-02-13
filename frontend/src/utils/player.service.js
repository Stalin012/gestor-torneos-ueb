// c:\gestor\frontend\src\utils\player.service.js

import AuthService from "./auth.service";

const addPlayer = async (playerData) => {
  const token = AuthService.getTokenOrThrow();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  const response = await fetch(`${AuthService.API_BASE}/representante/equipo/jugadores`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(playerData),
  });

  if (!response.ok) throw new Error(await AuthService.parseErrorResponse(response));
  return response.json();
};

const updatePlayer = async (cedula, playerData) => {
  const token = AuthService.getTokenOrThrow();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  const response = await fetch(`${AuthService.API_BASE}/representante/equipo/jugadores/${cedula}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(playerData),
  });

  if (!response.ok) throw new Error(await AuthService.parseErrorResponse(response));
  return response.json();
};

const removePlayer = async (cedula) => {
  const token = AuthService.getTokenOrThrow();
  const headers = { Authorization: `Bearer ${token}` };
  const response = await fetch(`${AuthService.API_BASE}/representante/equipo/jugadores/${cedula}`, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) throw new Error(await AuthService.parseErrorResponse(response));
  return response.json();
};

const PlayerService = {
  addPlayer,
  updatePlayer,
  removePlayer,
};

export default PlayerService;

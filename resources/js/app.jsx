// resources/js/app.jsx
import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Páginas Públicas
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import DisciplinaPage from "./Pages/public/DisciplinaPage";
import TorneoPublico from "./Pages/public/TorneoPublico";
import NoticiaDetalle from "./Pages/public/NoticiaDetalle";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import RepresentanteLayout from "./layouts/RepresentanteLayout";
import RefereeLayout from "./layouts/RefereeLayout";

// Módulos Admin
import AdminDashboard from "./Pages/admin/Dashboard";
import TorneosDeportes from "./Pages/admin/TorneosDeportes";
import TorneoDetalle from "./Pages/admin/TorneoDetalle";
import PartidosFixtures from "./Pages/admin/PartidosFixtures";
import EquiposInscripciones from "./Pages/admin/EquiposInscripciones";
import JugadoresPersonas from "./Pages/admin/JugadoresPersonas";
import Arbitros from "./Pages/admin/Arbitros";
import UsuariosSistema from "./Pages/admin/UsuariosSistema";
import GaleriaMedia from "./Pages/admin/GaleriaMedia";
import Auditoria from "./Pages/admin/Auditoria";
import Noticias from "./Pages/admin/Noticias";
import ConfiguracionGeneral from "./Pages/admin/ConfiguracionGeneral";
import Estadisticas from "./Pages/admin/Estadisticas";

// Módulos Representante
import DashboardRepresentante from "./Pages/representante/DashboardRepresentante";
import CalendarioRepresentante from "./Pages/representante/CalendarioRepresentante";
import NominaRepresentante from "./Pages/representante/NominaRepresentante";

import EquipoRepresentante from "./Pages/representante/EquipoRepresentante";
import InscripcionesRepresentante from "./Pages/representante/InscripcionesRepresentante";
import PartidosRepresentante from "./Pages/representante/PartidosRepresentante";
import PerfilRepresentante from "./Pages/representante/PerfilRepresentante";
import EstadisticasRepresentante from "./Pages/representante/EstadisticasRepresentante";


// Módulos Árbitro
import RefereeDashboard from "./Pages/referee/Dashboard";
import PartidosAsignados from "./Pages/referee/PartidosAsignados";
import RefereePerfil from "./Pages/referee/Perfil";

// Otros
import CarnetPage from "./Pages/carnet/CarnetPage";
import UserProfile from "./Pages/user/Profile";
import EquiposInscritos from "./Pages/user/EquiposInscritos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carnet/:cedula" element={<CarnetPage />} />
        <Route path="/disciplinas/:deporte" element={<DisciplinaPage />} />
        <Route path="/torneos/:id" element={<TorneoPublico />} />
        <Route path="/noticias/:id" element={<NoticiaDetalle />} />

        {/* --- RUTAS ADMINISTRADOR --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="torneos-deportes" element={<TorneosDeportes />} />
          <Route path="torneos/:id" element={<TorneoDetalle />} />
          <Route path="torneos" element={<TorneosDeportes />} />
          <Route path="partidos" element={<PartidosFixtures />} />
          <Route path="equipos" element={<EquiposInscripciones />} />
          <Route path="jugadores" element={<JugadoresPersonas />} />
          <Route path="arbitros" element={<Arbitros />} />
          <Route path="usuarios" element={<UsuariosSistema />} />
          <Route path="galeria" element={<GaleriaMedia />} />
          <Route path="auditoria" element={<Auditoria />} />
          <Route path="noticias" element={<Noticias />} />
          <Route path="auditoria" element={<Auditoria />} />
          <Route path="configuracion" element={<ConfiguracionGeneral />} />
          <Route path="estadisticas" element={<Estadisticas />} />
        </Route>

        {/* --- RUTAS REPRESENTANTE --- */}
        <Route path="/representante" element={<RepresentanteLayout />}>
          <Route index element={<DashboardRepresentante />} />
          <Route path="dashboard" element={<DashboardRepresentante />} />
          <Route path="calendario" element={<CalendarioRepresentante />} />

          <Route path="jugadores" element={<NominaRepresentante />} />
          <Route path="equipos" element={<EquipoRepresentante />} />
          <Route path="inscripciones" element={<InscripcionesRepresentante />} />
          <Route path="partidos" element={<PartidosRepresentante />} />
          <Route path="perfil" element={<PerfilRepresentante />} />
          <Route path="estadisticas" element={<EstadisticasRepresentante />} />
        </Route>


        {/* --- RUTAS ÁRBITRO --- */}
        <Route path="/referee" element={<RefereeLayout />}>
          <Route index element={<RefereeDashboard />} />
          <Route path="dashboard" element={<RefereeDashboard />} />
          <Route path="partidos" element={<PartidosAsignados />} />
          <Route path="perfil" element={<RefereePerfil />} />
        </Route>

        {/* --- OTRAS RUTAS --- */}
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/equipos" element={<EquiposInscritos />} />

        {/* --- 404 --- */}
        <Route path="*" element={
          <div style={{ background: '#0f172a', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Error 404 - Página no encontrada</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
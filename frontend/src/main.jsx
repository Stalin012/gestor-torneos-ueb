// frontend/src/main.jsx
import './bootstrap';
// Design System - Import UNIFIED Master CSS
// This single import includes all necessary styles in correct order
import './css/index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
import UnifiedLayout from "./layouts/UnifiedLayout";
import ErrorBoundary from "./components/ErrorBoundary";

// Páginas Públicas (Lazy)
const Home = lazy(() => import("./Pages/Home"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const DisciplinaPage = lazy(() => import("./Pages/public/DisciplinaPage"));
const TorneoPublico = lazy(() => import("./Pages/public/TorneoPublico"));
const NoticiaDetalle = lazy(() => import("./Pages/public/NoticiaDetalle"));
const GaleriaPublica = lazy(() => import("./Pages/public/GaleriaPublica"));

// Módulos Admin (Lazy)
const AdminDashboard = lazy(() => import("./Pages/admin/Dashboard"));
const TorneosDeportes = lazy(() => import("./Pages/admin/TorneosDeportes"));
const TorneoDetalle = lazy(() => import("./Pages/admin/TorneoDetalle"));
const PartidosFixtures = lazy(() => import("./Pages/admin/PartidosFixtures"));
const EquiposInscripciones = lazy(() => import("./Pages/admin/EquiposInscripciones"));
const JugadoresPersonas = lazy(() => import("./Pages/admin/JugadoresPersonas"));
const Arbitros = lazy(() => import("./Pages/admin/Arbitros"));
const UsuariosSistema = lazy(() => import("./Pages/admin/UsuariosSistema"));
const GaleriaMedia = lazy(() => import("./Pages/admin/GaleriaMedia"));
const Auditoria = lazy(() => import("./Pages/admin/Auditoria"));
const Noticias = lazy(() => import("./Pages/admin/Noticias"));
const ConfiguracionGeneral = lazy(() => import("./Pages/admin/ConfiguracionGeneral"));
const Estadisticas = lazy(() => import("./Pages/admin/Estadisticas"));
const PerfilAdmin = lazy(() => import("./Pages/admin/Perfil"));

// Módulos Representante (Lazy)
const DashboardRepresentante = lazy(() => import("./Pages/representante/DashboardRepresentante"));
const CalendarioRepresentante = lazy(() => import("./Pages/representante/CalendarioRepresentante"));
const NominaRepresentante = lazy(() => import("./Pages/representante/NominaRepresentante"));
const EquipoRepresentante = lazy(() => import("./Pages/representante/EquipoRepresentante"));
const InscripcionesRepresentante = lazy(() => import("./Pages/representante/InscripcionesRepresentante"));
const PartidosRepresentante = lazy(() => import("./Pages/representante/PartidosRepresentante"));
const PerfilRepresentante = lazy(() => import("./Pages/representante/PerfilRepresentante"));
const EstadisticasRepresentante = lazy(() => import("./Pages/representante/EstadisticasRepresentante"));

// Módulos Árbitro (Lazy)
const RefereeDashboard = lazy(() => import("./Pages/referee/Dashboard"));
const PartidosAsignados = lazy(() => import("./Pages/referee/PartidosAsignados"));
const RefereePerfil = lazy(() => import("./Pages/referee/Perfil"));

// Otros (Lazy)
const CarnetPage = lazy(() => import("./Pages/carnet/CarnetPage"));
const UserProfile = lazy(() => import("./Pages/user/Profile"));
const EquiposInscritos = lazy(() => import("./Pages/user/EquiposInscritos"));
const NotFound = lazy(() => import("./Pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen message="Cargando interfaz..." />}>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/carnet/:cedula" element={<CarnetPage />} />
          <Route path="/disciplinas/:deporte" element={<DisciplinaPage />} />
          <Route path="/torneos/:id" element={<TorneoPublico />} />
          <Route path="/noticias/:id" element={<NoticiaDetalle />} />
          <Route path="/galeria" element={<GaleriaPublica />} />

          {/* --- RUTAS ADMINISTRADOR --- */}
          <Route path="/admin" element={<UnifiedLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="torneos-deportes" element={<TorneosDeportes />} />
            <Route path="torneos/:id" element={<TorneoDetalle />} />
            <Route path="torneos" element={<TorneosDeportes />} />
            <Route path="partidos" element={<PartidosFixtures />} />
            <Route path="equipos/:torneoId?" element={<EquiposInscripciones />} />
            <Route path="jugadores" element={<JugadoresPersonas />} />
            <Route path="arbitros" element={<Arbitros />} />
            <Route path="usuarios" element={<UsuariosSistema />} />
            <Route path="galeria" element={<GaleriaMedia />} />
            <Route path="auditoria" element={<Auditoria />} />
            <Route path="noticias" element={<Noticias />} />
            <Route path="configuracion" element={<ConfiguracionGeneral />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="perfil" element={<PerfilAdmin />} />
          </Route>

          {/* --- RUTAS REPRESENTANTE --- */}
          <Route path="/representante" element={<UnifiedLayout />}>
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
          <Route path="/referee" element={<UnifiedLayout />}>
            <Route index element={<RefereeDashboard />} />
            <Route path="dashboard" element={<RefereeDashboard />} />
            <Route path="partidos" element={<PartidosAsignados />} />
            <Route path="perfil" element={<RefereePerfil />} />
          </Route>

          {/* --- RUTAS USUARIO/JUGADOR --- */}
          <Route path="/user" element={<UnifiedLayout />}>
            <Route index element={<UserProfile />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="perfil" element={<UserProfile />} />
            <Route path="equipos" element={<EquiposInscritos />} />
          </Route>

          {/* --- 404 --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

import { NotificationProvider } from './context/NotificationContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </React.StrictMode>
  );
}

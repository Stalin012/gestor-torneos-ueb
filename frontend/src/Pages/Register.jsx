import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, IdCard, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import Logo from "../components/Logo";
import { apiPublic } from "../api";
import "../css/home.css";

const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  REPRESENTANTE_HOME: "/representante",
  USER_PROFILE: "/user/profile",
};

const saveAuthData = (token, user) => {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(user));
};

const getRedirectPath = (userRole) => {
  const role = String(userRole || "").toLowerCase();
  switch (role) {
    case "admin":
      return ROUTES.ADMIN_DASHBOARD;
    case "representante":
      return ROUTES.REPRESENTANTE_HOME;
    default:
      return ROUTES.USER_PROFILE;
  }
};

const validarCedulaEcuatoriana = (cedula) => {
  if (!cedula || cedula.length !== 10) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;

  const tercerDigito = parseInt(cedula.substring(2, 3), 10);
  if (tercerDigito >= 6) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  let digitoCalculado = 10 - (suma % 10);
  if (digitoCalculado === 10) digitoCalculado = 0;

  const digitoReal = parseInt(cedula[9], 10);
  return digitoCalculado === digitoReal;
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    password_confirmation: "",
    rol: "jugador",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDisabled = useMemo(() => loading, [loading]);

  const handleChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null);
    },
    [error]
  );

  const handleBack = useCallback(() => navigate(ROUTES.LOGIN), [navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      const cedulaLimpia = formData.cedula.trim();

      if (!/^\d{10}$/.test(cedulaLimpia)) {
        setError("La cédula debe contener exactamente 10 números.");
        return;
      }

      if (!validarCedulaEcuatoriana(cedulaLimpia)) {
        setError("La cédula ingresada no es válida para Ecuador. Revisa los números.");
        return;
      }

      setLoading(true);

      try {
        const { data } = await apiPublic.post('/register', {
          cedula: formData.cedula.trim(),
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          email: formData.email.trim(),
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          rol: formData.rol,
        });

        if (!data?.token || !data?.user) {
          setError("Respuesta del servidor inválida.");
          return;
        }

        saveAuthData(data.token, data.user);

        const path = getRedirectPath(data.user?.rol || data.user?.role);
        navigate(path, { replace: true });
      } catch (err) {
        if (err.response?.data?.errors) {
          const msg = Object.values(err.response.data.errors).flat().join("\n");
          setError(msg);
        } else {
          setError(err.response?.data?.message || "No se pudo conectar al servidor. Verifica tu conexión.");
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate]
  );

  return (
    <div className="login-container">
      <div className="hero-bg" aria-hidden="true">
        <img
          src="https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Fondo"
          onError={(e) => (e.target.style.display = "none")}
          loading="lazy"
        />
        <div className="overlay"></div>
      </div>

      <button className="btn-back" onClick={handleBack} type="button">
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      <div className="login-card" role="main">
        <div className="login-header">
          <div className="login-logo">
            <Logo size="lg" variant="light" />
          </div>
          <h2>
            Crear <span className="highlight">Cuenta</span>
          </h2>
          <p>Registra tus datos para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <IdCard className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Cédula (10 dígitos)"
              value={formData.cedula}
              onChange={handleChange("cedula")}
              disabled={isDisabled}
              required
            />
          </div>

          <div className="input-group">
            <User className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Nombres"
              value={formData.nombres}
              onChange={handleChange("nombres")}
              disabled={isDisabled}
              required
            />
          </div>

          <div className="input-group">
            <User className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Apellidos"
              value={formData.apellidos}
              onChange={handleChange("apellidos")}
              disabled={isDisabled}
              required
            />
          </div>

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Correo"
              value={formData.email}
              onChange={handleChange("email")}
              disabled={isDisabled}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type="password"
              placeholder="Contraseña (mín. 8)"
              value={formData.password}
              onChange={handleChange("password")}
              disabled={isDisabled}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={formData.password_confirmation}
              onChange={handleChange("password_confirmation")}
              disabled={isDisabled}
              required
            />
          </div>

          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              <AlertCircle size={16} />
              <span style={{ whiteSpace: "pre-line" }}>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={isDisabled} aria-busy={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿Ya tienes cuenta?{" "}
            <button type="button" className="link-button" onClick={() => navigate(ROUTES.LOGIN)}>
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

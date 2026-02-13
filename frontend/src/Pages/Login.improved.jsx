import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowLeft, Shield, AlertCircle } from "lucide-react";
import "../css/home.css";

// Constants
const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";
const ROUTES = {
  HOME: "/",
  ADMIN_DASHBOARD: "/admin/dashboard",
  USER_PROFILE: "/user/profile",
  PASSWORD_RECOVERY: "/recuperar-contrasena",
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Credenciales incorrectas. Por favor, verifica tus datos.",
  SERVER_ERROR: "Error al conectar con el servidor. Intenta nuevamente.",
  NETWORK_ERROR: "No se pudo conectar al servidor. Verifica tu conexión a internet.",
  EMPTY_FIELDS: "Por favor, completa todos los campos.",
  INVALID_FORMAT: "El formato de usuario o contraseña no es válido.",
};

// Utility functions
const validateInputs = (login, password) => {
  const trimmedLogin = login.trim();
  const trimmedPassword = password.trim();

  if (!trimmedLogin || !trimmedPassword) {
    return { isValid: false, error: ERROR_MESSAGES.EMPTY_FIELDS };
  }

  if (trimmedLogin.length < 3 || trimmedPassword.length < 4) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FORMAT };
  }

  return { isValid: true, trimmedLogin, trimmedPassword };
};

const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const saveAuthData = (token, user) => {
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error saving auth data to localStorage:", error);
    throw new Error("No se pudo guardar la sesión. Verifica el espacio disponible.");
  }
};

const getRedirectPath = (userRole) => {
  switch (userRole?.toLowerCase()) {
    case "admin":
      return ROUTES.ADMIN_DASHBOARD;
    case "user":
    default:
      return ROUTES.USER_PROFILE;
  }
};

/**
 * Login Component - Handles user authentication
 * Supports login via email or cedula (ID number)
 */
const Login = () => {
  const navigate = useNavigate();
  
  // State management
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized handlers
  const handleBack = useCallback(() => {
    navigate(ROUTES.HOME);
  }, [navigate]);

  const handleInputChange = useCallback((field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  }, [error]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const validation = validateInputs(formData.login, formData.password);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    clearAuthData();

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          login: validation.trimmedLogin,
          password: validation.trimmedPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
        setError(errorMessage);
        return;
      }

      // Validate response data
      if (!data.token || !data.user) {
        setError("Respuesta del servidor inválida.");
        return;
      }

      // Save authentication data
      saveAuthData(data.token, data.user);

      // Navigate based on user role
      const redirectPath = getRedirectPath(data.user?.rol);
      navigate(redirectPath, { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      
      // Differentiate between network and server errors
      const errorMessage = err.name === "TypeError" 
        ? ERROR_MESSAGES.NETWORK_ERROR 
        : ERROR_MESSAGES.SERVER_ERROR;
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  // Memoized values
  const isFormDisabled = useMemo(() => loading, [loading]);

  return (
    <div className="login-container">
      {/* Background Image */}
      <div className="hero-bg" aria-hidden="true">
        <img 
          src="https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg" 
          alt="Background decorativo"
          onError={(e) => { e.target.style.display = 'none'; }}
          loading="lazy"
        />
        <div className="overlay"></div>
      </div>

      {/* Back Button */}
      <button 
        className="btn-back" 
        onClick={handleBack}
        aria-label="Volver a la página principal"
        type="button"
      >
        <ArrowLeft size={20} aria-hidden="true" /> 
        <span>Volver</span>
      </button>

      {/* Login Card */}
      <div className="login-card glass-effect" role="main">
        <div className="login-header">
          <div className="brand-icon-lg" aria-hidden="true">
            <Shield size={40} />
          </div>
          <h1>Acceso <span className="highlight">Clubes</span></h1>
          <p>Gestiona tu equipo y alineaciones</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} noValidate>
          {/* Login Input */}
          <div className="input-group">
            <User className="input-icon" size={20} aria-hidden="true" />
            <label htmlFor="login-input" className="sr-only">
              Correo electrónico o Cédula
            </label>
            <input
              id="login-input"
              type="text"
              placeholder="Correo o Cédula"
              required
              value={formData.login}
              onChange={handleInputChange("login")}
              disabled={isFormDisabled}
              autoComplete="username"
              aria-describedby={error ? "error-message" : undefined}
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <Lock className="input-icon" size={20} aria-hidden="true" />
            <label htmlFor="password-input" className="sr-only">
              Contraseña
            </label>
            <input
              id="password-input"
              type="password"
              placeholder="Contraseña"
              required
              value={formData.password}
              onChange={handleInputChange("password")}
              disabled={isFormDisabled}
              autoComplete="current-password"
              aria-describedby={error ? "error-message" : undefined}
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div 
              id="error-message"
              className="error-message"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={isFormDisabled}
            aria-busy={loading}
          >
            {loading ? "Verificando..." : "Ingresar al Sistema"}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            ¿Olvidaste tu contraseña?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate(ROUTES.PASSWORD_RECOVERY)}
              aria-label="Recuperar contraseña"
            >
              Recuperar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

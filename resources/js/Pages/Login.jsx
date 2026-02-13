import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowLeft, Shield, AlertCircle, Loader2 } from "lucide-react";
import "../../css/Login.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.login || !formData.password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Credenciales incorrectas");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user?.rol?.toLowerCase() || "user";
      if (role === 'admin') navigate("/admin/dashboard");
      else if (role === 'representante') navigate("/representante");
      else if (role === 'arbitro' || role === 'árbitro') navigate("/referee/dashboard");
      else navigate("/user/profile");

    } catch (err) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg"></div>

      <button className="btn-back" onClick={() => navigate("/")}>
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={36} color="white" />
          </div>
          <h2>Bienvenido</h2>
          <p>Ingresa a tu panel de control</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Usuario o Cédula"
                value={formData.login}
                onChange={e => setFormData({ ...formData, login: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {error && (
            <div className="error-msg">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <div className="register-link">
          ¿No tienes cuenta? <span onClick={() => navigate("/register")}>Regístrate</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

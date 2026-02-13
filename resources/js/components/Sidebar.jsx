import React, { useState } from "react";
import "./sidebar.css";

export default function Sidebar() {
    const [open, setOpen] = useState(true);

    return (
        <div className={`sidebar ${open ? "open" : "collapsed"}`}>
            <div className="sidebar-header">
                <h2 className="logo">{open ? "Gestor UEB" : "UEB"}</h2>
                <button className="toggle-btn" onClick={() => setOpen(!open)}>
                    <i className="fa-solid fa-bars"></i>
                </button>
            </div>

            <nav className="menu">
                <a href="#" className="menu-item">
                    <i className="fa fa-home"></i>
                    {open && <span>Inicio</span>}
                </a>

                <a href="#" className="menu-item">
                    <i className="fa fa-trophy"></i>
                    {open && <span>Torneos</span>}
                </a>

                <a href="#" className="menu-item">
                    <i className="fa fa-users"></i>
                    {open && <span>Equipos</span>}
                </a>

                <a href="#" className="menu-item">
                    <i className="fa fa-id-card"></i>
                    {open && <span>Carnets</span>}
                </a>

                <a href="#" className="menu-item">
                    <i className="fa fa-user"></i>
                    {open && <span>Mi Perfil</span>}
                </a>

                <a href="#" className="menu-item logout">
                    <i className="fa fa-sign-out-alt"></i>
                    {open && <span>Salir</span>}
                </a>
            </nav>
        </div>
    );
}

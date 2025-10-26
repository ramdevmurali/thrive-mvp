// src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css'; // We'll create this CSS file next

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="navbar-brand">THRIVE</h2>
      <div className="nav-links">
        <NavLink to="/" className="nav-link">Data Entry</NavLink>
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
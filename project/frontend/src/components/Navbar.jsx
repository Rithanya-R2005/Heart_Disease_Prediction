import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  // Home is active on both "/" and "/home"
  const isHomeActive =
    location.pathname === '/' || location.pathname === '/home';

  const authenticated = isAuthenticated();

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <NavLink to={authenticated ? '/home' : '/'} className="logo" onClick={closeMobile}>
          <span className="logo-text">CardioSense</span>
        </NavLink>

        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          {authenticated ? (
            <>
              <NavLink
                to="/home"
                className={`nav-link ${isHomeActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                Home
              </NavLink>
              <NavLink
                to="/healthcheck"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                HealthCheck AI
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                Dashboard
              </NavLink>
              <button onClick={handleLogout} className="btn-nav-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={`nav-link ${isHomeActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                Home
              </NavLink>
              <NavLink
                to="/healthcheck"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                HealthCheck AI
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `btn-nav-login ${isActive ? 'btn-nav-login-active' : ''}`
                }
                onClick={closeMobile}
              >
                Login
              </NavLink>
            </>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

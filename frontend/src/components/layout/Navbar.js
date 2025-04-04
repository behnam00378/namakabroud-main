import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          سیستم مدیریت نگهبانان
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        {currentUser && (
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  داشبورد
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/guards">
                  نگهبانان
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/areas">
                  مناطق
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/shifts">
                  شیفت‌ها
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/leaves">
                  مرخصی‌ها
                </Link>
              </li>
            </ul>
            <div className="d-flex">
              <span className="navbar-text me-3">
                {currentUser.name} | {currentUser.role === 'admin' ? 'مدیر' : currentUser.role === 'supervisor' ? 'گشت' : 'نگهبان'}
              </span>
              <button className="btn btn-outline-light" onClick={handleLogout}>
                خروج
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
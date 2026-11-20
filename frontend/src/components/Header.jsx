import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import '../styles/Header.css';
import logo from '../assets/Logo-ULM.svg';
import vector from '../assets/Vector.svg';

const dashboardPaths = [
  '/overview',
  '/borrowing',
  '/electronic-access',
  '/demand-analysis',
  '/acquisition',
  '/log-details',
];

export default function Header({ activeSection, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);


const handleHomeClick = () => {
  if (location.pathname !== '/') {
    navigate('/');
    return;
  }

  // Đang ở Home thì cuộn lên đầu trang
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
  const isHome = location.pathname === '/';

  // Đang ở một trang con của Dashboard
  const isDashboardPage = dashboardPaths.includes(location.pathname);

  // Dashboard active khi ở trang con hoặc đang cuộn đến Dashboard tại Home
  const isDashboardActive =
    isDashboardPage ||
    (isHome && activeSection === 'dashboard');

  // Trang chủ active khi ở đầu trang Home
  const isHomeActive =
    isHome && activeSection !== 'dashboard';

  return (
    <header className="header">

      <div className="header-left">
        <Link to="/" className="header-brand-link" title="Về trang chủ">
          <div
            className="header-brand-container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div className="header-logo-wrapper">
              <img
                src={logo}
                alt="UTH LibMetrics Logo"
                className="header-logo"
              />
            </div>

            <div className="header-text-group">
              <h1 className="header-main-title">
                Library Analytics Dashboard
              </h1>
              <p className="header-sub-desc">
                By HỌC KỲ DOANH NGHIỆP - Nhóm 4
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="header-right">
        <div className="header-quick-links">

          {/* Trang chủ */}
          <Link
  to="/"
  onClick={() => {
    if (location.pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }}
  className={`header-nav-pill ${
    isHomeActive ? 'active' : ''
  }`}
>
  Trang chủ
</Link>

          {/* Dashboard */}
          <Link
            to="/#dashboard"
            className={`header-nav-pill ${
              isDashboardActive ? 'active' : ''
            }`}
          >
            Dashboard
          </Link>

          {/* Quản lý */}
          <NavLink
            to="/management"
            className={({ isActive }) =>
              `header-nav-pill ${isActive ? 'active' : ''}`
            }
          >
            Quản lý
          </NavLink>

          {/* Giới thiệu */}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `header-nav-pill ${isActive ? 'active' : ''}`
            }
          >
            Giới thiệu
          </NavLink>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="header-nav-pill header-nav-icon-pill"
            title="Đăng xuất"
          >
            <img
              src={vector}
              alt="Vector"
              className="header-nav-icon"
            />
          </button>

        </div>
      </div>
{showLogoutModal && createPortal(
  <div className="logout-modal-overlay">
    <div className="logout-modal">
      <h3>Xác nhận đăng xuất</h3>

      <p>
        Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
      </p>

      <div className="logout-modal-actions">
        <button
          type="button"
          className="logout-cancel-btn"
          onClick={() => setShowLogoutModal(false)}
        >
          Hủy
        </button>

        <button
          type="button"
          className="logout-confirm-btn"
          onClick={onLogout}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  </div>,
  document.body
)}
    </header>
  );
}

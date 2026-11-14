import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Activity, Home, Info, LogOut } from 'lucide-react';
import '../styles/Header.css';

export default function Header({ title, subtitle, onLogout }) {
  const [tilt, setTilt] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    setTilt(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTilt('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <header
        className="dashboard-3d-header"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: tilt }}
      >
        {/* Dải ánh sáng 3D chạy ngầm */}
        <div className="header-glow-bar" />
        <div className="header-ambient-circle" />

        {/* Cột trái: Tiêu đề trang động */}
        <div className="header-left-info">
          <div className="header-kicker">
            <Sparkles size={13} />
            <span>UTH LIBRARY ANALYTICS DASHBOARD</span>
          </div>
          <h1 className="header-main-title">{title}</h1>
          {subtitle && <p className="header-sub-desc">{subtitle}</p>}
        </div>

        {/* Cột phải: Cụm điều hướng, Live Metabase và Nút Đăng xuất */}
        <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="header-quick-links">
            <Link to="/" className="header-nav-pill" title="Về Trang chủ">
              <Home size={15} />
              <span>Trang chủ</span>
            </Link>
            <Link to="/about" className="header-nav-pill" title="Giới thiệu hệ thống">
              <Info size={15} />
              <span>Giới thiệu</span>
            </Link>
          </div>

          <div className="live-status-3d-badge">
            <span className="pulse-dot" />
            <Activity size={15} className="status-icon" />
            <div className="status-texts">
              <strong>LIVE METABASE</strong>
              <small>UTH • Nhóm 4</small>
            </div>
          </div>

          {/* Nút Đăng xuất kích hoạt Modal */}
          {onLogout && (
            <button 
              onClick={() => setShowLogoutModal(true)} 
              title="Đăng xuất hệ thống"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                cursor: 'pointer',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '13px',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              <LogOut size={15} />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </header>

      {/* Modal xác nhận đăng xuất Dark Mode chuẩn tại Header */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999999,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            padding: '36px 32px',
            borderRadius: '24px',
            width: '380px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            color: '#ffffff',
            fontFamily: 'inherit'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#f4f4f5', margin: '0 0 12px 0' }}>
              Đăng xuất khỏi UTH Library Analytics?
            </h2>

            <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '28px', lineHeight: '1.5', margin: '0 0 28px 0' }}>
              Bạn sẽ cần đăng nhập lại để tiếp tục quản trị hệ thống thư viện.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleConfirmLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f4f4f5',
                  color: '#18181b',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f4f4f5'}
              >
                Đăng xuất
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: '#f4f4f5',
                  border: '1px solid #3f3f46',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#27272a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
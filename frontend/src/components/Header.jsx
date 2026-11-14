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

        {/* Cột phải: Cụm thẻ trạng thái 3D & điều hướng nhanh */}
        <div className="header-right-actions">
          <div className="header-quick-links">
            <Link to="/" className="header-nav-pill" title="Về Trang chủ">
              <Home size={15} />
              <span>Trang chủ</span>
            </Link>
            <Link to="/about" className="header-nav-pill" title="Giới thiệu hệ thống">
              <Info size={15} />
              <span>Giới thiệu</span>
            </Link>
            {onLogout && (
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="header-nav-pill"
                title="Đăng xuất khỏi hệ thống"
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={15} />
                <span>Đăng xuất</span>
              </button>
            )}
          </div>

          <div className="live-status-3d-badge">
            <span className="pulse-dot" />
            <Activity size={15} className="status-icon" />
            <div className="status-texts">
              <strong>LIVE METABASE</strong>
              <small>UTH • Nhóm 4</small>
            </div>
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '20px',
              padding: '28px 24px 24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              textAlign: 'center',
              color: '#f4f4f5'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <LogOut size={22} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
              Đăng xuất khỏi hệ thống?
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#a1a1aa', lineHeight: '1.5' }}>
              Bạn sẽ cần đăng nhập lại để tiếp tục truy cập vào bảng điều khiển quản trị thư viện.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
              >
                Đăng xuất
              </button>
              <button
                type="button"
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
                onMouseEnter={(e) => (e.currentTarget.style.background = '#27272a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
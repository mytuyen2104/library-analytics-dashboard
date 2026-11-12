import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Activity, Home, Info } from 'lucide-react';
import '../styles/Header.css';

export default function Header({ title, subtitle }) {
  const [tilt, setTilt] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

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
  );
}
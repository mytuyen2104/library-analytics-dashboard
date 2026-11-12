import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Database,
  BarChart3,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Cloud,
  GitBranch,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import '../styles/About.css';

// Component thẻ có hiệu ứng nghiêng 3D (3D Tilt Card) theo vị trí chuột
function TiltCard({ children, className = '' }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8; // Góc nghiêng dọc tối đa 8 độ
    const rotateY = ((x - centerX) / centerX) * 8;  // Góc nghiêng ngang tối đa 8 độ

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
    >
      <div className="tilt-card-glare" />
      {children}
    </div>
  );
}

export default function About() {
  const techStack = [
    {
      name: 'Microsoft SQL Server',
      role: 'Tầng Lưu Trữ Dữ Liệu (Data Storage)',
      desc: 'Quản trị cơ sở dữ liệu quan hệ chuẩn hóa (1.500+ bản ghi), thực thi truy vấn T-SQL tối ưu.',
      icon: Database,
      color: '#3b82f6'
    },
    {
      name: 'Metabase BI',
      role: 'Tầng Trực Quan Hóa (Analytics Engine)',
      desc: 'Chuyển đổi truy vấn thành biểu đồ KPI, biểu đồ đường, vành khuyên & bảng cảnh báo động.',
      icon: BarChart3,
      color: '#10b981'
    },
    {
      name: 'Docker Desktop',
      role: 'Hạ Tầng Ảo Hóa (Containerization)',
      desc: 'Đóng gói môi trường Metabase độc lập, vận hành ổn định, triển khai nhanh chóng.',
      icon: Server,
      color: '#0ea5e9'
    },
    {
      name: 'React + Vite',
      role: 'Giao Diện Người Dùng (Presentation)',
      desc: 'Khung ứng dụng web hiện đại, tốc độ cao, tích hợp nhúng các phân hệ phân tích trực quan.',
      icon: Cpu,
      color: '#8b5cf6'
    },
    {
      name: 'Cloudflare Tunnel',
      role: 'Triển Khai Trực Tuyến (Public Access)',
      desc: 'Kết nối đường hầm bảo mật qua tên miền tùy chỉnh dashboardg4.click phục vụ truy cập từ xa.',
      icon: Cloud,
      color: '#f59e0b'
    },
    {
      name: 'Git & Jira Scrum',
      role: 'Quản Lý Mã Nguồn & Dự Án',
      desc: 'Phối hợp nhóm hiệu quả theo Sprint, kiểm soát phiên bản chặt chẽ trên GitHub.',
      icon: GitBranch,
      color: '#ec4899'
    }
  ];

  const highlights = [
    { number: '120', label: 'Đầu sách quản lý' },
    { number: '943', label: 'Bản sách lưu kho' },
    { number: '800', label: 'Giao dịch mượn trả' },
    { number: '15.818', label: 'Lượt truy cập số' }
  ];

  return (
    <div className="about-3d-wrapper">
      {/* Các khối ánh sáng nền động (Ambient Orbs) */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      {/* Thanh điều hướng trên cùng */}
      <header className="about-topbar">
        <Link to="/" className="back-pill">
          <ArrowLeft size={16} />
          <span>Trang chủ</span>
        </Link>
        <div className="badge-uth">
          <Sparkles size={14} />
          <span>Học kỳ Doanh nghiệp • Nhóm 4 • UTH</span>
        </div>
      </header>

      {/* Khu vực Hero 3D */}
      <section className="about-hero">
        <div className="hero-content">
          <div className="hero-tag">
            <Layers size={15} />
            <span>KIẾN TRÚC PHÂN TÍCH DỮ LIỆU THÔNG MINH</span>
          </div>
          <h1 className="hero-title">
            Khám phá <span className="gradient-text">Library Analytics</span> Dashboard
          </h1>
          <p className="hero-subtitle">
            Giải pháp Business Intelligence toàn diện dành cho <strong>Trung tâm Thông tin – Thư viện UTH</strong>. 
            Biến dữ liệu vận hành thô thành tri thức quản trị trực quan, phân tích xu hướng học thuật và 
            tự động hóa thuật toán đề xuất bổ sung tài liệu ưu tiên.
          </p>

          <div className="hero-buttons">
            <Link to="/overview" className="btn-3d-primary">
              <span>Trải nghiệm Dashboard ngay</span>
              <ArrowRight size={18} />
            </Link>
            <a href="#architecture" className="btn-3d-secondary">
              <span>Khám phá kiến trúc</span>
            </a>
          </div>
        </div>

        {/* Khối mô hình 3D nổi bên phải */}
        <div className="hero-3d-stage">
          <div className="floating-cube-scene">
            <div className="glass-layer layer-back">
              <div className="layer-header">
                <Database size={16} /> <span>SQL Server • LibraryAnalyticsDB</span>
              </div>
              <div className="code-lines">
                <span>SELECT TOP 10 TenSach, COUNT(*)</span>
                <span>FROM MuonTra JOIN Sach...</span>
              </div>
            </div>

            <div className="glass-layer layer-mid">
              <div className="layer-header">
                <Server size={16} /> <span>Docker + Metabase BI Engine</span>
              </div>
              <div className="mini-bars">
                <div style={{ height: '45%' }} />
                <div style={{ height: '80%' }} />
                <div style={{ height: '60%' }} />
                <div style={{ height: '95%' }} />
                <div style={{ height: '70%' }} />
              </div>
            </div>

            <div className="glass-layer layer-front">
              <div className="layer-header">
                <BookOpen size={16} /> <span>Gợi ý bổ sung thông minh</span>
              </div>
              <div className="priority-pill">
                <span className="dot-red" />
                <span>Mạng máy tính - Tập 1</span>
              </div>
              <div className="priority-pill">
                <span className="dot-amber" />
                <span>Phân tích dữ liệu - Tập 1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dải thông số nổi 3D */}
      <section className="stats-ribbon">
        {highlights.map((item, idx) => (
          <TiltCard key={idx} className="stat-box">
            <strong className="stat-num">{item.number}</strong>
            <span className="stat-label">{item.label}</span>
          </TiltCard>
        ))}
      </section>

      {/* Kiến trúc & Công nghệ sử dụng */}
      <section id="architecture" className="tech-section">
        <div className="section-heading">
          <h2>Hệ sinh thái Công nghệ & Kiến trúc 3 Tầng</h2>
          <p>Kết hợp sức mạnh xử lý dữ liệu quan hệ, ảo hóa container và giao diện tương tác thời gian thực</p>
        </div>

        <div className="tech-grid">
          {techStack.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <TiltCard key={idx} className="tech-card">
                <div className="tech-icon-wrap" style={{ '--accent': tech.color }}>
                  <Icon size={24} />
                </div>
                <span className="tech-role">{tech.role}</span>
                <h3>{tech.name}</h3>
                <p>{tech.desc}</p>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* Giá trị cốt lõi mang lại */}
      <section className="value-section">
        <div className="value-glass-panel">
          <div className="value-left">
            <h2>Từ Dữ Liệu Thô Đến Quyết Định Quản Trị</h2>
            <p>
              Thay thế hoàn toàn quy trình tổng hợp Excel thủ công bằng hệ thống giám sát trực tuyến 24/7, 
              giúp ban giám đốc thư viện ra quyết định định lượng chính xác.
            </p>
            <ul className="value-list">
              <li>
                <CheckCircle2 size={18} />
                <span>Theo dõi tức thời 5 chỉ số KPI vĩ mô và chu kỳ mượn trả theo từng tháng.</span>
              </li>
              <li>
                <CheckCircle2 size={18} />
                <span>Đánh giá hiệu quả khai thác 6 cổng CSDL điện tử quốc tế (SpringerLink, IEEE, ProQuest...).</span>
              </li>
              <li>
                <CheckCircle2 size={18} />
                <span>Thuật toán tính điểm ưu tiên bổ sung sách tự động cảnh báo bằng màu sắc trực quan.</span>
              </li>
            </ul>
          </div>
          <div className="value-right">
            <Link to="/overview" className="launch-orb">
              <span>MỞ DASHBOARD</span>
              <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <p>© 2026 Trường Đại học Giao thông vận tải TP. Hồ Chí Minh (UTH) • Đồ án Học kỳ Doanh nghiệp Nhóm 4</p>
      </footer>
    </div>
  );
}
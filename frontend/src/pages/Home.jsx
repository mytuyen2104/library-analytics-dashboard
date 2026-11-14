import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Database, 
  TrendingUp, 
  ListOrdered, 
  Info, 
  ArrowRight, 
  LayoutDashboard, 
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  BookCheck,
  PackagePlus,
  LogOut
} from 'lucide-react';
import '../styles/home.css';

function TiltFeatureCard({ feature }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const Icon = feature.icon;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <Link 
      to={feature.to} 
      className="feature-3d-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, '--accent-color': feature.color }}
    >
      <div className="card-glare" />
      <div className="feature-icon-box" style={{ background: `${feature.color}15`, color: feature.color }}>
        <Icon size={24} />
      </div>
      <div className="feature-content">
        <h3>{feature.title}</h3>
        <p>{feature.desc}</p>
      </div>
      <div className="feature-arrow-icon" style={{ color: feature.color }}>
        <ArrowRight size={18} />
      </div>
    </Link>
  );
}

export default function Home(prop) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const features = [
    { title: 'Tổng quan thư viện', desc: 'Theo dõi các chỉ số KPI vĩ mô và hiệu suất hoạt động toàn diện của thư viện.', to: '/overview', icon: LayoutDashboard, color: '#2563eb' },
    { title: 'Quản lý Mượn / Trả', desc: 'Tạo phiếu mượn sách mới, tra cứu lịch sử mượn và xác nhận trả sách theo thời gian thực.', to: '/loan-management', icon: BookCheck, color: '#0d9488' },
    { title: 'Quản lý Kho Sách', desc: 'Kiểm tra số lượng bản sách hiện có, nhập bổ sung kho và thêm đầu sách mới vào hệ thống.', to: '/inventory-management', icon: PackagePlus, color: '#ea580c' },
    { title: 'Thống kê mượn sách', desc: 'Phân tích biến động lượt mượn theo thời gian thực và bảng xếp hạng Top 10 sách.', to: '/borrowing', icon: BookOpen, color: '#7c3aed' },
    { title: 'Truy cập điện tử', desc: 'Đo lường hiệu quả khai thác tài nguyên số từ các nhà cung cấp học liệu quốc tế.', to: '/electronic-access', icon: Database, color: '#059669' },
    { title: 'Phân tích nhu cầu', desc: 'Khám phá cơ cấu chuyên ngành và xu hướng dịch chuyển nhu cầu đọc của sinh viên.', to: '/demand-analysis', icon: TrendingUp, color: '#d97706' },
    { title: 'Gợi ý bổ sung tài liệu', desc: 'Thuật toán tính điểm ưu tiên thông minh hỗ trợ lập kế hoạch mua sắm sách mới.', to: '/acquisition', icon: ListOrdered, color: '#db2777' },
    { title: 'Chi tiết nhật ký', desc: 'Truy xuất lịch sử giao dịch, thao tác và nhật ký hoạt động chi tiết trong hệ thống.', to: '/log-details', icon: FileText, color: '#2563eb' },
    { title: 'Giới thiệu hệ thống', desc: 'Tìm hiểu chi tiết về mục tiêu, kiến trúc công nghệ 3 tầng và đội ngũ phát triển.', to: '/about', icon: Info, color: '#0284c7' },
  ];

  const handleConfirmLogout = () => {
    if (prop.onLogout) {
      prop.onLogout();
    }
  };

  return (
    <div className="home-3d-container">
      <div className="home-orb orb-alpha" />
      <div className="home-orb orb-beta" />
      <div className="home-orb orb-gamma" />

      <header className="home-nav">
        <div className="home-logo">
          <span className="logo-box">☷</span>
          <div className="logo-texts">
            <strong>UTH Library Analytics</strong>
            <small>Business Intelligence System</small>
          </div>
        </div>
        <nav className="home-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" className="active">Trang chủ</Link>
          <Link to="/overview">Dashboard</Link>
          <Link to="/loan-management">Mượn / Trả</Link>
          <Link to="/inventory-management">Kho sách</Link>
          <Link to="/about">Giới thiệu</Link>

          {/* Nút Đăng xuất ở trang chủ kích hoạt modal */}
          {prop.onLogout && (
            <button 
              onClick={() => setShowLogoutModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
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
        </nav>
      </header>

      <section className="home-hero">
        <div className="hero-text-col">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>ĐỒ ÁN HỌC KỲ DOANH NGHIỆP • NHÓM 4</span>
          </div>
          <h1>
            Nền Tảng Phân Tích Dữ Liệu <br />
            <span className="home-gradient-text">Thư Viện Thông Minh</span>
          </h1>
          <p>
            Tích hợp liền mạch giữa <strong>Microsoft SQL Server</strong>, hệ thống ảo hóa <strong>Docker</strong> 
            và giao diện trực quan <strong>Metabase BI</strong> nhằm tối ưu hóa công tác quản trị và phát triển nguồn tài liệu tại UTH.
          </p>
          <div className="hero-cta-group">
            <Link to="/overview" className="btn-primary-glow">
              <span>Truy cập Dashboard</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/loan-management" className="btn-secondary-glass">
              <span>Quản lý Mượn / Trả</span>
            </Link>
          </div>
        </div>

        <div className="hero-graphic-col">
          <div className="hero-3d-card-stack">
            <div className="stack-card card-sql">
              <div className="stack-dot red" /><div className="stack-dot yellow" /><div className="stack-dot green" />
              <code>SQL Server 2022 • 1,500 Records Synced</code>
            </div>
            <div className="stack-card card-docker">
              <Zap size={16} color="#0ea5e9" />
              <span>Docker Container Active (Port 3000)</span>
            </div>
            <div className="stack-card card-meta">
              <ShieldCheck size={16} color="#10b981" />
              <span>Live Metabase Dashboard Connected</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-header">
          <h2>Hệ Thống Phân Hệ Chức Năng</h2>
          <p>Khám phá toàn bộ các công cụ nghiệp vụ thư viện, phân tích và hỗ trợ ra quyết định</p>
        </div>

        <div className="features-3d-grid">
          {features.map((feature) => (
            <TiltFeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 Trường Đại học Giao thông vận tải TP. Hồ Chí Minh (UTH) • Đồ án Học kỳ Doanh nghiệp Nhóm 4</p>
      </footer>

      {/* Modal xác nhận đăng xuất chuẩn ChatGPT tại Trang Chủ (Đã bỏ thẻ tài khoản) */}
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
    </div>
  );
}
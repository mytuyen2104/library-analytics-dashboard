import React, { useState } from 'react';
import { Sparkles, FileText, Database, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import '../styles/LogDetails.css';

export default function LogDetails() {
  const [loading, setLoading] = useState(true);

  const rawUrl = "https://dashboard.dashboardg4.click/public/question/7dfeefaa-50dd-4875-b5da-604eb005c0f6";
  const chartLogUrl = `${rawUrl}#bordered=false&titled=false`;

  return (
    <section className="log-details-page">
      {/* Hiệu ứng ánh sáng nền động tạo chiều sâu 3D */}
      <div className="log-orb orb-1" />
      <div className="log-orb orb-2" />

      {/* Thẻ giới thiệu chia 2 cột đồng bộ với Overview */}
      <header className="log-intro-banner">
        <div className="log-intro-left">
          <div className="log-badge">
            <Sparkles size={14} />
            <span>TRUY XUẤT DỮ LIỆU VẬN HÀNH</span>
          </div>
          <h1>Chi Tiết Nhật Ký Hoạt Động Hệ Thống</h1>
          <p className="log-description">
            Phân hệ lưu trữ và hiển thị minh bạch toàn bộ lịch sử giao dịch mượn trả, lượt truy cập 
            tài nguyên số và các sự kiện phát sinh trong hệ thống thư viện theo thời gian thực. 
            Bảng dữ liệu chi tiết giúp cán bộ quản lý dễ dàng <strong>tra cứu, đối soát thông tin</strong> và 
            kiểm tra tính toàn vẹn của dữ liệu vận hành từ cơ sở dữ liệu nguồn.
          </p>
        </div>

        <div className="log-intro-right">
          <div className="log-mini-card">
            <Database size={18} className="log-mini-icon blue" />
            <div>
              <strong>800+ Lượt mượn trả</strong>
              <span>Nhật ký mượn trả chi tiết</span>
            </div>
          </div>
          <div className="log-mini-card">
            <Clock size={18} className="log-mini-icon amber" />
            <div>
              <strong>Thời gian thực</strong>
              <span>Cập nhật liên tục 24/7</span>
            </div>
          </div>
          <div className="log-mini-card">
            <ShieldCheck size={18} className="log-mini-icon green" />
            <div>
              <strong>Đối soát minh bạch</strong>
              <span>Chuẩn hóa từ SQL Server</span>
            </div>
          </div>
        </div>
      </header>

      {/* Khu vực hiển thị bảng nhật ký rộng 100% */}
      <div className="log-dashboard-grid">
        <article className="log-chart-card">
          <div className="log-card-top-bar" />
          
          <div className="log-card-header">
            <div className="log-card-title-group">
              <span className="log-card-icon">
                <FileText size={18} />
              </span>
              <div>
                <h2>Nhật ký hoạt động chi tiết hệ thống</h2>
                <p className="log-chart-description">
                  Theo dõi chi tiết lịch sử các giao dịch, thao tác và sự kiện diễn ra trong hệ thống thư viện.
                </p>
              </div>
            </div>

            <a 
              href={rawUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="log-external-btn"
            >
              <span>Mở trên Metabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="log-iframe-container">
            {loading && (
              <div className="log-chart-skeleton">
                <div className="log-spinner"></div>
                <span>Đang tải dữ liệu nhật ký hệ thống...</span>
              </div>
            )}
            <iframe
              src={chartLogUrl}
              title="Nhật ký hoạt động chi tiết hệ thống"
              className="log-chart-iframe"
              style={{ width: '100%', height: '680px', border: 'none' }}
              onLoad={() => setLoading(false)}
              allowTransparency
            />
          </div>
        </article>
      </div>
    </section>
  );
}
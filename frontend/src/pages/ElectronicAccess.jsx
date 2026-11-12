import React, { useState } from 'react';
import { 
  Sparkles, 
  Database, 
  Globe, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import '../styles/ElectronicAccess.css';

export default function ElectronicAccess() {
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  // Link gốc để mở tab mới
  const rawMonthlyUrl = "https://dashboard.dashboardg4.click/public/question/b66623b2-6be6-43eb-ac09-ba24bc0a60d3";
  const rawRankingUrl = "https://dashboard.dashboardg4.click/public/question/7ef1c7f8-5a31-4a4a-89c1-e94421f56fa2";

  // Link nhúng iframe
  const chartMonthlyUrl = `${rawMonthlyUrl}#bordered=false&titled=false`;
  const chartRankingUrl = `${rawRankingUrl}#bordered=false&titled=false`;

  return (
    <section className="electronic-access-page">
      {/* Hiệu ứng ánh sáng nền động tạo chiều sâu 3D */}
      <div className="ea-orb orb-1" />
      <div className="ea-orb orb-2" />

      {/* Banner giới thiệu 2 cột đồng bộ */}
      <header className="ea-intro-banner">
        <div className="ea-intro-left">
          <div className="ea-badge">
            <Sparkles size={14} />
            <span>KHAI THÁC TÀI NGUYÊN SỐ</span>
          </div>
          <h1>Thống Kê Truy Cập Cơ Sở Dữ Liệu Điện Tử</h1>
          <p className="ea-description">
            Phân hệ theo dõi và đánh giá hiệu quả sử dụng hệ thống học liệu số trực tuyến của thư viện. 
            Thông qua biểu đồ biến động theo tháng và bảng xếp hạng mức độ khai thác các cổng 
            <strong> CSDL điện tử quốc tế</strong> (như SpringerLink, IEEE, ProQuest, ScienceDirect...), 
            ban quản lý có thể đo lường chính xác nhu cầu tra cứu tài nguyên số của giảng viên và sinh viên 
            để tối ưu hóa ngân sách gia hạn bản quyền định kỳ.
          </p>
        </div>

        <div className="ea-intro-right">
          <div className="ea-mini-card">
            <Globe size={18} className="ea-mini-icon green" />
            <div>
              <strong>6 Cổng CSDL Quốc Tế</strong>
              <span>Springer, IEEE, ProQuest...</span>
            </div>
          </div>
          <div className="ea-mini-card">
            <TrendingUp size={18} className="ea-mini-icon blue" />
            <div>
              <strong>15.818+ Lượt truy cập</strong>
              <span>Tần suất khai thác học liệu số</span>
            </div>
          </div>
          <div className="ea-mini-card">
            <ShieldCheck size={18} className="ea-mini-icon purple" />
            <div>
              <strong>Tối ưu Ngân sách</strong>
              <span>Đánh giá hiệu quả bản quyền</span>
            </div>
          </div>
        </div>
      </header>

      {/* Khu vực hiển thị 2 biểu đồ */}
      <div className="ea-dashboard-grid">
        {/* Biểu đồ 1: Xu hướng theo tháng */}
        <article className="ea-chart-card">
          <div className="ea-card-top-bar" />
          
          <div className="ea-card-header">
            <div className="ea-card-title-group">
              <span className="ea-card-icon">
                <TrendingUp size={18} />
              </span>
              <div>
                <h2>Xu hướng truy cập CSDL điện tử theo tháng</h2>
                <p className="ea-chart-description">
                  Thống kê số lượng lượt truy cập cơ sở dữ liệu điện tử theo từng mốc thời gian.
                </p>
              </div>
            </div>

            <a 
              href={rawMonthlyUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ea-external-btn"
            >
              <span>Mở trên Metabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="ea-iframe-container">
            {loading1 && (
              <div className="ea-chart-skeleton">
                <div className="ea-spinner"></div>
                <span>Đang tải dữ liệu biểu đồ xu hướng...</span>
              </div>
            )}
            <iframe
              src={chartMonthlyUrl}
              title="Xu hướng truy cập CSDL điện tử theo tháng"
              className="ea-chart-iframe"
              style={{ width: '100%', height: '520px', border: 'none' }}
              onLoad={() => setLoading1(false)}
              allowTransparency
            />
          </div>
        </article>

        {/* Biểu đồ 2: Bảng xếp hạng CSDL */}
        <article className="ea-chart-card">
          <div className="ea-card-top-bar green-bar" />
          
          <div className="ea-card-header">
            <div className="ea-card-title-group">
              <span className="ea-card-icon green-icon">
                <Database size={18} />
              </span>
              <div>
                <h2>Bảng xếp hạng CSDL điện tử được dùng nhiều nhất</h2>
                <p className="ea-chart-description">
                  Liệt kê các cơ sở dữ liệu được sinh viên và giảng viên quan tâm, truy cập nhiều nhất.
                </p>
              </div>
            </div>

            <a 
              href={rawRankingUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ea-external-btn"
            >
              <span>Mở trên Metabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="ea-iframe-container">
            {loading2 && (
              <div className="ea-chart-skeleton">
                <div className="ea-spinner"></div>
                <span>Đang tải bảng xếp hạng CSDL...</span>
              </div>
            )}
            <iframe
              src={chartRankingUrl}
              title="Bảng xếp hạng CSDL điện tử được dùng nhiều nhất"
              className="ea-chart-iframe"
              style={{ width: '100%', height: '520px', border: 'none' }}
              onLoad={() => setLoading2(false)}
              allowTransparency
            />
          </div>
        </article>
      </div>
    </section>
  );
}
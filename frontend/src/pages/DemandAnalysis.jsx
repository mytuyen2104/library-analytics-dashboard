import React, { useState } from 'react';
import { 
  Sparkles, 
  PieChart, 
  TrendingUp, 
  Layers, 
  Compass, 
  BookMarked, 
  ExternalLink 
} from 'lucide-react';
import '../styles/DemandAnalysis.css';

export default function DemandAnalysis() {
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  // Link gốc để mở tab mới
  const rawCategoryUrl = "https://dashboard.dashboardg4.click/public/question/71ca7650-b6b6-4487-af3e-a818e38a83d9";
  const rawTrendUrl = "https://dashboard.dashboardg4.click/public/question/4d5ae813-403b-4729-9cc4-e2550e8ca2f1";

  // Link nhúng iframe
  const chartCategoryUrl = `${rawCategoryUrl}#bordered=false&titled=false`;
  const chartTrendUrl = `${rawTrendUrl}#bordered=false&titled=false`;

  return (
    <section className="demand-analysis-page">
      {/* Hiệu ứng ánh sáng nền động tạo chiều sâu 3D */}
      <div className="da-orb orb-1" />
      <div className="da-orb orb-2" />

      {/* Banner giới thiệu 2 cột đồng bộ */}
      <header className="da-intro-banner">
        <div className="da-intro-left">
          <div className="da-badge">
            <Sparkles size={14} />
            <span>KHÁM PHÁ XU HƯỚNG HỌC THUẬT</span>
          </div>
          <h1>Phân Tích Nhu Cầu Sử Dụng Tài Liệu</h1>
          <p className="da-description">
            Phân hệ tập trung bóc tách cơ cấu nhu cầu đọc và tra cứu tài liệu theo từng lĩnh vực, 
            chuyên ngành đào tạo tại trường. Thông qua việc đối chiếu tỷ trọng mượn sách giữa các thể loại 
            và theo dõi sự dịch chuyển nhu cầu theo thời gian, thư viện có thể nhận diện chính xác 
            <strong> các nhóm học liệu trọng tâm</strong> đang thu hút sinh viên để phân bổ nguồn lực hợp lý.
          </p>
        </div>

        <div className="da-intro-right">
          <div className="da-mini-card">
            <Layers size={18} className="da-mini-icon amber" />
            <div>
              <strong>Cơ cấu Chuyên ngành</strong>
              <span>Phân bổ tỷ trọng theo thể loại</span>
            </div>
          </div>
          <div className="da-mini-card">
            <Compass size={18} className="da-mini-icon blue" />
            <div>
              <strong>Dịch chuyển Xu hướng</strong>
              <span>Theo dõi biến động theo học kỳ</span>
            </div>
          </div>
          <div className="da-mini-card">
            <BookMarked size={18} className="da-mini-icon purple" />
            <div>
              <strong>Định hướng Học liệu</strong>
              <span>Tối ưu hóa danh mục đầu tư</span>
            </div>
          </div>
        </div>
      </header>

      {/* Khu vực hiển thị 2 biểu đồ */}
      <div className="da-dashboard-grid">
        {/* Biểu đồ 1: Nhu cầu theo thể loại */}
        <article className="da-chart-card">
          <div className="da-card-top-bar amber-bar" />
          
          <div className="da-card-header">
            <div className="da-card-title-group">
              <span className="da-card-icon amber-icon">
                <PieChart size={18} />
              </span>
              <div>
                <h2>Nhu cầu tài liệu theo thể loại</h2>
                <p className="da-chart-description">
                  Biểu đồ thể hiện chi tiết số lượng và tỷ trọng mượn sách theo từng thể loại chuyên ngành.
                </p>
              </div>
            </div>

            <a 
              href={rawCategoryUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="da-external-btn"
            >
              <span>Mở trên Metabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="da-iframe-container">
            {loading1 && (
              <div className="da-chart-skeleton">
                <div className="da-spinner"></div>
                <span>Đang tải dữ liệu nhu cầu theo thể loại...</span>
              </div>
            )}
            <iframe
              src={chartCategoryUrl}
              title="Nhu cầu tài liệu theo thể loại"
              className="da-chart-iframe"
              style={{ width: '100%', height: '520px', border: 'none' }}
              onLoad={() => setLoading1(false)}
              allowTransparency
            />
          </div>
        </article>

        {/* Biểu đồ 2: Xu hướng nhu cầu mượn tài liệu */}
        <article className="da-chart-card">
          <div className="da-card-top-bar" />
          
          <div className="da-card-header">
            <div className="da-card-title-group">
              <span className="da-card-icon">
                <TrendingUp size={18} />
              </span>
              <div>
                <h2>Xu hướng nhu cầu mượn tài liệu</h2>
                <p className="da-chart-description">
                  Theo dõi sự thay đổi và dịch chuyển nhu cầu mượn tài liệu giữa các nhóm ngành theo thời gian.
                </p>
              </div>
            </div>

            <a 
              href={rawTrendUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="da-external-btn"
            >
              <span>Mở trên Metabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="da-iframe-container">
            {loading2 && (
              <div className="da-chart-skeleton">
                <div className="da-spinner"></div>
                <span>Đang tải xu hướng nhu cầu mượn tài liệu...</span>
              </div>
            )}
            <iframe
              src={chartTrendUrl}
              title="Xu hướng nhu cầu mượn tài liệu"
              className="da-chart-iframe"
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
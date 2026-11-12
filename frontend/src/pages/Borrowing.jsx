import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Award, 
  CalendarRange, 
  Users, 
  ExternalLink 
} from 'lucide-react';
import '../styles/Borrowing.css';

export default function Borrowing() {
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  // Link gốc để mở tab mới
  const rawTrendUrl = "https://dashboard.dashboardg4.click/public/question/7f315243-8c82-4b68-a8c1-88de10ec368a";
  const rawTop10Url = "https://dashboard.dashboardg4.click/public/question/d48d143f-e141-45ee-bfea-4e654d478555";

  // Link nhúng iframe
  const URL_TREND = `${rawTrendUrl}#bordered=false&titled=false`;
  const URL_TOP10 = `${rawTop10Url}#bordered=false&titled=false`;

  return (
    <section className="borrowing-page">
      {/* Hiệu ứng ánh sáng nền động tạo chiều sâu 3D */}
      <div className="borrowing-orb orb-1" />
      <div className="borrowing-orb orb-2" />

      {/* Banner giới thiệu 2 cột đồng bộ với trang Chi tiết nhật ký */}
      <header className="borrowing-intro-banner">
        <div className="borrowing-intro-left">
          <div className="borrowing-badge">
            <Sparkles size={14} />
            <span>PHÂN TÍCH HOẠT ĐỘNG MƯỢN TRẢ</span>
          </div>
          <h1>Thống Kê Chi Tiết Lượt Mượn Sách</h1>
          <p className="borrowing-description">
            Phân hệ cung cấp cái nhìn trực quan về sự biến động và xu hướng mượn sách của độc giả 
            theo các mốc thời gian thực tế trong năm. Đồng thời, hệ thống tự động tổng hợp và xếp hạng 
            <strong> Top 10 đầu sách được mượn nhiều nhất</strong>, giúp ban quản lý thư viện đánh giá chính xác 
            mức độ quan tâm của sinh viên và giảng viên đối với các danh mục tài liệu hiện có trong kho.
          </p>
        </div>

        <div className="borrowing-intro-right">
          <div className="borrowing-mini-card">
            <CalendarRange size={18} className="borrowing-mini-icon blue" />
            <div>
              <strong>Chu kỳ theo tháng / năm</strong>
              <span>Theo dõi sát biến động lưu thông</span>
            </div>
          </div>
          <div className="borrowing-mini-card">
            <Award size={18} className="borrowing-mini-icon purple" />
            <div>
              <strong>Top 10 Sách Nổi Bật</strong>
              <span>Xếp hạng tài liệu mượn nhiều nhất</span>
            </div>
          </div>
          <div className="borrowing-mini-card">
            <Users size={18} className="borrowing-mini-icon green" />
            <div>
              <strong>Phục vụ xem thông tin lượt mượn</strong>
              <span>Tối ưu hóa luân chuyển kho sách</span>
            </div>
          </div>
        </div>
      </header>

      {/* Khu vực hiển thị 2 biểu đồ */}
      <div className="borrowing-dashboard-grid">
        {/* Biểu đồ 1: Xu hướng mượn sách */}
        <article className="borrowing-chart-card">
          <div className="borrowing-card-top-bar" />
          
          <div className="borrowing-card-header">
            <div className="borrowing-card-title-group">
              <span className="borrowing-card-icon">
                <TrendingUp size={18} />
              </span>
              <div>
                <h2>Xu hướng mượn sách theo tháng / năm</h2>
                <p className="borrowing-chart-description">
                  Theo dõi sự biến động của lượt mượn sách theo các mốc thời gian thực tế.
                </p>
              </div>
            </div>

            <a 
              href={rawTrendUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="borrowing-external-btn"
            >
              <span>Mở trên Metabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="borrowing-iframe-container">
            {loading1 && (
              <div className="borrowing-chart-skeleton">
                <div className="borrowing-spinner"></div>
                <span>Đang tải dữ liệu xu hướng mượn sách...</span>
              </div>
            )}
            <iframe
              src={URL_TREND}
              title="Xu hướng mượn sách"
              className="borrowing-chart-iframe"
              style={{ width: '100%', height: '520px', border: 'none' }}
              onLoad={() => setLoading1(false)}
              allowTransparency
            />
          </div>
        </article>

        {/* Biểu đồ 2: Top 10 sách được mượn nhiều nhất */}
        <article className="borrowing-chart-card">
          <div className="borrowing-card-top-bar purple-bar" />
          
          <div className="borrowing-card-header">
            <div className="borrowing-card-title-group">
              <span className="borrowing-card-icon purple-icon">
                <BookOpen size={18} />
              </span>
              <div>
                <h2>Top 10 sách được mượn nhiều nhất</h2>
                <p className="borrowing-chart-description">
                  Danh sách các đầu sách thu hút lượng quan tâm và mượn đọc cao nhất trong hệ thống.
                </p>
              </div>
            </div>

            <a 
              href={rawTop10Url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="borrowing-external-btn"
            >
              <span>Mở trên Metabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="borrowing-iframe-container">
            {loading2 && (
              <div className="borrowing-chart-skeleton">
                <div className="borrowing-spinner"></div>
                <span>Đang tải Top 10 sách được mượn...</span>
              </div>
            )}
            <iframe
              src={URL_TOP10}
              title="Top 10 sách được mượn nhiều nhất"
              className="borrowing-chart-iframe"
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
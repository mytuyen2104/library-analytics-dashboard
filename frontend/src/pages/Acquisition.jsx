import React, { useState } from 'react';
import { 
  Sparkles, 
  ListOrdered, 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  ExternalLink 
} from 'lucide-react';
import "../styles/Acquisition.css";

const RAW_METABASE_URL = "https://dashboard.dashboardg4.click/public/question/319f2e6d-492f-4dd7-a442-ab42110e0d5e?trang_thai=";
const METABASE_URL = `${RAW_METABASE_URL}#bordered=false&titled=false`;

export default function Acquisition() {
  const [loading, setLoading] = useState(true);

  return (
    <section className="acquisition-page">
      {/* Hiệu ứng ánh sáng nền động tạo chiều sâu 3D */}
      <div className="acq-orb orb-1" />
      <div className="acq-orb orb-2" />

      {/* Banner giới thiệu 2 cột đồng bộ */}
      <header className="acq-intro-banner">
        <div className="acq-intro-left">
          <div className="acq-badge">
            <Sparkles size={14} />
            <span>HỖ TRỢ RA QUYẾT ĐỊNH MUA SẮM</span>
          </div>
          <h1>Gợi Ý Bổ Sung Tài Liệu Thông Minh</h1>
          <p className="acq-description">
            Phân hệ ứng dụng thuật toán định lượng để tính toán <strong>Điểm ưu tiên bổ sung</strong> cho từng đầu sách 
            dựa trên sự kết hợp giữa tần suất mượn thực tế và số lượng bản sách hiện còn trong kho. 
            Hệ thống tự động phân loại và cảnh báo trực quan các đầu sách đang có nhu cầu cao nhưng thiếu hụt 
            số bản phục vụ, giúp ban quản lý thư viện lập kế hoạch nhập sách chính xác và tối ưu hóa ngân sách.
          </p>
        </div>

        <div className="acq-intro-right">
          <div className="acq-mini-card">
            <Calculator size={18} className="acq-mini-icon pink" />
            <div>
              <strong>Thuật toán Điểm ưu tiên</strong>
              <span>Đối chiếu Lượt mượn & Tồn kho</span>
            </div>
          </div>
          <div className="acq-mini-card">
            <AlertTriangle size={18} className="acq-mini-icon amber" />
            <div>
              <strong>Cảnh báo Thiếu hụt</strong>
              <span>Nhận diện sách cầu vượt cung</span>
            </div>
          </div>
          <div className="acq-mini-card">
            <TrendingUp size={18} className="acq-mini-icon blue" />
            <div>
              <strong>Tối ưu Ngân sách</strong>
              <span>Đầu tư đúng trọng tâm học thuật</span>
            </div>
          </div>
        </div>
      </header>

      {/* Khu vực hiển thị bảng xếp hạng */}
      <div className="acq-dashboard-grid">
        <article className="acq-chart-card">
          <div className="acq-card-top-bar" />
          
          <div className="acq-card-header">
            <div className="acq-card-title-group">
              <span className="acq-card-icon">
                <ListOrdered size={18} />
              </span>
              <div>
                <h2>Bảng xếp hạng ưu tiên bổ sung tài liệu</h2>
                <p className="acq-chart-description">
                  Điểm ưu tiên càng cao, sách càng được ưu tiên xem xét bổ sung vào kho học liệu.
                </p>
              </div>
            </div>

            <a 
              href={RAW_METABASE_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="acq-external-btn"
            >
              <span>Mở trên Metabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {METABASE_URL ? (
            <div className="acq-iframe-container">
              {loading && (
                <div className="acq-chart-skeleton">
                  <div className="acq-spinner"></div>
                  <span>Đang tải bảng xếp hạng ưu tiên...</span>
                </div>
              )}
              <iframe
                className="acq-chart-iframe"
                src={METABASE_URL}
                title="Bảng xếp hạng ưu tiên bổ sung tài liệu"
                style={{ width: '100%', height: '820px', border: 'none' }}
                onLoad={() => setLoading(false)}
                allowFullScreen
              />
            </div>
          ) : (
            <div className="acq-placeholder">
              <h3>Khu vực hiển thị Metabase</h3>
              <p>
                Bảng xếp hạng sẽ hiển thị tại đây sau khi cấu hình
                đường dẫn nhúng.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
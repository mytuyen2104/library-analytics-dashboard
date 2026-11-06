import React, { useState } from 'react';
import Filters from '../components/Filters.jsx';
import '../styles/Borrowing.css';

export default function Borrowing() {
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  // Link 1: Xu hướng mượn sách theo thời gian
  const URL_TREND = "https://dashboard.dashboardg4.click/public/question/7f315243-8c82-4b68-a8c1-88de10ec368a#bordered=false&titled=false";
  
  // Link 2: Top 10 sách được mượn nhiều nhất
  const URL_TOP10 = "https://dashboard.dashboardg4.click/public/question/d48d143f-e141-45ee-bfea-4e654d478555#bordered=false&titled=false";

  return (
    <div className="document-demand-page">
      {/* Bộ lọc (nếu trang có dùng chung Filters) */}
      <Filters type="borrowing" />

      {/* Khu vực hiển thị biểu đồ */}
      <div className="dashboard-grid">
        {/* Biểu đồ 1: Xu hướng mượn sách */}
        <div className="chart-card">
          <h2>Xu hướng mượn sách theo tháng / năm</h2>
          <p className="chart-description">
            Theo dõi sự biến động của lượt mượn sách theo các mốc thời gian thực tế.
          </p>

          {loading1 && (
            <div className="chart-skeleton">
              <div className="spinner"></div>
              <span>Đang tải dữ liệu xu hướng mượn sách...</span>
            </div>
          )}
          <iframe
            src={URL_TREND}
            title="Xu hướng mượn sách"
            className="chart-iframe"
            onLoad={() => setLoading1(false)}
            allowTransparency
          />
        </div>

        {/* Biểu đồ 2: Top 10 sách được mượn nhiều nhất */}
        <div className="chart-card">
          <h2>Top 10 sách được mượn nhiều nhất</h2>
          <p className="chart-description">
            Danh sách các đầu sách thu hút lượng quan tâm và mượn đọc cao nhất trong hệ thống.
          </p>

          {loading2 && (
            <div className="chart-skeleton">
              <div className="spinner"></div>
              <span>Đang tải Top 10 sách được mượn...</span>
            </div>
          )}
          <iframe
            src={URL_TOP10}
            title="Top 10 sách được mượn nhiều nhất"
            className="chart-iframe"
            onLoad={() => setLoading2(false)}
            allowTransparency
          />
        </div>
      </div>
    </div>
  );
}
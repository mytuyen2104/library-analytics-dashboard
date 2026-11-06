import React, { useState } from 'react';
import Filters from '../components/Filters.jsx';
import '../styles/ElectronicAccess.css';

export default function ElectronicAccess() {
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  // Link Metabase public questions
  const chartMonthlyUrl = "https://dashboard.dashboardg4.click/public/question/b66623b2-6be6-43eb-ac09-ba24bc0a60d3";
  const chartRankingUrl = "https://dashboard.dashboardg4.click/public/question/7ef1c7f8-5a31-4a4a-89c1-e94421f56fa2";

  return (
    <div className="electronic-access-page">
      {/* Bộ lọc */}
      <Filters type="database" />

      {/* Khu vực hiển thị biểu đồ */}
      <div className="dashboard-grid">
        {/* Biểu đồ 1: Xu hướng theo tháng */}
        <div className="chart-card">
          <h2>Xu hướng truy cập CSDL điện tử theo tháng</h2>
          <p className="chart-description">
            Thống kê số lượng lượt truy cập cơ sở dữ liệu điện tử theo từng mốc thời gian.
          </p>

          {loading1 && (
            <div className="chart-skeleton">
              <div className="spinner"></div>
              <span>Đang tải dữ liệu biểu đồ xu hướng...</span>
            </div>
          )}
          <iframe
            src={chartMonthlyUrl}
            title="Xu hướng truy cập CSDL điện tử theo tháng"
            className="chart-iframe"
            onLoad={() => setLoading1(false)}
            allowTransparency
          />
        </div>

        {/* Biểu đồ 2: Bảng xếp hạng CSDL */}
        <div className="chart-card">
          <h2>Bảng xếp hạng CSDL điện tử được dùng nhiều nhất</h2>
          <p className="chart-description">
            Liệt kê các cơ sở dữ liệu được sinh viên và giảng viên quan tâm, truy cập nhiều nhất.
          </p>

          {loading2 && (
            <div className="chart-skeleton">
              <div className="spinner"></div>
              <span>Đang tải bảng xếp hạng CSDL...</span>
            </div>
          )}
          <iframe
            src={chartRankingUrl}
            title="Bảng xếp hạng CSDL điện tử được dùng nhiều nhất"
            className="chart-iframe"
            onLoad={() => setLoading2(false)}
            allowTransparency
          />
        </div>
      </div>
    </div>
  );
}
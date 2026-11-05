import React, { useState } from 'react';
import Filters from '../components/Filters.jsx';
import '../styles/ElectronicAccess.css';

export default function ElectronicAccess() {
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  // Link Metabase public questions
  const chartMonthlyUrl = "http://scrooge-squire-amaretto.ngrok-free.dev/public/question/b66623b2-6be6-43eb-ac09-ba24bc0a60d3";
  const chartRankingUrl = "http://scrooge-squire-amaretto.ngrok-free.dev/public/question/7ef1c7f8-5a31-4a4a-89c1-e94421f56fa2";

  return (
    <div className="electronic-access-page">
      {/* Bộ lọc */}
      <Filters type="database" />

      {/* Khu vực hiển thị biểu đồ */}
      <div className="dashboard-grid">
        {/* Biểu đồ 1: Xu hướng theo tháng */}
        <div className="chart-card">
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
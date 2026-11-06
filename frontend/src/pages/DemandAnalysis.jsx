import React, { useState } from 'react';
import Filters from '../components/Filters.jsx';
import Placeholder from '../components/Placeholder.jsx';
import '../styles/DemandAnalysis.css';

export default function DemandAnalysis() {
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  const chartCategoryUrl = "https://dashboard.dashboardg4.click/public/question/71ca7650-b6b6-4487-af3e-a818e38a83d9";
  const chartTrendUrl = "https://dashboard.dashboardg4.click/public/question/4d5ae813-403b-4729-9cc4-e2550e8ca2f1";

  return (
    <div className="document-demand-page">
      {/* Bộ lọc */}
      <Filters type="document-demand" />

      {/* Khu vực hiển thị biểu đồ */}
      <div className="dashboard-grid">
        {/* Biểu đồ 1: Nhu cầu theo thể loại */}
        <div className="chart-card">
          <h2>Nhu cầu tài liệu theo thể loại</h2>
              <p className="chart-description">
                Biểu đồ thể hiện chi tiết số lượng mượn sách theo từng thể loại.
              </p>
          {loading1 && (
            <div className="chart-skeleton">
              <div className="spinner"></div>
              <span>Đang tải dữ liệu nhu cầu theo thể loại...</span>
            </div>
          )}
          <iframe
            src={chartCategoryUrl}
            title="Nhu cầu tài liệu theo thể loại"
            className="chart-iframe"
            onLoad={() => setLoading1(false)}
            allowTransparency
          />
        </div>

        {/* Biểu đồ 2: Xu hướng nhu cầu mượn tài liệu */}
        <div className="chart-card">
          <h2>Xu hướng nhu cầu mượn tài liệu</h2>

          {loading2 && (
            <div className="chart-skeleton">
              <div className="spinner"></div>
              <span>Đang tải xu hướng nhu cầu mượn tài liệu...</span>
            </div>
          )}
          <iframe
            src={chartTrendUrl}
            title="Xu hướng nhu cầu mượn tài liệu"
            className="chart-iframe"
            onLoad={() => setLoading2(false)}
            allowTransparency
          />
        </div>
      </div>
    </div>
  );
}
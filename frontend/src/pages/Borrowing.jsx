import React from 'react';
import '../styles/Borrowing.css';

const Borrowing = () => {
  // Link 1: Xu hướng mượn sách theo thời gian
  const URL_TREND = "http://scrooge-squire-amaretto.ngrok-free.dev/public/question/7f315243-8c82-4b68-a8c1-88de10ec368a#bordered=false&titled=false";
  
  // Link 2: Top 10 sách được mượn nhiều nhất
  const URL_TOP10 = "http://scrooge-squire-amaretto.ngrok-free.dev/public/question/d48d143f-e141-45ee-bfea-4e654d478555#bordered=false&titled=false";

  return (
    <div className="borrowing-container">
      {/* Header trang */}
      <div className="borrowing-header">
        <div>
          <h1 className="page-title">Thống kê mượn sách</h1>
          <p className="page-subtitle">
            Theo dõi lượt mượn theo thời gian và sách được quan tâm
          </p>
        </div>
        <div className="badge-tag">UTH • LIC</div>
      </div>

      {/* Khung nội dung chính */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="section-title">BẢNG ĐIỀU KHIỂN THỐNG KÊ MƯỢN SÁCH</h2>
          <h3 className="section-subtitle">
            Tổng quan xu hướng mượn sách và Top 10 danh mục sách nổi bật
          </h3>
          <p className="section-description">
            Hỗ trợ lọc dữ liệu theo thời gian, thể loại và tự động cập nhật các chỉ số mượn trả theo thời gian thực.
          </p>
        </div>

        {/* Khu vực hiển thị 2 Metabase Questions */}
        <div className="metabase-grid">
          {/* Question 1: Xu hướng mượn sách */}
          <div className="metabase-card">
            <h4 className="card-embed-title">📊 Xu hướng mượn sách theo tháng / năm</h4>
            <iframe
              src={URL_TREND}
              title="Xu hướng mượn sách"
              className="metabase-iframe"
              frameBorder="0"
              allowTransparency
            />
          </div>

          {/* Question 2: Top 10 sách mượn nhiều nhất */}
          <div className="metabase-card">
            <h4 className="card-embed-title">🏆 Top 10 sách được mượn nhiều nhất</h4>
            <iframe
              src={URL_TOP10}
              title="Top 10 sách được mượn nhiều nhất"
              className="metabase-iframe"
              frameBorder="0"
              allowTransparency
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Borrowing;
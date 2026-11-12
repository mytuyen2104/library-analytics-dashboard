Markdown# 🎨 Library Analytics Dashboard – Frontend (React + Vite)

Phân hệ giao diện người dùng (Web Portal) của dự án **UTH Library Analytics Dashboard (Nhóm 4)**. Ứng dụng được xây dựng bằng **React 18 + Vite**, thiết kế theo phong cách **3D Glassmorphism** hiện đại và tích hợp trực tiếp hệ thống biểu đồ thời gian thực từ **Metabase BI** thông qua Cloudflare Tunnel (`dashboard.dashboardg4.click`).

---

## 🚀 Hướng dẫn khởi chạy (Development)

1. Đảm bảo máy đã cài đặt **Node.js LTS** (khuyến nghị v18+).
2. Mở Terminal tại thư mục `frontend`:

```bash
cd frontend
npm install
npm run dev

Mở trình duyệt tại địa chỉ Vite cung cấp (mặc định: http://localhost:5173).
Để đóng gói bản Production (kiểm tra build): npm run build
🗺️ Cấu trúc Định tuyến (Routes) & 7 Phân hệ
Hệ thống bao gồm 2 trang Portal mở đầu và 6 phân hệ Dashboard nghiệp vụ:
Đường dẫn (Route)ComponentChức năng & Nội dung hiển thị/src/pages/Home.jsxTrang chủ: Hero 3D, điều hướng nhanh 7 phân hệ với hiệu ứng 3D Tilt Card & Glassmorphism./aboutsrc/pages/About.jsx
Giới thiệu hệ thống: Mô hình 3D kiến trúc 3 tầng (SQL Server - Docker/Metabase - React), công nghệ sử dụng và giá trị cốt lõi./overviewsrc/pages/Overview.jsx
Tổng quan thư viện: 5 thẻ KPI vĩ mô (Đầu sách, Bản sách, Độc giả, Lượt mượn, Truy cập số) và 2 biểu đồ phân tích nổi bật./borrowingsrc/pages/Borrowing.jsx
Thống kê lượt mượn: Biểu đồ xu hướng mượn sách theo tháng/năm và Top 10 đầu sách được mượn nhiều nhất./electronic-accesssrc/pages/ElectronicAccess.jsx
Truy cập điện tử: Xu hướng khai thác tài nguyên số theo tháng và bảng xếp hạng 6 cổng CSDL quốc tế./demand-analysissrc/pages/DemandAnalysis.jsx
Phân tích nhu cầu: Tỷ trọng mượn sách theo thể loại chuyên ngành và xu hướng dịch chuyển nhu cầu học thuật./acquisitionsrc/pages/Acquisition.jsx
Gợi ý bổ sung tài liệu: Bảng xếp hạng sách cần ưu tiên nhập mới dựa trên thuật toán tính Điểm ưu tiên./log-detailssrc/pages/LogDetails.jsx
Chi tiết nhật ký: Bảng tra cứu, đối soát 800+ bản ghi lịch sử giao dịch mượn trả thời gian thực.📂 Tổ chức Thư mục src/Plaintextfrontend/src/
├── components/
│   ├── Header.jsx          # Thanh Header 3D hiển thị tiêu đề động, nút điều hướng nhanh & trạng thái Live BI
│   ├── Sidebar.jsx         # Thanh điều hướng dọc cố định giữa các phân hệ Dashboard
│   ├── MetabaseKPI.jsx     # Component nhúng các thẻ chỉ số KPI đơn lẻ từ Metabase
│   ├── Filters.jsx         # Component bộ lọc giao diện
│   └── Placeholder.jsx     # Khung chờ tải dữ liệu
├── pages/                  # Chứa 7 trang giao diện chính của ứng dụng
├── styles/                 # Hệ thống CSS riêng biệt cho từng trang (main.css, Header.css, Home.css, About.css...)
├── App.jsx                 # Cấu hình React Router và khung bố cục chính (App Shell)
└── main.jsx                # Điểm khởi chạy ứng dụng React
✨ Điểm nhấn UI/UX & Kỹ thuậtHiệu ứng 3D Tilt & Glassmorphism: Các thẻ KPI, thẻ tính năng và Header có khả năng nghiêng 3D tương tác theo vị trí con trỏ chuột kết hợp lớp nền kính mờ (backdrop-filter: blur).
Tích hợp Live Metabase Iframe: Toàn bộ biểu đồ và KPI được nhúng trực tiếp từ máy chủ Metabase thông qua tên miền https://dashboard.dashboardg4.click kèm hiệu ứng Loading Skeleton mượt mà trong lúc chờ tải.CSS Scoped theo từng phân hệ: Mỗi trang sử dụng tiền tố class riêng biệt (ea-*, da-*, acq-*, log-*, borrowing-*) giúp ngăn chặn triệt để tình trạng xung đột CSS toàn cục.
Responsive Design: Tự động co giãn bố cục lưới linh hoạt trên cả màn hình Desktop lớn, Laptop, Tablet và Mobile.
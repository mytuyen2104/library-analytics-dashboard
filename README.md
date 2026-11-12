Markdown# 📊 Library Analytics Dashboard — Nhóm 4 (UTH)

> **Đồ án Học kỳ Doanh nghiệp (HKDN)**  
> **Đơn vị:** Trường Đại học Giao thông vận tải TP. Hồ Chí Minh (UTH)  
> **Quản lý dự án & Mã nguồn:** Jira Scrum & Git/GitHub

---

## 📖 GIỚI THIỆU DỰ ÁN

Dự án **Library Management Analytics Dashboard** được phát triển nhằm tự động hóa quy trình phân tích, thống kê và giám sát toàn diện hoạt động vận hành của **Trung tâm Thông tin – Thư viện UTH**.

Hệ thống chuyển đổi hơn **1.500 bản ghi** dữ liệu giao dịch mượn trả và nhật ký truy cập tài nguyên số thô trong **Microsoft SQL Server** thành các tri thức quản trị định lượng (*Actionable Insights*). Thông qua việc kết hợp giữa **Metabase BI** (chạy trên Docker) và giao diện Web **React + Vite** hiện đại (phong cách 3D Glassmorphism), hệ thống hỗ trợ ban quản lý thư viện theo dõi KPI thời gian thực, nắm bắt xu hướng học thuật của sinh viên và ra quyết định bổ sung tài liệu chính xác.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

* **Hệ quản trị Cơ sở dữ liệu:** Microsoft SQL Server (T-SQL, chuẩn hóa 4 bảng quan hệ PK/FK).
* **Nền tảng Phân tích & BI:** Metabase BI (triển khai độc lập qua Docker Container).
* **Giao diện Người dùng (Frontend):** React 18, Vite, React Router DOM, Lucide Icons, CSS3 3D Tilt & Glassmorphism.
* **Hạ tầng & Triển khai:** Docker Compose, Cloudflare Zero Trust / Tunnel (`dashboardg4.click`).
* **Quản lý dự án:** Jira (Scrum/Sprint) & Git/GitHub.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

Hệ thống vận hành theo mô hình kiến trúc 3 tầng khép kín và hỗ trợ truy cập từ xa qua Cloudflare Tunnel:

```text
┌─────────────────────────┐      TCP/IP (1433)       ┌───────────────────────────┐
│  Microsoft SQL Server   │ ───────────────────────► │    Metabase BI (Docker)   │
│  (1.500+ bản ghi chuẩn) │  (trustServerCert=true)  │   (http://localhost:3000) │
└─────────────────────────┘                          └─────────────┬─────────────┘
                                                                   │
                                        ┌──────────────────────────┴──────────────────────────┐
                                        │ Public Iframe / Cloudflare Tunnel                   │
                                        ▼                                                     ▼
                        ┌───────────────────────────────┐                     ┌───────────────────────────────┐
                        │   React + Vite Web Portal     │                     │   Metabase Admin Workspace    │
                        │   (http://localhost:5173)     │                     │ (dashboard.dashboardg4.click) │
                        └───────────────────────────────┘                     └───────────────────────────────┘
📂 CẤU TRÚC MÃ NGUỒNPlaintextlibrary-analytics-dashboard/
├── dashboard/                      # Lưu trữ cấu hình ứng dụng Metabase BI
│   ├── metabase.db.mv.db           # File dữ liệu Dashboard, biểu đồ và phân quyền
│   ├── metabase.db.trace.db        # Nhật ký giao dịch đồng bộ của Metabase
│   └── README.md                   # Hướng dẫn kỹ thuật phân hệ Dashboard
├── data/                           # 4 tập dữ liệu nguồn chuẩn hóa (.csv)
│   ├── Sach.csv                    # 120 danh mục đầu sách (943 bản sách)
│   ├── DocGia.csv                  # 80 hồ sơ độc giả
│   ├── MuonTra.csv                 # 800 giao dịch mượn trả sách
│   └── TruyCapDienTu.csv           # 500 bản ghi truy cập học liệu số (15.818 lượt)
├── database/                       # Tập lệnh khởi tạo cấu trúc cơ sở dữ liệu
│   └── schema.sql                  # DDL khởi tạo 4 bảng quan hệ (PK/FK)
├── queries/                        # Các tập lệnh T-SQL phân tích nghiệp vụ
│   ├── borrowing_statistics.sql    # Truy vấn thống kê lượt mượn & Top 10 sách
│   ├── demand_analysis.sql         # Truy vấn phân tích nhu cầu theo thể loại
│   └── UuTienBoSungSach.sql        # Thuật toán tính điểm ưu tiên bổ sung sách
├── frontend/                       # Ứng dụng Web React + Vite (Giao diện 3D Glassmorphism)
│   ├── src/
│   │   ├── components/             # Header 3D, Sidebar, MetabaseKPI, Filters...
│   │   ├── pages/                  # 7 trang phân hệ (Home, Overview, Borrowing, About...)
│   │   └── styles/                 # Hệ thống CSS 3D & Glassmorphism theo từng phân hệ
│   ├── package.json                # Cấu hình thư viện React, Vite, Lucide-react
│   └── vite.config.js              # Cấu hình máy chủ phát triển Vite
├── docker-compose.yml              # Cấu hình tự động hóa khởi chạy Metabase container
└── README.md                       # Tài liệu tổng quan và hướng dẫn triển khai dự án
📌 YÊU CẦU TIÊN QUYẾT
Trước khi khởi chạy hệ thống, đảm bảo máy trạm đã chuẩn bị sẵn:Docker Desktop: Đang hoạt động bình thường (Engine running).Microsoft SQL Server: Đã chạy tập lệnh database/schema.sql và import đầy đủ 4 file .csv từ thư mục data/ vào cơ sở dữ liệu LibraryAnalyticsDB.Cấu hình SQL Server Network: Đã bật giao thức TCP/IP (cổng 1433) và bật chế độ xác thực SQL Server and Windows Authentication mode (Mixed Mode).Node.js (v18+): Để khởi chạy giao diện người dùng React + Vite tại thư mục frontend/.🚀 
HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG
Phần 1: Khởi chạy Hạ tầng BI (Docker + Metabase)
Bước 1: Đồng bộ mã nguồn mới nhất từ GitHubBashgit pull origin main
Bước 2: Dọn dẹp container cũ (nếu có) để tránh xung đột cổng 3000Bashdocker stop metabase
docker rm metabase
Bước 3: Khởi chạy Metabase bằng Docker ComposeBashdocker compose up -d
(Hệ thống mất khoảng 15 – 30 giây để nạp toàn bộ dữ liệu biểu đồ vào bộ nhớ).

Phần 2: Khởi chạy Giao diện Web React (Frontend)
Mở một cửa sổ Terminal mới tại thư mục gốc của dự án và thực hiện:Bashcd frontend
npm install
npm run dev
Giao diện Web Portal (React): Truy cập tại 👉 http://localhost:5173
Giao diện Quản trị Metabase BI: Truy cập tại 👉 http://localhost:3000📊 CÁC PHÂN HỆ CHỨC NĂNG TRÊN HỆ THỐNG
Giao diện Web và Metabase tích hợp đồng bộ 7 phân hệ chức năng:STTPhân hệĐường dẫn (Route)Dạng trực quan hóaÝ nghĩa nghiệp vụ
1. Trang chủ & Giới thiệu/ & /about3D Hero Stage & Tilt CardsGiới thiệu tổng quan kiến trúc 3 tầng, công nghệ sử dụng và điều hướng nhanh.
2. Tổng quan thư viện/overview5 Single Metric Cards & 2 ChartsGiám sát 5 chỉ số KPI vĩ mô: Đầu sách (120), Bản sách (943), Độc giả (80), Lượt mượn (800), Truy cập số (15.818).
3. Thống kê lượt mượn/borrowingLine Chart & Bar ChartTheo dõi biến động lượt mượn theo tháng/năm và xếp hạng Top 10 đầu sách được mượn nhiều nhất.
4. Truy cập điện tử/electronic-accessLine Chart & Column ChartĐánh giá xu hướng khai thác học liệu số theo tháng và xếp hạng 6 cổng CSDL quốc tế (SpringerLink, IEEE, ProQuest...).
5. Phân tích nhu cầu/demand-analysisDonut Chart & Multi-line ChartPhân tích tỷ trọng mượn sách theo thể loại chuyên ngành và sự dịch chuyển nhu cầu đọc qua các kỳ.
6. Gợi ý bổ sung tài liệu/acquisitionPriority Table & HighlightỨng dụng thuật toán tính Điểm ưu tiên dựa trên lượt mượn và số bản tồn kho để đề xuất nhập sách mới.
7. Chi tiết nhật ký/log-detailsInteractive Data TableTruy xuất, tra cứu và đối soát minh bạch toàn bộ 800+ bản ghi lịch sử giao dịch mượn trả chi tiết.🛠️ CÁC LỆNH QUẢN TRỊ CONTAINER DOCKER
Trong quá trình vận hành Metabase, có thể sử dụng các lệnh sau tại thư mục gốc:Tạm dừng hệ thống: docker compose stopBật lại hệ thống: docker compose start
Xem nhật ký hoạt động (Logs): docker compose logs -f
Khởi động lại dịch vụ: docker compose restart
Gỡ bỏ container: docker compose down
© 2026 - Nhóm 4 | Đồ án Học kỳ Doanh nghiệp (HKDN) — Trường Đại học Giao thông vận tải TP. Hồ Chí Minh (UTH).
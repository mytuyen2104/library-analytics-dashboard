# Library Analytics Dashboard - Nhom 4

## Gioi thieu
Du an xay dung Dashboard phan tich du lieu thu vien,
ho tro thong ke va de xuat bo sung tai lieu.

## Chuc nang
- Thong ke luot muon sach.
- Thong ke truy cap tai lieu dien tu.
- Phan tich nhu cau su dung tai lieu.
- De xuat bo sung sach.
- Truc quan hoa du lieu bang Dashboard.

## Cong nghe du kien
- SQL Server
- SQL
- Power BI
- Power Query

## Nhom thuc hien
Nhom 4 - Du an thuc tap
## Quản lý công việc của nhóm bằng Jira.

## 📖 GIỚI THIỆU DỰ ÁN

Dự án **Library Management Analytics Dashboard** được phát triển nhằm tự động hóa quy trình phân tích và giám sát toàn diện hoạt động vận hành của một trung tâm thông tin – thư viện đại học. 

Hệ thống cho phép chuyển đổi 1.500 bản ghi dữ liệu mượn trả và tài nguyên số thô thành các tri thức quản trị định lượng (Actionable Insights), hỗ trợ người quản lý ra quyết định mua sắm tài liệu chính xác và đo lường hiệu quả khai thác CSDL điện tử theo thời gian thực.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

Hệ thống được thiết kế theo mô hình kiến trúc phân tầng khép kín:

```text
┌───────────────────────┐      TCP/IP (1433)      ┌─────────────────────────┐
│ Microsoft SQL Server  │ ──────────────────────► │  Metabase BI (Docker)   │
│ (1.500 bản ghi chuẩn) │   (trustServerCert=true)│  (Port Mapping: 3000)   │
└───────────────────────┘                         └────────────┬────────────┘
                                                               │
                                                               │ HTTP (Web UI)
                                                               ▼
                                                  ┌─────────────────────────┐
                                                  │   End-User Dashboard    │
                                                  │ (http://localhost:3000) │
                                                  └─────────────────────────┘
📂 CẤU TRÚC MÃ NGUỒN

library-analytics-dashboard/
├── dashboard/                     # Lưu trữ cấu hình ứng dụng Metabase
│   ├── metabase.db.mv.db          # File dữ liệu Dashboard, biểu đồ và phân quyền
│   ├── metabase.db.trace.db       # Nhật ký giao dịch đồng bộ
│   └── README.md                  # Hướng dẫn kỹ thuật phân hệ Dashboard
├── data/                          # 4 tập dữ liệu nguồn chuẩn hóa (.csv)
│   ├── Sach.csv                   # 120 danh mục sách
│   ├── DocGia.csv                 # 80 hồ sơ bạn đọc
│   ├── MuonTra.csv                # 800 giao dịch mượn trả
│   └── TruyCapDienTu.csv          # 500 bản ghi truy cập học liệu điện tử
├── database/                      # Tập lệnh tạo cấu trúc cơ sở dữ liệu
│   └── schema.sql                 # DDL khởi tạo 4 bảng quan hệ (PK/FK)
├── queries/                       # Các tập lệnh SQL phân tích theo phân hệ
│   ├── borrowing_statistics.sql   # Phân hệ thống kê mượn sách
│   ├── demand_analysis.sql        # Phân hệ phân tích nhu cầu theo thể loại
│   └── UuTienBoSungSach.sql       # Phân hệ tính điểm ưu tiên bổ sung sách
├── docker-compose.yml             # Cấu hình tự động hóa triển khai hạ tầng BI
└── README.md                      # Tài liệu tổng quan dự án

📌 YÊU CẦU TIÊN QUYẾT
Trước khi chạy hệ thống, đảm bảo máy trạm đã chuẩn bị:
Docker Desktop: Đang hoạt động bình thường (Engine running).
Microsoft SQL Server: Đã chạy schema.sql và import đủ 1.500 dòng vào database LibraryAnalyticsDB.
Tài khoản sa: Chế độ Mixed Mode đã bật, tài khoản sa đã kích hoạt với mật khẩu:.
🚀 HƯỚNG DẪN TRIỂN KHAI 1-CLICK (DOCKER COMPOSE)

Bước 1: Đồng bộ mã nguồn từ GitHub
Mở Terminal / Command Prompt tại thư mục dự án và thực hiện:

git pull origin main
Bước 2: Dọn dẹp phiên bản cũ (Nếu có)
Tránh xung đột cổng mạng hoặc tài nguyên cũ:

docker stop metabase 
docker rm metabase

Bước 3: Khởi chạy toàn bộ hệ thống
Khởi động container Metabase cùng toàn bộ cấu hình Dashboard có sẵn:

docker compose up -d

Hệ thống mất khoảng 15 – 30 giây để nạp xong toàn bộ biểu đồ vào bộ nhớ.
🔑 TÀI KHOẢN TRUY CẬP HỆ THỐNG
Sau khi khởi chạy, mở trình duyệt web và truy cập địa chỉ: 👉 http://localhost:3000
Vai trò		Phạm vi quyền hạn
Quản trị viên (Admin)		Toàn quyền cấu hình, sửa SQL và giao diện
Điều hướng xem Dashboard:
Đăng nhập ➔ Chọn Phân tích của chúng tôi (Our analytics) ➔ Chọn Library Management Dashboard.
📊 CÁC PHÂN HỆ TRÊN DASHBOARD
Hệ thống tích hợp đầy đủ 5 phân hệ nghiệp vụ hoàn chỉnh:
STT	Khối phân hệ	Dạng trực quan hóa	Ý nghĩa nghiệp vụ
1	Banner & Bộ lọc	Markdown & Global Slicers	Nhận diện hệ thống và lọc dữ liệu động theo Thể loại / Thời gian.
2	Chỉ số KPI Vĩ mô	Single Metric Cards	Tổng đầu sách (120), Tổng bản sách (943), Độc giả (80), Lượt mượn (800), Lượt truy cập số (15.818).
3	Thống kê Mượn sách	Line Chart & Row Chart	Theo dõi chu kỳ mượn sách qua 12 tháng và Top 10 cuốn sách được mượn nhiều nhất.
4	Tài nguyên Điện tử	Line Chart & Column Chart	Biến động tra cứu học liệu số theo thời gian và xếp hạng lưu lượng các CSDL (SpringerLink dẫn đầu).
5	Nhu cầu Thể loại	Donut Chart & Multi-line	Cơ cấu % mượn của các ngành đào tạo và diễn biến cạnh tranh nhu cầu mượn qua các tháng.
6	Gợi ý Mua sách	Table with Highlight	Bảng xếp hạng sách theo Điểm ưu tiên 

🛠️ CÁC LỆNH QUẢN TRỊ CONTAINER
Trong quá trình vận hành, có thể sử dụng các lệnh Docker Compose sau:
Tạm dừng hệ thống:

docker compose stop
Bật lại hệ thống:

docker compose start
Xem trạng thái nhật ký (Logs):

docker compose logs -f
Khởi động lại toàn bộ dịch vụ:

docker compose restart
Gỡ bỏ hệ thống hoàn toàn:

docker compose down

© 2026 - Nhóm 4 | Đồ án Học kỳ Doanh nghiệp (HKDN)
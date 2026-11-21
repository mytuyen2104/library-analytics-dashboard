# 📊 Library Analytics Dashboard — Nhóm 4 (UTH)

> **Đồ án Học kỳ Doanh nghiệp (HKDN)**  
> **Đơn vị:** Trường Đại học Giao thông vận tải TP. Hồ Chí Minh (UTH)  
> **Quản lý dự án & Mã nguồn:** Jira Scrum & Git/GitHub  
> **Cổng truy cập trực tuyến:** `https://uth.dashboardg4.click`

---

## 📖 GIỚI THIỆU DỰ ÁN

Dự án **Library Management Analytics Dashboard** được phát triển nhằm số hóa toàn diện quy trình vận hành nghiệp vụ và phân tích dữ liệu của **Trung tâm Thông tin – Thư viện UTH**.

Hệ thống chuyển đổi hơn **1.500 bản ghi** dữ liệu giao dịch mượn trả và nhật ký truy cập tài nguyên số thô trong **Microsoft SQL Server** thành các tri thức quản trị định lượng (*Actionable Insights*). Thông qua việc kết hợp giữa **Metabase BI** (Docker), **Backend REST API & Gemini AI** (Node.js/Express) và giao diện Web **React + Vite** hiện đại (phong cách 3D Glassmorphism), hệ thống hỗ trợ thủ thư và ban quản lý theo dõi KPI thời gian thực, thao tác nghiệp vụ mượn/trả/nhập kho/quản lý độc giả trực tiếp và hỏi đáp dữ liệu bằng ngôn ngữ tự nhiên.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

- **Cơ sở dữ liệu (Database):** Microsoft SQL Server 2022 (T-SQL, chuẩn hóa 4 bảng quan hệ PK/FK: `Sach`, `DocGia`, `MuonTra`, `TruyCapDienTu`).
- **Backend & Trợ lý AI:** Node.js, Express.js, `mssql` (Transaction & Stored Queries), Google Gemini API (`@google/genai` Text-to-SQL).
- **Nền tảng Phân tích & BI:** Metabase BI (triển khai độc lập qua Docker Container).
- **Giao diện Người dùng (Frontend):** React 18, Vite, React Router DOM, Lucide Icons, CSS3 3D Tilt & Glassmorphism.
- **Hạ tầng & Triển khai:** Docker Compose, Cloudflare Pages (`uth.dashboardg4.click`), Cloudflare Zero Trust / Tunnel (`api.dashboardg4.click`, `dashboard.dashboardg4.click`).
- **Quản lý dự án:** Jira (Scrum/Sprint) & Git/GitHub.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

Hệ thống vận hành theo mô hình kiến trúc 3 tầng tích hợp AI và truy cập từ xa an toàn qua Cloudflare Tunnel:

```text
┌─────────────────────────┐     TCP/IP (1433)       ┌───────────────────────────┐
│  Microsoft SQL Server   │ ──────────────────────► │    Metabase BI (Docker)   │
│  (LibraryAnalyticsDB)   │ ◄───┐                   │   (http://localhost:3000) │
└─────────────────────────┘     │                   └─────────────┬─────────────┘
                                │ (CRUD + AI SQL)                 │
                   ┌────────────┴────────────┐                    │
                   │  Backend Node.js/Express│                    │
                   │  + Gemini Text-to-SQL   │                    │
                   │ (http://localhost:5000) │                    │
                   └────────────┬────────────┘                    │
                                │                                 │
                                └────────────────┬────────────────┘
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │  Cloudflare Pages & Tunnel    │
                                 │  • uth.dashboardg4.click      │
                                 │  • api.dashboardg4.click      │
                                 │  • dashboard.dashboardg4.click│
                                 └───────────────┬───────────────┘
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │   React + Vite Web Portal     │
                                 │   (http://localhost:5173)     │
                                 └───────────────────────────────┘
```

---

## 📂 CẤU TRÚC MÃ NGUỒN

```text
library-analytics-dashboard/
├── backend/                        # Máy chủ API & Trợ lý AI (Node.js + Express)
│   ├── server.js                   # REST API (Kho sách, Độc giả, Mượn/Trả, Auth, Gemini AI)
│   ├── inventory-history.json      # Nhật ký lịch sử nhập bổ sung kho sách
│   ├── .env                        # Biến môi trường (DB_SERVER, GEMINI_API_KEY, ADMIN_ACCOUNTS)
│   └── package.json                # Cấu hình thư viện express, mssql, cors, dotenv, @google/genai
├── dashboard/                      # Lưu trữ cấu hình ứng dụng Metabase BI
│   ├── metabase.db.mv.db           # Dữ liệu Dashboard, biểu đồ và phân quyền
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
│   │   ├── components/             # Header 3D, Sidebar, ChatWidget AI, Login...
│   │   ├── pages/                  # 12 trang phân hệ (Home, Overview, Loan, Inventory, Reader...)
│   │   └── styles/                 # Hệ thống CSS 3D & Glassmorphism theo từng phân hệ
│   ├── package.json                # Cấu hình thư viện React, Vite, Lucide-react
│   └── vite.config.js              # Cấu hình máy chủ phát triển Vite
├── docker-compose.yml              # Cấu hình tự động hóa khởi chạy Metabase container
├── start-project.bat               # Script khởi động nhanh toàn bộ dịch vụ trên Windows
└── README.md                       # Tài liệu tổng quan và hướng dẫn triển khai dự án
```

---

## 📌 YÊU CẦU TIÊN QUYẾT

Trước khi khởi chạy hệ thống, đảm bảo máy trạm đã chuẩn bị sẵn:
1. **Docker Desktop:** Đang hoạt động bình thường (`Engine running`).
2. **Microsoft SQL Server:** Đã chạy tập lệnh `database/schema.sql` và import đầy đủ 4 file `.csv` từ thư mục `data/` vào cơ sở dữ liệu `LibraryAnalyticsDB`.
3. **Cấu hình SQL Server Network:** Đã bật giao thức **TCP/IP** (cổng `1433`) và bật chế độ xác thực **SQL Server and Windows Authentication mode (Mixed Mode)**.
4. **Node.js (v18+):** Để khởi chạy máy chủ Backend API và giao diện Frontend React + Vite.

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG

### Cách 1: Khởi chạy nhanh tự động (Windows)
1. Mở ứng dụng **Docker Desktop** và đợi trạng thái chuyển sang **Engine running**.
2. Bấm đúp chuột vào file **`start-project.bat`** tại thư mục gốc của dự án để tự động khởi động đồng thời **Metabase BI**, **Backend API** và **Frontend React**.

### Cách 2: Khởi chạy thủ công từng thành phần

#### Phần 1: Khởi chạy Hạ tầng BI (Docker + Metabase)
```bash
docker compose up -d
```
*(Hệ thống mất khoảng 15 – 30 giây để nạp toàn bộ dữ liệu biểu đồ vào bộ nhớ tại `http://localhost:3000`).*

#### Phần 2: Khởi chạy Backend API & AI (Port 5000)
Tạo file `backend/.env` với cấu hình kết nối CSDL và API Key:
```env
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=LibraryAnalyticsDB
GEMINI_API_KEY=your_gemini_api_key
ADMIN_ACCOUNTS=admin1:123456,admin2:123456,thuthu1:123456
PORT=5000
```

Tài khoản GG để gửi email thông báo cho user: thuviendashboard@gmail.com, thuvien@123
Mở Terminal tại thư mục `backend/` và chạy:
```bash
cd backend
npm install
node server.js
```

#### Phần 3: Khởi chạy Giao diện Web React (Port 5173)
Mở một cửa sổ Terminal mới tại thư mục `frontend/` và chạy:
```bash
cd frontend
npm install
npm run dev
```

- **Giao diện Web Portal (Local):** `http://localhost:5173` (Tài khoản mặc định: `admin1` / `123456`)
- **Giao diện Quản trị Metabase BI:** `http://localhost:3000`
- **Cổng Backend API:** `http://localhost:5000`

---

## 📊 CÁC PHÂN HỆ CHỨC NĂNG TRÊN HỆ THỐNG

Hệ thống tích hợp đồng bộ **12 phân hệ chức năng** kết hợp giữa phân tích BI, nghiệp vụ quản trị thư viện và trợ lý AI:

| STT | Phân hệ | Đường dẫn (Route) | Công nghệ / Trực quan hóa | Ý nghĩa nghiệp vụ |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Đăng nhập bảo mật** | `/login` | Auth API & LocalStorage | Xác thực quyền truy cập hệ thống quản trị thư viện dành cho cán bộ/thủ thư. |
| 2 | **Trang chủ & Giới thiệu** | `/` & `/about` | 3D Hero Stage & Tilt Cards | Giới thiệu tổng quan kiến trúc 3 tầng, công nghệ sử dụng và điều hướng nhanh. |
| 3 | **Tổng quan thư viện** | `/overview` | 5 Metric Cards & Metabase Charts | Giám sát 5 chỉ số KPI vĩ mô: Đầu sách (120), Bản sách (943), Độc giả (80), Lượt mượn (800), Truy cập số (15.818). |
| 4 | **Thống kê lượt mượn** | `/borrowing` | Metabase Line & Bar Charts | Theo dõi biến động lượt mượn theo tháng/năm và xếp hạng Top 10 đầu sách được mượn nhiều nhất. |
| 5 | **Truy cập điện tử** | `/electronic-access` | Metabase Line & Column Charts | Đánh giá xu hướng khai thác học liệu số theo tháng và xếp hạng 6 cổng CSDL quốc tế (SpringerLink, IEEE, ProQuest...). |
| 6 | **Phân tích nhu cầu** | `/demand-analysis` | Metabase Donut & Multi-line Charts | Phân tích tỷ trọng mượn sách theo thể loại chuyên ngành và sự dịch chuyển nhu cầu đọc qua các kỳ. |
| 7 | **Gợi ý bổ sung tài liệu** | `/acquisition` | Priority Table & Highlight | Ứng dụng thuật toán tính Điểm ưu tiên dựa trên lượt mượn và số bản tồn kho để đề xuất nhập sách mới. |
| 8 | **Chi tiết nhật ký** | `/log-details` | Interactive Data Table | Truy xuất, tra cứu và đối soát minh bạch toàn bộ 800+ bản ghi lịch sử giao dịch mượn trả chi tiết. |
| 9 | **Quản lý mượn trả** | `/loan-management` | REST API + SQL Transaction | Tạo phiếu mượn mới, tự động trừ/cộng tồn kho và xác nhận trả sách theo thời gian thực. |
| 10 | **Quản lý kho sách** | `/inventory-management` | REST API + Inventory Log | Tra cứu tồn kho, thêm đầu sách mới (tự sinh mã `Sxxxx`), nhập bổ sung số lượng và lưu nhật ký nhập kho. |
| 11 | **Quản lý độc giả** | `/reader-management` | CRUD API + CSV Export | Cấp thẻ độc giả (`DGxxxx`), lọc theo đối tượng, xem lịch sử mượn từng người và xuất báo cáo Excel (CSV). |
| 12 | **Trợ lý ảo AI Thư viện** | `ChatWidget` (Toàn trang) | Google Gemini Text-to-SQL | Chuyển đổi câu hỏi tiếng Việt thành truy vấn T-SQL `SELECT` an toàn và trả lời số liệu trực tiếp. |

---

## 🛠️ CÁC LỆNH QUẢN TRỊ CONTAINER DOCKER

Trong quá trình vận hành Metabase, có thể sử dụng các lệnh sau tại thư mục gốc:
- **Tạm dừng hệ thống:** `docker compose stop`
- **Bật lại hệ thống:** `docker compose start`
- **Xem nhật ký hoạt động (Logs):** `docker compose logs -f`
- **Khởi động lại dịch vụ:** `docker compose restart`
- **Gỡ bỏ container:** `docker compose down`

---

© 2026 - Nhóm 4 | Đồ án Học kỳ Doanh nghiệp (HKDN) — Trường Đại học Giao thông vận tải TP. Hồ Chí Minh (UTH).

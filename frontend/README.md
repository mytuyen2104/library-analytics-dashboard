# Library Analytics Dashboard – Frontend (React + Vite)

Sườn giao diện dùng chung cho dự án phân tích dữ liệu thư viện. Có **5 trang**, Header, Sidebar, điều hướng hoạt động và các vùng chờ nhúng Metabase.

## Cách chạy trên Windows (VS Code)

1. Cài **Node.js LTS** (nếu chưa có).
2. Giải nén thư mục, mở thư mục `library-analytics-dashboard-fe` bằng VS Code.
3. Chọn **Terminal → New Terminal** và chạy:

```bash
npm install
npm run dev
```

4. Mở địa chỉ Vite in ra (thường là `http://localhost:5173`).

Để kiểm tra bản build: `npm run build`.

## Phân công file

| Thành viên | File phụ trách |
|---|---|
| TV1 | `src/components/Header.jsx`, `src/components/Sidebar.jsx`, `src/pages/Overview.jsx`, `src/App.jsx`, `src/styles/main.css` |
| TV2 | `src/pages/Borrowing.jsx` |
| TV3 | `src/pages/ElectronicAccess.jsx` |
| TV4 | `src/pages/DemandAnalysis.jsx` |
| TV5 | `src/pages/Acquisition.jsx` |
| TV6 | Metabase, SQL Server, cấu hình nhúng và triển khai |

## Lưu ý

- Các số KPI trang Tổng quan **là dữ liệu minh họa**, chưa kết nối SQL Server.
- Các biểu đồ/bảng là **placeholder**, chưa nhúng Metabase.
- Các bộ lọc là **giao diện mẫu**, chưa lọc dữ liệu thật.
- Chưa có xác thực, phân quyền, backend hay cấu hình domain.
- Không commit mật khẩu SQL Server hoặc khóa nhúng Metabase vào GitHub.
- TV1 đưa code lên repo chung trước; TV2–TV5 tạo nhánh riêng để làm phần của mình.

## Bản cập nhật: thêm Trang chủ theo Figma
- `/` — Trang chủ với banner, menu ngang, nút **Vào Dashboard**, 6 thẻ chức năng.
- `/overview` — Tổng quan thư viện với 5 KPI.
- `/borrowing`, `/electronic-access`, `/demand-analysis`, `/acquisition` — 4 trang nghiệp vụ.
- `/about` — Trang giới thiệu cơ bản.

Giao diện trang chủ được dựng lại dựa trên ảnh Figma người dùng cung cấp, chưa phải bản xuất code pixel-perfect từ Figma. Biểu đồ, dữ liệu và bộ lọc vẫn là giao diện mẫu, chưa tích hợp Metabase.

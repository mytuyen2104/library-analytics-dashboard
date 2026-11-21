/*
TV3 - Electronic Access Statistics
Dự án: Library Analytics Dashboard

Data Source:
- Table: dbo.TruyCapDienTu (MaTruyCap, NgayTruyCap, TenCSDL, SoLuot)

Filters (đặt NULL = không lọc):
- @Nam      : lọc theo năm
- @Thang    : lọc theo tháng (1-12)
- @TuNgay / @DenNgay : lọc theo khoảng ngày (gồm cả 2 đầu)
- @TenCSDL  : lọc theo cơ sở dữ liệu điện tử

Available Databases:
- SpringerLink
- ProQuest
- EBSCO
- ScienceDirect
- ACM Digital Library
- IEEE Xplore

Danh sách truy vấn:
- [Q1] Tổng lượt truy cập
- [Q2] Truy cập theo tháng
- [Q3] Truy cập theo từng CSDL (kèm tỷ trọng %)
- [Q4] Truy cập theo tháng và từng CSDL (dùng cho biểu đồ theo CSDL)
- [Q5] Kiểm tra chất lượng và đối soát dữ liệu
*/

USE LibraryAnalyticsDB;
GO

-- Lưu ý: không đặt GO bên dưới, vì GO làm mất các biến đã khai báo.
DECLARE @Nam     INT          = NULL;   -- ví dụ: 2025
DECLARE @Thang   INT          = NULL;   -- ví dụ: 11
DECLARE @TuNgay  DATE         = NULL;   -- ví dụ: '2025-01-01'
DECLARE @DenNgay DATE         = NULL;   -- ví dụ: '2025-12-31'
DECLARE @TenCSDL NVARCHAR(100) = NULL;  -- ví dụ: N'IEEE Xplore'

-- [Q1] Tổng lượt truy cập
SELECT
    COALESCE(SUM(SoLuot), 0) AS TongLuotTruyCap
FROM dbo.TruyCapDienTu
WHERE (@Nam     IS NULL OR YEAR(NgayTruyCap)  = @Nam)
  AND (@Thang   IS NULL OR MONTH(NgayTruyCap) = @Thang)
  AND (@TuNgay  IS NULL OR NgayTruyCap >= @TuNgay)
  AND (@DenNgay IS NULL OR NgayTruyCap <  DATEADD(DAY, 1, @DenNgay))
  AND (@TenCSDL IS NULL OR TenCSDL = @TenCSDL);

-- [Q2] Truy cập theo tháng
SELECT
    YEAR(NgayTruyCap)  AS Nam,
    MONTH(NgayTruyCap) AS Thang,
    SUM(SoLuot)        AS TongLuot
FROM dbo.TruyCapDienTu
WHERE (@Nam     IS NULL OR YEAR(NgayTruyCap)  = @Nam)
  AND (@Thang   IS NULL OR MONTH(NgayTruyCap) = @Thang)
  AND (@TuNgay  IS NULL OR NgayTruyCap >= @TuNgay)
  AND (@DenNgay IS NULL OR NgayTruyCap <  DATEADD(DAY, 1, @DenNgay))
  AND (@TenCSDL IS NULL OR TenCSDL = @TenCSDL)
GROUP BY YEAR(NgayTruyCap), MONTH(NgayTruyCap)
ORDER BY Nam, Thang;

-- [Q3] Theo từng CSDL điện tử (kèm tỷ trọng %)
SELECT
    TenCSDL,
    SUM(SoLuot) AS TongLuotTruyCap,
    CAST(100.0 * SUM(SoLuot) / NULLIF(SUM(SUM(SoLuot)) OVER (), 0) AS DECIMAL(5,2)) AS TyTrongPhanTram
FROM dbo.TruyCapDienTu
WHERE (@Nam     IS NULL OR YEAR(NgayTruyCap)  = @Nam)
  AND (@Thang   IS NULL OR MONTH(NgayTruyCap) = @Thang)
  AND (@TuNgay  IS NULL OR NgayTruyCap >= @TuNgay)
  AND (@DenNgay IS NULL OR NgayTruyCap <  DATEADD(DAY, 1, @DenNgay))
  AND (@TenCSDL IS NULL OR TenCSDL = @TenCSDL)
GROUP BY TenCSDL
ORDER BY TongLuotTruyCap DESC;

-- [Q4] Theo tháng và từng CSDL
SELECT
    YEAR(NgayTruyCap)  AS Nam,
    MONTH(NgayTruyCap) AS Thang,
    TenCSDL,
    SUM(SoLuot)        AS TongLuot
FROM dbo.TruyCapDienTu
WHERE (@Nam     IS NULL OR YEAR(NgayTruyCap)  = @Nam)
  AND (@Thang   IS NULL OR MONTH(NgayTruyCap) = @Thang)
  AND (@TuNgay  IS NULL OR NgayTruyCap >= @TuNgay)
  AND (@DenNgay IS NULL OR NgayTruyCap <  DATEADD(DAY, 1, @DenNgay))
  AND (@TenCSDL IS NULL OR TenCSDL = @TenCSDL)
GROUP BY YEAR(NgayTruyCap), MONTH(NgayTruyCap), TenCSDL
ORDER BY Nam, Thang, TenCSDL;

-- [Q5] Kiểm tra chất lượng và đối soát (chạy trên toàn bảng, không áp dụng bộ lọc)
-- Q5.1 Tổng quan: kỳ vọng SoBanGhi = 500, TongLuot = 15818, SoCSDL = 6
SELECT
    COUNT(*)                 AS SoBanGhi,
    MIN(NgayTruyCap)         AS NgayDau,
    MAX(NgayTruyCap)         AS NgayCuoi,
    SUM(SoLuot)              AS TongLuot,
    COUNT(DISTINCT TenCSDL)  AS SoCSDL
FROM dbo.TruyCapDienTu;

-- Q5.2 Giá trị bất thường: kỳ vọng cả 4 cột = 0
SELECT
    SUM(CASE WHEN NgayTruyCap IS NULL THEN 1 ELSE 0 END) AS NgayTruyCap_NULL,
    SUM(CASE WHEN TenCSDL     IS NULL THEN 1 ELSE 0 END) AS TenCSDL_NULL,
    SUM(CASE WHEN SoLuot      IS NULL THEN 1 ELSE 0 END) AS SoLuot_NULL,
    SUM(CASE WHEN SoLuot < 0          THEN 1 ELSE 0 END) AS SoLuot_Am
FROM dbo.TruyCapDienTu;

-- Q5.3 MaTruyCap trùng: kỳ vọng không trả về dòng nào
SELECT MaTruyCap, COUNT(*) AS SoLan
FROM dbo.TruyCapDienTu
GROUP BY MaTruyCap
HAVING COUNT(*) > 1;

-- Q5.4 Đối soát: kỳ vọng 3 cột bằng nhau
SELECT
    (SELECT SUM(SoLuot) FROM dbo.TruyCapDienTu) AS TongBang,
    (SELECT SUM(T) FROM (SELECT SUM(SoLuot) AS T FROM dbo.TruyCapDienTu
                         GROUP BY YEAR(NgayTruyCap), MONTH(NgayTruyCap)) AS m) AS TongCacThang,
    (SELECT SUM(T) FROM (SELECT SUM(SoLuot) AS T FROM dbo.TruyCapDienTu
                         GROUP BY TenCSDL) AS d) AS TongCacCSDL;
/*
TV3 - Electronic Access Statistics

Data Source:
- Table: TruyCapDienTu

Filters:
- Year
- Month
- Date Range
- TenCSDL

Available Databases:
- SpringerLink
- ProQuest
- EBSCO
- ScienceDirect
- ACM Digital Library
- IEEE Xplore
*/

USE LibraryAnalyticsDB;
GO

-- Tổng lượt truy cập
SELECT
    SUM(SoLuot) AS TongLuotTruyCap
FROM dbo.TruyCapDienTu;

-- Truy cập theo tháng
SELECT
    YEAR(NgayTruyCap) AS Nam,
    MONTH(NgayTruyCap) AS Thang,
    SUM(SoLuot) AS TongLuot
FROM dbo.TruyCapDienTu
GROUP BY YEAR(NgayTruyCap), MONTH(NgayTruyCap)
ORDER BY Nam, Thang;

-- Theo từng CSDL điện tử
SELECT
    TenCSDL,
    SUM(SoLuot) AS TongLuotTruyCap
FROM dbo.TruyCapDienTu
GROUP BY TenCSDL
ORDER BY TongLuotTruyCap DESC;
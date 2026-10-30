USE LibraryAnalyticsDB;
GO

-- KPI01: Tổng đầu sách
SELECT COUNT(*) AS TongDauSach
FROM dbo.Sach;

-- KPI02: Tổng bản sách
SELECT SUM(SoBanHienCo) AS TongBanSach
FROM dbo.Sach;

-- KPI03: Tổng lượt mượn
SELECT COUNT(*) AS TongLuotMuon
FROM dbo.MuonTra;

-- KPI04: Độc giả hoạt động
SELECT COUNT(DISTINCT MaDocGia) AS DocGiaHoatDong
FROM dbo.MuonTra;

-- KPI05: Tổng lượt truy cập điện tử
SELECT SUM(SoLuot) AS TongLuotTruyCap
FROM dbo.TruyCapDienTu;
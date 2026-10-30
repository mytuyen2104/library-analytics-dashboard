USE LibraryAnalyticsDB;
GO

-- Kiểm tra số bản ghi trong 4 bảng
SELECT 'Sach' AS TenBang, COUNT(*) AS SoBanGhi
FROM dbo.Sach
UNION ALL
SELECT 'DocGia', COUNT(*)
FROM dbo.DocGia
UNION ALL
SELECT 'MuonTra', COUNT(*)
FROM dbo.MuonTra
UNION ALL
SELECT 'TruyCapDienTu', COUNT(*)
FROM dbo.TruyCapDienTu;

-- Đối chiếu các KPI tổng quan
SELECT
    (SELECT COUNT(*) FROM dbo.Sach) AS TongDauSach,
    (SELECT SUM(SoBanHienCo) FROM dbo.Sach) AS TongBanSach,
    (SELECT COUNT(*) FROM dbo.MuonTra) AS TongLuotMuon,
    (SELECT COUNT(DISTINCT MaDocGia) FROM dbo.MuonTra) AS DocGiaHoatDong,
    (SELECT SUM(SoLuot) FROM dbo.TruyCapDienTu) AS TongLuotTruyCap;
USE LibraryAnalyticsDB;
GO

-- 1. Thống kê lượt mượn theo tháng
SELECT 
    YEAR(NgayMuon) AS Nam,
    MONTH(NgayMuon) AS Thang,
    COUNT(MaMuon) AS TongSoLuotMuon
FROM dbo.MuonTra
GROUP BY YEAR(NgayMuon), MONTH(NgayMuon)
ORDER BY Nam ASC, Thang ASC;
GO

-- 2. Top 10 sách được mượn nhiều nhất
SELECT TOP 10
    s.MaSach,
    s.TenSach,
    s.TheLoai,
    COUNT(m.MaMuon) AS SoLuotMuon
FROM dbo.Sach s
INNER JOIN dbo.MuonTra m ON s.MaSach = m.MaSach
GROUP BY s.MaSach, s.TenSach, s.TheLoai
ORDER BY SoLuotMuon DESC;
GO
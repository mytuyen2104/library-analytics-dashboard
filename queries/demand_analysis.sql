USE LibraryAnalyticsDB;
GO
SELECT 
    s.TheLoai,
    COUNT(mt.MaMuon) AS SoLuotMuon
FROM dbo.Sach s
INNER JOIN dbo.MuonTra mt ON s.MaSach = mt.MaSach
GROUP BY s.TheLoai
ORDER BY SoLuotMuon DESC;
USE LibraryAnalyticsDB;
GO

SELECT
    s.MaSach,
    s.TenSach,
    s.SoBanHienCo,
    COUNT(mt.MaMuon) AS TongLuotMuon
FROM dbo.Sach AS s
LEFT JOIN dbo.MuonTra AS mt
    ON s.MaSach = mt.MaSach
GROUP BY s.MaSach, s.TenSach, s.SoBanHienCo
ORDER BY TongLuotMuon DESC, s.MaSach;

SELECT
    N'Số bản âm hoặc NULL' AS NoiDungKiemTra,
    COUNT(*) AS SoLoi
FROM dbo.Sach
WHERE SoBanHienCo < 0 OR SoBanHienCo IS NULL

UNION ALL

SELECT N'Mã sách không tồn tại', COUNT(*)
FROM dbo.MuonTra AS mt
LEFT JOIN dbo.Sach AS s ON mt.MaSach = s.MaSach
WHERE s.MaSach IS NULL

UNION ALL

SELECT N'Mã độc giả không tồn tại', COUNT(*)
FROM dbo.MuonTra AS mt
LEFT JOIN dbo.DocGia AS dg ON mt.MaDocGia = dg.MaDocGia
WHERE dg.MaDocGia IS NULL

UNION ALL

SELECT N'Thiếu ngày mượn', COUNT(*)
FROM dbo.MuonTra
WHERE NgayMuon IS NULL

UNION ALL

SELECT N'Ngày trả trước ngày mượn', COUNT(*)
FROM dbo.MuonTra
WHERE NgayTra < NgayMuon;
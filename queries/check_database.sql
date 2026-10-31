USE LibraryAnalyticsDB;
GO

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

-- KIỂM TRA CẤU TRÚC 4 BẢNG
SELECT
    TABLE_NAME AS TenBang,
    COLUMN_NAME AS TenCot,
    DATA_TYPE AS KieuDuLieu,
    CHARACTER_MAXIMUM_LENGTH AS DoDai,
    IS_NULLABLE AS ChoPhepNull
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo'
AND TABLE_NAME IN (
    'Sach',
    'DocGia',
    'MuonTra',
    'TruyCapDienTu'
)
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- KIEM TRA DU LIEU TRUNG LAP

-- Bang Sach
SELECT MaSach, COUNT(*) AS SoLan
FROM dbo.Sach
GROUP BY MaSach
HAVING COUNT(*) > 1;

-- Bang DocGia
SELECT MaDocGia, COUNT(*) AS SoLan
FROM dbo.DocGia
GROUP BY MaDocGia
HAVING COUNT(*) > 1;

-- Bang MuonTra
SELECT MaMuon, COUNT(*) AS SoLan
FROM dbo.MuonTra
GROUP BY MaMuon
HAVING COUNT(*) > 1;

-- Bang TruyCapDienTu
SELECT MaTruyCap, COUNT(*) AS SoLan
FROM dbo.TruyCapDienTu
GROUP BY MaTruyCap
HAVING COUNT(*) > 1;

-- KIEM TRA KHOA NGOAI

SELECT
    fk.name AS TenKhoaNgoai,
    OBJECT_NAME(fk.parent_object_id) AS Bang,
    OBJECT_NAME(fk.referenced_object_id) AS BangThamChieu
FROM sys.foreign_keys AS fk
WHERE fk.parent_object_id = OBJECT_ID('dbo.MuonTra');

-- BUOC 5: KIEM TRA DU LIEU BAT HOP LY

-- 1. Kiem tra sach co so ban am
SELECT *
FROM dbo.Sach
WHERE SoBanHienCo < 0;

-- 2. Kiem tra ngay tra truoc ngay muon
SELECT *
FROM dbo.MuonTra
WHERE NgayTra < NgayMuon;

-- 3. Kiem tra luot truy cap am
SELECT *
FROM dbo.TruyCapDienTu
WHERE SoLuot < 0;

-- 4. Kiem tra giao dich muon khong co sach
SELECT mt.*
FROM dbo.MuonTra mt
LEFT JOIN dbo.Sach s ON mt.MaSach = s.MaSach
WHERE s.MaSach IS NULL;

-- 5. Kiem tra giao dich muon khong co doc gia
SELECT mt.*
FROM dbo.MuonTra mt
LEFT JOIN dbo.DocGia dg ON mt.MaDocGia = dg.MaDocGia
WHERE dg.MaDocGia IS NULL;
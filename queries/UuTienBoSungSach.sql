USE LibraryAnalyticsDB;
GO

DECLARE @TuNgay DATE = '20250101';
DECLARE @DenNgay DATE = '20261027';

IF @TuNgay > @DenNgay
    THROW 50001, N'Khoảng ngày không hợp lệ', 1;

;WITH LuotMuon AS (
    SELECT
        MaSach,
        COUNT_BIG(*) AS L
    FROM dbo.MuonTra
    WHERE NgayMuon >= @TuNgay
      AND NgayMuon <= @DenNgay
      AND TrangThai IN (N'Đã trả', N'Chưa trả')
    GROUP BY MaSach
),
ChiSo AS (
    SELECT
        s.MaSach,
        s.TenSach,
        s.TheLoai,
        s.SoBanHienCo,
        COALESCE(m.L, 0) AS L,
        CASE
            WHEN s.SoBanHienCo > 0
            THEN 1.0 * COALESCE(m.L, 0)
                 / NULLIF(s.SoBanHienCo, 0)
        END AS R
    FROM dbo.Sach AS s
    LEFT JOIN LuotMuon AS m
        ON m.MaSach = s.MaSach
),
ChuanHoa AS (
    SELECT
        *,
        MAX(
            CASE WHEN SoBanHienCo > 0 THEN L END
        ) OVER () AS Lmax,
        MAX(R) OVER () AS Rmax
    FROM ChiSo
),
TinhDiem AS (
    SELECT
        *,
        CASE
            WHEN SoBanHienCo > 0
            THEN 100.0 * (
                0.4 * COALESCE(
                    1.0 * L / NULLIF(Lmax, 0), 0
                )
                + 0.6 * COALESCE(
                    R / NULLIF(Rmax, 0), 0
                )
            )
        END AS Diem
    FROM ChuanHoa
)
SELECT
    MaSach,
    TenSach,
    TheLoai,
    SoBanHienCo,
    L AS LuotMuon,
    CAST(R AS DECIMAL(18, 2)) AS LuotMuonTrenBan,
    CAST(Diem AS DECIMAL(10, 2)) AS DiemUuTien
FROM TinhDiem
ORDER BY
    CASE WHEN Diem IS NULL THEN 1 ELSE 0 END,
    Diem DESC,
    L DESC,
    MaSach ASC;
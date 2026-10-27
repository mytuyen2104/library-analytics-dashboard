/*
  Library Analytics Dashboard - Nhom 4
  SQL Server schema for the FOUR shared synthetic CSV files.
  Encoding: UTF-8. Run in SQL Server Management Studio (SSMS).
  IMPORTANT: This file creates tables only; it does NOT import CSV data.
  CSV import order: Sach, DocGia, MuonTra, TruyCapDienTu.
*/

IF DB_ID(N'LibraryAnalyticsDB') IS NULL
BEGIN
    CREATE DATABASE LibraryAnalyticsDB;
END;
GO

USE LibraryAnalyticsDB;
GO

-- 1. Sach: 120 book titles in the current sample.
IF OBJECT_ID(N'dbo.Sach', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Sach (
        MaSach        VARCHAR(10)   NOT NULL,
        TenSach       NVARCHAR(255) NOT NULL,
        TacGia        NVARCHAR(150) NULL,
        TheLoai       NVARCHAR(100) NOT NULL,
        SoBanHienCo   INT           NOT NULL,
        NamXuatBan    INT           NULL,
        CONSTRAINT PK_Sach PRIMARY KEY (MaSach),
        CONSTRAINT CK_Sach_SoBan CHECK (SoBanHienCo >= 0),
        CONSTRAINT CK_Sach_Nam CHECK (NamXuatBan IS NULL OR NamXuatBan BETWEEN 1000 AND 2100)
    );
END;
GO

-- 2. DocGia: 80 synthetic readers.
IF OBJECT_ID(N'dbo.DocGia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DocGia (
        MaDocGia     VARCHAR(10)  NOT NULL,
        LoaiDocGia   NVARCHAR(80) NOT NULL,
        NgayDangKy   DATE         NOT NULL,
        CONSTRAINT PK_DocGia PRIMARY KEY (MaDocGia)
    );
END;
GO

-- 3. MuonTra: 800 borrowing records, referencing Sach and DocGia.
IF OBJECT_ID(N'dbo.MuonTra', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MuonTra (
        MaMuon       VARCHAR(10)  NOT NULL,
        MaSach       VARCHAR(10)  NOT NULL,
        MaDocGia     VARCHAR(10)  NOT NULL,
        NgayMuon     DATE         NOT NULL,
        NgayTra      DATE         NULL,
        TrangThai    NVARCHAR(50) NOT NULL,
        CONSTRAINT PK_MuonTra PRIMARY KEY (MaMuon),
        CONSTRAINT FK_MuonTra_Sach FOREIGN KEY (MaSach) REFERENCES dbo.Sach(MaSach),
        CONSTRAINT FK_MuonTra_DocGia FOREIGN KEY (MaDocGia) REFERENCES dbo.DocGia(MaDocGia),
        CONSTRAINT CK_MuonTra_Ngay CHECK (NgayTra IS NULL OR NgayTra >= NgayMuon)
    );
END;
GO

-- 4. TruyCapDienTu: 500 records of aggregated access counts.
IF OBJECT_ID(N'dbo.TruyCapDienTu', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TruyCapDienTu (
        MaTruyCap    VARCHAR(10)   NOT NULL,
        NgayTruyCap  DATE          NOT NULL,
        TenCSDL      NVARCHAR(150) NOT NULL,
        SoLuot       INT           NOT NULL,
        CONSTRAINT PK_TruyCapDienTu PRIMARY KEY (MaTruyCap),
        CONSTRAINT CK_TruyCapDienTu_SoLuot CHECK (SoLuot >= 0)
    );
END;
GO

-- Optional indexes for common dashboard filters and joins.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MuonTra_NgayMuon' AND object_id = OBJECT_ID(N'dbo.MuonTra'))
    CREATE INDEX IX_MuonTra_NgayMuon ON dbo.MuonTra (NgayMuon);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MuonTra_MaSach' AND object_id = OBJECT_ID(N'dbo.MuonTra'))
    CREATE INDEX IX_MuonTra_MaSach ON dbo.MuonTra (MaSach);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_TruyCap_Ngay_CSDL' AND object_id = OBJECT_ID(N'dbo.TruyCapDienTu'))
    CREATE INDEX IX_TruyCap_Ngay_CSDL ON dbo.TruyCapDienTu (NgayTruyCap, TenCSDL);
GO

-- After importing CSVs, run these checks. Expected: 120, 80, 800, 500.
SELECT N'Sach' AS Bang, COUNT(*) AS SoDong FROM dbo.Sach
UNION ALL SELECT N'DocGia', COUNT(*) FROM dbo.DocGia
UNION ALL SELECT N'MuonTra', COUNT(*) FROM dbo.MuonTra
UNION ALL SELECT N'TruyCapDienTu', COUNT(*) FROM dbo.TruyCapDienTu;
GO

SELECT TOP 10 
    s.MaSach,
    s.TenSach,
    s.TacGia,
    mt.MaMuon,
    mt.MaDocGia,
    mt.NgayMuon,
    mt.NgayTra,
    mt.TrangThai
FROM dbo.Sach s
INNER JOIN dbo.MuonTra mt ON s.MaSach = mt.MaSach;
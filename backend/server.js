require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const HISTORY_FILE = path.join(__dirname, 'inventory-history.json');

// Hàm đọc lịch sử nhập kho từ file JSON
function readInventoryHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

// Hàm ghi thêm 1 dòng lịch sử nhập kho
function appendInventoryHistory(entry) {
  const history = readInventoryHistory();
  history.unshift(entry);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

// Hàm sinh mã tự động VARCHAR(10) tiếp theo (VD: M0802, S0121, DG0081)
async function generateNextId(pool, tableName, idColumn, prefix) {
  const prefixLen = prefix.length;
  const result = await pool.request().query(`
    SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(LTRIM(RTRIM(${idColumn})), ${prefixLen + 1}, 20) AS INT)), 0) AS maxNum
    FROM dbo.${tableName}
    WHERE LTRIM(RTRIM(${idColumn})) LIKE '${prefix}[0-9]%'
      AND TRY_CAST(SUBSTRING(LTRIM(RTRIM(${idColumn})), ${prefixLen + 1}, 20) AS INT) IS NOT NULL
  `);
  const nextNum = (result.recordset[0]?.maxNum || 0) + 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

// ================= 1. API QUẢN LÝ KHO SÁCH (dbo.Sach) =================

// Lấy lịch sử thêm / nhập kho sách
app.get('/api/sach/lich-su', (req, res) => {
  res.json(readInventoryHistory());
});

// Lấy danh sách sách trong kho
app.get('/api/sach', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('search', sql.NVarChar, `%${search}%`)
      .query(`
        SELECT MaSach, TenSach, TacGia, TheLoai, SoBanHienCo, NamXuatBan
        FROM dbo.Sach
        WHERE TenSach LIKE @search OR MaSach LIKE @search OR TacGia LIKE @search
        ORDER BY MaSach DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm đầu sách mới vào kho
app.post('/api/sach', async (req, res) => {
  try {
    const { MaSach, TenSach, TacGia, TheLoai, SoBanHienCo, NamXuatBan } = req.body;
    const pool = await sql.connect(dbConfig);
    const finalMaSach = MaSach?.trim() || await generateNextId(pool, 'Sach', 'MaSach', 'S');

    await pool.request()
      .input('MaSach', sql.VarChar(10), finalMaSach)
      .input('TenSach', sql.NVarChar(255), TenSach)
      .input('TacGia', sql.NVarChar(150), TacGia || null)
      .input('TheLoai', sql.NVarChar(100), TheLoai)
      .input('SoBanHienCo', sql.Int, Number(SoBanHienCo))
      .input('NamXuatBan', sql.Int, NamXuatBan ? Number(NamXuatBan) : null)
      .query(`
        INSERT INTO dbo.Sach (MaSach, TenSach, TacGia, TheLoai, SoBanHienCo, NamXuatBan)
        VALUES (@MaSach, @TenSach, @TacGia, @TheLoai, @SoBanHienCo, @NamXuatBan)
      `);

    appendInventoryHistory({
      id: Date.now(),
      thoiGian: new Date().toLocaleString('vi-VN'),
      loaiHanhDong: 'Thêm đầu sách mới',
      maSach: finalMaSach,
      tenSach: TenSach,
      soLuongThem: Number(SoBanHienCo),
      tonSauNhap: Number(SoBanHienCo),
    });

    res.json({ message: 'Thêm sách mới vào kho thành công!', MaSach: finalMaSach });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nhập bổ sung số lượng cho sách có sẵn
app.put('/api/sach/:maSach/nhap-kho', async (req, res) => {
  try {
    const { maSach } = req.params;
    const { soLuongThem } = req.body;
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('MaSach', sql.VarChar(10), maSach)
      .input('SoLuongThem', sql.Int, Number(soLuongThem))
      .query(`
        UPDATE dbo.Sach
        SET SoBanHienCo = SoBanHienCo + @SoLuongThem
        WHERE MaSach = @MaSach
      `);

    const infoRes = await pool.request()
      .input('MaSach', sql.VarChar(10), maSach)
      .query(`SELECT TenSach, SoBanHienCo FROM dbo.Sach WHERE MaSach = @MaSach`);

    if (infoRes.recordset.length > 0) {
      appendInventoryHistory({
        id: Date.now(),
        thoiGian: new Date().toLocaleString('vi-VN'),
        loaiHanhDong: 'Nhập bổ sung kho',
        maSach,
        tenSach: infoRes.recordset[0].TenSach,
        soLuongThem: Number(soLuongThem),
        tonSauNhap: infoRes.recordset[0].SoBanHienCo,
      });
    }

    res.json({ message: 'Cập nhật số lượng kho thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= 2. API QUẢN LÝ MƯỢN / TRẢ (dbo.MuonTra + dbo.DocGia) =================

app.get('/api/doc-gia', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT MaDocGia, LoaiDocGia, CONVERT(varchar(10), NgayDangKy, 23) AS NgayDangKy
      FROM dbo.DocGia
      ORDER BY MaDocGia ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/muon-tra', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('search', sql.NVarChar, `%${search}%`)
      .query(`
        SELECT 
          m.MaMuon, m.MaSach, s.TenSach, 
          m.MaDocGia, d.LoaiDocGia,
          CONVERT(varchar(10), m.NgayMuon, 23) AS NgayMuon,
          CONVERT(varchar(10), m.NgayTra, 23) AS NgayTra,
          m.TrangThai
        FROM dbo.MuonTra m
        JOIN dbo.Sach s ON m.MaSach = s.MaSach
        JOIN dbo.DocGia d ON m.MaDocGia = d.MaDocGia
        WHERE m.MaDocGia LIKE @search 
           OR m.MaMuon LIKE @search 
           OR s.TenSach LIKE @search
        ORDER BY m.NgayMuon DESC, m.MaMuon DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/muon-tra', async (req, res) => {
  const { MaDocGia, LoaiDocGia = 'Sinh viên', MaSach, NgayMuon } = req.body;
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const sachRes = await new sql.Request(transaction)
      .input('MaSach', sql.VarChar(10), MaSach)
      .query(`SELECT SoBanHienCo, TenSach FROM dbo.Sach WHERE MaSach = @MaSach`);

    if (sachRes.recordset.length === 0) throw new Error('Không tìm thấy mã sách!');
    if (sachRes.recordset[0].SoBanHienCo <= 0) throw new Error('Sách này đã hết trong kho!');

    const finalMaDocGia = MaDocGia.trim().toUpperCase();
    const dgRes = await new sql.Request(transaction)
      .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
      .query(`SELECT MaDocGia, LoaiDocGia FROM dbo.DocGia WHERE MaDocGia = @MaDocGia`);

    if (dgRes.recordset.length === 0) {
      await new sql.Request(transaction)
        .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
        .input('LoaiDocGia', sql.NVarChar(80), LoaiDocGia)
        .query(`
          INSERT INTO dbo.DocGia (MaDocGia, LoaiDocGia, NgayDangKy)
          VALUES (@MaDocGia, @LoaiDocGia, CAST(GETDATE() AS DATE))
        `);
    }

    const maMuon = await generateNextId(pool, 'MuonTra', 'MaMuon', 'M');
    const finalNgayMuon = NgayMuon || new Date().toISOString().split('T')[0];

    await new sql.Request(transaction)
      .input('MaMuon', sql.VarChar(10), maMuon)
      .input('MaSach', sql.VarChar(10), MaSach)
      .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
      .input('NgayMuon', sql.Date, finalNgayMuon)
      .query(`
        INSERT INTO dbo.MuonTra (MaMuon, MaSach, MaDocGia, NgayMuon, NgayTra, TrangThai)
        VALUES (@MaMuon, @MaSach, @MaDocGia, @NgayMuon, NULL, N'Đang mượn')
      `);

    await new sql.Request(transaction)
      .input('MaSach', sql.VarChar(10), MaSach)
      .query(`UPDATE dbo.Sach SET SoBanHienCo = SoBanHienCo - 1 WHERE MaSach = @MaSach`);

    await transaction.commit();
    res.json({
      message: 'Tạo phiếu mượn thành công!',
      phieuMuon: {
        MaMuon: maMuon,
        MaSach,
        TenSach: sachRes.recordset[0].TenSach,
        MaDocGia: finalMaDocGia,
        LoaiDocGia: dgRes.recordset[0]?.LoaiDocGia || LoaiDocGia,
        NgayMuon: finalNgayMuon,
      },
    });
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/muon-tra/:maMuon/tra-sach', async (req, res) => {
  const { maMuon } = req.params;
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const phieuRes = await new sql.Request(transaction)
      .input('MaMuon', sql.VarChar(10), maMuon)
      .query(`SELECT MaSach, TrangThai, NgayMuon FROM dbo.MuonTra WHERE MaMuon = @MaMuon`);

    if (phieuRes.recordset.length === 0) throw new Error('Không tìm thấy phiếu mượn!');
    const phieu = phieuRes.recordset[0];
    if (phieu.TrangThai === 'Đã trả') throw new Error('Phiếu này đã được trả trước đó!');

    await new sql.Request(transaction)
      .input('MaMuon', sql.VarChar(10), maMuon)
      .query(`
        UPDATE dbo.MuonTra
        SET TrangThai = N'Đã trả',
            NgayTra = CASE WHEN CAST(GETDATE() AS DATE) < NgayMuon THEN NgayMuon ELSE CAST(GETDATE() AS DATE) END
        WHERE MaMuon = @MaMuon
      `);

    await new sql.Request(transaction)
      .input('MaSach', sql.VarChar(10), phieu.MaSach)
      .query(`UPDATE dbo.Sach SET SoBanHienCo = SoBanHienCo + 1 WHERE MaSach = @MaSach`);

    await transaction.commit();
    res.json({ message: 'Đã trả sách và cập nhật lại số lượng trong kho!' });
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ error: err.message });
  }
});
// Xóa toàn bộ lịch sử nhập kho
app.delete('/api/sach/lich-su', (req, res) => {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf8');
    res.json({ message: 'Đã xóa toàn bộ lịch sử nhập kho!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa 1 dòng lịch sử theo id
app.delete('/api/sach/lich-su/:id', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const history = readInventoryHistory().filter((item) => item.id !== targetId);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
    res.json({ message: 'Đã xóa mục lịch sử!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Library API running on port ${PORT}`));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// ================= 3. API TRỢ LÝ AI HỎI ĐÁP DỮ LIỆU (GEMINI TEXT-TO-SQL) =================



let cachedWorkingModel = null;

async function getAvailableGeminiModel() {
  if (cachedWorkingModel) return cachedWorkingModel;

  const pager = await ai.models.list();
  const availableModels = [];
  for await (const m of pager) {
    const name = m.name.replace(/^models\//, '');
    if (
      name.includes('gemini') &&
      !name.includes('embedding') &&
      !name.includes('imagen') &&
      !name.includes('image') &&
      !name.includes('2.5') &&
      !name.includes('2.0')
    ) {
      availableModels.push(name);
    }
  }

  // Ưu tiên chọn bản flash-lite mới nhất (tốc độ phản hồi < 1 giây)
  const preferred =
    availableModels.find((n) => n === 'gemini-3.5-flash-lite') ||
    availableModels.find((n) => n.includes('flash-lite')) ||
    availableModels.find((n) => n === 'gemini-3.5-flash') ||
    availableModels.find((n) => n.includes('flash')) ||
    availableModels[0];

  cachedWorkingModel = preferred;
  console.log('✅ Đã chọn model siêu tốc:', cachedWorkingModel);
  return cachedWorkingModel;
}

async function callGeminiSafe(promptText) {
  const modelName = await getAvailableGeminiModel();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout sau 25s với ${modelName}`)), 25000)
  );

  const apiPromise = ai.models.generateContent({
    model: modelName,
    contents: promptText,
    config: {
      temperature: 0.1,
    },
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  return response.text;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ reply: 'Vui lòng nhập câu hỏi của bạn.' });
    }

    console.log('📩 Nhận câu hỏi:', message);

    const decisionPrompt = `
Bạn là trợ lý ảo thông minh của Thư viện Trường ĐH Giao thông vận tải TP.HCM (UTH).
Hệ thống có CSDL LibraryAnalyticsDB gồm 4 bảng:
1. dbo.Sach (MaSach, TenSach, TacGia, TheLoai, SoBanHienCo, NamXuatBan)
   - Thể loại: N'Công nghệ thông tin', N'Luật', N'Quản trị', N'Văn học', N'Khoa học cơ bản', N'Kỹ thuật', N'Ngoại ngữ', N'Kinh tế'.
2. dbo.DocGia (MaDocGia, LoaiDocGia, NgayDangKy)
3. dbo.MuonTra (MaMuon, MaSach, MaDocGia, NgayMuon, NgayTra, TrangThai) — TrangThai: N'Đã trả', N'Chưa trả', N'Đang mượn'.
4. dbo.TruyCapDienTu (MaTruyCap, NgayTruyCap, TenCSDL, SoLuot) — TenCSDL: 'SpringerLink', 'ProQuest', 'EBSCO', 'ScienceDirect', 'ACM Digital Library', 'IEEE Xplore'.

Nhiệm vụ:
- Nếu câu hỏi KHÔNG liên quan đến tra cứu dữ liệu thư viện (chào hỏi, phép tính toán học, hỏi chức năng...), trả lời thẳng bắt đầu bằng "CHAT: " (ví dụ: "CHAT: 1 + 1 = 2. Tôi có thể giúp gì cho bạn về dữ liệu thư viện?").
- Nếu câu hỏi CẦN tra cứu dữ liệu trong CSDL thư viện, chỉ trả về DUY NHẤT 1 câu lệnh T-SQL SELECT hợp lệ (dùng TOP, luôn thêm tiền tố N trước chuỗi tiếng Việt có dấu, không giải thích, không bọc \`\`\`sql).

Câu hỏi người dùng: "${message}"
Phản hồi:`;

    const rawOutput = await callGeminiSafe(decisionPrompt);
    const cleanedOutput = rawOutput.replace(/```sql|```/gi, '').trim();
    console.log('🤖 AI phản hồi lượt 1:', cleanedOutput);

    // Trường hợp 1: Trả lời giao tiếp / câu hỏi chung
    if (cleanedOutput.toUpperCase().startsWith('CHAT:')) {
      return res.json({
        reply: cleanedOutput.replace(/^CHAT:\s*/i, '').trim(),
      });
    }

    // Trường hợp 2: Thực thi câu lệnh T-SQL SELECT
    const upperSql = cleanedOutput.toUpperCase();
    if (
      !upperSql.startsWith('SELECT') ||
      /\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|EXEC|MERGE)\b/.test(upperSql)
    ) {
      return res.json({
        reply: 'Xin lỗi, tôi chỉ hỗ trợ tra cứu dữ liệu đọc (SELECT) hoặc giải đáp thông tin chung của thư viện.',
      });
    }

    const pool = await sql.connect(dbConfig);
    const dbResult = await pool.request().query(cleanedOutput);
    const rows = dbResult.recordset;
    console.log(`📊 SQL trả về ${rows.length} dòng`);

    const finalReply = await callGeminiSafe(
      `Bạn là trợ lý ảo Thư viện ĐH Giao thông vận tải TP.HCM (UTH).
Người dùng hỏi: "${message}"
Kết quả dữ liệu thực tế: ${JSON.stringify(rows.slice(0, 15))}
Hãy trả lời ngắn gọn, rõ ràng, lịch sự bằng tiếng Việt (dùng gạch đầu dòng nếu liệt kê). Không nhắc đến JSON hay câu lệnh SQL.`
    );

    res.json({
      reply: finalReply,
      sqlDebug: cleanedOutput,
    });
  } catch (error) {
    console.error('❌ Lỗi Chat AI:', error);
    res.status(500).json({
      reply: `Lỗi kết nối AI: ${error.message}. Vui lòng kiểm tra lại GEMINI_API_KEY trong file .env hoặc đường truyền mạng!`,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Library API running on port ${PORT}`));
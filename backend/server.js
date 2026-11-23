require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const nodemailer = require('nodemailer');

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

// Cấu hình gửi email thông báo (Gmail SMTP)
const mailTransporter = (process.env.MAIL_USER && process.env.MAIL_PASS)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })
  : null;

// Hàm đồng bộ các phiếu chưa trả đã quá 60 ngày thành 'Quá hạn' và điền sẵn ngày hạn trả dự kiến nếu còn NULL
async function syncOverdueLoans(pool) {
  await pool.request().query(`
    UPDATE dbo.MuonTra
    SET NgayTra = DATEADD(DAY, 60, NgayMuon)
    WHERE TrangThai <> N'Đã trả' AND NgayTra IS NULL;

    UPDATE dbo.MuonTra
    SET TrangThai = N'Quá hạn'
    WHERE TrangThai IN (N'Chưa trả', N'Đang mượn')
      AND ISNULL(NgayTra, DATEADD(DAY, 60, NgayMuon)) < CAST(GETDATE() AS DATE);
  `);
}

// 1. Email thông báo cấp thẻ độc giả mới
async function sendReaderWelcomeEmail({ Email, MaDocGia, HoTen, MaSV_NV, LoaiDocGia, NgayDangKy }) {
  if (!mailTransporter || !Email) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email.trim())) {
    console.log(`⚠️ Bỏ qua gửi mail vì địa chỉ không đúng định dạng: ${Email}`);
    return;
  }

  const mailOptions = {
    from: `"Trung Tâm Thông Tin - Thư Viện UTH" <${process.env.MAIL_USER}>`,
    to: Email.trim(),
    subject: `[Thư viện UTH] Cấp thẻ độc giả thành công - Mã thẻ: ${MaDocGia}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #085750; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 18px;">TRUNG TÂM THÔNG TIN - THƯ VIỆN UTH</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Trường Đại học Giao thông vận tải TP. Hồ Chí Minh</p>
        </div>

        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <p>Xin chào <strong>${HoTen || 'Quý độc giả'}</strong>,</p>
          <p>Thẻ độc giả thư viện của bạn đã được đăng ký thành công trên hệ thống. Dưới đây là thông tin thẻ của bạn:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px;">
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 42%;">Mã thẻ độc giả:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #085750; font-size: 16px;">${MaDocGia}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Họ và tên:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${HoTen || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Mã SV / Mã NV:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">${MaSV_NV || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Đối tượng độc giả:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">${LoaiDocGia}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; color: #64748b;">Ngày đăng ký thẻ:</td>
              <td style="padding: 10px 14px;">${NgayDangKy}</td>
            </tr>
          </table>

          <div style="background: #EAF7F6; border-left: 4px solid #16877F; padding: 12px 14px; border-radius: 6px; font-size: 13px; color: #085750;">
            <strong>Quy định mượn trả tài liệu:</strong><br/>
            • Thời hạn mượn tiêu chuẩn là <strong>60 ngày</strong> kể từ ngày mượn.<br/>
            • Độc giả có tài liệu quá hạn chưa trả sẽ tạm khóa quyền mượn sách mới cho đến khi hoàn trả.
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 12px; color: #64748b;">
          Email này được gửi tự động từ Hệ thống Quản lý Thư viện UTH - Nhóm 4.
        </div>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email thông tin thẻ ${MaDocGia} tới ${Email}`);
  } catch (err) {
    console.error(`⚠️ Không thể gửi email tới ${Email}:`, err.message);
  }
}

// 2. Email xác nhận phiếu mượn sách (kèm ngày hẹn trả sau 60 ngày)
async function sendBorrowReceiptEmail({
  Email,
  MaMuon,
  MaDocGia,
  HoTen,
  MaSV_NV,
  LoaiDocGia,
  MaSach,
  TenSach,
  TacGia,
  TheLoai,
  NgayMuon,
  HanTra,
}) {
  if (!mailTransporter || !Email) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email.trim())) {
    console.log(`⚠️ Bỏ qua gửi mail phiếu mượn vì email không hợp lệ: ${Email}`);
    return;
  }

  const mailOptions = {
    from: `"Trung Tâm Thông Tin - Thư Viện UTH" <${process.env.MAIL_USER}>`,
    to: Email.trim(),
    subject: `[Thư viện UTH] Xác nhận mượn sách thành công - Phiếu ${MaMuon}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #085750; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 18px;">TRUNG TÂM THÔNG TIN - THƯ VIỆN UTH</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Biên nhận điện tử xác nhận giao dịch mượn tài liệu</p>
        </div>

        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <p>Xin chào <strong>${HoTen || 'Quý độc giả'}</strong>,</p>
          <p>Hệ thống thư viện ghi nhận bạn vừa thực hiện mượn tài liệu thành công với thông tin chi tiết sau:</p>

          <h4 style="margin: 18px 0 8px; color: #085750; font-size: 14px; text-transform: uppercase;">1. Thông tin độc giả</h4>
          <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px;">
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 42%;">Mã thẻ độc giả:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #085750;">${MaDocGia}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Họ và tên:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${HoTen || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Mã SV / Mã NV:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0;">${MaSV_NV || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; color: #64748b;">Đối tượng độc giả:</td>
              <td style="padding: 9px 14px;">${LoaiDocGia}</td>
            </tr>
          </table>

          <h4 style="margin: 18px 0 8px; color: #085750; font-size: 14px; text-transform: uppercase;">2. Thông tin tài liệu mượn</h4>
          <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px;">
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 42%;">Mã phiếu mượn:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #085750; font-size: 15px;">${MaMuon}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Mã sách:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${MaSach}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Tên sách:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${TenSach}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Tác giả / Thể loại:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0;">${TacGia || 'Đang cập nhật'} — ${TheLoai || ''}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Ngày mượn:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${NgayMuon}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Hạn trả dự kiến (60 ngày):</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #b91c1c;">${HanTra}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; color: #64748b;">Trạng thái:</td>
              <td style="padding: 9px 14px; color: #b45309; font-weight: 600;">Chưa trả</td>
            </tr>
          </table>

          <div style="margin-top: 16px; background: #EAF7F6; border-left: 4px solid #16877F; padding: 12px 14px; border-radius: 6px; font-size: 13px; color: #085750;">
            <strong>Lưu ý từ Thư viện UTH:</strong><br/>
            • Vui lòng hoàn trả sách trước hoặc đúng ngày <strong>${HanTra}</strong> (thời hạn 60 ngày).<br/>
            • Nếu quá hạn chưa trả, tài khoản độc giả sẽ bị <strong>tạm khóa quyền mượn sách mới</strong>.
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 12px; color: #64748b;">
          Email này được gửi tự động từ Hệ thống Quản lý Thư viện UTH - Nhóm 4.
        </div>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email biên nhận mượn sách (${MaMuon}) tới ${Email}`);
  } catch (err) {
    console.error(`⚠️ Không thể gửi email biên nhận tới ${Email}:`, err.message);
  }
}

// 3. Email xác nhận hoàn trả sách
async function sendReturnReceiptEmail({
  Email,
  MaMuon,
  MaDocGia,
  HoTen,
  MaSV_NV,
  LoaiDocGia,
  MaSach,
  TenSach,
  TacGia,
  TheLoai,
  NgayMuon,
  NgayTra,
}) {
  if (!mailTransporter || !Email) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email.trim())) {
    console.log(`⚠️ Bỏ qua gửi mail trả sách vì email không hợp lệ: ${Email}`);
    return;
  }

  const mailOptions = {
    from: `"Trung Tâm Thông Tin - Thư Viện UTH" <${process.env.MAIL_USER}>`,
    to: Email.trim(),
    subject: `[Thư viện UTH] Xác nhận hoàn trả sách thành công - Phiếu ${MaMuon}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #085750; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 18px;">TRUNG TÂM THÔNG TIN - THƯ VIỆN UTH</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Biên nhận điện tử xác nhận hoàn trả tài liệu</p>
        </div>

        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <p>Xin chào <strong>${HoTen || 'Quý độc giả'}</strong>,</p>
          <p>Thư viện xác nhận bạn đã <strong>hoàn trả tài liệu thành công</strong>. Chi tiết giao dịch như sau:</p>

          <h4 style="margin: 18px 0 8px; color: #085750; font-size: 14px; text-transform: uppercase;">1. Thông tin độc giả</h4>
          <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px;">
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 42%;">Mã thẻ độc giả:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #085750;">${MaDocGia}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Họ và tên:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${HoTen || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Mã SV / Mã NV:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0;">${MaSV_NV || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; color: #64748b;">Đối tượng độc giả:</td>
              <td style="padding: 9px 14px;">${LoaiDocGia}</td>
            </tr>
          </table>

          <h4 style="margin: 18px 0 8px; color: #085750; font-size: 14px; text-transform: uppercase;">2. Thông tin tài liệu đã trả</h4>
          <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px;">
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 42%;">Mã phiếu mượn:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #085750; font-size: 15px;">${MaMuon}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Mã sách:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${MaSach}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Tên sách:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${TenSach}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Tác giả / Thể loại:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0;">${TacGia || 'Đang cập nhật'} — ${TheLoai || ''}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Ngày mượn:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0;">${NgayMuon}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Ngày trả thực tế:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${NgayTra}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; color: #64748b;">Trạng thái:</td>
              <td style="padding: 9px 14px; color: #047857; font-weight: 700;">Đã trả</td>
            </tr>
          </table>

          <div style="margin-top: 16px; background: #EAF7F6; border-left: 4px solid #16877F; padding: 12px 14px; border-radius: 6px; font-size: 13px; color: #085750;">
            Cảm ơn bạn đã sử dụng dịch vụ của <strong>Trung tâm Thông tin - Thư viện UTH</strong>. Quyền mượn tài liệu của bạn luôn sẵn sàng cho những lần tiếp theo!
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 12px; color: #64748b;">
          Email này được gửi tự động từ Hệ thống Quản lý Thư viện UTH - Nhóm 4.
        </div>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email biên nhận trả sách (${MaMuon}) tới ${Email}`);
  } catch (err) {
    console.error(`⚠️ Không thể gửi email trả sách tới ${Email}:`, err.message);
  }
}

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

// ================= 2. API QUẢN LÝ ĐỘC GIẢ (dbo.DocGia) =================

// Lấy danh sách độc giả kèm thống kê số lượt mượn, số sách quá hạn & tìm kiếm
app.get('/api/doc-gia', async (req, res) => {
  try {
    const { search = '', loai = '' } = req.query;
    const pool = await sql.connect(dbConfig);
    await syncOverdueLoans(pool);

    const result = await pool.request()
      .input('search', sql.NVarChar, `%${search}%`)
      .input('loai', sql.NVarChar, loai)
      .query(`
        SELECT 
          d.MaDocGia, 
          d.HoTen,
          d.MaSV_NV,
          d.Email,
          d.SoDienThoai,
          d.LoaiDocGia, 
          CONVERT(varchar(10), d.NgayDangKy, 23) AS NgayDangKy,
          COUNT(m.MaMuon) AS TongLuotMuon,
          SUM(CASE WHEN m.TrangThai IN (N'Đang mượn', N'Chưa trả', N'Quá hạn') THEN 1 ELSE 0 END) AS DangMuon,
          SUM(CASE WHEN m.TrangThai = N'Quá hạn' THEN 1 ELSE 0 END) AS QuaHan
        FROM dbo.DocGia d
        LEFT JOIN dbo.MuonTra m ON d.MaDocGia = m.MaDocGia
        WHERE (
            d.MaDocGia LIKE @search 
            OR d.LoaiDocGia LIKE @search
            OR ISNULL(d.HoTen, N'') LIKE @search
            OR ISNULL(d.MaSV_NV, '') LIKE @search
            OR ISNULL(d.Email, '') LIKE @search
            OR ISNULL(d.SoDienThoai, '') LIKE @search
          )
          AND (@loai = '' OR d.LoaiDocGia = @loai)
        GROUP BY d.MaDocGia, d.HoTen, d.MaSV_NV, d.Email, d.SoDienThoai, d.LoaiDocGia, d.NgayDangKy
        ORDER BY d.NgayDangKy DESC, CASE WHEN d.HoTen IS NOT NULL THEN 0 ELSE 1 END, d.MaDocGia DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm độc giả mới (tự sinh mã DGxxxx nếu bỏ trống, kiểm tra trùng Mã SV/NV & SĐT)
app.post('/api/doc-gia', async (req, res) => {
  try {
    const {
      MaDocGia,
      HoTen,
      MaSV_NV,
      Email,
      SoDienThoai,
      LoaiDocGia = 'Sinh viên',
      NgayDangKy,
    } = req.body;
    const pool = await sql.connect(dbConfig);
    const finalMaDocGia = MaDocGia?.trim().toUpperCase() || await generateNextId(pool, 'DocGia', 'MaDocGia', 'DG');
    const finalNgayDangKy = NgayDangKy || new Date().toISOString().split('T')[0];

    const checkExist = await pool.request()
      .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
      .query(`SELECT MaDocGia FROM dbo.DocGia WHERE MaDocGia = @MaDocGia`);

    if (checkExist.recordset.length > 0) {
      return res.status(400).json({ error: `Mã độc giả ${finalMaDocGia} đã tồn tại!` });
    }

    // Kiểm tra trùng Mã SV/NV hoặc Số điện thoại (cho phép trùng Họ tên & Email để tiện test gửi mail)
    const duplicateCheck = await pool.request()
      .input('MaSV_NV', sql.VarChar(20), MaSV_NV?.trim() || null)
      .input('SoDienThoai', sql.VarChar(15), SoDienThoai?.trim() || null)
      .query(`
        SELECT TOP 1 MaDocGia, MaSV_NV, SoDienThoai
        FROM dbo.DocGia
        WHERE (@MaSV_NV IS NOT NULL AND MaSV_NV = @MaSV_NV)
           OR (@SoDienThoai IS NOT NULL AND SoDienThoai = @SoDienThoai)
      `);

    if (duplicateCheck.recordset.length > 0) {
      const dup = duplicateCheck.recordset[0];
      if (MaSV_NV?.trim() && dup.MaSV_NV === MaSV_NV.trim()) {
        return res.status(400).json({
          error: `Mã SV/NV "${MaSV_NV.trim()}" đã được đăng ký cho thẻ độc giả ${dup.MaDocGia}!`,
        });
      }
      if (SoDienThoai?.trim() && dup.SoDienThoai === SoDienThoai.trim()) {
        return res.status(400).json({
          error: `Số điện thoại "${SoDienThoai.trim()}" đã thuộc về thẻ độc giả ${dup.MaDocGia}!`,
        });
      }
    }

    await pool.request()
      .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
      .input('HoTen', sql.NVarChar(100), HoTen?.trim() || null)
      .input('MaSV_NV', sql.VarChar(20), MaSV_NV?.trim() || null)
      .input('Email', sql.VarChar(100), Email?.trim() || null)
      .input('SoDienThoai', sql.VarChar(15), SoDienThoai?.trim() || null)
      .input('LoaiDocGia', sql.NVarChar(80), LoaiDocGia)
      .input('NgayDangKy', sql.Date, finalNgayDangKy)
      .query(`
        INSERT INTO dbo.DocGia (MaDocGia, HoTen, MaSV_NV, Email, SoDienThoai, LoaiDocGia, NgayDangKy)
        VALUES (@MaDocGia, @HoTen, @MaSV_NV, @Email, @SoDienThoai, @LoaiDocGia, @NgayDangKy)
      `);

    if (Email?.trim()) {
      sendReaderWelcomeEmail({
        Email: Email.trim(),
        MaDocGia: finalMaDocGia,
        HoTen: HoTen?.trim() || null,
        MaSV_NV: MaSV_NV?.trim() || null,
        LoaiDocGia,
        NgayDangKy: finalNgayDangKy,
      });
    }

    res.json({
      message: Email?.trim()
        ? `Thêm độc giả ${finalMaDocGia} thành công! (Đã gửi thông tin thẻ tới ${Email.trim()})`
        : 'Thêm độc giả mới thành công!',
      MaDocGia: finalMaDocGia,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật thông tin độc giả (kiểm tra trùng Mã SV/NV & SĐT với các thẻ khác)
app.put('/api/doc-gia/:maDocGia', async (req, res) => {
  try {
    const { maDocGia } = req.params;
    const { HoTen, MaSV_NV, Email, SoDienThoai, LoaiDocGia, NgayDangKy } = req.body;
    const pool = await sql.connect(dbConfig);

    const duplicateCheck = await pool.request()
      .input('MaDocGia', sql.VarChar(10), maDocGia)
      .input('MaSV_NV', sql.VarChar(20), MaSV_NV?.trim() || null)
      .input('SoDienThoai', sql.VarChar(15), SoDienThoai?.trim() || null)
      .query(`
        SELECT TOP 1 MaDocGia, MaSV_NV, SoDienThoai
        FROM dbo.DocGia
        WHERE MaDocGia <> @MaDocGia
          AND (
            (@MaSV_NV IS NOT NULL AND MaSV_NV = @MaSV_NV)
            OR (@SoDienThoai IS NOT NULL AND SoDienThoai = @SoDienThoai)
          )
      `);

    if (duplicateCheck.recordset.length > 0) {
      const dup = duplicateCheck.recordset[0];
      if (MaSV_NV?.trim() && dup.MaSV_NV === MaSV_NV.trim()) {
        return res.status(400).json({
          error: `Mã SV/NV "${MaSV_NV.trim()}" đã thuộc về độc giả ${dup.MaDocGia}!`,
        });
      }
      if (SoDienThoai?.trim() && dup.SoDienThoai === SoDienThoai.trim()) {
        return res.status(400).json({
          error: `Số điện thoại "${SoDienThoai.trim()}" đã thuộc về độc giả ${dup.MaDocGia}!`,
        });
      }
    }

    await pool.request()
      .input('MaDocGia', sql.VarChar(10), maDocGia)
      .input('HoTen', sql.NVarChar(100), HoTen?.trim() || null)
      .input('MaSV_NV', sql.VarChar(20), MaSV_NV?.trim() || null)
      .input('Email', sql.VarChar(100), Email?.trim() || null)
      .input('SoDienThoai', sql.VarChar(15), SoDienThoai?.trim() || null)
      .input('LoaiDocGia', sql.NVarChar(80), LoaiDocGia)
      .input('NgayDangKy', sql.Date, NgayDangKy)
      .query(`
        UPDATE dbo.DocGia
        SET HoTen = @HoTen,
            MaSV_NV = @MaSV_NV,
            Email = @Email,
            SoDienThoai = @SoDienThoai,
            LoaiDocGia = @LoaiDocGia,
            NgayDangKy = @NgayDangKy
        WHERE MaDocGia = @MaDocGia
      `);

    res.json({ message: 'Cập nhật thông tin độc giả thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy lịch sử mượn trả chi tiết của 1 độc giả (tự đồng bộ hạn trả 60 ngày & trạng thái Quá hạn)
app.get('/api/doc-gia/:maDocGia/lich-su', async (req, res) => {
  try {
    const { maDocGia } = req.params;
    const pool = await sql.connect(dbConfig);
    await syncOverdueLoans(pool);

    const result = await pool.request()
      .input('MaDocGia', sql.VarChar(10), maDocGia)
      .query(`
        SELECT 
          m.MaMuon, m.MaSach, s.TenSach, s.TheLoai,
          CONVERT(varchar(10), m.NgayMuon, 23) AS NgayMuon,
          CONVERT(varchar(10), ISNULL(m.NgayTra, DATEADD(DAY, 60, m.NgayMuon)), 23) AS NgayTra,
          CASE 
            WHEN m.TrangThai = N'Đã trả' THEN N'Đã trả'
            WHEN ISNULL(m.NgayTra, DATEADD(DAY, 60, m.NgayMuon)) < CAST(GETDATE() AS DATE) THEN N'Quá hạn'
            ELSE m.TrangThai
          END AS TrangThai
        FROM dbo.MuonTra m
        JOIN dbo.Sach s ON m.MaSach = s.MaSach
        WHERE m.MaDocGia = @MaDocGia
        ORDER BY m.NgayMuon DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa độc giả (cho phép xóa nếu độc giả không còn giữ sách chưa trả)
app.delete('/api/doc-gia/:maDocGia', async (req, res) => {
  const { maDocGia } = req.params;
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 1. Kiểm tra xem độc giả còn giữ cuốn sách nào chưa trả không
    const checkLoans = await new sql.Request(transaction)
      .input('MaDocGia', sql.VarChar(10), maDocGia)
      .query(`
        SELECT 
          COUNT(*) AS TongGiaoDich,
          SUM(CASE WHEN TrangThai <> N'Đã trả' THEN 1 ELSE 0 END) AS DangGiu
        FROM dbo.MuonTra
        WHERE MaDocGia = @MaDocGia
      `);

    const { TongGiaoDich, DangGiu } = checkLoans.recordset[0];

    if (Number(DangGiu) > 0) {
      await transaction.rollback();
      return res.status(400).json({
        error: `Không thể xóa độc giả ${maDocGia} vì đang giữ ${DangGiu} cuốn sách chưa trả!`,
      });
    }

    // 2. Xóa các phiếu mượn cũ đã trả trong dbo.MuonTra trước để không vướng khóa ngoại
    if (Number(TongGiaoDich) > 0) {
      await new sql.Request(transaction)
        .input('MaDocGia', sql.VarChar(10), maDocGia)
        .query(`DELETE FROM dbo.MuonTra WHERE MaDocGia = @MaDocGia`);
    }

    // 3. Xóa thẻ độc giả trong dbo.DocGia
    await new sql.Request(transaction)
      .input('MaDocGia', sql.VarChar(10), maDocGia)
      .query(`DELETE FROM dbo.DocGia WHERE MaDocGia = @MaDocGia`);

    await transaction.commit();

    res.json({
      message: Number(TongGiaoDich) > 0
        ? `Đã xóa thẻ độc giả ${maDocGia} cùng ${TongGiaoDich} lịch sử phiếu đã trả thành công!`
        : `Đã xóa thẻ độc giả ${maDocGia} thành công!`,
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: err.message });
  }
});

// Gửi email nhắc hạn trả sách / cảnh báo quá hạn cho độc giả
app.post('/api/doc-gia/:maDocGia/nhac-han', async (req, res) => {
  try {
    const { maDocGia } = req.params;
    const pool = await sql.connect(dbConfig);
    await syncOverdueLoans(pool);

    // 1. Lấy thông tin độc giả
    const dgRes = await pool.request()
      .input('MaDocGia', sql.VarChar(10), maDocGia)
      .query(`
        SELECT MaDocGia, HoTen, MaSV_NV, Email, LoaiDocGia
        FROM dbo.DocGia
        WHERE MaDocGia = @MaDocGia
      `);

    if (dgRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy độc giả!' });
    }

    const reader = dgRes.recordset[0];
    if (!reader.Email || !reader.Email.trim()) {
      return res.status(400).json({
        error: `Độc giả ${maDocGia} chưa cập nhật địa chỉ Email nên không thể gửi thông báo!`,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reader.Email.trim())) {
      return res.status(400).json({
        error: `Địa chỉ email "${reader.Email}" không đúng định dạng hợp lệ!`,
      });
    }

    // 2. Lấy danh sách các cuốn sách độc giả đang giữ (chưa trả & quá hạn)
    const loansRes = await pool.request()
      .input('MaDocGia', sql.VarChar(10), maDocGia)
      .query(`
        SELECT 
          m.MaMuon,
          m.MaSach,
          s.TenSach,
          CONVERT(varchar(10), m.NgayMuon, 23) AS NgayMuon,
          CONVERT(varchar(10), ISNULL(m.NgayTra, DATEADD(DAY, 60, m.NgayMuon)), 23) AS HanTra,
          CASE 
            WHEN ISNULL(m.NgayTra, DATEADD(DAY, 60, m.NgayMuon)) < CAST(GETDATE() AS DATE) THEN N'Quá hạn'
            ELSE N'Còn hạn'
          END AS TinhTrang
        FROM dbo.MuonTra m
        JOIN dbo.Sach s ON m.MaSach = s.MaSach
        WHERE m.MaDocGia = @MaDocGia
          AND m.TrangThai <> N'Đã trả'
        ORDER BY m.NgayMuon ASC
      `);

    const activeLoans = loansRes.recordset;
    if (activeLoans.length === 0) {
      return res.status(400).json({
        error: `Độc giả ${maDocGia} hiện không giữ cuốn sách nào cần nhắc hạn!`,
      });
    }

    if (!mailTransporter) {
      return res.status(500).json({
        error: 'Hệ thống chưa cấu hình MAIL_USER / MAIL_PASS trong file .env!',
      });
    }

    const hasOverdue = activeLoans.some((item) => item.TinhTrang === 'Quá hạn');
    const headerBg = hasOverdue ? '#991b1b' : '#085750';
    const subjectPrefix = hasOverdue
      ? `[KHẨN - Thư viện UTH] Thông báo SÁCH QUÁ HẠN trả - Mã thẻ: ${maDocGia}`
      : `[Thư viện UTH] Nhắc nhở thời hạn hoàn trả tài liệu - Mã thẻ: ${maDocGia}`;

    const rowsHtml = activeLoans
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${item.MaMuon}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${item.TenSach} (${item.MaSach})</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${item.NgayMuon}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${item.HanTra}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: ${
            item.TinhTrang === 'Quá hạn' ? '#dc2626' : '#047857'
          };">${item.TinhTrang}</td>
        </tr>
      `
      )
      .join('');

    await mailTransporter.sendMail({
      from: `"Trung Tâm Thông Tin - Thư Viện UTH" <${process.env.MAIL_USER}>`,
      to: reader.Email.trim(),
      subject: subjectPrefix,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: ${headerBg}; color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 18px;">TRUNG TÂM THÔNG TIN - THƯ VIỆN UTH</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.92;">
              ${hasOverdue ? 'Thông báo quá hạn hoàn trả tài liệu & tạm khóa quyền mượn' : 'Thông báo nhắc nhở thời hạn hoàn trả tài liệu'}
            </p>
          </div>

          <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
            <p>Xin chào <strong>${reader.HoTen || 'Quý độc giả'}</strong> (Mã thẻ: <strong>${maDocGia}</strong>),</p>
            <p>
              ${
                hasOverdue
                  ? 'Hệ thống thư viện ghi nhận bạn hiện có <strong>tài liệu đã quá thời hạn trả (60 ngày)</strong> và tài khoản độc giả đang tạm khóa quyền mượn mới:'
                  : 'Thư viện xin gửi thông tin chi tiết các tài liệu bạn đang mượn để bạn chủ động sắp xếp thời gian hoàn trả đúng hạn:'
              }
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; background: #f8fafc;">
              <thead>
                <tr style="background: #e2e8f0; text-align: left; color: #334155;">
                  <th style="padding: 9px 10px;">Mã Phiếu</th>
                  <th style="padding: 9px 10px;">Tên Tài Liệu</th>
                  <th style="padding: 9px 10px;">Ngày Mượn</th>
                  <th style="padding: 9px 10px;">Hạn Trả</th>
                  <th style="padding: 9px 10px;">Tình Trạng</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div style="background: ${hasOverdue ? '#fef2f2' : '#EAF7F6'}; border-left: 4px solid ${
              hasOverdue ? '#dc2626' : '#16877F'
            }; padding: 12px 14px; border-radius: 6px; font-size: 13px; color: ${
              hasOverdue ? '#991b1b' : '#085750'
            };">
              ${
                hasOverdue
                  ? '<strong>Yêu cầu xử lý:</strong> Vui lòng mang các tài liệu quá hạn đến quầy thủ thư UTH để hoàn trả sớm nhất nhằm mở lại quyền mượn sách.'
                  : '<strong>Lưu ý:</strong> Thời hạn mượn tiêu chuẩn là 60 ngày kể từ ngày mượn. Vui lòng hoàn trả đúng hạn tại quầy thủ thư UTH.'
              }
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 12px; color: #64748b;">
            Email này được gửi tự động từ Hệ thống Quản lý Thư viện UTH - Nhóm 4.
          </div>
        </div>
      `,
    });

    res.json({
      message: `Đã gửi email ${hasOverdue ? 'cảnh báo quá hạn' : 'nhắc hạn trả sách'} tới ${reader.Email.trim()} (${maDocGia})!`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= 3. API QUẢN LÝ MƯỢN / TRẢ (dbo.MuonTra) =================

// Lấy danh sách phiếu mượn trả (hiện rõ ngày trả dự kiến 60 ngày / ngày đã trả & trạng thái Quá hạn)
app.get('/api/muon-tra', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const pool = await sql.connect(dbConfig);
    await syncOverdueLoans(pool);

    const result = await pool.request()
      .input('search', sql.NVarChar, `%${search}%`)
      .query(`
        SELECT 
          m.MaMuon, m.MaSach, s.TenSach, 
          m.MaDocGia, d.LoaiDocGia,
          CONVERT(varchar(10), m.NgayMuon, 23) AS NgayMuon,
          CONVERT(varchar(10), ISNULL(m.NgayTra, DATEADD(DAY, 60, m.NgayMuon)), 23) AS NgayTra,
          CASE 
            WHEN m.TrangThai = N'Đã trả' THEN N'Đã trả'
            WHEN ISNULL(m.NgayTra, DATEADD(DAY, 60, m.NgayMuon)) < CAST(GETDATE() AS DATE) THEN N'Quá hạn'
            ELSE m.TrangThai
          END AS TrangThai
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

// Tạo phiếu mượn mới (Khóa mượn nếu có sách quá hạn 60 ngày chưa trả, tự gán hạn trả = NgayMuon + 60 ngày)
app.post('/api/muon-tra', async (req, res) => {
  const { MaDocGia, LoaiDocGia = 'Sinh viên', MaSach, NgayMuon } = req.body;
  const pool = await sql.connect(dbConfig);
  await syncOverdueLoans(pool);

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const finalMaDocGia = MaDocGia.trim().toUpperCase();

    // 1. Kiểm tra độc giả có phiếu mượn nào quá hạn 60 ngày chưa trả không
    const overdueRes = await new sql.Request(transaction)
      .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
      .query(`
        SELECT TOP 1 
          m.MaMuon, 
          s.TenSach, 
          CONVERT(varchar(10), ISNULL(m.NgayTra, DATEADD(DAY, 60, m.NgayMuon)), 23) AS HanTra
        FROM dbo.MuonTra m
        JOIN dbo.Sach s ON m.MaSach = s.MaSach
        WHERE m.MaDocGia = @MaDocGia
          AND m.TrangThai <> N'Đã trả'
          AND ISNULL(m.NgayTra, DATEADD(DAY, 60, m.NgayMuon)) < CAST(GETDATE() AS DATE)
        ORDER BY m.NgayMuon ASC
      `);

    if (overdueRes.recordset.length > 0) {
      const ov = overdueRes.recordset[0];
      throw new Error(
        `Độc giả ${finalMaDocGia} đã bị KHÓA quyền mượn do có sách quá hạn chưa trả (Phiếu ${ov.MaMuon} - "${ov.TenSach}", hạn trả: ${ov.HanTra}). Vui lòng trả sách quá hạn trước!`
      );
    }

    // 2. Kiểm tra tồn kho sách
    const sachRes = await new sql.Request(transaction)
      .input('MaSach', sql.VarChar(10), MaSach)
      .query(`SELECT SoBanHienCo, TenSach, TacGia, TheLoai FROM dbo.Sach WHERE MaSach = @MaSach`);

    if (sachRes.recordset.length === 0) throw new Error('Không tìm thấy mã sách!');
    if (sachRes.recordset[0].SoBanHienCo <= 0) throw new Error('Sách này đã hết trong kho!');

    const bookInfo = sachRes.recordset[0];

    // 3. Kiểm tra / tạo độc giả nếu chưa có
    const dgRes = await new sql.Request(transaction)
      .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
      .query(`SELECT MaDocGia, HoTen, MaSV_NV, Email, LoaiDocGia FROM dbo.DocGia WHERE MaDocGia = @MaDocGia`);

    let readerInfo = dgRes.recordset[0] || null;

    if (!readerInfo) {
      await new sql.Request(transaction)
        .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
        .input('LoaiDocGia', sql.NVarChar(80), LoaiDocGia)
        .query(`
          INSERT INTO dbo.DocGia (MaDocGia, LoaiDocGia, NgayDangKy)
          VALUES (@MaDocGia, @LoaiDocGia, CAST(GETDATE() AS DATE))
        `);
      readerInfo = {
        MaDocGia: finalMaDocGia,
        HoTen: null,
        MaSV_NV: null,
        Email: null,
        LoaiDocGia,
      };
    }

    const maMuon = await generateNextId(pool, 'MuonTra', 'MaMuon', 'M');
    const finalNgayMuon = NgayMuon || new Date().toISOString().split('T')[0];

    // 4. Lưu phiếu mượn kèm NgayTra = NgayMuon + 60 ngày và TrangThai = N'Chưa trả'
    const insertRes = await new sql.Request(transaction)
      .input('MaMuon', sql.VarChar(10), maMuon)
      .input('MaSach', sql.VarChar(10), MaSach)
      .input('MaDocGia', sql.VarChar(10), finalMaDocGia)
      .input('NgayMuon', sql.Date, finalNgayMuon)
      .query(`
        INSERT INTO dbo.MuonTra (MaMuon, MaSach, MaDocGia, NgayMuon, NgayTra, TrangThai)
        OUTPUT CONVERT(varchar(10), inserted.NgayTra, 23) AS HanTraStr
        VALUES (@MaMuon, @MaSach, @MaDocGia, @NgayMuon, DATEADD(DAY, 60, @NgayMuon), N'Chưa trả')
      `);

    const finalHanTra = insertRes.recordset[0]?.HanTraStr || finalNgayMuon;

    await new sql.Request(transaction)
      .input('MaSach', sql.VarChar(10), MaSach)
      .query(`UPDATE dbo.Sach SET SoBanHienCo = SoBanHienCo - 1 WHERE MaSach = @MaSach`);

    await transaction.commit();

    if (readerInfo.Email?.trim()) {
      sendBorrowReceiptEmail({
        Email: readerInfo.Email.trim(),
        MaMuon: maMuon,
        MaDocGia: finalMaDocGia,
        HoTen: readerInfo.HoTen,
        MaSV_NV: readerInfo.MaSV_NV,
        LoaiDocGia: readerInfo.LoaiDocGia || LoaiDocGia,
        MaSach,
        TenSach: bookInfo.TenSach,
        TacGia: bookInfo.TacGia,
        TheLoai: bookInfo.TheLoai,
        NgayMuon: finalNgayMuon,
        HanTra: finalHanTra,
      });
    }

    res.json({
      message: readerInfo.Email?.trim()
        ? `Tạo phiếu mượn ${maMuon} thành công! Hạn trả: ${finalHanTra} (Đã gửi biên nhận tới ${readerInfo.Email.trim()})`
        : `Tạo phiếu mượn ${maMuon} thành công! Hạn trả dự kiến (60 ngày): ${finalHanTra}`,
      phieuMuon: {
        MaMuon: maMuon,
        MaSach,
        TenSach: bookInfo.TenSach,
        MaDocGia: finalMaDocGia,
        LoaiDocGia: readerInfo.LoaiDocGia || LoaiDocGia,
        NgayMuon: finalNgayMuon,
        NgayTra: finalHanTra,
        TrangThai: 'Chưa trả',
      },
    });
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ error: err.message });
  }
});

// Xác nhận trả sách (cập nhật NgayTra = ngày trả thực tế, TrangThai = N'Đã trả')
app.put('/api/muon-tra/:maMuon/tra-sach', async (req, res) => {
  const { maMuon } = req.params;
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const phieuRes = await new sql.Request(transaction)
      .input('MaMuon', sql.VarChar(10), maMuon)
      .query(`
        SELECT 
          m.MaMuon, m.MaSach, m.MaDocGia, m.TrangThai,
          CONVERT(varchar(10), m.NgayMuon, 23) AS NgayMuonStr,
          m.NgayMuon,
          s.TenSach, s.TacGia, s.TheLoai,
          d.HoTen, d.MaSV_NV, d.Email, d.LoaiDocGia
        FROM dbo.MuonTra m
        JOIN dbo.Sach s ON m.MaSach = s.MaSach
        JOIN dbo.DocGia d ON m.MaDocGia = d.MaDocGia
        WHERE m.MaMuon = @MaMuon
      `);

    if (phieuRes.recordset.length === 0) throw new Error('Không tìm thấy phiếu mượn!');
    const phieu = phieuRes.recordset[0];
    if (phieu.TrangThai === 'Đã trả') throw new Error('Phiếu này đã được trả trước đó!');

    const updateRes = await new sql.Request(transaction)
      .input('MaMuon', sql.VarChar(10), maMuon)
      .query(`
        UPDATE dbo.MuonTra
        SET TrangThai = N'Đã trả',
            NgayTra = CASE WHEN CAST(GETDATE() AS DATE) < NgayMuon THEN NgayMuon ELSE CAST(GETDATE() AS DATE) END
        OUTPUT CONVERT(varchar(10), inserted.NgayTra, 23) AS NgayTraStr
        WHERE MaMuon = @MaMuon
      `);

    const finalNgayTra = updateRes.recordset[0]?.NgayTraStr || new Date().toISOString().split('T')[0];

    await new sql.Request(transaction)
      .input('MaSach', sql.VarChar(10), phieu.MaSach)
      .query(`UPDATE dbo.Sach SET SoBanHienCo = SoBanHienCo + 1 WHERE MaSach = @MaSach`);

    await transaction.commit();

    if (phieu.Email?.trim()) {
      sendReturnReceiptEmail({
        Email: phieu.Email.trim(),
        MaMuon: phieu.MaMuon,
        MaDocGia: phieu.MaDocGia,
        HoTen: phieu.HoTen,
        MaSV_NV: phieu.MaSV_NV,
        LoaiDocGia: phieu.LoaiDocGia,
        MaSach: phieu.MaSach,
        TenSach: phieu.TenSach,
        TacGia: phieu.TacGia,
        TheLoai: phieu.TheLoai,
        NgayMuon: phieu.NgayMuonStr,
        NgayTra: finalNgayTra,
      });
    }

    res.json({
      message: phieu.Email?.trim()
        ? `Đã trả sách phiếu ${maMuon} thành công! (Đã gửi biên nhận trả sách tới ${phieu.Email.trim()})`
        : 'Đã trả sách và cập nhật lại số lượng trong kho!',
    });
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ error: err.message });
  }
});

// ================= 4. API ĐĂNG NHẬP & TRỢ LÝ AI =================

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' });
    }

    const accountsConfig = process.env.ADMIN_ACCOUNTS || 'admin1:123456,admin2:123456,thuthu1:123456,thuthu2:123456,giaovien:123456';
    const validAccounts = {};

    accountsConfig.split(',').forEach(pair => {
      const [user, pass] = pair.split(':');
      if (user && pass) {
        validAccounts[user.trim()] = pass.trim();
      }
    });

    if (validAccounts[username.trim()] && validAccounts[username.trim()] === password.trim()) {
      res.json({ success: true, message: 'Đăng nhập thành công!', token: 'admin-token-xyz' });
    } else {
      res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
2. dbo.DocGia (MaDocGia, HoTen, MaSV_NV, Email, SoDienThoai, LoaiDocGia, NgayDangKy)
3. dbo.MuonTra (MaMuon, MaSach, MaDocGia, NgayMuon, NgayTra, TrangThai) — TrangThai: N'Đã trả', N'Chưa trả', N'Quá hạn', N'Đang mượn'. (Hạn mượn 60 ngày kể từ NgayMuon).
4. dbo.TruyCapDienTu (MaTruyCap, NgayTruyCap, TenCSDL, SoLuot) — TenCSDL: 'SpringerLink', 'ProQuest', 'EBSCO', 'ScienceDirect', 'ACM Digital Library', 'IEEE Xplore'.

Nhiệm vụ:
- Nếu câu hỏi KHÔNG liên quan đến tra cứu dữ liệu thư viện (chào hỏi, phép tính toán học, hỏi chức năng...), trả lời thẳng bắt đầu bằng "CHAT: " (ví dụ: "CHAT: 1 + 1 = 2. Tôi có thể giúp gì cho bạn về dữ liệu thư viện?").
- Nếu câu hỏi CẦN tra cứu dữ liệu trong CSDL thư viện, chỉ trả về DUY NHẤT 1 câu lệnh T-SQL SELECT hợp lệ (dùng TOP, luôn thêm tiền tố N trước chuỗi tiếng Việt có dấu, không giải thích, không bọc 
\`\`\`sql).

Câu hỏi người dùng: "${message}"
Phản hồi:`;

    const rawOutput = await callGeminiSafe(decisionPrompt);
    const cleanedOutput = rawOutput.replace(/```sql|```/gi, '').trim();
    console.log('🤖 AI phản hồi lượt 1:', cleanedOutput);

    if (cleanedOutput.toUpperCase().startsWith('CHAT:')) {
      return res.json({
        reply: cleanedOutput.replace(/^CHAT:\s*/i, '').trim(),
      });
    }

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
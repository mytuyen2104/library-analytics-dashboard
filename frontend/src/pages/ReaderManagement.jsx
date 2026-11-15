import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Download, Edit3, History,
  CheckCircle2, AlertCircle, X, BookOpen, Filter
} from 'lucide-react';

const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://api.dashboardg4.click/api';

export default function ReaderManagement() {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form thêm mới
  const [maDocGia, setMaDocGia] = useState('');
  const [loaiDocGia, setLoaiDocGia] = useState('Sinh viên');
  const [ngayDangKy, setNgayDangKy] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Modal sửa độc giả
  const [editingReader, setEditingReader] = useState(null);

  // Modal lịch sử mượn của độc giả
  const [historyModal, setHistoryModal] = useState({ open: false, reader: null, logs: [], loading: false });

  const fetchReaders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (filterLoai) params.append('loai', filterLoai);

      const res = await fetch(`${API_BASE}/doc-gia?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setReaders(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể tải danh sách độc giả từ máy chủ!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReaders();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, filterLoai]);

  const handleAddReader = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE}/doc-gia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MaDocGia: maDocGia,
          LoaiDocGia: loaiDocGia,
          NgayDangKy: ngayDangKy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thêm độc giả thất bại');

      setMessage({ type: 'success', text: `Đã cấp thẻ độc giả ${data.MaDocGia} thành công!` });
      setMaDocGia('');
      setLoaiDocGia('Sinh viên');
      fetchReaders();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReader = async (e) => {
    e.preventDefault();
    if (!editingReader) return;

    try {
      const res = await fetch(`${API_BASE}/doc-gia/${editingReader.MaDocGia}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          LoaiDocGia: editingReader.LoaiDocGia,
          NgayDangKy: editingReader.NgayDangKy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');

      setMessage({ type: 'success', text: `Đã cập nhật độc giả ${editingReader.MaDocGia}!` });
      setEditingReader(null);
      fetchReaders();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleViewHistory = async (reader) => {
    setHistoryModal({ open: true, reader, logs: [], loading: true });
    try {
      const res = await fetch(`${API_BASE}/doc-gia/${reader.MaDocGia}/lich-su`);
      const data = await res.json();
      setHistoryModal({ open: true, reader, logs: Array.isArray(data) ? data : [], loading: false });
    } catch {
      setHistoryModal({ open: true, reader, logs: [], loading: false });
    }
  };

  // Xuất báo cáo danh sách độc giả ra file CSV (chuẩn UTF-8 BOM cho Excel)
  const handleExportCSV = () => {
    if (readers.length === 0) return;

    const headers = ['Mã Độc Giả', 'Loại Độc Giả', 'Ngày Đăng Ký', 'Tổng Lượt Mượn', 'Sách Đang Giữ'];
    const rows = readers.map((r) => [
      r.MaDocGia,
      r.LoaiDocGia,
      r.NgayDangKy,
      r.TongLuotMuon || 0,
      r.DangMuon || 0,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Doc_Gia_UTH_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Thống kê nhanh
  const totalReaders = readers.length;
  const studentCount = readers.filter((r) => r.LoaiDocGia === 'Sinh viên').length;
  const lecturerCount = readers.filter((r) => r.LoaiDocGia === 'Giảng viên').length;
  const activeBorrowers = readers.filter((r) => Number(r.DangMuon) > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Thông báo */}
      {message.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#047857' : '#b91c1c',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thẻ KPI tổng quan độc giả */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Tổng số độc giả (đang lọc)</span>
          <strong style={{ fontSize: '26px', color: '#0f172a', marginTop: '4px' }}>{totalReaders}</strong>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Sinh viên</span>
          <strong style={{ fontSize: '26px', color: '#2563eb', marginTop: '4px' }}>{studentCount}</strong>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Giảng viên</span>
          <strong style={{ fontSize: '26px', color: '#059669', marginTop: '4px' }}>{lecturerCount}</strong>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Độc giả đang giữ sách</span>
          <strong style={{ fontSize: '26px', color: '#d97706', marginTop: '4px' }}>{activeBorrowers}</strong>
        </div>
      </div>

      {/* Form cấp thẻ độc giả mới */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <UserPlus size={20} color="#0284c7" />
          <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Cấp thẻ độc giả mới</h3>
        </div>

        <form
          onSubmit={handleAddReader}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'end' }}
        >
          <div>
            <label style={labelStyle}>Mã độc giả (để trống tự sinh DGxxxx)</label>
            <input
              type="text"
              placeholder="VD: DG0081 hoặc MSSV..."
              value={maDocGia}
              onChange={(e) => setMaDocGia(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Loại độc giả</label>
            <select
              value={loaiDocGia}
              onChange={(e) => setLoaiDocGia(e.target.value)}
              style={inputStyle}
            >
              <option value="Sinh viên">Sinh viên</option>
              <option value="Giảng viên">Giảng viên</option>
              <option value="Cán bộ nhân viên">Cán bộ nhân viên</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Ngày đăng ký thẻ</label>
            <input
              type="date"
              value={ngayDangKy}
              onChange={(e) => setNgayDangKy(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#0284c7',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              height: '40px',
            }}
          >
            {submitting ? 'Đang lưu...' : '+ Thêm độc giả'}
          </button>
        </form>
      </div>

      {/* Thanh tìm kiếm, lọc & xuất báo cáo */}
      <div style={panelStyle}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Danh sách độc giả thư viện</h3>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {/* Ô tìm kiếm */}
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Tìm mã độc giả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '32px', width: '210px' }}
              />
            </div>

            {/* Bộ lọc loại độc giả */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={16} color="#64748b" />
              <select
                value={filterLoai}
                onChange={(e) => setFilterLoai(e.target.value)}
                style={{ ...inputStyle, width: '160px' }}
              >
                <option value="">Tất cả đối tượng</option>
                <option value="Sinh viên">Sinh viên</option>
                <option value="Giảng viên">Giảng viên</option>
                <option value="Cán bộ nhân viên">Cán bộ nhân viên</option>
              </select>
            </div>

            {/* Nút xuất báo cáo Excel/CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #16a34a',
                background: '#f0fdf4',
                color: '#15803d',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={16} />
              <span>Xuất Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* Bảng dữ liệu độc giả */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={thStyle}>Mã Độc Giả</th>
                <th style={thStyle}>Loại Độc Giả</th>
                <th style={thStyle}>Ngày Đăng Ký</th>
                <th style={thStyle}>Tổng Lượt Mượn</th>
                <th style={thStyle}>Đang Giữ Sách</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    Đang tải dữ liệu độc giả...
                  </td>
                </tr>
              ) : readers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    Không tìm thấy độc giả nào phù hợp.
                  </td>
                </tr>
              ) : (
                readers.map((r) => (
                  <tr key={r.MaDocGia} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>{r.MaDocGia}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: r.LoaiDocGia === 'Giảng viên' ? '#dcfce7' : '#dbeafe',
                          color: r.LoaiDocGia === 'Giảng viên' ? '#166534' : '#1e40af',
                        }}
                      >
                        {r.LoaiDocGia}
                      </span>
                    </td>
                    <td style={tdStyle}>{r.NgayDangKy}</td>
                    <td style={tdStyle}>{r.TongLuotMuon || 0} lượt</td>
                    <td style={tdStyle}>
                      {Number(r.DangMuon) > 0 ? (
                        <span style={{ color: '#d97706', fontWeight: 600 }}>{r.DangMuon} cuốn</span>
                      ) : (
                        <span style={{ color: '#64748b' }}>0 cuốn</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleViewHistory(r)}
                          title="Xem lịch sử mượn sách"
                          style={actionBtnStyle('#eff6ff', '#1d4ed8')}
                        >
                          <History size={15} />
                          <span>Lịch sử</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReader({ ...r })}
                          title="Chỉnh sửa thông tin"
                          style={actionBtnStyle('#f8fafc', '#334155')}
                        >
                          <Edit3 size={15} />
                          <span>Sửa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Sửa thông tin độc giả */}
      {editingReader && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Cập nhật độc giả: {editingReader.MaDocGia}</h3>
              <button onClick={() => setEditingReader(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateReader} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Loại độc giả</label>
                <select
                  value={editingReader.LoaiDocGia}
                  onChange={(e) => setEditingReader({ ...editingReader, LoaiDocGia: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Sinh viên">Sinh viên</option>
                  <option value="Giảng viên">Giảng viên</option>
                  <option value="Cán bộ nhân viên">Cán bộ nhân viên</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ngày đăng ký</label>
                <input
                  type="date"
                  value={editingReader.NgayDangKy}
                  onChange={(e) => setEditingReader({ ...editingReader, NgayDangKy: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditingReader(null)} style={cancelBtnStyle}>
                  Hủy
                </button>
                <button type="submit" style={saveBtnStyle}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lịch sử mượn sách của độc giả */}
      {historyModal.open && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#0284c7" />
                <h3 style={{ margin: 0 }}>
                  Lịch sử mượn sách — {historyModal.reader?.MaDocGia} ({historyModal.reader?.LoaiDocGia})
                </h3>
              </div>
              <button
                onClick={() => setHistoryModal({ open: false, reader: null, logs: [], loading: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {historyModal.loading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tải lịch sử...</p>
            ) : historyModal.logs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
                Độc giả này chưa có lịch sử mượn sách nào.
              </p>
            ) : (
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={thStyle}>Mã Phiếu</th>
                      <th style={thStyle}>Tên Sách</th>
                      <th style={thStyle}>Ngày Mượn</th>
                      <th style={thStyle}>Ngày Trả</th>
                      <th style={thStyle}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyModal.logs.map((log) => (
                      <tr key={log.MaMuon} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{log.MaMuon}</td>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{log.TenSach}</td>
                        <td style={tdStyle}>{log.NgayMuon}</td>
                        <td style={tdStyle}>{log.NgayTra || '—'}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              background: log.TrangThai === 'Đã trả' ? '#dcfce7' : '#fef3c7',
                              color: log.TrangThai === 'Đã trả' ? '#166534' : '#92400e',
                            }}
                          >
                            {log.TrangThai}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles đồng bộ giao diện sáng hiện đại
const cardStyle = {
  background: '#ffffff',
  padding: '16px 20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
};

const panelStyle = {
  background: '#ffffff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#475569',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const thStyle = { padding: '12px', color: '#475569', fontWeight: 600 };
const tdStyle = { padding: '12px', color: '#334155' };

const actionBtnStyle = (bg, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  background: bg,
  color,
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
});

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px',
};

const modalBoxStyle = {
  background: '#ffffff',
  borderRadius: '14px',
  padding: '22px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

const cancelBtnStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  cursor: 'pointer',
};

const saveBtnStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: 'none',
  background: '#0284c7',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};
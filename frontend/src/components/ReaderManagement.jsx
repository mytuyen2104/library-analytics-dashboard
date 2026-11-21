import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Download, Edit3, History, Trash2, BellRing,
  CheckCircle2, AlertCircle, X, BookOpen, Filter, IdCard, Mail, Phone, Hash, Calendar
} from 'lucide-react';
import '../styles/ReaderManagement.css';

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
  const [hoTen, setHoTen] = useState('');
  const [maSvNv, setMaSvNv] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [loaiDocGia, setLoaiDocGia] = useState('Sinh viên');
  const [ngayDangKy, setNgayDangKy] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [sendingNoticeId, setSendingNoticeId] = useState(null);

  // Modal xem chi tiết thẻ thông tin cá nhân khi bấm vào Mã độc giả
  const [selectedReader, setSelectedReader] = useState(null);

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
          HoTen: hoTen,
          MaSV_NV: maSvNv,
          Email: email,
          SoDienThoai: soDienThoai,
          LoaiDocGia: loaiDocGia,
          NgayDangKy: ngayDangKy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thêm độc giả thất bại');

      setMessage({ type: 'success', text: data.message || `Đã cấp thẻ độc giả ${data.MaDocGia} thành công!` });
      setMaDocGia('');
      setHoTen('');
      setMaSvNv('');
      setEmail('');
      setSoDienThoai('');
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
          HoTen: editingReader.HoTen || '',
          MaSV_NV: editingReader.MaSV_NV || '',
          Email: editingReader.Email || '',
          SoDienThoai: editingReader.SoDienThoai || '',
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

  const handleDeleteReader = async (reader) => {
    const displayName = reader.HoTen ? `${reader.MaDocGia} (${reader.HoTen})` : reader.MaDocGia;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thẻ độc giả ${displayName} không?`)) {
      return;
    }

    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/doc-gia/${reader.MaDocGia}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa độc giả thất bại');

      setMessage({ type: 'success', text: data.message });
      fetchReaders();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSendNotice = async (reader) => {
    setSendingNoticeId(reader.MaDocGia);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/doc-gia/${reader.MaDocGia}/nhac-han`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gửi thông báo thất bại');

      setMessage({ type: 'success', text: data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSendingNoticeId(null);
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

    const headers = [
      'Mã Độc Giả',
      'Họ và Tên',
      'Mã SV / Mã NV',
      'Email',
      'Số Điện Thoại',
      'Loại Độc Giả',
      'Ngày Đăng Ký',
      'Tổng Lượt Mượn',
      'Sách Đang Giữ',
      'Sách Quá Hạn',
    ];
    const rows = readers.map((r) => [
      r.MaDocGia,
      r.HoTen || '',
      r.MaSV_NV || '',
      r.Email || '',
      r.SoDienThoai || '',
      r.LoaiDocGia,
      r.NgayDangKy,
      r.TongLuotMuon || 0,
      r.DangMuon || 0,
      r.QuaHan || 0,
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
    <div className="rm-container">
      {/* Thông báo */}
      {message.text && (
        <div
          className={`rm-alert ${message.type === 'success' ? 'rm-alert--success' : 'rm-alert--error'
            }`}
        >
          <div className="rm-alert-content">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage({ type: '', text: '' })}
            className="rm-alert-close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thẻ KPI tổng quan độc giả */}
      <div className="rm-kpi-grid">
        <div className="rm-kpi-card">
          <span className="rm-kpi-label">Tổng số độc giả (đang lọc)</span>
          <strong className="rm-kpi-value rm-kpi-value--total">{totalReaders}</strong>
        </div>
        <div className="rm-kpi-card">
          <span className="rm-kpi-label">Sinh viên</span>
          <strong className="rm-kpi-value rm-kpi-value--student">{studentCount}</strong>
        </div>
        <div className="rm-kpi-card">
          <span className="rm-kpi-label">Giảng viên</span>
          <strong className="rm-kpi-value rm-kpi-value--lecturer">{lecturerCount}</strong>
        </div>
        <div className="rm-kpi-card">
          <span className="rm-kpi-label">Độc giả đang giữ sách</span>
          <strong className="rm-kpi-value rm-kpi-value--borrowing">{activeBorrowers}</strong>
        </div>
      </div>

      {/* Form cấp thẻ độc giả mới */}
      <div className="rm-panel">
        <div className="rm-section-header">
          <UserPlus size={20} className="rm-icon-sky" />
          <h3 className="rm-section-title">Cấp thẻ độc giả mới</h3>
        </div>

        <form onSubmit={handleAddReader} className="rm-add-form">
          <div>
            <label className="rm-label">Mã độc giả (để trống tự sinh DGxxxx)</label>
            <input
              type="text"
              placeholder="VD: DG0081..."
              value={maDocGia}
              onChange={(e) => setMaDocGia(e.target.value)}
              className="rm-input"
            />
          </div>

          <div>
            <label className="rm-label">Họ và tên</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              className="rm-input"
            />
          </div>

          <div>
            <label className="rm-label">Mã sinh viên / Mã NV</label>
            <input
              type="text"
              placeholder="VD: 2251120001"
              value={maSvNv}
              onChange={(e) => setMaSvNv(e.target.value)}
              className="rm-input"
            />
          </div>

          <div>
            <label className="rm-label">Email</label>
            <input
              type="email"
              placeholder="VD: sinhvien@ut.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rm-input"
            />
          </div>

          <div>
            <label className="rm-label">Số điện thoại</label>
            <input
              type="tel"
              placeholder="VD: 0901234567"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              className="rm-input"
            />
          </div>

          <div>
            <label className="rm-label">Loại độc giả</label>
            <select
              value={loaiDocGia}
              onChange={(e) => setLoaiDocGia(e.target.value)}
              className="rm-input"
            >
              <option value="Sinh viên">Sinh viên</option>
              <option value="Giảng viên">Giảng viên</option>
              <option value="Cán bộ nhân viên">Cán bộ nhân viên</option>
            </select>
          </div>

          <div>
            <label className="rm-label">Ngày đăng ký thẻ</label>
            <input
              type="date"
              value={ngayDangKy}
              onChange={(e) => setNgayDangKy(e.target.value)}
              required
              className="rm-input"
            />
          </div>

          <button type="submit" disabled={submitting} className="rm-btn-primary">
            {submitting ? 'Đang lưu...' : '+ Thêm độc giả'}
          </button>
        </form>
      </div>

      {/* Thanh tìm kiếm, lọc & xuất báo cáo */}
      <div className="rm-panel">
        <div className="rm-list-header">
          <div className="rm-section-header rm-section-header--compact">
            <Users size={20} className="rm-icon-dark" />
            <h3 className="rm-section-title">Danh sách độc giả thư viện</h3>
          </div>

          <div className="rm-toolbar-actions">
            {/* Ô tìm kiếm */}
            <div className="rm-search-box">
              <Search size={16} className="rm-search-icon" />
              <input
                type="text"
                placeholder="Tìm mã ĐG, họ tên, MSSV, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rm-input rm-search-input"
              />
            </div>

            {/* Bộ lọc loại độc giả */}
            <div className="rm-filter-box">
              <Filter size={16} className="rm-filter-icon" />
              <select
                value={filterLoai}
                onChange={(e) => setFilterLoai(e.target.value)}
                className="rm-input rm-filter-select"
              >
                <option value="">Tất cả đối tượng</option>
                <option value="Sinh viên">Sinh viên</option>
                <option value="Giảng viên">Giảng viên</option>
                <option value="Cán bộ nhân viên">Cán bộ nhân viên</option>
              </select>
            </div>

            {/* Nút xuất báo cáo Excel/CSV */}
            <button type="button" onClick={handleExportCSV} className="rm-btn-export">
              <Download size={16} />
              <span>Xuất Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* Bảng dữ liệu độc giả */}
        <div className="rm-table-scroll">
          <table className="rm-table">
            <thead>
              <tr>
                <th>Mã Độc Giả</th>
                <th>Họ và Tên</th>
                <th>Mã SV / NV</th>
                <th>Loại Độc Giả</th>
                <th>Ngày Đăng Ký</th>
                <th>Tổng Lượt Mượn</th>
                <th>Đang Giữ Sách</th>
                <th className="rm-text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="rm-table-empty">
                    Đang tải dữ liệu độc giả...
                  </td>
                </tr>
              ) : readers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="rm-table-empty">
                    Không tìm thấy độc giả nào phù hợp.
                  </td>
                </tr>
              ) : (
                readers.map((r) => (
                  <tr key={r.MaDocGia}>
                    <td className="rm-code-cell">
                      <button
                        type="button"
                        onClick={() => setSelectedReader(r)}
                        title="Bấm để xem thẻ thông tin cá nhân"
                        className="rm-code-link"
                      >
                        {r.MaDocGia}
                      </button>
                    </td>
                    <td className="rm-book-title-cell">
                      {r.HoTen || <span className="rm-text-muted">Chưa cập nhật</span>}
                    </td>
                    <td>{r.MaSV_NV || '—'}</td>
                    <td>
                      <span
                        className={`rm-role-badge ${
                          r.LoaiDocGia === 'Giảng viên'
                            ? 'rm-role-badge--lecturer'
                            : 'rm-role-badge--student'
                        }`}
                      >
                        {r.LoaiDocGia}
                      </span>
                    </td>
                    <td>{r.NgayDangKy}</td>
                    <td>{r.TongLuotMuon || 0} lượt</td>
                    <td>
                      {Number(r.QuaHan) > 0 ? (
                        <span
                          className="rm-status-badge rm-status-badge--overdue"
                          title="Độc giả đang bị khóa quyền mượn do có sách quá hạn"
                        >
                          {r.DangMuon} cuốn ({r.QuaHan} quá hạn - Khóa)
                        </span>
                      ) : Number(r.DangMuon) > 0 ? (
                        <span className="rm-borrowing-active">{r.DangMuon} cuốn</span>
                      ) : (
                        <span className="rm-borrowing-none">0 cuốn</span>
                      )}
                    </td>
                    <td className="rm-text-right">
                      <div className="rm-action-group">
                        {Number(r.DangMuon) > 0 && (
                          <button
                            type="button"
                            disabled={sendingNoticeId === r.MaDocGia}
                            onClick={() => handleSendNotice(r)}
                            title={
                              Number(r.QuaHan) > 0
                                ? 'Gửi email cảnh báo sách quá hạn'
                                : 'Gửi email nhắc hạn trả sách'
                            }
                            className={`rm-btn-action ${
                              Number(r.QuaHan) > 0
                                ? 'rm-btn-action--notice-overdue'
                                : 'rm-btn-action--notice-normal'
                            }`}
                          >
                            <BellRing size={15} />
                            <span>
                              {sendingNoticeId === r.MaDocGia
                                ? 'Đang gửi...'
                                : Number(r.QuaHan) > 0
                                  ? 'Báo quá hạn'
                                  : 'Nhắc hạn'}
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleViewHistory(r)}
                          title="Xem lịch sử mượn sách"
                          className="rm-btn-action rm-btn-action--history"
                        >
                          <History size={15} />
                          <span>Lịch sử</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReader({ ...r })}
                          title="Chỉnh sửa thông tin"
                          className="rm-btn-action rm-btn-action--edit"
                        >
                          <Edit3 size={15} />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReader(r)}
                          title="Xóa thẻ độc giả"
                          className="rm-btn-action rm-btn-action--delete"
                        >
                          <Trash2 size={15} />
                          <span>Xóa</span>
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

      {/* Modal Thẻ thông tin cá nhân chi tiết (Mở khi bấm vào Mã độc giả) */}
      {selectedReader && (
        <div className="rm-modal-backdrop" onClick={() => setSelectedReader(null)}>
          <div className="rm-modal-box rm-modal-box--md" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-header">
              <div className="rm-modal-title-group">
                <IdCard size={22} className="rm-icon-sky" />
                <h3 className="rm-modal-title">Thẻ Thông Tin Độc Giả</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReader(null)}
                className="rm-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rm-profile-card">
              <div className="rm-profile-banner">
                <div className="rm-profile-avatar">
                  {(selectedReader.HoTen || selectedReader.MaDocGia).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="rm-profile-name">
                    {selectedReader.HoTen || 'Chưa cập nhật họ tên'}
                  </h4>
                  <div className="rm-profile-badges">
                    <span className="rm-profile-code">{selectedReader.MaDocGia}</span>
                    <span className="rm-role-badge rm-role-badge--student">
                      {selectedReader.LoaiDocGia}
                    </span>
                    {Number(selectedReader.QuaHan) > 0 && (
                      <span className="rm-status-badge rm-status-badge--overdue">
                        Khóa mượn ({selectedReader.QuaHan} quá hạn)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rm-profile-grid">
                <div className="rm-profile-item">
                  <span className="rm-profile-item-label">
                    <Hash size={14} /> Mã sinh viên / Mã NV
                  </span>
                  <strong className="rm-profile-item-value">
                    {selectedReader.MaSV_NV || 'Chưa cập nhật'}
                  </strong>
                </div>

                <div className="rm-profile-item">
                  <span className="rm-profile-item-label">
                    <Calendar size={14} /> Ngày đăng ký thẻ
                  </span>
                  <strong className="rm-profile-item-value">{selectedReader.NgayDangKy}</strong>
                </div>

                <div className="rm-profile-item">
                  <span className="rm-profile-item-label">
                    <Mail size={14} /> Email liên hệ
                  </span>
                  <strong className="rm-profile-item-value">
                    {selectedReader.Email || 'Chưa cập nhật'}
                  </strong>
                </div>

                <div className="rm-profile-item">
                  <span className="rm-profile-item-label">
                    <Phone size={14} /> Số điện thoại
                  </span>
                  <strong className="rm-profile-item-value">
                    {selectedReader.SoDienThoai || 'Chưa cập nhật'}
                  </strong>
                </div>
              </div>

              <div className="rm-profile-stats">
                <div className="rm-profile-stat-box">
                  <span>Tổng lượt đã mượn</span>
                  <strong>{selectedReader.TongLuotMuon || 0} lượt</strong>
                </div>
                <div className="rm-profile-stat-box">
                  <span>Sách đang giữ hiện tại</span>
                  <strong>{selectedReader.DangMuon || 0} cuốn</strong>
                </div>
              </div>
            </div>

            <div className="rm-modal-footer">
              <button
                type="button"
                onClick={() => {
                  const target = selectedReader;
                  setSelectedReader(null);
                  handleViewHistory(target);
                }}
                className="rm-btn-action rm-btn-action--history"
              >
                <History size={15} />
                <span>Xem lịch sử mượn</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = { ...selectedReader };
                  setSelectedReader(null);
                  setEditingReader(target);
                }}
                className="rm-btn-save"
              >
                Chỉnh sửa thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa thông tin độc giả */}
      {editingReader && (
        <div className="rm-modal-backdrop">
          <div className="rm-modal-box rm-modal-box--md">
            <div className="rm-modal-header">
              <h3 className="rm-modal-title">Cập nhật độc giả: {editingReader.MaDocGia}</h3>
              <button
                type="button"
                onClick={() => setEditingReader(null)}
                className="rm-modal-close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateReader} className="rm-modal-form">
              <div className="rm-modal-grid">
                <div>
                  <label className="rm-label">Họ và tên</label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    value={editingReader.HoTen || ''}
                    onChange={(e) => setEditingReader({ ...editingReader, HoTen: e.target.value })}
                    className="rm-input"
                  />
                </div>
                <div>
                  <label className="rm-label">Mã sinh viên / Mã NV</label>
                  <input
                    type="text"
                    placeholder="VD: 2251120001"
                    value={editingReader.MaSV_NV || ''}
                    onChange={(e) => setEditingReader({ ...editingReader, MaSV_NV: e.target.value })}
                    className="rm-input"
                  />
                </div>
                <div>
                  <label className="rm-label">Email</label>
                  <input
                    type="email"
                    placeholder="VD: sinhvien@ut.edu.vn"
                    value={editingReader.Email || ''}
                    onChange={(e) => setEditingReader({ ...editingReader, Email: e.target.value })}
                    className="rm-input"
                  />
                </div>
                <div>
                  <label className="rm-label">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="VD: 0901234567"
                    value={editingReader.SoDienThoai || ''}
                    onChange={(e) => setEditingReader({ ...editingReader, SoDienThoai: e.target.value })}
                    className="rm-input"
                  />
                </div>
                <div>
                  <label className="rm-label">Loại độc giả</label>
                  <select
                    value={editingReader.LoaiDocGia}
                    onChange={(e) => setEditingReader({ ...editingReader, LoaiDocGia: e.target.value })}
                    className="rm-input"
                  >
                    <option value="Sinh viên">Sinh viên</option>
                    <option value="Giảng viên">Giảng viên</option>
                    <option value="Cán bộ nhân viên">Cán bộ nhân viên</option>
                  </select>
                </div>
                <div>
                  <label className="rm-label">Ngày đăng ký</label>
                  <input
                    type="date"
                    value={editingReader.NgayDangKy}
                    onChange={(e) => setEditingReader({ ...editingReader, NgayDangKy: e.target.value })}
                    className="rm-input"
                    required
                  />
                </div>
              </div>
              <div className="rm-modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingReader(null)}
                  className="rm-btn-cancel"
                >
                  Hủy
                </button>
                <button type="submit" className="rm-btn-save">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lịch sử mượn sách của độc giả */}
      {historyModal.open && (
        <div className="rm-modal-backdrop">
          <div className="rm-modal-box rm-modal-box--lg">
            <div className="rm-modal-header">
              <div className="rm-modal-title-group">
                <BookOpen size={20} className="rm-icon-sky" />
                <h3 className="rm-modal-title">
                  Lịch sử mượn sách — {historyModal.reader?.MaDocGia}
                  {historyModal.reader?.HoTen
                    ? ` (${historyModal.reader.HoTen})`
                    : ` (${historyModal.reader?.LoaiDocGia})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModal({ open: false, reader: null, logs: [], loading: false })}
                className="rm-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            {historyModal.loading ? (
              <p className="rm-modal-status">Đang tải lịch sử...</p>
            ) : historyModal.logs.length === 0 ? (
              <p className="rm-modal-status rm-modal-status--padded">
                Độc giả này chưa có lịch sử mượn sách nào.
              </p>
            ) : (
              <div className="rm-history-scroll">
                <table className="rm-table rm-table--compact">
                  <thead>
                    <tr>
                      <th>Mã Phiếu</th>
                      <th>Tên Sách</th>
                      <th>Ngày Mượn</th>
                      <th>Hạn Trả / Ngày Trả</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyModal.logs.map((log) => (
                      <tr key={log.MaMuon}>
                        <td>{log.MaMuon}</td>
                        <td className="rm-book-title-cell">{log.TenSach}</td>
                        <td>{log.NgayMuon}</td>
                        <td>{log.NgayTra || '—'}</td>
                        <td>
                          <span
                            className={`rm-status-badge ${
                              log.TrangThai === 'Đã trả'
                                ? 'rm-status-badge--returned'
                                : log.TrangThai === 'Quá hạn'
                                  ? 'rm-status-badge--overdue'
                                  : 'rm-status-badge--borrowing'
                            }`}
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
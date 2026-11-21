import React, { useState, useEffect } from 'react';
import '../styles/LoanManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoanManagement() {
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loans, setLoans] = useState([]);
  const [searchReturn, setSearchReturn] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNRETURNED' | 'RETURNED'
  const [createdReceipt, setCreatedReceipt] = useState(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    MaDocGia: '',
    LoaiDocGia: 'Sinh viên',
    TenSachInput: '',
    MaSach: '',
    NgayMuon: new Date().toISOString().split('T')[0],
  });

  const fetchData = async (keyword = '') => {
    try {
      const [resBooks, resReaders, resLoans] = await Promise.all([
        fetch(`${API_URL}/sach`),
        fetch(`${API_URL}/doc-gia`),
        fetch(`${API_URL}/muon-tra?search=${encodeURIComponent(keyword)}`),
      ]);

      const dataBooks = await resBooks.json();
      const dataReaders = await resReaders.json();
      const dataLoans = await resLoans.json();

      setBooks(Array.isArray(dataBooks) ? dataBooks : []);
      setReaders(Array.isArray(dataReaders) ? dataReaders : []);
      setLoans(Array.isArray(dataLoans) ? dataLoans : []);
    } catch (err) {
      console.error('Lỗi kết nối API:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReaderChange = (maDG) => {
    const matched = readers.find((r) => r.MaDocGia.toLowerCase() === maDG.trim().toLowerCase());
    setForm({
      ...form,
      MaDocGia: maDG,
      LoaiDocGia: matched ? matched.LoaiDocGia : form.LoaiDocGia,
    });
  };

  const handleSelectBookByName = (tenSach) => {
    const matched = books.find((b) => b.TenSach.toLowerCase() === tenSach.trim().toLowerCase());
    setForm({
      ...form,
      TenSachInput: tenSach,
      MaSach: matched ? matched.MaSach : '',
    });
  };

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!form.MaSach) {
      setMessage('Vui lòng chọn đúng tên sách có trong danh sách gợi ý!');
      return;
    }

    const res = await fetch(`${API_URL}/muon-tra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        MaDocGia: form.MaDocGia,
        LoaiDocGia: form.LoaiDocGia,
        MaSach: form.MaSach,
        NgayMuon: form.NgayMuon,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(`Lỗi: ${data.error}`);
      return;
    }

    setCreatedReceipt(data.phieuMuon);
    setMessage('Tạo phiếu mượn thành công và đã trừ 1 quyển trong kho!');
    setForm({ ...form, MaDocGia: '', TenSachInput: '', MaSach: '' });
    fetchData(searchReturn);
  };

  const handleReturnBook = async (maMuon) => {
    const res = await fetch(`${API_URL}/muon-tra/${maMuon}/tra-sach`, { method: 'PUT' });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setMessage(data.message);
    fetchData(searchReturn);
  };

  // Lọc danh sách phiếu theo trạng thái Đã trả / Chưa trả
  const filteredLoans = loans.filter((item) => {
    if (statusFilter === 'RETURNED') return item.TrangThai === 'Đã trả';
    if (statusFilter === 'UNRETURNED') return item.TrangThai !== 'Đã trả';
    return true;
  });

  const countReturned = loans.filter((item) => item.TrangThai === 'Đã trả').length;
  const countUnreturned = loans.filter((item) => item.TrangThai !== 'Đã trả').length;

  return (
    <div className="loan-management">
      {message && (
        <div className="loan-message">
          {message}
        </div>
      )}

      <div className="loan-layout">
        {/* CỘT TRÁI: TẠO PHIẾU MƯỢN */}
        <div className="loan-card loan-create-card">
          <h3 className="loan-section-title">1. Tạo Phiếu Mượn Mới</h3>

          <form onSubmit={handleBorrowSubmit} className="loan-form">
            <div className="loan-form-group">
              <label className="loan-label">Mã độc giả (Người mượn):</label>
              <input
                required
                list="reader-suggestions"
                maxLength={10}
                placeholder="VD: DG001 (hoặc nhập mã mới DG081)..."
                value={form.MaDocGia}
                onChange={(e) => handleReaderChange(e.target.value)}
                className="loan-input"
              />
              <datalist id="reader-suggestions">
                {readers.map((r) => (
                  <option key={r.MaDocGia} value={r.MaDocGia}>
                    {`${r.MaDocGia} - ${r.LoaiDocGia}`}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="loan-form-group">
              <label className="loan-label">Loại độc giả:</label>
              <select
                value={form.LoaiDocGia}
                onChange={(e) => setForm({ ...form, LoaiDocGia: e.target.value })}
                className="loan-input"
              >
                <option value="Sinh viên">Sinh viên</option>
                <option value="Giảng viên">Giảng viên</option>
                <option value="Học viên cao học">Nhân viên thư viện</option>
              </select>
            </div>

            <div className="loan-form-group">
              <label className="loan-label">Nhập / Chọn tên sách:</label>
              <input
                required
                list="book-suggestions"
                placeholder="Gõ tên sách để tìm..."
                value={form.TenSachInput}
                onChange={(e) => handleSelectBookByName(e.target.value)}
                className="loan-input"
              />
              <datalist id="book-suggestions">
                {books.map((b) => (
                  <option key={b.MaSach} value={b.TenSach}>
                    {`${b.MaSach} - Còn lại: ${b.SoBanHienCo} quyển`}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="loan-form-row">
              <div className="loan-form-group">
                <label className="loan-label">Mã sách:</label>
                <input
                  readOnly
                  value={form.MaSach}
                  placeholder="Tự động điền"
                  className="loan-input loan-readonly"
                />
              </div>

              <div className="loan-form-group">
                <label className="loan-label">Ngày mượn:</label>
                <input
                  type="date"
                  value={form.NgayMuon}
                  onChange={(e) => setForm({ ...form, NgayMuon: e.target.value })}
                  className="loan-input"
                />
              </div>
            </div>
 
            <button type="submit" className="loan-submit-btn">
              Tạo Phiếu Mượn
            </button>
          </form>

          {createdReceipt && (
            <div className="loan-receipt">
              <h4>Thông tin Phiếu Mượn Vừa Tạo</h4>
              <p><strong>Mã phiếu:</strong> {createdReceipt.MaMuon}</p>
              <p><strong>Mã độc giả:</strong> {createdReceipt.MaDocGia} ({createdReceipt.LoaiDocGia})</p>
              <p><strong>Mã sách:</strong> {createdReceipt.MaSach}</p>
              <p><strong>Tên sách:</strong> {createdReceipt.TenSach}</p>
              <p><strong>Ngày mượn:</strong> {createdReceipt.NgayMuon}</p>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: TRA CỨU & TRẢ SÁCH */}
        <div className="loan-card loan-return-card">
          <h3 className="loan-section-title loan-return-title">
            2. Trả Sách (Nhập Mã độc giả / Mã phiếu / Tên sách)
          </h3>

          {/* Thanh tìm kiếm + Bộ lọc trạng thái */}
          <div className="loan-toolbar">
            <input
              type="text"
              placeholder="Nhập mã độc giả (VD: DG001) hoặc tên sách để tìm phiếu..."
              value={searchReturn}
              onChange={(e) => {
                setSearchReturn(e.target.value);
                fetchData(e.target.value);
              }}
              className="loan-input loan-search-input"
            />

            <div className="loan-filter-group">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`loan-filter-btn loan-filter-all ${statusFilter === 'ALL' ? 'active' : ''}`}
              >
                Tất cả ({loans.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('UNRETURNED')}
                className={`loan-filter-btn loan-filter-unreturned ${statusFilter === 'UNRETURNED' ? 'active' : ''}`}
              >
                Chưa trả ({countUnreturned})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('RETURNED')}
                className={`loan-filter-btn loan-filter-returned ${statusFilter === 'RETURNED' ? 'active' : ''}`}
              >
                Đã trả ({countReturned})
              </button>
            </div>
          </div>

          <div className="loan-table-wrapper">
            <table className="loan-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Độc giả</th>
                  <th>Mã &amp; Tên sách</th>
                  <th>Ngày mượn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredLoans.map((item) => (
                  <tr key={item.MaMuon}>
                    <td className="loan-id-cell">{item.MaMuon}</td>
                    <td>
                      <strong>{item.MaDocGia}</strong>
                      <div className="loan-subtext">{item.LoaiDocGia}</div>
                    </td>
                    <td>
                      <strong>{item.MaSach}</strong> - {item.TenSach}
                    </td>
                    <td>{item.NgayMuon}</td>
                    <td>
                      <span className={`loan-status ${item.TrangThai === 'Đã trả' ? 'returned' : 'unreturned'}`}>
                        {item.TrangThai}
                      </span>
                    </td>
                    <td>
                      {item.TrangThai !== 'Đã trả' ? (
                        <button
                          onClick={() => handleReturnBook(item.MaMuon)}
                          className="loan-return-btn"
                        >
                          Trả sách
                        </button>
                      ) : (
                        <span className="loan-returned-date">
                          Đã trả ({item.NgayTra})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

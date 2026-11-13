import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const cardStyle = {
  background: '#ffffff',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
  border: '1px solid #e2e8f0',
  color: '#1e293b',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  marginTop: '6px',
  fontSize: '14px',
  color: '#0f172a',
  background: '#fff',
  boxSizing: 'border-box',
};

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
    <div style={{ padding: '8px 0' }}>
      {message && (
        <div style={{ padding: '12px 16px', background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: '10px', marginBottom: '20px', fontWeight: 500 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', alignItems: 'start' }}>
        {/* CỘT TRÁI: TẠO PHIẾU MƯỢN */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0f172a' }}>1. Tạo Phiếu Mượn Mới</h3>
          <form onSubmit={handleBorrowSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Mã độc giả (Người mượn):</label>
              <input
                required
                list="reader-suggestions"
                maxLength={10}
                placeholder="VD: DG001 (hoặc nhập mã mới DG081)..."
                value={form.MaDocGia}
                onChange={(e) => handleReaderChange(e.target.value)}
                style={inputStyle}
              />
              <datalist id="reader-suggestions">
                {readers.map((r) => (
                  <option key={r.MaDocGia} value={r.MaDocGia}>
                    {`${r.MaDocGia} - ${r.LoaiDocGia}`}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Loại độc giả:</label>
              <select
                value={form.LoaiDocGia}
                onChange={(e) => setForm({ ...form, LoaiDocGia: e.target.value })}
                style={inputStyle}
              >
                <option value="Sinh viên">Sinh viên</option>
                <option value="Giảng viên">Giảng viên</option>
                <option value="Học viên cao học">Nhân viên thư viện</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Nhập / Chọn tên sách:</label>
              <input
                required
                list="book-suggestions"
                placeholder="Gõ tên sách để tìm..."
                value={form.TenSachInput}
                onChange={(e) => handleSelectBookByName(e.target.value)}
                style={inputStyle}
              />
              <datalist id="book-suggestions">
                {books.map((b) => (
                  <option key={b.MaSach} value={b.TenSach}>
                    {`${b.MaSach} - Còn lại: ${b.SoBanHienCo} quyển`}
                  </option>
                ))}
              </datalist>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Mã sách:</label>
                <input
                  readOnly
                  value={form.MaSach}
                  placeholder="Tự động điền"
                  style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Ngày mượn:</label>
                <input
                  type="date"
                  value={form.NgayMuon}
                  onChange={(e) => setForm({ ...form, NgayMuon: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{ marginTop: '6px', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Tạo Phiếu Mượn
            </button>
          </form>

          {createdReceipt && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '10px', color: '#065f46', fontSize: '14px' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Thông tin Phiếu Mượn Vừa Tạo</h4>
              <p style={{ margin: '4px 0' }}><strong>Mã phiếu:</strong> {createdReceipt.MaMuon}</p>
              <p style={{ margin: '4px 0' }}><strong>Mã độc giả:</strong> {createdReceipt.MaDocGia} ({createdReceipt.LoaiDocGia})</p>
              <p style={{ margin: '4px 0' }}><strong>Mã sách:</strong> {createdReceipt.MaSach}</p>
              <p style={{ margin: '4px 0' }}><strong>Tên sách:</strong> {createdReceipt.TenSach}</p>
              <p style={{ margin: '4px 0' }}><strong>Ngày mượn:</strong> {createdReceipt.NgayMuon}</p>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: TRA CỨU & TRẢ SÁCH */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#0f172a' }}>2. Trả Sách (Nhập Mã độc giả / Mã phiếu / Tên sách)</h3>
          
          {/* Thanh tìm kiếm + Bộ lọc trạng thái */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nhập mã độc giả (VD: DG001) hoặc tên sách để tìm phiếu..."
              value={searchReturn}
              onChange={(e) => {
                setSearchReturn(e.target.value);
                fetchData(e.target.value);
              }}
              style={{ ...inputStyle, marginTop: 0, flex: 1, minWidth: '220px' }}
            />

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: statusFilter === 'ALL' ? '#0f172a' : '#f8fafc',
                  color: statusFilter === 'ALL' ? '#fff' : '#475569',
                }}
              >
                Tất cả ({loans.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('UNRETURNED')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #fcd34d',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: statusFilter === 'UNRETURNED' ? '#d97706' : '#fef3c7',
                  color: statusFilter === 'UNRETURNED' ? '#fff' : '#92400e',
                }}
              >
                Chưa trả ({countUnreturned})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RETURNED')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #6ee7b7',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: statusFilter === 'RETURNED' ? '#059669' : '#d1fae5',
                  color: statusFilter === 'RETURNED' ? '#fff' : '#065f46',
                }}
              >
                Đã trả ({countReturned})
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 8px' }}>Mã phiếu</th>
                  <th style={{ padding: '10px 8px' }}>Độc giả</th>
                  <th style={{ padding: '10px 8px' }}>Mã & Tên sách</th>
                  <th style={{ padding: '10px 8px' }}>Ngày mượn</th>
                  <th style={{ padding: '10px 8px' }}>Trạng thái</th>
                  <th style={{ padding: '10px 8px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((item) => (
                  <tr key={item.MaMuon} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{item.MaMuon}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <strong>{item.MaDocGia}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.LoaiDocGia}</div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <strong>{item.MaSach}</strong> - {item.TenSach}
                    </td>
                    <td style={{ padding: '10px 8px' }}>{item.NgayMuon}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: item.TrangThai === 'Đã trả' ? '#d1fae5' : '#fef3c7',
                        color: item.TrangThai === 'Đã trả' ? '#065f46' : '#92400e',
                      }}>
                        {item.TrangThai}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {item.TrangThai !== 'Đã trả' ? (
                        <button
                          onClick={() => handleReturnBook(item.MaMuon)}
                          style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Trả sách
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Đã trả ({item.NgayTra})</span>
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
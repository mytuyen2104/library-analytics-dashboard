import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_HISTORY_KEY = 'library_inventory_history_backup';

const cardStyle = {
  background: '#ffffff',
  padding: '20px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
  border: '1px solid #e2e8f0',
  color: '#1e293b',
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  color: '#0f172a',
  background: '#fff',
};

export default function InventoryManagement() {
  const [books, setBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'OUT' | 'UNDER_10'
  const [newBook, setNewBook] = useState({
    TenSach: '',
    TacGia: '',
    TheLoai: 'Công nghệ thông tin',
    SoBanHienCo: 10,
    NamXuatBan: 2025,
  });

  const fetchBooks = async (keyword = '') => {
    try {
      const res = await fetch(`${API_URL}/sach?search=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách kho:', err);
      setBooks([]);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/sach/lich-su`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data);
          localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(data));
          return;
        }
      }
    } catch (err) {
      console.warn('Đang dùng bộ nhớ đệm lịch sử cục bộ:', err);
    }
    const cached = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
    setHistory(cached);
  };

  useEffect(() => {
    fetchBooks();
    fetchHistory();
  }, []);

  const recordLocalBackup = (entry) => {
    const current = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
    const updated = [entry, ...current];
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  const handleDeleteHistoryItem = async (id) => {
    try {
      await fetch(`${API_URL}/sach/lich-su/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Lỗi xóa trên server:', err);
    }
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử nhập kho không?')) return;
    try {
      await fetch(`${API_URL}/sach/lich-su`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Lỗi xóa toàn bộ trên server:', err);
    }
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify([]));
    setHistory([]);
  };

  const handleAddNewBook = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/sach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    });
    const data = await res.json();
    if (res.ok) {
      recordLocalBackup({
        id: Date.now(),
        thoiGian: new Date().toLocaleString('vi-VN'),
        loaiHanhDong: 'Thêm đầu sách mới',
        maSach: data.MaSach || 'Mới',
        tenSach: newBook.TenSach,
        soLuongThem: Number(newBook.SoBanHienCo),
        tonSauNhap: Number(newBook.SoBanHienCo),
      });
      alert('Đã thêm đầu sách mới vào kho!');
      setNewBook({ TenSach: '', TacGia: '', TheLoai: 'Công nghệ thông tin', SoBanHienCo: 10, NamXuatBan: 2025 });
      fetchBooks(search);
      fetchHistory();
    }
  };

  const handleRestock = async (book) => {
    const qty = prompt(`Nhập số lượng sách muốn bổ sung thêm cho "${book.TenSach}":`, '5');
    if (!qty || isNaN(qty) || Number(qty) <= 0) return;

    const added = Number(qty);
    const res = await fetch(`${API_URL}/sach/${book.MaSach}/nhap-kho`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soLuongThem: added }),
    });
    if (res.ok) {
      recordLocalBackup({
        id: Date.now(),
        thoiGian: new Date().toLocaleString('vi-VN'),
        loaiHanhDong: 'Nhập bổ sung kho',
        maSach: book.MaSach,
        tenSach: book.TenSach,
        soLuongThem: added,
        tonSauNhap: Number(book.SoBanHienCo) + added,
      });
      fetchBooks(search);
      fetchHistory();
    }
  };

  // Thống kê số lượng sách theo mức tồn kho
  const countOut = books.filter((b) => Number(b.SoBanHienCo) === 0).length;
  const countUnder10 = books.filter((b) => Number(b.SoBanHienCo) < 10).length;

  // Lọc danh sách sách theo bộ lọc tồn kho & xếp cuốn ít nhất lên đầu khi lọc
  const displayedBooks = books
    .filter((b) => {
      const qty = Number(b.SoBanHienCo);
      if (stockFilter === 'OUT') return qty === 0;
      if (stockFilter === 'UNDER_10') return qty < 10;
      return true;
    })
    .sort((a, b) => {
      if (stockFilter === 'ALL') return 0;
      return Number(a.SoBanHienCo) - Number(b.SoBanHienCo);
    });

  const getStockBadgeStyle = (qty) => {
    const num = Number(qty);
    if (num === 0) return { background: '#fee2e2', color: '#dc2626' };
    if (num < 10) return { background: '#fef3c7', color: '#b45309' };
    return { background: '#d1fae5', color: '#059669' };
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {/* 1. Form thêm đầu sách mới */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#0f172a' }}>Thêm Đầu Sách Mới Vào Kho</h3>
        <form onSubmit={handleAddNewBook} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 0.8fr 0.8fr auto', gap: '10px' }}>
          <input required placeholder="Tên sách mới..." value={newBook.TenSach} onChange={(e) => setNewBook({ ...newBook, TenSach: e.target.value })} style={inputStyle} />
          <input placeholder="Tác giả..." value={newBook.TacGia} onChange={(e) => setNewBook({ ...newBook, TacGia: e.target.value })} style={inputStyle} />
          <input required placeholder="Thể loại..." value={newBook.TheLoai} onChange={(e) => setNewBook({ ...newBook, TheLoai: e.target.value })} style={inputStyle} />
          <input required type="number" min="0" placeholder="Số lượng" value={newBook.SoBanHienCo} onChange={(e) => setNewBook({ ...newBook, SoBanHienCo: e.target.value })} style={inputStyle} />
          <input type="number" placeholder="Năm XB" value={newBook.NamXuatBan} onChange={(e) => setNewBook({ ...newBook, NamXuatBan: e.target.value })} style={inputStyle} />
          <button type="submit" style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Thêm Sách
          </button>
        </form>
      </div>

      {/* 2. Danh sách tồn kho + Bộ lọc cảnh báo thiếu + Nút Lịch sử */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Danh Sách Tồn Kho Hiện Tại</h3>
          <button
            type="button"
            onClick={() => {
              if (!showHistory) fetchHistory();
              setShowHistory(!showHistory);
            }}
            style={{
              padding: '7px 14px',
              background: showHistory ? '#0f172a' : '#f1f5f9',
              color: showHistory ? '#fff' : '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{showHistory ? '✕ Đóng lịch sử' : `🕒 Lịch sử nhập kho (${history.length})`}</span>
          </button>
        </div>

        {/* Khung lịch sử chỉ hiện khi bấm nút */}
        {showHistory && (
          <div style={{ marginBottom: '18px', padding: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Nhật ký Thêm / Nhập Bổ Sung Kho Sách</strong>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  style={{
                    padding: '5px 10px',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  🗑️ Xóa tất cả lịch sử
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                Chưa có giao dịch thêm hoặc nhập kho nào được ghi nhận.
              </p>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '8px' }}>Thời gian</th>
                      <th style={{ padding: '8px' }}>Thao tác</th>
                      <th style={{ padding: '8px' }}>Mã sách</th>
                      <th style={{ padding: '8px' }}>Tên sách</th>
                      <th style={{ padding: '8px' }}>Số lượng thêm</th>
                      <th style={{ padding: '8px' }}>Tồn sau nhập</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px', color: '#334155', fontWeight: 500 }}>{item.thoiGian}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: item.loaiHanhDong === 'Thêm đầu sách mới' ? '#dbeafe' : '#e0f2fe',
                            color: '#1d4ed8',
                          }}>
                            {item.loaiHanhDong}
                          </span>
                        </td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{item.maSach}</td>
                        <td style={{ padding: '8px' }}><strong>{item.tenSach}</strong></td>
                        <td style={{ padding: '8px', color: '#059669', fontWeight: 'bold' }}>+{item.soLuongThem} quyển</td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{item.tonSauNhap} quyển</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            style={{
                              padding: '3px 8px',
                              background: 'transparent',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Thanh tìm kiếm + Bộ lọc sách thiếu / dưới 10 cuốn */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sách, mã sách hoặc tác giả..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchBooks(e.target.value);
            }}
            style={{ ...inputStyle, flex: 1, minWidth: '240px' }}
          />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStockFilter('ALL')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                background: stockFilter === 'ALL' ? '#0f172a' : '#f8fafc',
                color: stockFilter === 'ALL' ? '#fff' : '#475569',
              }}
            >
              Tất cả ({books.length})
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('OUT')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #fca5a5',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                background: stockFilter === 'OUT' ? '#dc2626' : '#fee2e2',
                color: stockFilter === 'OUT' ? '#fff' : '#b91c1c',
              }}
            >
              Hết hàng ({countOut})
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('UNDER_10')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #fcd34d',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                background: stockFilter === 'UNDER_10' ? '#d97706' : '#fef3c7',
                color: stockFilter === 'UNDER_10' ? '#fff' : '#92400e',
              }}
            >
              Dưới 10 cuốn ({countUnder10})
            </button>
          </div>
        </div>

        <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px 10px' }}>Mã sách</th>
                <th style={{ padding: '12px 10px' }}>Tên sách</th>
                <th style={{ padding: '12px 10px' }}>Tác giả</th>
                <th style={{ padding: '12px 10px' }}>Thể loại</th>
                <th style={{ padding: '12px 10px' }}>Năm XB</th>
                <th style={{ padding: '12px 10px' }}>Tồn kho hiện có</th>
                <th style={{ padding: '12px 10px' }}>Cập nhật kho</th>
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    Không có đầu sách nào thuộc mức tồn kho này.
                  </td>
                </tr>
              ) : (
                displayedBooks.map((b) => {
                  const badge = getStockBadgeStyle(b.SoBanHienCo);
                  return (
                    <tr key={b.MaSach} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{b.MaSach}</td>
                      <td style={{ padding: '10px' }}><strong>{b.TenSach}</strong></td>
                      <td style={{ padding: '10px', color: '#475569' }}>{b.TacGia || '—'}</td>
                      <td style={{ padding: '10px' }}>{b.TheLoai}</td>
                      <td style={{ padding: '10px' }}>{b.NamXuatBan || '—'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '13px',
                          background: badge.background,
                          color: badge.color,
                        }}>
                          {Number(b.SoBanHienCo) === 0 ? '0 quyển (Hết)' : `${b.SoBanHienCo} quyển`}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button
                          onClick={() => handleRestock(b)}
                          style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          + Nhập thêm
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
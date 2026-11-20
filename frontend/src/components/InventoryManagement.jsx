import React, { useState, useEffect } from 'react';
import '../styles/InventoryManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_HISTORY_KEY = 'library_inventory_history_backup';

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
      setNewBook({
        TenSach: '',
        TacGia: '',
        TheLoai: 'Công nghệ thông tin',
        SoBanHienCo: 10,
        NamXuatBan: 2025,
      });
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

  const getStockBadgeClass = (qty) => {
    const num = Number(qty);
    if (num === 0) return 'inv-stock-badge inv-stock-badge--out';
    if (num < 10) return 'inv-stock-badge inv-stock-badge--low';
    return 'inv-stock-badge inv-stock-badge--ok';
  };

  return (
    <div className="inv-container">
      {/* 1. Form thêm đầu sách mới */}
      <div className="inv-card inv-card--spaced">
        <h3 className="inv-card-title inv-card-title--form">Thêm Đầu Sách Mới Vào Kho</h3>
        <form className="inv-add-form" onSubmit={handleAddNewBook}>
          <input
            required
            className="inv-input"
            placeholder="Tên sách mới..."
            value={newBook.TenSach}
            onChange={(e) => setNewBook({ ...newBook, TenSach: e.target.value })}
          />
          <input
            className="inv-input"
            placeholder="Tác giả..."
            value={newBook.TacGia}
            onChange={(e) => setNewBook({ ...newBook, TacGia: e.target.value })}
          />
          <input
            required
            className="inv-input"
            placeholder="Thể loại..."
            value={newBook.TheLoai}
            onChange={(e) => setNewBook({ ...newBook, TheLoai: e.target.value })}
          />
          <input
            required
            type="number"
            min="0"
            className="inv-input"
            placeholder="Số lượng"
            value={newBook.SoBanHienCo}
            onChange={(e) => setNewBook({ ...newBook, SoBanHienCo: e.target.value })}
          />
          <input
            type="number"
            className="inv-input"
            placeholder="Năm XB"
            value={newBook.NamXuatBan}
            onChange={(e) => setNewBook({ ...newBook, NamXuatBan: e.target.value })}
          />
          <button type="submit" className="inv-btn-add">
            + Thêm Sách
          </button>
        </form>
      </div>

      {/* 2. Danh sách tồn kho + Bộ lọc cảnh báo thiếu + Nút Lịch sử */}
      <div className="inv-card">
        <div className="inv-list-header">
          <h3 className="inv-card-title">Danh Sách Tồn Kho Hiện Tại</h3>
          <button
            type="button"
            onClick={() => {
              if (!showHistory) fetchHistory();
              setShowHistory(!showHistory);
            }}
            className={`inv-history-toggle ${showHistory ? 'inv-history-toggle--active' : ''}`}
          >
            <span>{showHistory ? '✕ Đóng lịch sử' : `🕒 Lịch sử nhập kho (${history.length})`}</span>
          </button>
        </div>

        {/* Khung lịch sử chỉ hiện khi bấm nút */}
        {showHistory && (
          <div className="inv-history-panel">
            <div className="inv-history-toolbar">
              <strong className="inv-history-heading">Nhật ký Thêm / Nhập Bổ Sung Kho Sách</strong>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="inv-history-clear-btn"
                >
                  🗑️ Xóa tất cả lịch sử
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="inv-history-empty">
                Chưa có giao dịch thêm hoặc nhập kho nào được ghi nhận.
              </p>
            ) : (
              <div className="inv-history-scroll">
                <table className="inv-history-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Thao tác</th>
                      <th>Mã sách</th>
                      <th>Tên sách</th>
                      <th>Số lượng thêm</th>
                      <th>Tồn sau nhập</th>
                      <th className="inv-text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td className="inv-history-time">{item.thoiGian}</td>
                        <td>
                          <span
                            className={`inv-action-badge ${
                              item.loaiHanhDong === 'Thêm đầu sách mới'
                                ? 'inv-action-badge--new'
                                : 'inv-action-badge--restock'
                            }`}
                          >
                            {item.loaiHanhDong}
                          </span>
                        </td>
                        <td className="inv-code-cell">{item.maSach}</td>
                        <td>
                          <strong>{item.tenSach}</strong>
                        </td>
                        <td className="inv-added-qty">+{item.soLuongThem} quyển</td>
                        <td className="inv-after-qty">{item.tonSauNhap} quyển</td>
                        <td className="inv-text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            className="inv-history-delete-btn"
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
        <div className="inv-toolbar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sách, mã sách hoặc tác giả..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchBooks(e.target.value);
            }}
            className="inv-input inv-search-input"
          />

          <div className="inv-filter-group">
            <button
              type="button"
              onClick={() => setStockFilter('ALL')}
              className={`inv-filter-btn inv-filter-btn--all ${
                stockFilter === 'ALL' ? 'is-active' : ''
              }`}
            >
              Tất cả ({books.length})
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('OUT')}
              className={`inv-filter-btn inv-filter-btn--out ${
                stockFilter === 'OUT' ? 'is-active' : ''
              }`}
            >
              Hết hàng ({countOut})
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('UNDER_10')}
              className={`inv-filter-btn inv-filter-btn--under10 ${
                stockFilter === 'UNDER_10' ? 'is-active' : ''
              }`}
            >
              Dưới 10 cuốn ({countUnder10})
            </button>
          </div>
        </div>

        <div className="inv-table-scroll">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Mã sách</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Thể loại</th>
                <th>Năm XB</th>
                <th>Tồn kho hiện có</th>
                <th>Cập nhật kho</th>
              </tr>
            </thead>
            <tbody>
              {displayedBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="inv-table-empty">
                    Không có đầu sách nào thuộc mức tồn kho này.
                  </td>
                </tr>
              ) : (
                displayedBooks.map((b) => (
                  <tr key={b.MaSach}>
                    <td className="inv-code-cell">{b.MaSach}</td>
                    <td>
                      <strong>{b.TenSach}</strong>
                    </td>
                    <td className="inv-author-cell">{b.TacGia || '—'}</td>
                    <td>{b.TheLoai}</td>
                    <td>{b.NamXuatBan || '—'}</td>
                    <td>
                      <span className={getStockBadgeClass(b.SoBanHienCo)}>
                        {Number(b.SoBanHienCo) === 0 ? '0 quyển (Hết)' : `${b.SoBanHienCo} quyển`}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRestock(b)}
                        className="inv-btn-restock"
                      >
                        + Nhập thêm
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
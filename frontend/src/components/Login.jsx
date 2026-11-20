
import React, { useState } from 'react';
import '../styles/Login.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('https://api.dashboardg4.click/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        onLoginSuccess();
      } else {
        setMessage(data.message || 'Đăng nhập thất bại!');
      }
    } catch {
      setMessage('Không thể kết nối đến server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* HEADER */}
        <div className="login-heading">
          <div className="login-brand">
            <h1>UTH LIBRARY ANALYTICS DASHBOARD</h1>
            <span>Học Kỳ Doanh Nghiệp - Nhóm 4</span>
          </div>

          <div className="login-divider"></div>

          <h2>Đăng nhập hệ thống</h2>
          <p>
            Vui lòng đăng nhập để tiếp tục sử dụng hệ thống quản lý thư viện.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {message && (
          <div className="login-message">
            {message}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="login-form">

          <div className="login-form-group">
            <label htmlFor="username">Tên đăng nhập</label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Mật khẩu</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>

        </form>

        {/* FOOTER */}
        <div className="login-footer">
          <span>BY HỌC KỲ DOANH NGHIỆP - NHÓM 4</span>
          <p>UTH Library Analytics Dashboard</p>
        </div>

      </div>
    </div>
  );
}

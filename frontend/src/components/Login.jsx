import React, { useState } from 'react';

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
      const res = await fetch('http://localhost:5000/api/auth/login', {
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', width: '380px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 Quản Trị Thư Viện UTH</h2>
        {message && <p style={{ color: '#f87171', textAlign: 'center', fontSize: '14px', marginBottom: '15px' }}>{message}</p>}

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ví dụ: admin1, thuthu1..."
            required
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Đang kiểm tra...' : 'Đăng Nhập Hệ Thống'}
          </button>
        </form>
        
        <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          (Gợi ý tài khoản demo: <b>admin1</b> / <b>123456</b>)
        </p>
      </div>
    </div>
  );
}
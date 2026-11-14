import React, { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const QUICK_QUESTIONS = [
  'Thư viện hiện có tổng bao nhiêu đầu sách và bản sách?',
  'Top 5 cuốn sách được mượn nhiều nhất là gì?',
  'Những sách nào đang ở mức cực kỳ cấp thiết cần bổ sung?',
  'Cổng CSDL điện tử nào có lượt truy cập cao nhất?',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý phân tích dữ liệu Thư viện UTH. Bạn muốn tra cứu số liệu gì?',
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (questionText) => {
    const text = (questionText || input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Không thể kết nối tới máy chủ API. Vui lòng thử lại!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'sans-serif' }}>
      {isOpen && (
        <div
          style={{
            width: '360px',
            height: '480px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            borderRadius: '14px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: '12px',
            border: '1px solid #334155',
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>🤖 Trợ lý Dữ liệu Thư viện</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Nội dung tin nhắn */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.sender === 'user' ? '#2563eb' : '#334155',
                  padding: '9px 13px',
                  borderRadius: '12px',
                  maxWidth: '85%',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.45',
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Đang truy vấn dữ liệu SQL Server...</div>}
            <div ref={chatEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh */}
          <div style={{ padding: '6px 10px', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid #334155', backgroundColor: '#0f172a' }}>
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '11px',
                  padding: '5px 9px',
                  borderRadius: '99px',
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Ô nhập liệu */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={{ display: 'flex', padding: '10px', backgroundColor: '#0f172a', gap: '8px' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi số liệu thư viện..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#1e293b',
                color: '#fff',
                outline: 'none',
                fontSize: '13px',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#10b981',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Gửi
            </button>
          </form>
        </div>
      )}

      {/* Nút bong bóng mở Chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          float: 'right',
          padding: '12px 18px',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: '#2563eb',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)',
          cursor: 'pointer',
        }}
      >
        💬 Hỏi đáp AI
      </button>
    </div>
  );
}
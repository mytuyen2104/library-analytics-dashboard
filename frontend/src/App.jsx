import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
// import Overview from './components/Overview.jsx';
// import Borrowing from './components/Borrowing.jsx';
// import ElectronicAccess from './pages/ElectronicAccess.jsx';
// import DemandAnalysis from './pages/DemandAnalysis.jsx';
// import Acquisition from './pages/Acquisition.jsx';
// import LogDetails from './pages/LogDetails.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Management from './pages/Management.jsx';
// import LoanManagement from './pages/LoanManagement';
// import InventoryManagement from './pages/InventoryManagement';
import ChatWidget from './components/ChatWidget';
import Login from './components/Login';
// import ReaderManagement from './pages/ReaderManagement';

const headings = {
  '/overview': ['TỔNG QUAN THƯ VIỆN', 'Theo dõi các chỉ số hoạt động của thư viện'],
  '/borrowing': ['THỐNG KÊ LƯỢT MƯỢN', 'Theo dõi lượt mượn và những đầu sách phổ biến'],
  '/electronic-access': ['TRUY CẬP ĐIỆN TỬ', 'Phân tích lượt truy cập các cơ sở dữ liệu điện tử'],
  '/demand-analysis': ['PHÂN TÍCH NHU CẦU', 'Khám phá xu hướng và nhu cầu tài liệu'],
  '/acquisition': ['GỢI Ý BỔ SUNG TÀI LIỆU', 'Xếp hạng ưu tiên dựa trên nhu cầu và số bản hiện có'],
  '/log-details': ['CHI TIẾT NHẬT KÝ', 'Theo dõi lịch sử giao dịch và hoạt động của hệ thống'],
  '/loan-management': ['QUẢN LÝ MƯỢN TRẢ', 'Theo dõi và quản lý quá trình mượn trả sách'],
  '/inventory-management': ['QUẢN LÝ KHO SÁCH', 'Quản lý tồn kho và bổ sung sách mới'],
  '/reader-management': ['QUẢN LÝ ĐỘC GIẢ', 'Quản lý thông tin và hoạt động của độc giả'],
};

export default function App() {
  const { pathname } = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isAdminLoggedIn') === 'true'
  );

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
  };

  // Chặn toàn bộ trang web nếu chưa đăng nhập
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Trang chủ và trang Giới thiệu (truyền onLogout vào Home)
if (
  pathname === '/' ||
  pathname === '/about' ||
  pathname === '/management' ||
  [
    '/overview',
    '/borrowing',
    '/electronic-access',
    '/demand-analysis',
    '/acquisition',
    '/log-details'
  ].includes(pathname)
)
 {
    return (
  <Routes>
    <Route path="/" element={<Home onLogout={handleLogout} />} />
    <Route path="/about" element={<About onLogout={handleLogout} />} />
<Route
  path="/management"
  element={<Management onLogout={handleLogout} />}
/>
    <Route path="/overview" element={<Home onLogout={handleLogout} />} />
    <Route path="/borrowing" element={<Home onLogout={handleLogout} />} />
    <Route path="/electronic-access" element={<Home onLogout={handleLogout} />} />
    <Route path="/demand-analysis" element={<Home onLogout={handleLogout} />} />
    <Route path="/acquisition" element={<Home onLogout={handleLogout} />} />
    <Route path="/log-details" element={<Home onLogout={handleLogout} />} />
  </Routes>
);
  }

  // Các trang Dashboard quản trị bên trong (truyền onLogout vào Header)
  const [title, subtitle] = headings[pathname] || ['LIBRARY ANALYTICS', ''];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-column">
        <Header title={title} subtitle={subtitle} onLogout={handleLogout} />
        <main className="content">
          <Routes>
            
            <Route path="/loan-management" element={<LoanManagement />} />
            <Route path="/inventory-management" element={<InventoryManagement />} />
            <Route path="/reader-management" element={<ReaderManagement />} />
            <Route path="*" element={<Overview />} />
          </Routes>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
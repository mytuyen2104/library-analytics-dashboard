import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Overview from './pages/Overview.jsx';
import Borrowing from './pages/Borrowing.jsx';
import ElectronicAccess from './pages/ElectronicAccess.jsx';
import DemandAnalysis from './pages/DemandAnalysis.jsx';
import Acquisition from './pages/Acquisition.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
const headings={'/overview':['TỔNG QUAN THƯ VIỆN','Theo dõi các chỉ số hoạt động của thư viện'],'/borrowing':['THỐNG KÊ LƯỢT MƯỢN','Theo dõi lượt mượn và những đầu sách phổ biến'],'/electronic-access':['TRUY CẬP ĐIỆN TỬ','Phân tích lượt truy cập các cơ sở dữ liệu điện tử'],'/demand-analysis':['PHÂN TÍCH NHU CẦU','Khám phá xu hướng và nhu cầu tài liệu'],'/acquisition':['GỢI Ý BỔ SUNG TÀI LIỆU','Xếp hạng ưu tiên dựa trên nhu cầu và số bản hiện có']};
export default function App(){const {pathname}=useLocation();if(pathname==='/'||pathname==='/about')return <Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/></Routes>;const [title,subtitle]=headings[pathname]||['LIBRARY ANALYTICS',''];return <div className="app-shell"><Sidebar/><div className="main-column"><Header title={title} subtitle={subtitle}/><main className="content"><Routes><Route path="/overview" element={<Overview/>}/><Route path="/borrowing" element={<Borrowing/>}/><Route path="/electronic-access" element={<ElectronicAccess/>}/><Route path="/demand-analysis" element={<DemandAnalysis/>}/><Route path="/acquisition" element={<Acquisition/>}/><Route path="*" element={<Overview/>}/></Routes></main></div></div>}

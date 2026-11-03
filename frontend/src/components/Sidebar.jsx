import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Database, ChartNoAxesCombined, ListOrdered } from 'lucide-react';
const links = [
  {to:'/', label:'Trang chủ', icon:LayoutDashboard, end:true},
  {to:'/overview', label:'Tổng quan', icon:LayoutDashboard},
  {to:'/borrowing', label:'Thống kê lượt mượn', icon:BookOpen},
  {to:'/electronic-access', label:'Truy cập điện tử', icon:Database},
  {to:'/demand-analysis', label:'Phân tích nhu cầu', icon:ChartNoAxesCombined},
  {to:'/acquisition', label:'Gợi ý bổ sung tài liệu', icon:ListOrdered},
];
export default function Sidebar(){return <aside className="sidebar"><div className="brand"><div className="brand-mark">L</div><div><strong>Library Analytics</strong><small>Dashboard</small></div></div><nav aria-label="Điều hướng chính">{links.map(({to,label,icon:Icon,end})=><NavLink key={to} to={to} end={end} className={({isActive})=>`nav-link ${isActive?'active':''}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav><div className="sidebar-footer">UTH • Library Analytics</div></aside>}

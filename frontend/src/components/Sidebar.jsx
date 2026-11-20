
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

import {
  LayoutDashboard,
  BookOpen,
  Database,
  ChartNoAxesCombined,
  ListOrdered,
  FileText
} from 'lucide-react';

const groups = [
  {
    title: 'Phân tích',
    links: [
      { to: '/overview', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/borrowing', label: 'Thống kê lượt mượn', icon: BookOpen },
      { to: '/electronic-access', label: 'Truy cập điện tử', icon: Database },
      { to: '/demand-analysis', label: 'Phân tích nhu cầu', icon: ChartNoAxesCombined },
    ],
  },
  {
    title: 'Đề xuất',
    links: [
      { to: '/acquisition', label: 'Gợi ý bổ sung tài liệu', icon: ListOrdered },
    ],
  },
  {
    title: 'Khác',
    links: [
      { to: '/log-details', label: 'Chi tiết nhật ký', icon: FileText },
    ],
  },
];

export default function Sidebar({ activeSection }) {
  const location = useLocation();

  // Khi ở Home và cuộn xuống Dashboard,
  // mặc định kích hoạt Tổng quan
  const isHomeDashboard =
    location.pathname === '/' && activeSection === 'dashboard';

  return (
    <aside className="sidebar">

      <div className="brand">
        <div>
          Dashboard
        </div>
      </div>

      <nav aria-label="Điều hướng chính">

        {groups.map((group) => (
          <div className="sidebar-group" key={group.title}>

            <div className="sidebar-group-title">
              {group.title}
            </div>

            {group.links.map(({ to, label, icon: Icon }) => {

              const isOverviewActive =
                to === '/overview' && isHomeDashboard;

              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `nav-link ${
                      isActive || isOverviewActive ? 'active' : ''
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{label}</span>
                </NavLink>
              );
            })}

          </div>
        ))}

      </nav>

      <div className="sidebar-footer">
        UTH • Library Analytics
      </div>

    </aside>
  );
}

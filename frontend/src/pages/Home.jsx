
import React, { useRef, useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';

import '../styles/home.css';

import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Overview from '../components/Overview.jsx';
import Borrowing from '../components/Borrowing.jsx';
import ElectronicAccess from '../components/ElectronicAccess.jsx';
import DemandAnalysis from '../components/DemandAnalysis.jsx';
import Acquisition from '../components/Acquisition.jsx';
import LogDetails from '../components/LogDetails.jsx';
import ChatWidget from '../components/ChatWidget.jsx';


export default function Home({ onLogout }) {
  const dashboardRef = useRef(null);
  const location = useLocation();
  // const navigate = useNavigate();
  const contentRef = useRef(null);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (location.pathname === '/') return;

    requestAnimationFrame(() => {
      // Reset vùng nội dung Dashboard
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
        contentRef.current.scrollLeft = 0;
      }

      // Đưa khu vực Dashboard về vị trí đầu
      dashboardRef.current?.scrollIntoView({
        behavior: 'instant',
        block: 'start'
      });
    });
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('dashboard');
    } else if (location.hash === '#dashboard') {
      setActiveSection('dashboard');
    } else {
      setActiveSection('home');
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname === '/' && !location.hash) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.hash === '#dashboard') {
      requestAnimationFrame(() => {
        dashboardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== '/') {
        setActiveSection('dashboard');
        return;
      }

      if (!dashboardRef.current) return;

      const dashboardTop =
        dashboardRef.current.getBoundingClientRect().top;

      if (dashboardTop <= window.innerHeight * 0.35) {
        setActiveSection('dashboard');
      } else {
        setActiveSection('home');
      }
    };



    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // Xác định nội dung Dashboard theo đường dẫn
  const renderDashboard = () => {
    switch (location.pathname) {
      case '/overview':
        return <Overview />;

      case '/borrowing':
        return <Borrowing />;

      case '/electronic-access':
        return <ElectronicAccess />;

      case '/demand-analysis':
        return <DemandAnalysis />;

      case '/acquisition':
        return <Acquisition />;

      case '/log-details':
        return <LogDetails />;

      default:
        return <Overview />;
    }
  };

  return (
    <div className="home-main-layout">

      <div className="home-orbs-container">
        <div className="home-orb orb-alpha" />
        <div className="home-orb orb-beta" />
        <div className="home-orb orb-gamma" />
      </div>

      {/* 1. HEADER */}
      <div className="home-header">
        <Header
          activeSection={activeSection}
          onLogout={onLogout}
        />
      </div>

      {/* 2. HOME CONTENT */}
      <div className="home-content">
        <section className="home-text">
          <div className="home-main-text">
            <h1>
              <br />
              <span className="home-gradient-text">
                Nền Tảng Phân Tích Dữ Liệu Và Quản Lý
                Thư Viện Thông Minh
              </span>
            </h1>

            <p>
              Số hóa nghiệp vụ mượn trả, quản lý kho sách – độc giả và trực quan hóa dữ liệu thư viện UTH, tích hợp gợi ý bổ sung tài liệu và hỏi đáp AI thông minh
            </p>
          </div>
        </section>
      </div>

      {/* 3. DASHBOARD */}
      <div className="home-dashboard" id="dashboard" ref={dashboardRef}>

        <aside className="dashboard-sidebar">
          <Sidebar activeSection={activeSection} />
        </aside>

        <main
          className="dashboard-content"
          ref={contentRef}
        >
          {renderDashboard()}
        </main>

      </div>
      <ChatWidget />
    </div>
  );
}


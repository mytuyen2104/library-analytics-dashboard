import React, { useState, useEffect } from "react";

import Header from "../components/Header.jsx";
import LoanManagement from "../components/LoanManagement.jsx";
import InventoryManagement from "../components/InventoryManagement.jsx";
import ReaderManagement from "../components/ReaderManagement.jsx";
import ChatWidget from '../components/ChatWidget.jsx';

import "../styles/Management.css";

const TABS_DATA = [
  {
    id: 'muon-tra',
    shortLabel: 'MƯỢN TRẢ',
    fullLabel: 'QUẢN LÝ MƯỢN TRẢ',
    content: 'Nội dung quản lý mượn trả sách...',
  },
  {
    id: 'kho-sach',
    shortLabel: 'KHO SÁCH',
    fullLabel: 'QUẢN LÝ KHO SÁCH',
    content: 'Nội dung quản lý kho sách...',
  },
  {
    id: 'doc-gia',
    shortLabel: 'ĐỘC GIẢ',
    fullLabel: 'QUẢN LÝ ĐỘC GIẢ',
    content: 'Nội dung quản lý độc giả...',
  },
];

export default function LibraryManagement({ onLogout }) {
  const [activeTab, setActiveTab] = useState('muon-tra');


  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, []);

  return (
    <div className="management-page">
      <div className="management-orbs-container">
        <div className="management-orb management-orb-alpha" />
        <div className="management-orb management-orb-beta" />
        <div className="management-orb management-orb-gamma" />
      </div>

      <div className="management-header">
        <Header
          activeSection="management"
          onLogout={onLogout}
        />
      </div>

      <div className="management-content">
        <section className="management-frame">
          {/* Thanh điều hướng Tabs */}
          <div className="tabs-header" role="tablist">
            {TABS_DATA.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {/* Render tên đầy đủ nếu đang active, ngược lại render tên ngắn */}
                  {isActive ? tab.fullLabel : tab.shortLabel}
                </button>
              );
            })}
          </div>


          {/* Khung hiển thị nội dung tương ứng */}
          <div className="tab">
            <div className="tab-content">
              <div className="tab-panel" role="tabpanel">

                {activeTab === 'muon-tra' && (
                  <LoanManagement />
                )}

                {activeTab === 'kho-sach' && (
                  <div className="inventory-scroll">
                    <InventoryManagement />
                  </div>
                )}

                {activeTab === 'doc-gia' && (
                  <div>
                    <ReaderManagement />
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>
      </div>
      <ChatWidget />
    </div>
  );
}

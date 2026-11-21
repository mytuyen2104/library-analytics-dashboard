import { useState } from "react";
import "../styles/LogDetails.css";

const base = "https://dashboard.dashboardg4.click/public/question/";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const charts = [
  {
    title: "Nhật ký hoạt động chi tiết hệ thống",
    description:
      "Theo dõi chi tiết lịch sử các giao dịch, thao tác và sự kiện diễn ra trong hệ thống thư viện theo thời gian thực.",
    url: `${base}7dfeefaa-50dd-4875-b5da-604eb005c0f6`,
  },
];

export default function LogDetails() {
  const [exporting, setExporting] = useState(false);

  const formatDate = (val) => {
    if (!val) return "Chưa trả";
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString("vi-VN");
  };

  const handleExportLogsCSV = async () => {
    try {
      setExporting(true);
      const res = await fetch(`${API_URL}/muon-tra`);
      if (!res.ok) throw new Error("Không thể lấy dữ liệu nhật ký từ máy chủ");
      const logs = await res.json();

      if (!Array.isArray(logs) || logs.length === 0) {
        alert("Chưa có dữ liệu nhật ký giao dịch để xuất báo cáo!");
        return;
      }

      const headers = [
        "Mã mượn",
        "Mã độc giả",
        "Tên độc giả",
        "Đối tượng",
        "Mã sách",
        "Tên sách",
        "Ngày mượn",
        "Hạn trả",
        "Ngày trả",
        "Trạng thái",
      ];

      const rows = logs.map((item) => [
        `"${item.MaMuon || ""}"`,
        `"${item.MaDocGia || ""}"`,
        `"${(item.HoTen || item.TenDocGia || "").replace(/"/g, '""')}"`,
        `"${item.LoaiDocGia || item.DoiTuong || ""}"`,
        `"${item.MaSach || ""}"`,
        `"${(item.TenSach || "").replace(/"/g, '""')}"`,
        `"${formatDate(item.NgayMuon)}"`,
        `"${formatDate(item.HanTra)}"`,
        `"${item.NgayTra ? formatDate(item.NgayTra) : "Chưa trả"}"`,
        `"${item.TrangThai || (item.NgayTra ? "Đã trả" : "Đang mượn")}"`,
      ]);

      const csvContent =
        "\uFEFF" +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.setAttribute("download", `Nhat_Ky_Hoat_Dong_He_Thong_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi xuất nhật ký CSV:", err);
      alert("Lỗi khi tải báo cáo CSV. Vui lòng kiểm tra kết nối Backend!");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="log-details-page">
      {/* FRAME 01: HEADING */}
      <section className="log-details-heading">
        <div className="heading-content">
          <h1>CHI TIẾT NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG</h1>
          <p>
            Phân hệ lưu trữ và hiển thị minh bạch toàn bộ lịch sử giao dịch mượn trả, lượt truy cập tài nguyên số và các sự kiện phát sinh.
          </p>
        </div>
      </section>

      {/* FRAME 02: CHART */}
      <section className="log-details-chart">
        <div className="log-details-tag">
          <div className="chart-text chart-text--with-action">
            <h2>Thống kê chi tiết nhật ký vận hành</h2>
            <button
              type="button"
              onClick={handleExportLogsCSV}
              disabled={exporting}
              className="btn-export-report-csv"
            >
              {exporting ? "Đang xuất file..." : "📥 Tải báo cáo (.CSV)"}
            </button>
          </div>

          <div className="chart-content">
            {charts.map((item) => (
              <article className="chart-item" key={item.title}>
                <div className="chart-item-text">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="chart-item-frame">
                  <iframe
                    title={item.title}
                    src={`${item.url}#bordered=false&titled=false`}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ height: "680px" }}
                  />
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem đầy đủ trên Metabase
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
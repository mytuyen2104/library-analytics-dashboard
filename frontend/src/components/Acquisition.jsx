import { useState } from "react";
import "../styles/Acquisition.css";

const base = "https://dashboard.dashboardg4.click/public/question/";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const charts = [
  {
    title: "Bảng xếp hạng ưu tiên bổ sung tài liệu",
    description:
      "Điểm ưu tiên càng cao, sách càng được ưu tiên xem xét bổ sung vào kho học liệu dựa trên lượt mượn và số lượng tồn kho.",
    url: `${base}319f2e6d-492f-4dd7-a442-ab42110e0d5e?trang_thai=`,
  },
];

export default function Acquisition() {
  const [exporting, setExporting] = useState(false);

  const handleExportAcquisitionCSV = async () => {
    try {
      setExporting(true);
      const [booksRes, loansRes] = await Promise.all([
        fetch(`${API_URL}/sach`),
        fetch(`${API_URL}/muon-tra`),
      ]);

      if (!booksRes.ok || !loansRes.ok) {
        throw new Error("Không thể lấy dữ liệu từ máy chủ");
      }

      const [books, loanLogs] = await Promise.all([
        booksRes.json(),
        loansRes.json(),
      ]);

      if (!Array.isArray(books) || books.length === 0) {
        alert("Chưa có dữ liệu sách để xuất báo cáo!");
        return;
      }

      // Đếm tổng số lượt mượn thực tế theo từng MaSach từ bảng MuonTra
      const loanCountMap = {};
      if (Array.isArray(loanLogs)) {
        loanLogs.forEach((log) => {
          if (log.MaSach) {
            loanCountMap[log.MaSach] = (loanCountMap[log.MaSach] || 0) + 1;
          }
        });
      }

      // Tính điểm ưu tiên & sắp xếp giảm dần giống hệt truy vấn Metabase
      const ranked = books
        .map((b) => {
          const stock = Number(b.SoBanHienCo ?? 0);
          const loans = loanCountMap[b.MaSach] || 0;
          const priorityScore =
            stock === 0 ? loans : Number((loans / stock).toFixed(2));

          let status = "Đủ đáp ứng";
          if (stock === 0 || priorityScore >= 8) status = "Cực kỳ cấp thiết";
          else if (priorityScore >= 4) status = "Cần bổ sung";

          return {
            MaSach: b.MaSach || "",
            TenSach: b.TenSach || "",
            TacGia: b.TacGia || "",
            TheLoai: b.TheLoai || "",
            SoBanHienCo: stock,
            LuotMuon: loans,
            DiemUuTien: priorityScore,
            TrangThaiDeXuat: status,
          };
        })
        .sort((a, b) => b.DiemUuTien - a.DiemUuTien);

      const headers = [
        "Mã sách",
        "Tên sách",
        "Tác giả",
        "Thể loại",
        "Số bản hiện có",
        "Lượt mượn",
        "Điểm ưu tiên",
        "Trạng thái đề xuất",
      ];

      const rows = ranked.map((item) => [
        `"${item.MaSach}"`,
        `"${item.TenSach.replace(/"/g, '""')}"`,
        `"${item.TacGia.replace(/"/g, '""')}"`,
        `"${item.TheLoai.replace(/"/g, '""')}"`,
        `"${item.SoBanHienCo}"`,
        `"${item.LuotMuon}"`,
        `"${item.DiemUuTien}"`,
        `"${item.TrangThaiDeXuat}"`,
      ]);

      const csvContent =
        "\uFEFF" +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.setAttribute("download", `Bao_Cao_Goi_Y_Bo_Sung_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi xuất báo cáo CSV:", err);
      alert("Lỗi khi tải báo cáo CSV. Vui lòng kiểm tra kết nối Backend!");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="acquisition-page">
      {/* FRAME 01: HEADING */}
      <section className="acquisition-heading">
        <div className="heading-content">
          <h1>GỢI Ý BỔ SUNG TÀI LIỆU THÔNG MINH</h1>
          <p>
            Phân hệ ứng dụng thuật toán định lượng để tính toán điểm ưu tiên bổ sung dựa trên sự kết hợp giữa tần suất mượn thực tế và tồn kho.
          </p>
        </div>
      </section>

      {/* FRAME 02: CHART */}
      <section className="acquisition-chart">
        <div className="acquisition-tag">
          <div className="chart-text chart-text--with-action">
            <h2>Thống kê chi tiết danh mục mua sắm</h2>
            <button
              type="button"
              onClick={handleExportAcquisitionCSV}
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
                    style={{ height: "820px" }}
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
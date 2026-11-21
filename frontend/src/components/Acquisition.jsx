import "../styles/Acquisition.css";

const base = "https://dashboard.dashboardg4.click/public/question/";

const charts = [
  {
    title: "Bảng xếp hạng ưu tiên bổ sung tài liệu",
    description:
      "Điểm ưu tiên càng cao, sách càng được ưu tiên xem xét bổ sung vào kho học liệu dựa trên lượt mượn và số lượng tồn kho.",
    url: `${base}319f2e6d-492f-4dd7-a442-ab42110e0d5e?trang_thai=`,
  },
];

export default function Acquisition() {
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

          <div className="chart-text">
            <h2>Thống kê chi tiết danh mục mua sắm</h2>
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
                    style={{ height: '820px' }}
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
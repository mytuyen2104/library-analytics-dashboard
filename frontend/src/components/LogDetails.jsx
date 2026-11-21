import "../styles/LogDetails.css";

const base = "https://dashboard.dashboardg4.click/public/question/";

const charts = [
  {
    title: "Nhật ký hoạt động chi tiết hệ thống",
    description:
      "Theo dõi chi tiết lịch sử các giao dịch, thao tác và sự kiện diễn ra trong hệ thống thư viện theo thời gian thực.",
    url: `${base}7dfeefaa-50dd-4875-b5da-604eb005c0f6`,
  },
];

export default function LogDetails() {
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

          <div className="chart-text">
            <h2>Thống kê chi tiết nhật ký vận hành</h2>
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
                    style={{ height: '680px' }}
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
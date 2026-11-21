
import MetabaseKPI from "../components/MetabaseKPI";
import "../styles/Overview.css";

const base = "https://dashboard.dashboardg4.click/public/question/";

const kpis = [
  { title: "Tổng đầu sách", url: `${base}105ebcee-409b-4c7b-8644-4309dbf52af4` },
  { title: "Tổng bản sách", url: `${base}02644f07-fc4f-4706-a701-76eccea8fcd6` },
  { title: "Tổng độc giả", url: `${base}fb5426e9-524d-4549-898e-14bd028ada77` },
  { title: "Tổng lượt mượn", url: `${base}7287d835-cfe8-4a44-bb22-6aa4fb2f8422` },
  { title: "Tổng truy cập số", url: `${base}6314695d-6f48-4a92-856d-a6e64b84c6f3` },
];

const charts = [
  {
    title: "Xếp hạng nhu cầu mượn sách theo thể loại",
    description: "So sánh nhu cầu sử dụng tài liệu giữa các thể loại.",
    url: `${base}71ca7650-b6b6-4487-af3e-a818e38a83d9`,
  },
  {
    title: "Gợi ý bổ sung tài liệu",
    description: "Danh sách sách cần ưu tiên bổ sung dựa trên dữ liệu mượn và số bản hiện có.",
    url: `${base}319f2e6d-492f-4dd7-a442-ab42110e0d5e`,
  },
  {
    title: "Xu hướng mượn sách",
    description: "Theo dõi xu hướng và biến động lượt mượn theo thời gian.",
    url: `${base}7f315243-8c82-4b68-a8c1-88de10ec368a`,
    layout: "full",
  },
  {
    title: "Top 10 sách được mượn nhiều nhất",
    description: "Thống kê 10 đầu sách có lượt mượn cao nhất.",
    url: `${base}d48d143f-e141-45ee-bfea-4e654d478555`,
    layout: "full",
  },
];

export default function Overview() {
  return (
    <main className="overview-page">

      {/* FRAME 01: HEADING */}
      <section className="overview-heading">
        <div className="heading-content">
          <h1>TỔNG QUAN THƯ VIỆN</h1>
          <p>
            Các chỉ số và tình hình khai thác tài nguyên thư viện
          </p>
        </div>
      </section>

      {/* FRAME 02: NUMBER */}
      <section className="overview-number">
        <div className="tag1">
          <div className="number-text">
            <h2>Chỉ số hoạt động thư viện</h2>

          </div>

          <div className="number-content">
            {kpis.map((kpi) => (
              <div className="number-item" key={kpi.title}>
                <MetabaseKPI
                  title={kpi.title}
                  url={kpi.url}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FRAME 03: CHART */}
      <section className="overview-chart">
        <div className="overview-tag">
          <div className="chart-text">
            <h2>Phân tích và đề xuất nổi bật</h2>

          </div>

          <div className="chart-content">
            {charts.map((item) => (
              <article
                className={`chart-item chart-item-${item.layout}`}
                key={item.title}
              >

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

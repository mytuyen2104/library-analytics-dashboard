import "../styles/Borrowing.css";

const base = "https://dashboard.dashboardg4.click/public/question/";

const charts = [
  {
    title: "Xu hướng mượn sách theo tháng / năm",
    description:
      "Theo dõi sự biến động và xu hướng mượn sách của độc giả theo các mốc thời gian.",
    url: `${base}7f315243-8c82-4b68-a8c1-88de10ec368a`,
  },
  {
    title: "Top 10 sách được mượn nhiều nhất",
    description:
      "Thống kê 10 đầu sách có lượt mượn cao nhất, phản ánh mức độ quan tâm của độc giả.",
    url: `${base}d48d143f-e141-45ee-bfea-4e654d478555`,
  },
];

export default function Borrowing() {
  return (
    <main className="borrowing-page">

      {/* FRAME 01: HEADING */}
      <section className="borrowing-heading">
        <div className="heading-content">
          <h1>PHÂN TÍCH HOẠT ĐỘNG MƯỢN TRẢ</h1>
          <p>
            Theo dõi xu hướng mượn sách và mức độ quan tâm của độc giả
            đối với tài liệu thư viện.
          </p>
        </div>
      </section>

      {/* FRAME 02: CHART */}
      <section className="borrowing-chart">
        <div className="borrowing-tag">

          <div className="chart-text">
            <h2>Thống kê chi tiết lượt mượn sách</h2>
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

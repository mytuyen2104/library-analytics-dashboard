import "../styles/DemandAnalysis.css";

const base = "https://dashboard.dashboardg4.click/public/question/";

const charts = [
  {
    title: "Nhu cầu tài liệu theo thể loại",
    description:
      "Biểu đồ thể hiện chi tiết số lượng và tỷ trọng mượn sách theo từng thể loại chuyên ngành.",
    url: `${base}71ca7650-b6b6-4487-af3e-a818e38a83d9`,
  },
  {
    title: "Xu hướng nhu cầu mượn tài liệu",
    description:
      "Theo dõi sự thay đổi và dịch chuyển nhu cầu mượn tài liệu giữa các nhóm ngành theo thời gian.",
    url: `${base}4d5ae813-403b-4729-9cc4-e2550e8ca2f1`,
  },
];

export default function DemandAnalysis() {
  return (
    <main className="demand-analysis-page">

      {/* FRAME 01: HEADING */}
      <section className="demand-analysis-heading">
        <div className="heading-content">
          <h1>PHÂN TÍCH NHU CẦU SỬ DỤNG TÀI LIỆU</h1>
          <p>
            Phân hệ tập trung bóc tách cơ cấu nhu cầu đọc và tra cứu tài liệu theo từng lĩnh vực, chuyên ngành đào tạo tại trường.
          </p>
        </div>
      </section>

      {/* FRAME 02: CHART */}
      <section className="demand-analysis-chart">
        <div className="demand-analysis-tag">

          <div className="chart-text">
            <h2>Thống kê chi tiết xu hướng học thuật</h2>
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
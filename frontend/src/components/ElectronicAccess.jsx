import "../styles/ElectronicAccess1.css";

const base = "https://dashboard.dashboardg4.click/public/question/";

const charts = [
  {
    title: "Xu hướng truy cập CSDL điện tử theo tháng",
    description:
      "Thống kê số lượng lượt truy cập cơ sở dữ liệu điện tử theo từng mốc thời gian.",
    url: `${base}b66623b2-6be6-43eb-ac09-ba24bc0a60d3`,
  },
  {
    title: "Bảng xếp hạng CSDL điện tử được dùng nhiều nhất",
    description:
      "Liệt kê các cơ sở dữ liệu được sinh viên và giảng viên quan tâm, truy cập nhiều nhất.",
    url: `${base}7ef1c7f8-5a31-4a4a-89c1-e94421f56fa2`,
  },
];

export default function ElectronicAccess() {
  return (
    <main className="electronic-access-page">

      {/* FRAME 01: HEADING */}
      <section className="electronic-access-heading">
        <div className="heading-content">
          <h1>THỐNG KÊ TRUY CẬP CƠ SỞ DỮ LIỆU ĐIỆN TỬ</h1>
          <p>
            Phân hệ theo dõi và đánh giá hiệu quả sử dụng hệ thống học liệu số trực tuyến của thư viện.
          </p>
        </div>
      </section>

      {/* FRAME 02: CHART */}
      <section className="electronic-access-chart">
        <div className="electronic-access-tag">

          <div className="chart-text">
            <h2>Thống kê chi tiết tài nguyên số</h2>
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
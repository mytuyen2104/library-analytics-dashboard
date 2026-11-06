import MetabaseKPI from "../components/MetabaseKPI";
import "../styles/overview.css";

const base = "https://dashboard.dashboardg4.click/public/question/";

const kpis = [
  { title: "Tổng đầu sách", url: `${base}105ebcee-409b-4c7b-8644-4309dbf52af4` },
  { title: "Tổng bản sách", url: `${base}02644f07-fc4f-4706-a701-76eccea8fcd6` },
  { title: "Tổng độc giả", url: `${base}fb5426e9-524d-4549-898e-14bd028ada77` },
  { title: "Tổng lượt mượn", url: `${base}7287d835-cfe8-4a44-bb22-6aa4fb2f8422` },
  { title: "Tổng truy cập số", url: `${base}6314695d-6f48-4a92-856d-a6e64b84c6f3` },
];

const insights = [
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
];

export default function Overview() {
  return (
    <section className="overview-page">
    
        <header className="overview-intro">
        <p className="overview-description">
          Hệ thống cung cấp cái nhìn tổng thể về quy mô và tình hình hoạt động
          của thư viện thông qua các chỉ số thống kê về đầu sách, số bản hiện có,
          độc giả, lượt mượn và mức độ truy cập tài nguyên điện tử. Đồng thời,
          các biểu đồ phân tích giúp theo dõi xu hướng sử dụng tài liệu, đánh giá
          nhu cầu mượn sách theo từng thể loại và xác định những đầu sách cần
          ưu tiên bổ sung, hỗ trợ thư viện quản lý nguồn tài nguyên và đưa ra
          quyết định phù hợp với nhu cầu thực tế.
        </p>
      </header>     

     

      <section aria-labelledby="overview-kpi-heading" className="overview-section">
        <div className="overview-section-heading">
          <h2 id="overview-kpi-heading">Chỉ số hoạt động thư viện</h2>
          <span>5 chỉ số tổng quan</span>
        </div>
        <div className="overview-kpi-grid">
          {kpis.map((kpi) => (
            <MetabaseKPI key={kpi.title} title={kpi.title} url={kpi.url} />
          ))}
        </div>
      </section>

      <section aria-labelledby="overview-insights-heading" className="overview-section">
        <div className="overview-section-heading">
          <h2 id="overview-insights-heading">Phân tích và đề xuất nổi bật</h2>
          <span>Dữ liệu từ Metabase</span>
        </div>
        <div className="overview-insight-grid">
          {insights.map((item) => (
            <article className="overview-insight-card" key={item.title}>
              <div className="overview-insight-heading">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <iframe
                title={item.title}
                src={`${item.url}#bordered=false&titled=false`}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                Xem đầy đủ trên Metabase
              </a>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

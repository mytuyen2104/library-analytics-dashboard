import Filters from "../components/Filters.jsx";
import "../styles/Acquisition.css";

const METABASE_URL = "https://scrooge-squire-amaretto.ngrok-free.dev/public/question/319f2e6d-492f-4dd7-a442-ab42110e0d5e?trang_thai=";

export default function Acquisition() {
  return (
    <div className="acquisition-page">
      <Filters />

      <section className="acquisition-card">
        <h2>Bảng xếp hạng ưu tiên bổ sung tài liệu</h2>

        <p className="acquisition-description">
          Điểm ưu tiên càng cao, sách càng được ưu tiên xem xét bổ sung.
        </p>

        {METABASE_URL ? (
          <iframe
            className="acquisition-frame"
            src={METABASE_URL}
            title="Bảng xếp hạng ưu tiên bổ sung tài liệu"
            allowFullScreen
          />
        ) : (
          <div className="acquisition-placeholder">
            <h3>Khu vực hiển thị Metabase</h3>
            <p>
              Bảng xếp hạng sẽ hiển thị tại đây sau khi cấu hình
              đường dẫn nhúng.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
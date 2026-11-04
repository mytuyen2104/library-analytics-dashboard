export default function MetabaseKPI({ title, url }) {
  return (
    <article className="overview-kpi-card">
      <h3>{title}</h3>
      <iframe
        title={title}
        src={`${url}#bordered=false&titled=false`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </article>
  );
}

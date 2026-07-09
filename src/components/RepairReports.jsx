function RepairReports({ templates }) {
  return (
    <section className="kb-panel" id="repair-reports">
      <div className="screen-header">
        <h2>Repair Reports</h2>
        <span>Templates</span>
      </div>
      <div className="repair-template-grid">
        {templates.map(([name, fields]) => (
          <article key={name}>
            <strong>{name}</strong>
            <p>{fields}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RepairReports;

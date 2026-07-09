function ErrorCodeDatabase({ groups }) {
  return (
    <section className="kb-panel" id="error-code-database">
      <div className="screen-header">
        <h2>Error Code Database</h2>
        <span>Structure ready</span>
      </div>
      <div className="error-code-grid">
        {groups.map(([name, description]) => (
          <article key={name}>
            <strong>{name}</strong>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ErrorCodeDatabase;

function TroubleshootingPlaybooks({ playbooks }) {
  return (
    <section className="kb-panel" id="troubleshooting-playbooks">
      <div className="screen-header">
        <h2>Troubleshooting Playbooks</h2>
        <span>Phase 1 preview</span>
      </div>
      <div className="playbook-grid">
        {playbooks.map((playbook) => (
          <article key={playbook.title}>
            <span>{playbook.category}</span>
            <h3>{playbook.title}</h3>
            <div>
              {playbook.sections.map((section) => (
                <b key={section}>{section}</b>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TroubleshootingPlaybooks;

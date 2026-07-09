const metrics = [
  ["Open Tickets", "147", "3 critical"],
  ["SLA Compliance", "97%", "Across all clients"],
  ["Monthly Resolutions", "4,321", "+18% this month"],
  ["Time Saved", "187 hrs", "Documentation and triage"],
  ["Technicians Online", "28", "Active now"],
];

function Hero() {
  return (
    <div className="hero-shell">
      <header className="topbar">
        <div className="search">Search TechMate AI: printer, 0x80070005, VLAN, DNS</div>
        <div className="status-dots">
          <span>Alerts 3</span>
          <span>Online</span>
        </div>
      </header>

      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">AI operating system for IT teams</p>
          <h1>Diagnose, document, and scale technician performance from one platform.</h1>
          <p>
            Diagnose devices, manage tickets, analyze photos, document repairs,
            build technician memory, and turn every repair into reusable team knowledge.
          </p>
          <div className="hero-actions">
            <a className="primary-btn" href="#ai-troubleshooter">Start Troubleshooting</a>
            <a className="secondary-btn" href="#operations-dashboard">View Dashboard</a>
          </div>
        </div>

        <div className="assistant-status">
          <span>Photo diagnostic workflow</span>
          <strong>AI repair path ready</strong>
          <div className="bot-face">
            <i />
            <i />
          </div>
          <div className="mini-diagnosis">
            <p><b>Cause:</b> Print spooler service stopped</p>
            <p><b>Confidence:</b> 92%</p>
            <p><b>Fix:</b> Restart spooler and clear stuck queue</p>
          </div>
        </div>
      </div>

      <section className="hero-workflow" aria-label="TechMate AI workflow">
        {["Upload photo", "AI diagnosis", "Repair steps", "Service notes"].map((step, index) => (
          <article key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </article>
        ))}
      </section>

      <section className="metrics-grid" aria-label="TechMate dashboard metrics">
        {metrics.map(([label, value, note]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Hero;

const roiStats = [
  ["38%", "Faster Ticket Resolution", "AI-guided diagnosis helps technicians move from symptom to fix sooner."],
  ["75%", "Less Documentation Time", "Repair notes, service reports, and client summaries are generated from the work performed."],
  ["24/7", "Team Knowledge Recall", "Past repairs, photos, error codes, and successful fixes become searchable memory."],
  ["97%", "SLA Compliance View", "Managers see where the team is healthy and where work is at risk."],
];

const businessReasons = [
  "Photo-based diagnostics",
  "Train new technicians faster",
  "Standardized troubleshooting",
  "Secure team knowledge base",
  "Reusable repair history",
  "Client-ready service reports",
];

function BusinessValue() {
  return (
    <section className="business-value" id="business-value">
      <div className="section-heading">
        <p className="eyebrow">Why teams use TechMate AI</p>
        <h2>Built to save hours, reduce repeat work, and make every technician sharper.</h2>
      </div>

      <div className="roi-grid">
        {roiStats.map(([value, label, text]) => (
          <article className="roi-card" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="business-reasons">
        {businessReasons.map((reason) => (
          <span key={reason}>{reason}</span>
        ))}
      </div>
    </section>
  );
}

export default BusinessValue;

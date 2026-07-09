const memoryItems = [
  ["312", "successful printer fixes matched"],
  ["88", "BSOD cases linked to driver updates"],
  ["41", "switch port failures with repeat patterns"],
  ["19", "VPN login issues tied to expired credentials"],
];

function TechnicianMemory() {
  return (
    <section className="technician-memory" id="technician-memory">
      <div>
        <p className="eyebrow">Technician Memory</p>
        <h2>Every repair makes the platform smarter.</h2>
        <p>
          Technicians upload photos, notes, work orders, logs, and error codes.
          TechMate AI learns which fixes actually worked and brings those patterns
          back the next time a similar issue appears.
        </p>
      </div>

      <article className="memory-console">
        <span>Similar issue detected</span>
        <h3>This printer issue has been fixed 312 times.</h3>
        <p>Top successful resolutions:</p>
        <ol>
          <li>Restart Print Spooler Service and clear the stuck queue.</li>
          <li>Verify printer IP, DNS record, and driver compatibility.</li>
          <li>Inspect fuser history when paper jams repeat within 30 days.</li>
        </ol>
        <div className="memory-stats">
          {memoryItems.map(([value, label]) => (
            <b key={label}>{value}<small>{label}</small></b>
          ))}
        </div>
      </article>
    </section>
  );
}

export default TechnicianMemory;

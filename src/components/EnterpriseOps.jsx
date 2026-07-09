const opsMetrics = [
  ["Open Tickets", "147"],
  ["Critical Issues", "3"],
  ["Technicians Online", "28"],
  ["SLA Compliance", "97%"],
  ["Monthly Resolutions", "4,321"],
  ["Time Saved", "187 hrs"],
];

const assets = [
  ["HP LaserJet M608", "Printer", "Last repaired: 5/23/2026", "Known issue: Fuser failure"],
  ["Core Switch SW-02", "Switch", "Last repaired: 5/18/2026", "Known issue: Port flapping"],
  ["Dell OptiPlex 7090", "Computer", "Last repaired: 5/12/2026", "Known issue: BSOD driver fault"],
  ["FortiGate 80F", "Firewall", "Last repaired: 5/08/2026", "Known issue: VPN auth failures"],
];

const clients = [
  ["Client A", "112 devices", "2 open tickets", "Healthy"],
  ["Client B", "357 devices", "5 open tickets", "Watch"],
  ["Client C", "42 devices", "0 open tickets", "Healthy"],
];

function EnterpriseOps() {
  return (
    <>
      <section className="operations-dashboard" id="operations-dashboard">
        <div className="screen-header">
          <h2>Operations Dashboard</h2>
          <span>Executive view</span>
        </div>
        <div className="ops-metric-grid">
          {opsMetrics.map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="asset-client-grid">
        <div className="asset-panel" id="asset-management">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Asset management</p>
            <h2>Track every device and every known repair pattern.</h2>
          </div>
          <div className="asset-list">
            {assets.map(([name, type, repaired, issue]) => (
              <article key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{type}</span>
                </div>
                <p>{repaired}</p>
                <b>{issue}</b>
              </article>
            ))}
          </div>
        </div>

        <div className="client-panel" id="client-portal">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Client portal</p>
            <h2>MSP-ready visibility by customer.</h2>
          </div>
          <div className="client-list">
            {clients.map(([name, devices, tickets, status]) => (
              <article key={name}>
                <strong>{name}</strong>
                <span>{devices}</span>
                <span>{tickets}</span>
                <b className={status === "Healthy" ? "online" : "warning"}>{status}</b>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default EnterpriseOps;

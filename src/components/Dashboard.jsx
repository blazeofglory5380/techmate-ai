import ErrorLookup from "./ErrorLookup";

function Dashboard() {
  return (
    <>
      <section className="product-preview" id="ai-troubleshooter">
        <div className="screenshot chat-screen">
          <div className="screen-header">
            <h2>AI Troubleshooter</h2>
            <span>Live chat</span>
          </div>
          <div className="chat-layout">
            <aside>
              <strong>Recent Chats</strong>
              <button>Printer offline</button>
              <button>Wi-Fi keeps dropping</button>
              <button>DNS not resolving</button>
            </aside>
            <div className="chat-main">
              <div className="bubble user">Printer offline.</div>
              <div className="bubble ai">
                Check spooler service, print queue, DNS resolution, and printer
                IP. Then verify driver compatibility and test from another
                workstation.
              </div>
              <div className="checklist">
                <span>Check print queue</span>
                <span>Restart spooler</span>
                <span>Ping printer IP</span>
                <span>Generate repair notes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="screenshot network-screen" id="network-center">
          <div className="screen-header">
            <h2>Network Diagnostic</h2>
            <span>DNS healthy</span>
          </div>
          <pre>{`PING 8.8.8.8
Reply from 8.8.8.8: bytes=32 time=22ms TTL=117
Reply from 8.8.8.8: bytes=32 time=21ms TTL=117
Reply from 8.8.8.8: bytes=32 time=24ms TTL=117

Packet Loss: 0%
Recommendation: DNS and upstream connectivity look healthy.`}</pre>
        </div>
      </section>

      <section className="dashboard-preview">
        <div className="screen-header">
          <h2>NOC Dashboard Preview</h2>
          <span>Mission control</span>
        </div>
        <div className="ops-grid">
          <article>
            <h3>Network Status</h3>
            {["Router Gateway", "Core Switch", "DNS Server", "File Server", "Printer Queue"].map((item, index) => (
              <div className="status-row" key={item}>
                <span>{item}</span>
                <b className={index === 3 ? "warning" : "online"}>{index === 3 ? "Warning" : "Online"}</b>
              </div>
            ))}
          </article>

          <article>
            <h3>Recent AI Diagnoses</h3>
            {["Wi-Fi Disconnects", "Printer Offline", "DNS Failure", "Slow Workstation", "VPN Login Issue"].map((item, index) => (
              <div className="status-row" key={item}>
                <span>{item}</span>
                <b className={index === 1 ? "warning" : "online"}>{index === 1 ? "Investigating" : "Resolved"}</b>
              </div>
            ))}
          </article>
        </div>
      </section>

      <ErrorLookup />
    </>
  );
}

export default Dashboard;

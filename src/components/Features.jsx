const launchModules = [
  ["Camera Scan", "Upload device, rack, printer, cable, or error photos for AI analysis."],
  ["Network Diagnostics", "Run ping, DNS, traceroute, IP, VLAN, Wi-Fi, and Cisco checks."],
  ["Error Code Lookup", "Search Windows, printer, Cisco, server, and application errors."],
  ["Voice Assistant", "Talk through field repairs while your hands are busy."],
  ["Job Notes", "Create service reports, work orders, and client documentation."],
  ["Team Dashboard", "Track technicians, assets, tickets, reports, and performance."],
];

const roles = [
  ["Help Desk", "Password resets, user support, ticket triage, and workstation fixes."],
  ["Field Technician", "Printer repair, hardware support, photos, and client notes."],
  ["Network Technician", "Switches, routers, Wi-Fi, VLANs, DNS, and connectivity issues."],
  ["MSP Teams", "Client support, documentation, shared queues, and team analytics."],
  ["Students", "A+, Network+, Security+, CCNA labs and troubleshooting practice."],
];

const certs = [
  ["A+", "Hardware, printers, mobile devices, operating systems", "32%"],
  ["Network+", "Routing, switching, wireless, subnetting, troubleshooting", "48%"],
  ["Security+", "Threats, hardening, risk management, access control", "41%"],
  ["CCNA", "VLANs, STP, OSPF, routing, switching, automation", "26%"],
];

function Features() {
  return (
    <>
      <section className="camera-section" id="camera-scan">
        <div>
          <p className="eyebrow">Camera scanner</p>
          <h2>Upload a photo. Get a repair path.</h2>
          <p>
            Camera Scan is one of TechMate AI's strongest launch features:
            technicians can scan a printer panel, server rack, switch, cable,
            or error screen and get the likely problem, cause, fix, and notes.
          </p>
        </div>

        <div className="device-row">
          <article className="phone-mock">
            <span>Mobile Technician App</span>
            <div className="photo-box printer-photo">Printer Panel Photo</div>
            <strong>Error E05 detected</strong>
            <p>Likely paper feed or sensor issue.</p>
            <button>Generate Fix Steps</button>
          </article>

          <article className="laptop-mock">
            <span>Desktop Dashboard</span>
            <div className="rack-lines">
              <i />
              <i />
              <i />
              <i />
            </div>
            <strong>Switch Port Analysis</strong>
            <p>Port 18 is flapping. Check cable, duplex settings, and VLAN assignment.</p>
          </article>
        </div>
      </section>

      <section className="mobile-section">
        <div>
          <p className="eyebrow">TechMate Mobile</p>
          <h2>Built for technicians away from the desk.</h2>
          <p>
            Field techs can take a photo, ask a voice question, get AI repair
            steps, and generate service notes before leaving the customer site.
          </p>
        </div>
        <div className="mobile-flow">
          <article>Take device photo</article>
          <article>AI analyzes issue</article>
          <article>Follow repair steps</article>
          <article>Create client report</article>
        </div>
      </section>

      <section className="modules" id="technician-tools">
        <div className="section-heading">
          <p className="eyebrow">Technician toolkit</p>
          <h2>Everything a technician needs without leaving TechMate AI.</h2>
        </div>
        <div className="module-grid">
          {launchModules.map(([title, text]) => (
            <article className="module-card" key={title}>
              <span>{title}</span>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="roles-section">
        <div className="section-heading">
          <p className="eyebrow">Who uses TechMate</p>
          <h2>Built for technicians, teams, and students.</h2>
        </div>
        <div className="roles-grid">
          {roles.map(([title, text]) => (
            <article className="role-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="notes-section">
        <div>
          <p className="eyebrow">Technician notes</p>
          <h2>Turn repairs into client-ready service reports.</h2>
          <p>
            TechMate AI can summarize the issue, cause, work performed, and
            resolution so technicians spend less time writing reports.
          </p>
        </div>
        <article className="service-report">
          <span>Service Report</span>
          <div><b>Client:</b> ABC Company</div>
          <div><b>Issue:</b> Printer offline</div>
          <div><b>Cause:</b> Print spooler stopped</div>
          <div><b>Resolution:</b> Restarted spooler and cleared stuck queue</div>
          <strong>Status: Resolved</strong>
        </article>
      </section>

      <section className="cert-section" id="certifications">
        <div>
          <p className="eyebrow">Certification Center</p>
          <h2>A revenue stream for students and future technicians.</h2>
          <p>
            Turn your own CompTIA and networking study path into a product:
            labs, flashcards, mock exams, and real-world troubleshooting
            scenarios for A+, Network+, Security+, and CCNA.
          </p>
        </div>
        <div className="cert-grid">
          {certs.map(([name, text, progress]) => (
            <article className="cert-card" key={name}>
              <strong>{name}</strong>
              <span>{text}</span>
              <div className="cert-tags">
                <em>Flashcards</em>
                <em>Practice Exams</em>
                <em>Labs</em>
              </div>
              <div className="progress">
                <i style={{ width: progress }} />
              </div>
              <small>{progress} progress</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Features;

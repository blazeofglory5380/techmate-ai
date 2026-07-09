const navItems = [
  "AI Troubleshooter",
  "Operations Dashboard",
  "Asset Management",
  "Client Portal",
  "Error Lookup",
  "Camera Scan",
  "Knowledge Base",
  "Troubleshooting Playbooks",
  "Technician Memory",
  "Certifications",
];

function Navbar() {
  return (
    <aside className="sidebar" aria-label="TechMate navigation preview">
      <a className="brand" href="#home">
        <span>TM</span>
        <strong>TechMate AI</strong>
      </a>

      <nav>
        {navItems.map((item, index) => (
          <a
            className={index === 0 ? "active" : ""}
            href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
            key={item}
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="pro-card">
        <strong>TechMate AI Business</strong>
        <p>Give technicians shared memory, diagnostics, assets, and client-ready reports.</p>
        <a href="#pricing">Upgrade Now</a>
      </div>
    </aside>
  );
}

export default Navbar;

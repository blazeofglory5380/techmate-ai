import { useMemo, useState } from "react";
import { vendorFilters, vendorResources } from "../data/vendorResources";
import "./VendorResources.css";

function VendorResources() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Vendor");
  const [activeVendor, setActiveVendor] = useState(vendorResources[0]);

  const filteredVendors = useMemo(() => {
    const search = query.trim().toLowerCase();
    return vendorResources.filter((vendor) => {
      const searchable = [
        vendor.vendor,
        ...vendor.deviceCategories,
        ...vendor.commonIssues,
        ...vendor.relatedPlaybooks,
        ...vendor.relatedCommands,
        vendor.safetyNotes,
      ]
        .join(" ")
        .toLowerCase();

      const matchesFilter =
        filter === "Vendor" ||
        filter === "Device type" ||
        vendor.deviceCategories.some((category) => category.toLowerCase() === filter.toLowerCase()) ||
        searchable.includes(filter.toLowerCase());

      return matchesFilter && (!search || searchable.includes(search));
    });
  }, [filter, query]);

  const detailVendor = activeVendor || filteredVendors[0] || vendorResources[0];

  return (
    <main className="page vendor-page">
      <section className="page-hero">
        <p className="eyebrow">Vendor Resource Center</p>
        <h1>Official vendor support links for technician workflows.</h1>
        <p>
          TechMate AI organizes vendor resources, but does not host firmware, BIOS files, drivers, installers,
          ISO files, or copyrighted manufacturer manuals.
        </p>
      </section>

      <section className="vendor-warning">
        <strong>Technician warning</strong>
        <p>
          TechMate AI links to official manufacturer resources. Always verify model number, service tag, OS
          version, firmware version, and backup/rollback instructions before installing BIOS, firmware, or drivers.
        </p>
      </section>

      <section className="vendor-toolbar">
        <div className="search-shell">
          <span>VR</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search vendors, devices, BIOS, firmware, drivers, issues, commands..."
          />
        </div>
        <div className="tab-row">
          {vendorFilters.map((item) => (
            <button type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="vendor-layout">
        <aside className="vendor-detail">
          <div className="card-top">
            <span>{detailVendor.vendor}</span>
            <i>OF</i>
          </div>
          <h2>{detailVendor.vendor}</h2>
          <p>Official support resources and TechMate workflow relationships for safe technician use.</p>

          <div className="vendor-link-grid">
            <a href={detailVendor.supportLink} target="_blank" rel="noreferrer">Support</a>
            <a href={detailVendor.downloadLink} target="_blank" rel="noreferrer">Drivers / Firmware</a>
            <a href={detailVendor.warrantyLink} target="_blank" rel="noreferrer">Warranty Lookup</a>
            <a href={detailVendor.documentationLink} target="_blank" rel="noreferrer">Documentation</a>
          </div>

          <VendorList title="Device Categories" items={detailVendor.deviceCategories} />
          <VendorList title="Common Technician Issues" items={detailVendor.commonIssues} />
          <VendorList title="Related TechMate Playbooks" items={detailVendor.relatedPlaybooks} />
          <VendorList title="Related Commands" items={detailVendor.relatedCommands} />

          <div className="vendor-safety-note">
            <strong>Safety notes</strong>
            <p>{detailVendor.safetyNotes}</p>
          </div>
        </aside>

        <div className="vendor-grid">
          {filteredVendors.map((vendor) => (
            <button type="button" className="vendor-card" onClick={() => setActiveVendor(vendor)} key={vendor.id}>
              <div className="card-top">
                <span>{vendor.deviceCategories.slice(0, 2).join(" / ")}</span>
                <i>{vendor.vendor.slice(0, 2).toUpperCase()}</i>
              </div>
              <h3>{vendor.vendor}</h3>
              <p>{vendor.commonIssues.slice(0, 3).join(", ")}</p>
              <div className="vendor-chip-row">
                {vendor.deviceCategories.slice(0, 4).map((category) => <span className="badge" key={category}>{category}</span>)}
              </div>
              <div className="vendor-card-links">
                <a href={vendor.supportLink} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Support</a>
                <a href={vendor.downloadLink} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Downloads</a>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function VendorList({ title, items }) {
  return (
    <div className="vendor-list-block">
      <h3>{title}</h3>
      <div className="vendor-chip-row">
        {items.map((item) => <span className="badge" key={item}>{item}</span>)}
      </div>
    </div>
  );
}

export default VendorResources;

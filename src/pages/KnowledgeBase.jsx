import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  knowledgeCategories,
  knowledgeSearchText,
  normalizeKnowledgeRecord,
  skillLevels,
  vendorNames,
} from "../data/knowledgeData";
import "./KnowledgeBase.css";

const today = new Date().toISOString().slice(0, 10);

function KnowledgeBase({ data }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [draft, setDraft] = useState(emptyKnowledgeNote());

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return data.knowledgeRecords.filter((item) => {
      const inCategory = category === "All" || item.category === category;
      return inCategory && (!search || knowledgeSearchText(item).includes(search));
    });
  }, [category, data.knowledgeRecords, query]);

  function addKnowledgeNote(event) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const record = normalizeKnowledgeRecord({
      ...draft,
      id: createId("knowledge"),
      sourceType: "Custom Note",
      tags: splitList(draft.tags),
      relatedCommands: splitList(draft.relatedCommands),
      relatedErrors: splitList(draft.relatedErrors),
      relatedTopics: splitList(draft.tags),
      relatedPlaybooks: splitList(draft.relatedPlaybooks),
      dateAdded: today,
    });
    data.setCustomKnowledge((current) => [record, ...current]);
    setSelectedItem(record);
    setDraft(emptyKnowledgeNote());
  }

  return (
    <main className="page knowledge-page">
      <section className="page-hero">
        <p className="eyebrow">Knowledge Base</p>
        <h1>Technician knowledge system</h1>
        <p>Search, create, and connect notes across commands, error codes, troubleshooting, vendors, uploads, reports, and labs.</p>
      </section>

      <section className="knowledge-control-panel">
        <div className="search-shell">
          <span>SR</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, category, tags, summary, notes, commands, errors, vendors..."
          />
        </div>
        <div className="tab-row">
          {["All", ...knowledgeCategories].map((item) => (
            <button type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="knowledge-link-strip">
        <Link to="/commands">Commands Library</Link>
        <Link to="/error-codes">Error Codes</Link>
        <Link to="/troubleshooting">Troubleshooting</Link>
        <Link to="/vendor-resources">Vendor Resources</Link>
        <Link to="/repair-reports">Repair Reports</Link>
      </section>

      <section className="knowledge-grid">
        {filteredItems.map((item) => (
          <button type="button" className="knowledge-card" onClick={() => setSelectedItem(item)} key={item.id}>
            <div className="card-top">
              <span>{item.sourceType}</span>
              <i>{item.category.slice(0, 2).toUpperCase()}</i>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <div className="knowledge-meta">
              <span className="badge">{item.category}</span>
              <span className="badge">{item.skillLevel}</span>
              {item.relatedVendor && item.relatedVendor !== "None" && <span className="badge">{item.relatedVendor}</span>}
            </div>
          </button>
        ))}
      </section>

      <section className="form-card knowledge-note-form">
        <div className="panel-title">
          <div>
            <h2>Add Knowledge Note</h2>
            <p>Saved to localStorage and searchable immediately.</p>
          </div>
        </div>
        <form className="report-form" onSubmit={addKnowledgeNote}>
          <div className="field-grid">
            <label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Example: FortiGate VPN user cannot connect" /></label>
            <label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{knowledgeCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="field-grid">
            <label>Related Vendor<select value={draft.relatedVendor} onChange={(event) => setDraft({ ...draft, relatedVendor: event.target.value })}>{vendorNames.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Skill Level<select value={draft.skillLevel} onChange={(event) => setDraft({ ...draft, skillLevel: event.target.value })}>{skillLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <label>Tags<input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="vpn, firewall, remote access" /></label>
          <label>Summary<textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} placeholder="Short searchable summary..." /></label>
          <label>Full Notes<textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Full technician note, exact symptoms, checks, fix, escalation notes..." /></label>
          <div className="field-grid">
            <label>Related Commands<input value={draft.relatedCommands} onChange={(event) => setDraft({ ...draft, relatedCommands: event.target.value })} placeholder="ping, nslookup, Test-NetConnection" /></label>
            <label>Related Error Codes<input value={draft.relatedErrors} onChange={(event) => setDraft({ ...draft, relatedErrors: event.target.value })} placeholder="0x80070005, 169.254.x.x" /></label>
          </div>
          <label>Related Troubleshooting Playbooks<input value={draft.relatedPlaybooks} onChange={(event) => setDraft({ ...draft, relatedPlaybooks: event.target.value })} placeholder="No Internet, DNS Issue, Printer Offline" /></label>
          <div className="form-actions">
            <button className="primary-btn" type="submit">Add Knowledge Note</button>
            <button type="button" onClick={() => setDraft(emptyKnowledgeNote())}>Clear Form</button>
          </div>
        </form>
      </section>

      {selectedItem && <KnowledgeModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </main>
  );
}

function KnowledgeModal({ item, onClose }) {
  return (
    <div className="knowledge-modal-backdrop" role="presentation" onClick={onClose}>
      <section className="knowledge-modal" role="dialog" aria-modal="true" aria-labelledby="knowledge-modal-title" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p className="eyebrow">{item.sourceType}</p>
            <h2 id="knowledge-modal-title">{item.title}</h2>
            <p>{item.summary}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>Close</button>
        </header>

        <div className="knowledge-modal-meta">
          <span className="badge">{item.category}</span>
          <span className="badge">{item.skillLevel}</span>
          <span className="badge">{item.dateAdded}</span>
          {item.relatedVendor && item.relatedVendor !== "None" && <span className="badge">{item.relatedVendor}</span>}
        </div>

        <DetailList title="Tags" items={item.tags} />
        <section>
          <h3>Full Notes</h3>
          <p>{item.notes || "No full notes added yet."}</p>
        </section>
        <DetailList title="Related Commands" items={item.relatedCommands} copyable />
        <DetailList title="Related Errors" items={item.relatedErrors} />
        <DetailList title="Related Troubleshooting Playbooks" items={item.relatedPlaybooks} />
        <DetailList title="Related Topics" items={item.relatedTopics} />

        <div className="knowledge-modal-links">
          <Link to="/commands">Commands Library</Link>
          <Link to="/error-codes">Error Codes</Link>
          <Link to="/troubleshooting">Troubleshooting</Link>
          <Link to="/vendor-resources">Vendor Resources</Link>
          <Link to="/repair-reports">Repair Reports</Link>
        </div>
      </section>
    </div>
  );
}

function DetailList({ title, items = [], copyable = false }) {
  if (!items.length) return null;
  return (
    <section>
      <h3>{title}</h3>
      <div className="knowledge-pill-row">
        {items.map((item) => (
          <button type="button" className="ghost-btn" onClick={() => copyable && copyText(item)} key={item}>
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function emptyKnowledgeNote() {
  return {
    title: "",
    category: "Troubleshooting",
    tags: "",
    summary: "",
    notes: "",
    relatedCommands: "",
    relatedErrors: "",
    relatedVendor: "None",
    relatedPlaybooks: "",
    skillLevel: "Beginner",
  };
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function copyText(text) {
  navigator.clipboard?.writeText(text);
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default KnowledgeBase;

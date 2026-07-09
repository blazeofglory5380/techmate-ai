import { useMemo, useState } from "react";
import CategoryFilter from "./CategoryFilter";
import ErrorCodeDatabase from "./ErrorCodeDatabase";
import KnowledgeCard from "./KnowledgeCard";
import RepairReports from "./RepairReports";
import SearchBar from "./SearchBar";
import TroubleshootingPlaybooks from "./TroubleshootingPlaybooks";
import {
  bookCatalog,
  errorCodeGroups,
  knowledgeCategories,
  playbooks,
  repairReportTemplates,
} from "../data/knowledgeBaseCatalog";

function KnowledgeBase() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return bookCatalog.filter((book) => {
      const matchesCategory = activeCategory === "All" || book.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [book.title, book.category, book.description, book.location]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <section className="knowledge-base-system" id="knowledge-base">
      <div className="kb-hero">
        <div>
          <p className="eyebrow">Knowledge base system</p>
          <h2>Build the technician library before building AI search.</h2>
          <p>
            Phase 1 organizes the master PDF library, article areas, playbooks,
            error codes, command references, repair reports, and AI training data.
          </p>
        </div>
        <article className="kb-storage-card">
          <span>Master Library</span>
          <strong>C:\Users\thin_\Desktop\TechMate AI (AI Tech)\KnowledgeBase</strong>
          <p>PDFs stay in the master library. `src/assets/books` remains the demo/testing copy.</p>
        </article>
      </div>

      <div className="kb-tool-row">
        <SearchBar value={query} onChange={setQuery} />
        <CategoryFilter
          activeCategory={activeCategory}
          categories={knowledgeCategories}
          onChange={setActiveCategory}
        />
      </div>

      <div className="kb-library-layout">
        <div className="kb-main-panel">
          <div className="screen-header">
            <h2>Book Library</h2>
            <span>{filteredBooks.length} visible</span>
          </div>
          <div className="kb-card-grid">
            {filteredBooks.map((book) => (
              <KnowledgeCard item={book} key={book.title} />
            ))}
          </div>
        </div>

        <aside className="kb-roadmap">
          <h3>Roadmap</h3>
          <div><b>Phase 1</b><span>Folders, categories, search UI</span></div>
          <div><b>Phase 2</b><span>PDF upload, PDF viewer, metadata</span></div>
          <div><b>Phase 3</b><span>Text extraction and OCR</span></div>
          <div><b>Phase 4</b><span>AI search and troubleshooting engine</span></div>
          <div><b>Phase 5</b><span>Camera, voice, reports, technician copilot</span></div>
        </aside>
      </div>

      <div className="kb-placeholder-grid">
        <article>
          <span>Future Upload</span>
          <strong>Drop PDFs into KnowledgeBase/Books</strong>
          <p>The upload workflow will come later, after the UI and library structure are solid.</p>
        </article>
        <article>
          <span>Future AI Search</span>
          <strong>PDF to chunks to vector database</strong>
          <p>This is intentionally not built yet. Today is the foundation.</p>
        </article>
      </div>

      <TroubleshootingPlaybooks playbooks={playbooks} />
      <ErrorCodeDatabase groups={errorCodeGroups} />
      <RepairReports templates={repairReportTemplates} />
    </section>
  );
}

export default KnowledgeBase;

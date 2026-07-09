import { useMemo, useState } from "react";
import { errorCodes } from "../data/errorCodes";

function ErrorLookup() {
  const [query, setQuery] = useState("0x80070005");

  const result = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return (
      errorCodes.find((error) =>
        [error.code, error.system, error.title].some((value) =>
          value.toLowerCase().includes(normalized),
        ),
      ) || errorCodes[0]
    );
  }, [query]);

  return (
    <section className="error-database" id="error-lookup">
      <div className="section-heading">
        <p className="eyebrow">Error code database</p>
        <h2>Search an error and get cause, severity, and repair steps.</h2>
      </div>

      <div className="error-preview">
        <label className="error-search">
          <span>Search Error</span>
          <input
            aria-label="Search error code"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="0x80070005, E05, DNS, Cisco"
            value={query}
          />
        </label>

        <article>
          <span>{result.system} Error</span>
          <h3>{result.code} - {result.title}</h3>
          <p>{result.cause}</p>
          <b className={result.severity === "High" ? "high" : "medium"}>
            {result.severity} Severity
          </b>
        </article>

        <article>
          <span>Recommended Fix</span>
          <ul>
            {result.fixes.map((fix) => (
              <li key={fix}>{fix}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default ErrorLookup;

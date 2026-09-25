import { useState } from "react";

export default function UrlForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  }

  function handleDemoClick() {
    const demoUrl = `${window.location.origin}/demo-article`;
    setUrl(demoUrl);
    onSubmit(demoUrl);
  }

  return (
    <div className="url-form-wrapper">
      <form className="url-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="url-input"
          placeholder="Paste a public URL, e.g. https://en.wikipedia.org/wiki/Alan_Turing"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="submit-btn" disabled={isLoading || !url.trim()}>
          {isLoading ? "Summarising..." : "Summarise"}
        </button>
      </form>
      <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--ink-soft)" }}>
        <span>Or test instantly: </span>
        <button
          type="button"
          onClick={handleDemoClick}
          disabled={isLoading}
          style={{
            background: "none",
            border: "none",
            color: "var(--highlight-deep)",
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
            font: "inherit",
            fontWeight: 500,
          }}
        >
          Use Built-in Sample Article
        </button>
      </div>
    </div>
  );
}


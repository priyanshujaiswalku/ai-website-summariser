import { useState } from "react";

export default function UrlForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="url-input"
        placeholder="Paste a public URL, e.g. https://example.com/article"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" className="submit-btn" disabled={isLoading || !url.trim()}>
        {isLoading ? "Summarising..." : "Summarise"}
      </button>
    </form>
  );
}

export default function SummaryCard({ result }) {
  if (!result) return null;

  return (
    <div className="summary-card">
      <p className="summary-source">
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          {result.title || result.url}
        </a>
      </p>
      <p className="summary-text">{result.summary}</p>
    </div>
  );
}

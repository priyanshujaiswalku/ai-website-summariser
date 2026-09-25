export default function LoadingIndicator() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" />
      <span>Fetching the page and generating a summary...</span>
    </div>
  );
}

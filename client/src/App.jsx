import { useState } from "react";
import UrlForm from "./components/UrlForm.jsx";
import LoadingIndicator from "./components/LoadingIndicator.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import { summarizeUrl } from "./api/summarize.js";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(url) {
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await summarizeUrl(url);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Website Summariser</h1>
        <p className="subtitle">Paste a public URL and get a short AI-generated summary.</p>
      </header>

      <main className="app-main">
        <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />

        {isLoading && <LoadingIndicator />}
        <ErrorMessage message={error} />
        <SummaryCard result={result} />
      </main>

      <footer className="app-footer">
        <p>Built for the Indus Net Technologies assignment.</p>
      </footer>
    </div>
  );
}

export default App;

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { requestLogger } from "./middleware/logger.js";
import summarizeRoute from "./routes/summarize.route.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.join(__dirname, "../client/dist");

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.1.0",
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  });
});


app.use("/api", summarizeRoute);

// Public sample content for a reliable end-to-end demo of the summariser.
app.get("/demo-article", (req, res) => {
  res.type("html").send(`<!doctype html>
    <html><head><title>The Value of Clear Technical Communication</title></head>
    <body><main><h1>The Value of Clear Technical Communication</h1>
    <p>Clear technical communication makes software easier to build, use, and maintain. It translates complex engineering decisions into language that teammates, users, and stakeholders can understand.</p>
    <p>Good documentation explains purpose before implementation details. It gives readers a concise starting point, practical setup instructions, and examples that can be adapted to their own work.</p>
    <p>Teams benefit when decisions are recorded with their trade-offs. A short explanation of why one approach was selected helps future contributors avoid repeating old investigations and makes changes safer.</p>
    <p>Writing clearly is also an engineering practice. It exposes ambiguous requirements early, improves reviews, and creates a shared understanding between people with different technical backgrounds.</p>
    <p>Useful technical communication is accurate, current, structured, and focused on the reader's next action. These qualities reduce support work and help software deliver value more reliably.</p>
    </main></body></html>`);
});

// Serve the production React build from the same app as the API.
app.use(express.static(clientDistPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

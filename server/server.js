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
  res.json({ status: "ok" });
});

app.use("/api", summarizeRoute);

// Serve the production React build from the same app as the API.
app.use(express.static(clientDistPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

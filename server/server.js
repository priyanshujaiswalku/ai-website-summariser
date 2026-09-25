import "dotenv/config";
import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/logger.js";
import summarizeRoute from "./routes/summarize.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", summarizeRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

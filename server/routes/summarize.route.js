import { Router } from "express";
import { fetchVisibleText } from "../services/scrape.service.js";
import { summarizeText } from "../services/ai.service.js";

const router = Router();

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

router.post("/summarize", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string" || !isValidHttpUrl(url)) {
    return res.status(400).json({
      error: "Please provide a valid public URL (starting with http:// or https://).",
    });
  }

  try {
    const { title, text } = await fetchVisibleText(url);

    if (!text || text.length < 30) {
      return res.status(422).json({
        error: "Could not extract enough readable text from that page.",
      });
    }

    const summary = await summarizeText({ title, text, url });

    return res.json({ url, title, summary });
  } catch (err) {
    console.error("Summarize error:", err.message);

    if (err.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Fetching the page timed out." });
    }
    if (err.response?.status === 404 || err.code === "ENOTFOUND") {
      return res.status(400).json({ error: "That URL could not be reached." });
    }

    return res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

export default router;

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

  // --- STAGE 1: Scrape visible content from target webpage ---
  let title = "";
  let text = "";
  try {
    const scraped = await fetchVisibleText(url);
    title = scraped.title;
    text = scraped.text;
  } catch (err) {
    console.error(`Scrape error for ${url}:`, err.message);

    if (err.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Fetching the webpage timed out." });
    }

    const networkAccessBlocked =
      err.code === "EACCES" ||
      err.code === "EPERM" ||
      /\b(?:EACCES|EPERM)\b/.test(err.message || "");

    if (networkAccessBlocked) {
      return res.status(502).json({
        error:
          "This environment is blocking outbound website access. Try again from a network that permits HTTPS connections.",
      });
    }

    if (err.response?.status === 404 || err.code === "ENOTFOUND") {
      return res.status(400).json({
        error: "That URL could not be reached (HTTP 404 or domain not found).",
      });
    }

    return res.status(400).json({
      error: `Could not load that URL: ${err.message || "Failed to reach target webpage."}`,
    });
  }

  // --- STAGE 2: Validate extracted readable text ---
  if (!text || text.length < 30) {
    return res.status(422).json({
      error: "Could not extract enough readable text from that page to summarise.",
    });
  }

  // --- STAGE 3: Generate summary with AI provider ---
  try {
    const summary = await summarizeText({ title, text, url });
    return res.json({ url, title, summary });
  } catch (err) {
    console.error("AI summarisation error:", err.message, err.response?.data || "");

    const statusCode = err.response?.status || 500;
    const providerMessage = err.response?.data?.error?.message;

    if (statusCode === 401) {
      return res.status(500).json({
        error: "AI authentication failed. Please verify GROQ_API_KEY in the environment.",
      });
    }

    if (statusCode === 429) {
      return res.status(429).json({
        error: "AI provider rate limit reached. Please wait a few seconds and try again.",
      });
    }

    if (statusCode === 404) {
      return res.status(502).json({
        error: `AI model error: ${providerMessage || "The configured AI model could not be found on the provider."}`,
      });
    }

    return res.status(502).json({
      error: providerMessage || err.message || "AI summarisation failed.",
    });
  }
});

export default router;


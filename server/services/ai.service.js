import axios from "axios";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Sends page text to the AI model and returns a short summary.
 *
 * Uses Groq's OpenAI-compatible chat completions endpoint. To switch to
 * OpenAI or Gemini instead, you only need to change this function -
 * everything else (routes, frontend) stays the same.
 */
export async function summarizeText({ title, text, url }) {
  const apiKey = process.env.GROQ_API_KEY;
  const primaryModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  if (!apiKey) {
    // If no GROQ_API_KEY is set locally, fallback to the deployed live service
    try {
      console.log("No local GROQ_API_KEY found, using deployed AI service for summary...");
      const fallbackUrl = "https://ai-website-summariser-c2qn.onrender.com/api/summarize";
      const res = await axios.post(fallbackUrl, { url }, { timeout: 35000 });
      if (res.data?.summary) {
        return res.data.summary;
      }
    } catch (fallbackErr) {
      throw new Error(
        "No local GROQ_API_KEY set, and fallback to deployed service failed: " +
          (fallbackErr.response?.data?.error || fallbackErr.message)
      );
    }

    throw new Error(
      "Missing GROQ_API_KEY. Add it to server/.env or your hosting environment."
    );
  }


  const systemPrompt =
    "You are a concise summarisation assistant. Summarise the given webpage " +
    "content in 4-6 clear sentences, capturing the main topic and key points. " +
    "Do not add opinions or information that isn't in the text. If the text " +
    "looks like navigation/boilerplate with no real content, say so plainly.";

  const userPrompt =
    `Webpage URL: ${url}\n` +
    `Page title: ${title || "(no title found)"}\n\n` +
    `Page content:\n${text}`;

  // Fallback candidate models in preference order. If a model returns 404 (model_not_found),
  // automatically try the next supported model.
  const candidateModels = [
    primaryModel,
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await axios.post(
        GROQ_ENDPOINT,
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 25000,
        }
      );

      const summary = response.data?.choices?.[0]?.message?.content?.trim();
      if (!summary) {
        throw new Error("AI provider returned an empty response.");
      }
      return summary;
    } catch (err) {
      lastError = err;
      const isModelNotFound =
        err.response?.status === 404 &&
        (err.response?.data?.error?.code === "model_not_found" ||
          /model.*not.*found/i.test(err.response?.data?.error?.message || ""));

      if (isModelNotFound) {
        console.warn(`Groq model '${model}' not found. Trying next candidate...`);
        continue;
      }

      // For non-404 errors (e.g. 401 invalid key, 429 rate limit), stop and rethrow
      throw err;
    }
  }

  throw lastError;
}


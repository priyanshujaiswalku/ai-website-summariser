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
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY. Add it to server/.env (see .env.example)."
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
      timeout: 20000,
    }
  );

  const summary = response.data?.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error("AI provider returned an empty response.");
  }

  return summary;
}

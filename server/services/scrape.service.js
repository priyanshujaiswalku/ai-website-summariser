import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Fetches the HTML at `url` and extracts the visible, human-readable text.
 * This is a basic implementation: it strips scripts/styles/nav/footer noise
 * and returns a reasonably clean block of text for summarisation.
 */
export async function fetchVisibleText(url) {
  let html;
  const requestConfig = {
    timeout: 10000,
    maxContentLength: 5 * 1024 * 1024,
    // Do not inherit a hosting environment's HTTP(S)_PROXY setting. Those
    // proxies can return 404 for arbitrary external webpages.
    proxy: false,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AISummariserBot/1.0)",
    },
  };

  try {
    ({ data: html } = await axios.get(url, requestConfig));
  } catch (directFetchError) {
    // Reader is a fallback for public pages that reject direct bot requests.
    // The Reader URL must contain the full original URL, including https://.
    const readerUrl = `https://r.jina.ai/http://${url}`;
    try {
      ({ data: html } = await axios.get(readerUrl, {
        ...requestConfig,
        timeout: 20000,
      }));
    } catch {
      throw directFetchError;
    }
  }

  const $ = cheerio.load(html);

  // Remove elements that never contain useful readable content
  $("script, style, noscript, iframe, svg, nav, footer, header, form").remove();

  const pageTitle = $("title").first().text().trim();

  // Grab text from common content-bearing tags, in document order
  const parts = [];
  $("h1, h2, h3, h4, h5, h6, p, li, blockquote, td, th").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length > 0) parts.push(text);
  });

  let visibleText = parts.join("\n");

  // Fallback: if the tag-based extraction found almost nothing
  // (e.g. heavily JS-rendered site), fall back to body text.
  if (visibleText.length < 200) {
    visibleText = $("body").text().replace(/\s+/g, " ").trim();
  }

  // Cap the text so we don't blow past the AI model's context window
  const MAX_CHARS = 12000;
  if (visibleText.length > MAX_CHARS) {
    visibleText = visibleText.slice(0, MAX_CHARS);
  }

  return { title: pageTitle, text: visibleText };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function summarizeUrl(url) {
  const response = await fetch(`${API_BASE_URL}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Server returned ${response.status} (${response.statusText || "Unexpected response"}).`
    );
  }

  if (!response.ok) {
    throw new Error(data.error || "Failed to summarise this page.");
  }

  return data; // { url, title, summary }

}

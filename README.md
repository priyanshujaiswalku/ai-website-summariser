# AI Website Summariser

A small full-stack web app: paste any public URL, and it fetches the page,
extracts the visible text, sends it to an AI model, and shows a short summary.

Built for the Indus Net Technologies Assignment 1 brief.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Scraping:** Axios + Cheerio (fetches HTML, strips scripts/nav/footer, pulls visible text from headings/paragraphs/lists)
- **AI:** Groq's chat completions API (OpenAI-compatible), using the free/fast `llama-3.1-8b-instant` model

## Folder Structure

```
ai-website-summariser/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── summarize.js       # fetch() wrapper for the backend
│   │   ├── components/
│   │   │   ├── UrlForm.jsx        # URL input + submit button
│   │   │   ├── LoadingIndicator.jsx
│   │   │   ├── SummaryCard.jsx    # renders the result
│   │   │   └── ErrorMessage.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   └── .env.example
│
├── server/                 # Express backend
│   ├── routes/
│   │   └── summarize.route.js     # POST /api/summarize
│   ├── services/
│   │   ├── scrape.service.js      # fetches URL + extracts visible text
│   │   └── ai.service.js          # calls the AI model
│   ├── middleware/
│   │   └── logger.js
│   ├── server.js
│   └── .env.example
│
└── README.md
```

## How It Works

1. The user pastes a URL into the React frontend and clicks **Summarise**.
2. The frontend calls `POST /api/summarize` on the Express backend.
3. The backend:
   - Validates the URL.
   - Fetches the page HTML with Axios.
   - Uses Cheerio to strip `<script>`, `<style>`, `<nav>`, `<footer>`, etc., and
     pulls text from headings, paragraphs, list items, and table cells (falls
     back to full body text if that yields too little).
   - Truncates the text to a safe length and sends it to the Groq API with a
     system prompt asking for a concise, factual 4-6 sentence summary.
4. The summary (plus page title and URL) is returned to the frontend and
   displayed. A loading indicator is shown while the request is in flight,
   and errors (invalid URL, unreachable page, missing API key, etc.) are
   shown inline.

## Setup

### Prerequisites

- Node.js 18+
- A free Groq API key: https://console.groq.com/keys

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# open .env and paste your GROQ_API_KEY
npm start
```

The server runs on `http://localhost:5000` by default.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env   # defaults already point at http://localhost:5000
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### 3. Try it

Paste a public article/blog URL (e.g. a Wikipedia page or a news article)
into the input box and click **Summarise**.

## How AI Was Used

- **Building this project:** I used Claude to scaffold the Express backend
  (routes/services/middleware split), the React components, and the CSS, and
  to review error handling around network/timeout failures. I wrote/adjusted
  the prompts and tested the app end-to-end myself.
- **Inside the app itself:** the app's core feature calls the Groq API
  (`llama-3.1-8b-instant`) with a system prompt instructing it to produce a
  neutral, factual 4-6 sentence summary of the scraped page text, and to say
  plainly if the page has no real readable content (e.g. it's mostly
  navigation/boilerplate).

## Notes / Possible Improvements

- The scraper is a basic static-HTML extractor — it won't see content that
  only renders after client-side JavaScript runs (a headless browser like
  Puppeteer would fix this, at the cost of more setup).
- Swapping providers (OpenAI, Gemini) only requires changing
  `server/services/ai.service.js` — the rest of the app is provider-agnostic.
- Could add: response caching per URL, streaming the summary token-by-token,
  and a character/word count limit warning in the UI before submission.

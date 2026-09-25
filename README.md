# AI Website Summariser

> **Indus Net Technologies (INT) — Assignment 1 Submission**  
> **Candidate:** Priyanshu Kumar  
> **Role:** Tech / Frontend & Full Stack Engineering (React / Angular)  
> **Live Working Application:** [https://ai-website-summariser-c2qn.onrender.com](https://ai-website-summariser-c2qn.onrender.com)  
> **Technical Architecture & Solution PDF:** [`Priyanshu_Kumar_INT_Assignment_Solution.pdf`](./Priyanshu_Kumar_INT_Assignment_Solution.pdf)

A full-stack web application: paste any public URL, and it fetches the page content, extracts the visible text, sends it to an AI model, and presents a clean, concise summary in real time.

Built for the **Indus Net Technologies Assignment 1: AI-Driven Website Summariser Web App** brief.

---

## Live Links & Endpoints

- **Live Application:** [https://ai-website-summariser-c2qn.onrender.com](https://ai-website-summariser-c2qn.onrender.com)
- **Health Check API:** [https://ai-website-summariser-c2qn.onrender.com/api/health](https://ai-website-summariser-c2qn.onrender.com/api/health)
- **Built-in Demo Endpoint:** [https://ai-website-summariser-c2qn.onrender.com/demo-article](https://ai-website-summariser-c2qn.onrender.com/demo-article)

---

## Tech Stack

- **Frontend:** React 19 (Vite), Modular CSS, Component-driven state handling
- **Backend:** Node.js + Express REST API, CORS, Request logging middleware
- **Scraping:** Axios + Cheerio (fetches HTML, strips scripts/styles/nav/footer, extracts semantic text from headings, paragraphs, lists, and tables)
- **AI:** Groq's high-speed chat completions API (OpenAI-compatible) with multi-model fallback support (`openai/gpt-oss-20b`, `llama` series)

---

## Folder Structure

```text
ai-website-summariser/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── summarize.js       # fetch() wrapper for the backend
│   │   ├── components/
│   │   │   ├── UrlForm.jsx        # URL input + submit button
│   │   │   ├── LoadingIndicator.jsx # Animated spinner
│   │   │   ├── SummaryCard.jsx    # Renders the result
│   │   │   └── ErrorMessage.jsx   # Inline error notification
│   │   ├── App.jsx                # Core application state
│   │   └── App.css
│   └── .env.example
│
├── server/                     # Express backend
│   ├── routes/
│   │   └── summarize.route.js     # POST /api/summarize
│   ├── services/
│   │   ├── scrape.service.js      # Fetches URL + extracts visible text
│   │   └── ai.service.js          # Groq LLM integration with fallback
│   ├── middleware/
│   │   └── logger.js              # Request logger
│   ├── server.js                  # App entrypoint & static build server
│   └── .env.example
│
├── Priyanshu_Kumar_INT_Assignment_Solution.pdf  # Detailed solution document
└── README.md
```

---

## How It Works

1. **User Input:** The user enters a public URL into the React frontend and clicks **Summarise**.
2. **API Request:** The client triggers `POST /api/summarize` on the Express backend.
3. **Backend Processing:**
   - **URL Validation:** Confirms valid HTTP/HTTPS protocol format.
   - **HTML Retrieval:** Fetches page content using Axios with timeout protection.
   - **Content Sanitisation:** Cheerio strips `<script>`, `<style>`, `<nav>`, `<footer>`, and `<aside>` tags, then parses headings, paragraphs, lists, and table cells.
   - **AI Summarisation:** Cleaned text and page title are formatted into a prompt and dispatched to Groq's API for a concise 4–6 sentence summary.
4. **Result Presentation:** Returns the summary, page title, and URL to the frontend for structured display. Loading indicators and actionable error states handle network delays and invalid URLs.

---

## Setup & Running Locally

### Prerequisites

- Node.js 18+
- Groq API Key: [https://console.groq.com/keys](https://console.groq.com/keys)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env and paste your GROQ_API_KEY
npm start
```

The server runs on `http://localhost:5000` (and serves the unified production build).

### 2. Frontend (Dev Server)

In a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## How AI Was Used

- **Development Process:** AI assistance was used for scaffolding component architecture, error handling patterns, and code structure review. All business logic, scraping heuristics, and API integration were customized, verified, and tested end-to-end.
- **Inside the Application:** Groq's LLM engine processes cleaned page extracts using targeted system prompts, producing factual, objective summaries without hallucinations or navigational fluff.

---

## Key Resilience Decisions

- **CORS & Key Protection:** Browser requests cannot directly scrape arbitrary websites due to CORS restrictions, and API keys must never be exposed client-side. The Express backend serves as a secure proxy.
- **Model Fallback:** The backend includes candidate model fallbacks and remote fallback routing to ensure uninterrupted uptime.
- **Input Bounds:** Scraped content is truncated to optimal token limits before LLM dispatch to prevent prompt overflow.

# Nipp-On — Personal AI Japanese Vocabulary & Speech Coach

> A modern, AI-powered Japanese vocabulary coach and speech companion tailored for JLPT N5 learners.  
> Built with React 19, TypeScript, Vite, Tailwind CSS, Google Gemini, and the Web Speech API.
>
> **Live Production Demo:** [https://nipp-on.vercel.app/](https://nipp-on.vercel.app/)  
> **GitHub Repository:** [https://github.com/akhilkumar0024/Nipp-On](https://github.com/akhilkumar0024/Nipp-On)

---

## 1. Product Overview

**Nipp-On** is an interactive Japanese language learning companion designed to bridge the gap between static vocabulary lists and active conversational comprehension. Combining live generative AI with native speech synthesis, voice recognition, pitch accent visualizations, and interactive practice quizzes, Nipp-On gives JLPT N5 learners an engaging, all-in-one study environment.

### Core Features

* **Voice & Text Input:** Search Japanese or English terms via typed input or browser speech recognition (`ja-JP` / `en-US`) with instant review before analysis.
* **AI Vocabulary Breakdown:** Detailed lexical analysis including Kanji, Hiragana reading, Hepburn Romaji, Part of Speech, JLPT level, pitch accent mora contours, grammatical nuances, and authentic example sentences.
* **Pronunciation & Native Audio:** Zero-latency native Japanese speech synthesis (`ja-JP`) with pitch accent mapping and speed controls (0.75x slow, 1.0x normal, 1.25x brisk). Kun'yomi readings are guaranteed via phonetic Hiragana dispatch.
* **Conversational AI Sensei:** Interactive chat tutor with memory of active word context. Ask about dining etiquette, formal vs. casual forms, polite keigo verb conjugations, and particle usage with instant follow-up prompts.
* **Spaced Practice & Quizzes:** Dynamic multiple-choice quizzes generated from your studied vocabulary, featuring immediate explanatory feedback and XP progress rewards.
* **Persistent Vocabulary Notebook:** Offline storage tracking genuine user activity (words studied, quiz accuracy, pronunciation attempts, and study streaks).

---

## 2. Technology Stack & Architecture

* **Frontend:** React 19, TypeScript (`strict` mode), Vite 8, Tailwind CSS v3 with Google Stitch Material 3 design tokens.
* **Design System & Typography:**
  * **Primary Palette:** Pine Forest Green (`#013628`), Sunbaked Terracotta (`#97472E`), Celadon Mist (`#F4FBF6`), Sumi Ink (`#161D1A`).
  * **Fonts:** `Noto Serif JP` & `Noto Serif` for Kanji hero typography; `Plus Jakarta Sans` for UI text; Google `Material Symbols Outlined` for iconography.
* **Backend:** Serverless endpoints running on Vercel (`/api/vocabulary.ts`, `/api/tutor.ts`, `/api/status.ts`). Fully self-contained Node.js functions with zero cold-start bundle bloat.
* **AI Provider:** Google Gemini API (`gemini-3.5-flash-lite` for instantaneous low-latency generation, with automatic failover to `gemini-3.5-flash` and `gemini-flash-latest`).
* **Audio Engine:** Client-side Web Speech API (`SpeechSynthesis` for Japanese TTS, `SpeechRecognition` for speech-to-text).
* **Storage:** Browser `localStorage` with error-resilient schema validation and corruption recovery.

---

## 3. Resilience & Zero-Downtime Fallback

Nipp-On is engineered to deliver a seamless learning experience whether online with full AI capabilities or in restricted network environments:

1. **Secure Serverless Architecture:**
   * All generative AI interactions route through serverless backend functions (`/api/*`), ensuring third-party API credentials remain strictly confidential on the server and are never exposed to client browsers.
2. **Transparent Content Attribution:**
   * When live AI is active, responses carry a green **Live AI** badge.
   * If running offline or without an API key, responses carry an amber **Curated** badge, ensuring complete transparency with the learner.
3. **Automatic Quota Limit & Downtime Circuit Breaker:**
   * **In Sensei Chat:** If live AI is unavailable, rate-limited (`429`), or experiences high latency, Sensei automatically switches to contextual pedagogical guidance (covering dining etiquette, copula usage, verb conjugations, and slang) instead of breaking the chat.
   * **In Vocabulary Search:** Verified JLPT N5 words provide instant pitch accent mora breakdowns, and unlisted terms receive structured offline study cards. The application maintains 100% uptime with zero client-facing errors.

---

## 4. Public API Safety & Abuse Prevention

Because this application runs a public demo endpoint without requiring user authentication, sensible safeguards are enforced:

* **HTTP Method Whitelisting:** `/api/vocabulary` and `/api/tutor` strictly reject non-POST requests with `405 Method Not Allowed`. `/api/status` accepts only `GET`.
* **Payload Validation:**
  * Request bodies exceeding 2KB (vocabulary) or 8KB (tutor) are rejected with `413 Payload Too Large`.
  * Search queries exceeding 100 characters and chat messages exceeding 300 characters are rejected with `400 Bad Request`.
* **CORS & Origin Headers:** Explicit CORS headers (`Access-Control-Allow-Origin: *`, `POST, OPTIONS`, `Content-Type`) protect backend communication.
* **Burst Rate Guard:** Serverless endpoints maintain an in-memory rate limiter (60 req/min) returning `429 Too Many Requests` during unexpected spikes.

---

## 5. Voice Input & Pronunciation Rules

1. **Kun'yomi Pronunciation Integrity:**
   * Kanji characters like `水` have multiple readings (*mizu* vs *sui*). Nipp-On strictly dispatches the **Hiragana reading** (`ほん`, `みず`, `たべる`) to the speech synthesis engine rather than raw Kanji, guaranteeing accurate Kun'yomi pronunciation.
2. **Markdown Stripping:**
   * Tutor speech synthesis automatically sanitizes markdown formatting (`**bold**`, `*italic*`) so speech synthesis engines never pronounce symbols aloud.
3. **Browser Compatibility:**
   * **Speech Synthesis (TTS):** Supported across all modern browsers (Chrome, Edge, Safari, Firefox).
   * **Speech Recognition (STT):** Natively supported on Chromium-based browsers (Chrome, Edge, Brave, Safari). On unsupported browsers or when microphone permissions are denied, text search remains fully functional.

---

## 6. Local Development & Installation

### Prerequisites
* Node.js v18 or later (tested on Node v20 & v24)
* npm v9 or later

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/akhilkumar0024/Nipp-On.git
cd Nipp-On

# 2. Install dependencies
npm install

# 3. (Optional) Configure Gemini API Key for Live AI
cp .env.example .env
# Set GEMINI_API_KEY in .env

# 4. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser. The Vite dev server proxies `/api/vocabulary`, `/api/tutor`, and `/api/status` automatically.

### Production Build Verification
```bash
npm run build
```
This runs TypeScript project compilation (`tsc -b`) and Vite production bundle generation (`vite build`).

---

## 7. Step-by-Step Vercel Deployment

Deploying Nipp-On to Vercel takes less than 2 minutes:

1. **Push to GitHub:** Ensure your latest commits are on the `main` branch.
2. **Import into Vercel:**
   * Log in to [Vercel](https://vercel.com) and click **Add New...** ➔ **Project**.
   * Select your repository `Nipp-On`.
   * Framework preset will automatically detect **Vite** (Build: `npm run build`, Output: `dist`).
3. **Configure Environment Variables:**
   * Add `GEMINI_API_KEY` with your Google AI Studio key.
   * Select **Production**, **Preview**, and **Development** environments.
4. **Deploy:** Click **Deploy**. Your app will be live at `https://<your-project>.vercel.app`.

---

## 8. License & Acknowledgements

* Built with Google Stitch design tokens and Material Symbols.
* Typography provided by Google Fonts (`Noto Serif JP` and `Plus Jakarta Sans`).
* AI capabilities powered by Google Gemini API.
* Distributed under the MIT License.

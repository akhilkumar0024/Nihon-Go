# Nipp-On — Personal AI Japanese Vocabulary & Speech Coach

> **Prototype Submission for Product Operations Associate**  
> Built with React, TypeScript, Vite, Tailwind CSS, Google Gemini API, and the Web Speech API. Designed with high-fidelity adherence to Google Stitch design systems.
>
> **GitHub Repository:** [https://github.com/akhilkumar0024/Nihon-Go](https://github.com/akhilkumar0024/Nihon-Go)

---

## 1. Product Overview

**Nipp-On** is an AI-powered Japanese vocabulary coach with voice input, native pronunciation, conversational tutoring, quizzes, and a vocabulary notebook tailored for JLPT N5 learners.

### The Six Core Feature Groups
* **Voice & Text Input:** Search Japanese or English terms via typed input or browser speech recognition with real-time text review prior to submission.
* **AI Vocabulary Breakdown:** Detailed lexical analysis including Kanji, Hiragana reading, Hepburn Romaji, Part of Speech, JLPT level, pitch accent mora charts, grammatical nuances, and authentic example sentences.
* **Pronunciation & Native Audio:** Zero-latency native Japanese speech synthesis (`ja-JP`) with pitch accent contour mapping and speed controls (0.75x slow, 1.0x normal, 1.25x brisk). Kun'yomi readings are guaranteed via Hiragana phonetic dispatch.
* **Conversational AI Sensei:** Interactive chat tutor with memory of active word context. Learner questions regarding restaurant etiquette, slang, polite verb conjugations, and particle usage receive structured responses with follow-up suggestions.
* **Spaced Practice & Quizzes:** Dynamic multiple-choice and meaning quizzes generated from studied vocabulary, featuring immediate explanatory feedback and XP progress rewards.
* **Vocabulary Notebook & Honest Progress Tracking:** Fully persistent offline storage tracking genuine user activity (words studied, quiz accuracy, pitch attempts, and study streaks).

---

## 2. Pre-Submission Audit & Honest Learner State

During our pre-submission audit, we eliminated misleading demonstration data:

| Metric / Component | Audit Finding & Action Taken |
|---|---|
| **Streaks** | Removed fabricated multi-day streaks. Fresh browser sessions honestly initialize at `0-Day Streak` and increment only with recorded daily reviews. |
| **Pitch Score** | Replaced hardcoded "90% native match" with honest `—` and `READY / NO ATTEMPTS` until the user records actual pronunciation attempts. |
| **Notebook Data** | Fresh sessions start empty (`0 words`). Reviewers and users can click **"Load 4 Starter N5 Words (Sample Demo)"** on demand to explore the notebook, with each starter entry clearly labeled with a demo badge. |
| **Active Session Time** | Replaced static timers (e.g. 08:42) with a live session timer that increments from 00:00 as the user interacts with the app. |
| **Speech Recognition Score** | Removed simulated 88–95% scores when microphone permissions were denied or unavailable. The system now provides an honest error message and prompt to use text search. |

---

## 3. Technology Stack & Architecture

* **Frontend:** React 19, TypeScript (strict type checking), Vite 8, Tailwind CSS v3 with Google Stitch Material 3 design tokens.
* **Design System & Typography:**
  * Primary Palette: Pine Forest Green (`#013628`, `#1E4D3E`), Sunbaked Terracotta (`#97472E`), Celadon Mist (`#F4FBF6`), Sumi Ink (`#161D1A`).
  * Fonts: `Noto Serif JP` & `Noto Serif` for Kanji hero characters; `Plus Jakarta Sans` for UI text; Google `Material Symbols Outlined` for iconography.
* **Backend:** Node.js serverless functions running on Vercel (`/api/vocabulary.ts`, `/api/tutor.ts`, `/api/status.ts`).
* **AI Provider:** Google Gemini API (`gemini-2.5-flash` with automatic fallback to `gemini-1.5-flash`).
* **Audio Engine:** Client-side Web Speech API (`SpeechSynthesis` for Japanese TTS, `SpeechRecognition` for voice input).
* **Storage:** Browser `localStorage` with error-resilient schema validation and corruption recovery.

---

## 4. Real AI Functionality & Fallback Behaviour

Nipp-On supports both live AI generation and resilient offline exploration:

1. **Server-Side Security (`GEMINI_API_KEY`):**
   * The Gemini API key is loaded strictly on the server/serverless layer.
   * **Never** prefixed with `VITE_`, never bundled into client JavaScript, and never exposed in browser responses or error traces.
2. **Transparent Content Attribution:**
   * When `GEMINI_API_KEY` is present, responses are tagged with `source: 'live-ai'` and marked in the UI as **Live AI**.
   * When running without an API key or when network/quota errors occur, the system serves verified JLPT N5 entries tagged with `source: 'curated-fallback'` and badged as **Curated**.
   * Fallback answers are never misrepresented as live AI generations.
3. **Robust Error Handling:**
   * If an unindexed query is requested without an API key, the API returns a helpful 500 error recommending available curated words (e.g. *eat*, *drink*, *book*, *water*, *cat*, *friend*, *delicious*) without leaking stack traces or internal paths.

---

## 5. Public API Safety & Abuse Prevention

Because this application runs a public demo endpoint without requiring user authentication, practical safeguards have been implemented:

* **HTTP Method Whitelisting:** `/api/vocabulary` and `/api/tutor` strictly reject non-POST requests with `405 Method Not Allowed`. `/api/status` accepts only `GET`.
* **Payload Size & String Length Limits:**
  * Request bodies exceeding 2KB (vocabulary) or 8KB (tutor) are rejected with `413 Payload Too Large`.
  * Search queries exceeding 100 characters are rejected with `400 Bad Request`.
  * Chat messages exceeding 300 characters or conversation histories exceeding 10 messages are rejected.
* **CORS & Origin Headers:** Explicit CORS headers (`Access-Control-Allow-Origin: *`, `POST, OPTIONS`, `Content-Type`) are returned.
* **Burst Rate Guard & Cost Protection:**
  * Each serverless runtime maintains an in-memory rate limiter (60 req/min) returning `429 Too Many Requests`.
  * *Note on Serverless Architecture:* In-memory rate limiters protect individual lambda instances from burst traffic, but are not global across ephemeral serverless instances. For zero-budget prototype deployment, this avoids introducing paid services (like Redis/Upstash).
  * *Cost Control Recommendation:* In Google AI Studio, set a spending cap or quota limit on your Gemini project to ensure total API usage remains bounded.

---

## 6. Voice Input & Pronunciation Rules

1. **Kun'yomi Pronunciation Integrity:**
   * Kanji characters like `水` have multiple readings (*mizu* vs *sui*). Nipp-On strictly dispatches the **Hiragana reading** (`ほん`, `みず`, `たべる`) to the speech synthesis engine rather than the raw Kanji, guaranteeing accurate Kun'yomi pronunciation.
2. **Markdown Stripping:**
   * Tutor speech synthesis strips markdown asterisks (`**bold**`, `*italic*`) and formatting characters so speech synthesis engines never pronounce symbols aloud.
3. **Browser Compatibility:**
   * **Speech Synthesis (TTS):** Supported across all modern browsers (Chrome, Edge, Safari, Firefox).
   * **Speech Recognition (STT):** Natively supported on Chromium-based browsers (Chrome, Edge, Brave, Safari). On unsupported browsers or when microphone access is denied, text search remains fully functional and an informative banner is displayed.

---

## 7. Local Development & Verification

### Prerequisites
* Node.js v18 or later (tested on Node v20 & v24)
* npm v9 or later

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/akhilkumar0024/Nihon-Go.git
cd Nihon-Go

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

## 8. Step-by-Step Vercel Deployment Guide

Deploying Nipp-On to Vercel takes less than 3 minutes:

### Step 1: Push Code to GitHub
Ensure all changes are pushed to your `main` branch:
```bash
git push origin main
```

### Step 2: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** ➔ **Project**.
3. Select your repository `Nihon-Go` from GitHub.
4. Configure the project:
   * **Framework Preset:** Vite
   * **Root Directory:** `./` (or leave default)
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`

### Step 3: Add the Gemini API Key
1. In the **Environment Variables** section on the import screen (or later under Project Settings ➔ Environment Variables):
   * **Key:** `GEMINI_API_KEY`
   * **Value:** `your_gemini_api_key_from_google_ai_studio`
   * **Target Environments:** Production, Preview, Development (all checked)
2. Click **Deploy**.

### Step 4: Redeployment After Changing Environment Variables
If you update or add `GEMINI_API_KEY` after the initial deployment:
1. Navigate to **Deployments** in your Vercel project dashboard.
2. Click the three dots (`...`) on the latest deployment and select **Redeploy**.
3. *Vercel injects updated environment variables only into new builds/deployments.*

### Step 5: Verify the Live Public URL
Open the generated `*.vercel.app` URL in a private/incognito browser window without being logged in to verify:
* Dashboard loads with clean `0-Day Streak` and `READY / NO ATTEMPTS` empty state.
* Search a word (e.g. "cat" or "book") to verify live AI vocabulary analysis.
* Click audio speaker button to verify Japanese speech synthesis.
* Open Sensei AI chat and ask a question.
* Complete a quick quiz in Practice & Notebook.

---

## 9. Security & Integrity Summary

* **No Leaked Secrets:** Zero API keys in frontend code, git commits, or client-facing responses.
* **No Fabricated Metrics:** Learner statistics reflect only authentic actions.
* **Clear Attribution:** Curated fallbacks and Live AI are visibly distinguished.
* **Zero Cost Overruns:** Hard payload caps, character validation, and serverless timeout boundaries prevent uncontrolled resource consumption.

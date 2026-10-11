# Nipp-ON — Personal AI Japanese Vocabulary & Speech Coach

> **Prototype Submission for Product Operations Associate**  
> Built with React, TypeScript, Vite, Tailwind CSS, Google Gemini API, and the Web Speech API. Styled with full visual fidelity to Google Stitch design systems.

---

## 1. Project Overview

**Nipp-ON** is an AI-powered vocabulary tutor designed to help English speakers learn Japanese vocabulary through multimodal interactions:
* **English & Voice Input:** Search arbitrary words or speak into the microphone.
* **Lexical & Linguistic Analysis:** Automatic Japanese writing (Kanji/Kana), Hiragana reading, Hepburn Romaji, Part of Speech, JLPT level classification, and pitch-accent mora curve graphs.
* **Cultural & Grammar Nuances:** Pedagogical explanations of particle pairings, honorifics, and real-world example sentences.
* **Audio Pronunciation:** Zero-latency native Japanese pronunciation via the browser's Web Speech Synthesis API (`ja-JP`) with natural (1.0x) and slow (0.75x) study speed controls.
* **Conversational AI Sensei:** Dedicated two-column tutor dialogue stream that maintains word context across turns, answering grammar, restaurant etiquette, and slang questions.
* **Interactive Practice Quiz & Notebook:** Spaced-repetition quizzes with multiple-choice options, instant grammar feedback drawers (+15 XP), and offline browser storage persistence.

---

## 2. Six Core Feature Groups

| Feature Group | Implementation Details |
|---|---|
| **A. Voice & Text Input** | Text input always available; speech recognition (Web Speech API) with animated audio waveform, interim preview, and graceful permission error handling. |
| **B. AI-Powered Vocabulary Tutor** | Serverless backend endpoint (`/api/vocabulary`) calling Google Gemini (`gemini-2.5-flash`), returning validated structured JSON. Built-in curated N5 dataset fallback for instant zero-config exploration. |
| **C. Pronunciation & Audio** | Browser `SpeechSynthesis` API with Tokyo accent detection, playback rate toggle (1.0x / 0.75x slow), and speech engine diagnostics. |
| **D. Conversational AI Tutor** | Sensei AI dialogue endpoint (`/api/tutor`) retaining active word context and conversation history, with interactive quick prompts and inline audio pronunciation on Japanese text. |
| **E. Practice Quiz** | Multi-question quiz engine testing meaning, readings, verb conjugations, and audio listening, with instant feedback drawers and scoring. |
| **F. Notebook & Progress** | Full `localStorage` persistence for bookmarks and progress; honest calculation of daily goals, review streaks, quiz accuracy, and session duration. |

---

## 3. Technology Stack & Architecture

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (Tailwind v3 matching Google Stitch color tokens and typography).
* **Backend:** Node.js serverless functions (`/api/vocabulary.ts`, `/api/tutor.ts`, `/api/status.ts`).
* **AI Model:** Google Gemini API (`gemini-2.5-flash` with automatic fallback to `gemini-1.5-flash`).
* **Audio:** Web Speech API (`SpeechSynthesis` for Japanese TTS, `SpeechRecognition` for STT).
* **Storage:** Browser `localStorage` (no account/login required for the reviewer).
* **Deployment Target:** Vercel (configured via `vercel.json` with SPA routing and serverless `/api/*` execution).

---

## 4. Security & API Key Management

* **Server-Side Only:** `GEMINI_API_KEY` is loaded exclusively in server-side / serverless functions.
* **No Client Leakage:** The API key is **never** prefixed with `VITE_`, never bundled into frontend JavaScript, and never returned in API responses.
* **Graceful Degradation:** If deployed without an API key, Nipp-ON operates transparently on a curated JLPT N5 database with contextual tutor dialogue, clearly badging live AI vs curated results.

---

## 5. Local Development Setup

### Prerequisites
* Node.js v18+ (tested on Node v24)
* npm v9+

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/akhilkumar0024/Nihon-Go.git Nipp-ON
cd Nipp-ON

# 2. Install dependencies
npm install

# 3. (Optional) Configure Gemini API Key
cp .env.example .env
# Edit .env and set: GEMINI_API_KEY=your_key_here

# 4. Start local development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.  
*(Note: The Vite dev server includes integrated API middleware that serves `/api/vocabulary`, `/api/tutor`, and `/api/status` locally without requiring a separate backend process).*

---

## 6. Vercel Public Deployment Guide

1. **Push to GitHub:** Ensure all code is committed to `origin/main`.
2. **Import into Vercel:**
   * Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   * Import the `Nihon-Go` repository.
   * Vercel will automatically detect **Vite** as the framework preset with `npm run build` as the build command and `dist` as the output directory.
3. **Environment Variable Configuration:**
   * In Vercel Project Settings ➔ **Environment Variables**:
   * Add:
     * Key: `GEMINI_API_KEY`
     * Value: `<Your Google AI Studio Gemini API Key>`
4. **Deploy:** Click **Deploy**.
5. **Acceptance Verification:**
   * Open the public HTTPS URL in a clean browser session (e.g. Incognito).
   * Search an arbitrary English word (e.g., *"bicycle"* or *"train"*).
   * Confirm the live AI analysis loads with audio pronunciation.
   * Ask Sensei a follow-up question.
   * Complete a practice quiz and save words to your notebook.

---

## 7. Stitch Design Fidelity

Nipp-ON reproduces the exact design language from Google Stitch:
* **Palette:** Pine Forest Green (`#013628`, `#1E4D3E`), Sunbaked Terracotta (`#97472E`, `#C86D51`), Celadon Mist (`#F4FBF6`, `#E8F0EA`), Sumi Ink typography (`#161D1A`).
* **Typography:** `Noto Serif` & `Noto Serif JP` for literary authority in headings and kanji; `Plus Jakarta Sans` for clean, accessible interface body text.
* **Tactile Interactions:** Custom tactile button depress animations (`tactile-depress`, `tactile-terracotta`), pulsing soundwave visualizers, and traditional washi callout panels.

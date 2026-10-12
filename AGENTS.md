# Agent Instructions & Project Context: Nipp-On

## Project Summary
This workspace contains **Nipp-On**, an AI-powered Japanese vocabulary coach for JLPT N5 learners built with React 19, TypeScript, Vite, Tailwind CSS, Google Gemini, and the Web Speech API.

For complete architectural details, consult [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

## Critical Guidelines for Agents in this Repository

1. **Design System & Aesthetics**:
   - The UI strictly adheres to Google Stitch design specifications found in `design_reference/*.html`.
   - Primary colors: Pine Forest Green (`#013628`) and Terracotta (`#97472E`).
   - Fonts: Google Fonts `Noto Serif JP` for Kanji hero characters and `Plus Jakarta Sans` for UI/body text.
   - Do NOT use generic raw CSS colors; always use the theme tokens defined in `tailwind.config.js`.

2. **Japanese TTS Pronunciation Rules**:
   - Kanji characters like `水` have multiple readings. In speech synthesis calls, **always pass the Hiragana reading** (`word.hiragana || word.japanese`) to `audioService.speakJapanese()` so Kun'yomi (e.g. *mizu*) is pronounced correctly instead of On'yomi (*sui*).
   - In chat or free-form text, strip markdown symbols (`*`, `_`, `#`, etc.) before passing to `SpeechSynthesisUtterance` so speech engines never pronounce formatting symbols aloud.

3. **Markdown in Chat**:
   - In `TutorScreen.tsx`, chat messages must be passed through `renderFormattedChatMessage()` to parse `**bold**` and `*italic*` into semantic elements rather than displaying raw asterisks.

4. **Security & API Keys**:
   - Never prefix Gemini API keys with `VITE_` or expose them in the browser bundle.
   - All AI interactions must pass through `/api/vocabulary` or `/api/tutor`.
   - Both endpoints must maintain robust fallback handling if the API key is not configured.

5. **Layout Spacing**:
   - Fixed `TopNavBar` is `h-16`. `<main>` in `App.tsx` must maintain `mt-16 min-h-[calc(100vh-4rem)]` to prevent fixed header overlap.

6. **Git Remote**:
   - `https://github.com/akhilkumar0024/Nipp-On.git` (`main` branch).

# Nipp-On (日本-Go) — Personal Japanese Vocabulary & Speech Coach

> An intuitive, AI-powered Japanese vocabulary coach designed to help JLPT N5 learners master authentic pronunciation, pitch accents, grammatical nuances, and conversational fluency.
>
> 🌐 **Live Demo:** [https://nipp-on.vercel.app/](https://nipp-on.vercel.app/)  
> 📦 **GitHub Repository:** [https://github.com/akhilkumar0024/Nipp-On](https://github.com/akhilkumar0024/Nipp-On)  
>
> 📋 **Product Management Portfolio & Case Studies:**
> * 📄 **[Product Case Study (0-to-1 Strategy & MVP Teardown)](./docs/product/PRODUCT_CASE_STUDY.md):** User problem discovery, target persona, end-to-end study journey, trade-offs, and A/B test framework.
> * 📐 **[Product Requirements Document — Live MVP v1.0](./docs/product/PRD_V1_CORE_MVP.md):** Specification of the current live production application (Voice search, Kanji cards, AI Sensei, Quizzes, and Fallback circuit breaker).
> * 🚀 **[Product Requirements Document — Roadmap v1.1](./docs/product/PRD_CLOUD_SYNC.md):** Next-release specification for engineering & design handoff (Cloud authentication, cross-device notebook sync, PostgreSQL schemas, and edge cases).
> * ⚙️ **[Technical Architecture & Engineering Guide](./PROJECT_CONTEXT.md):** Serverless design, Web Speech API subsystems, and fallback circuit breaker.

---

## 1. What is Nipp-On?

Traditional vocabulary apps often give you flat dictionary definitions with robotic audio. **Nipp-On** bridges the gap between passive memorization and real-world comprehension:

* **Hear Authentic Pronunciation:** Native speech engine with adjustable speeds and visual pitch accent contours.
* **Understand Cultural Context:** AI-powered lexical breakdowns that explain polite vs. casual registers, common particle pairings, and natural example sentences.
* **Practice with AI Sensei:** A friendly, interactive tutor that answers questions on Japanese etiquette, sentence patterns, and restaurant phrases.
* **Spaced Retention:** Interactive multiple-choice quizzes and a personal notebook with offline tracking.

---

## 2. How to Use the Application

### 🏠 1. Dashboard & Daily Progress
* **Daily Goal & Streak:** Tracks your consecutive study days and daily word targets (e.g. 5/5 words).
* **Daily Flashcard Review:** Flip through your daily study cards, listen to native pronunciation, and mark words as reviewed.
* **Quick Stats:** View words studied, total XP points earned, and overall quiz accuracy in real time.

---

### 🔍 2. Vocabulary Search & Pitch Accent
* **Search Anywhere:** Type words in English (*water*, *to eat*), Romaji (*mizu*, *taberu*), or Japanese (*水*, *食べる*).
* **Voice Search:** Click the microphone icon to speak words aloud using browser speech recognition.
* **Detailed Kanji Card:**
  * **Hero Kanji & Readings:** Clear display of Kanji, Furigana (Hiragana), and Romaji.
  * **Pitch Accent Mora Chart:** Visual tone indicators showing where pitch rises and falls (e.g., *Heiban*, *Atamadaka*).
  * **Audio Speed Controls:** Play native Japanese audio at `0.75x` (slow study), `1.0x` (normal), or `1.25x` (brisk).
  * **Contextual Examples:** Natural beginner sentences with Furigana and English translations.
* **Add to Notebook:** Click **"Add to Notebook"** to save terms for practice quizzes.

---

### 💬 3. Conversational AI Sensei
* **Context-Aware Dialogue:** Sensei knows the active word you are currently studying.
* **Quick Prompt Chips:** Click pre-made questions like:
  * *"How do I order this in a formal restaurant?"*
  * *"Explain the difference between casual and polite forms"*
  * *"Quiz me on verb conjugations"*
* **Free-Form Chat:** Type or dictate questions about Japanese culture, slang, or grammar nuances.
* **Speech Playback in Chat:** Click the speaker button next to Sensei's answers to listen to the Japanese phrases spoken aloud.

---

### 📝 4. Quizzes & Practice Notebook
* **Interactive Quizzes:** Take 4-option multiple-choice quizzes testing reading comprehension, Kanji identification, and meaning.
* **Instant Explanations:** Answer selections reveal immediate grammatical feedback and award +15 XP.
* **Personal Notebook:** Review all saved vocabulary terms, filter by JLPT level or mastery status, or listen to audio on demand.

---

### ⚙️ 5. Audio Settings
* Access the **Audio Settings Modal** via the top navigation bar to select your preferred Japanese voice synthesis engine, adjust base pitch, and test sample phrases.

---

## 3. How to Run Locally

### Prerequisites
* **Node.js:** Version 18 or later (tested on Node v20 & v24)
* **npm:** Version 9 or later

### Step 1: Clone the Repository
```bash
git clone https://github.com/akhilkumar0024/Nipp-On.git
cd Nipp-On
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables (Optional)
To enable live AI generation with Google Gemini:
```bash
cp .env.example .env
```
Open `.env` and add your Gemini API key from [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If you run without an API key, the application automatically runs in Curated Offline Mode using verified N5 starter vocabulary).*

### Step 4: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Step 5: Test Production Build
```bash
npm run build
```

---

## 4. How to Deploy on Vercel

Deploying Nipp-On to Vercel takes less than 2 minutes:

### Step 1: Push Code to GitHub
Ensure all your local changes are pushed to your `main` branch:
```bash
git push origin main
```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** ➔ **Project**.
3. Select your repository **`Nipp-On`**.
4. Vercel will automatically detect the **Vite** framework preset:
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Root Directory:** `./`

### Step 3: Add the Gemini API Key
1. In the **Environment Variables** section on the import screen:
   * **Key:** `GEMINI_API_KEY`
   * **Value:** Your Google Gemini API key
   * **Environments:** Check **Production**, **Preview**, and **Development**.
2. Click **Deploy**.

Your live application will be deployed and accessible at `https://<your-project>.vercel.app`.

---

## 5. Technical Documentation

For developers, contributors, and architectural reviewers, comprehensive documentation is available in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), including:
* System architecture & sequence diagrams
* Vercel serverless functions & API specifications (`/api/vocabulary`, `/api/tutor`, `/api/status`)
* Kun'yomi vs. On'yomi pronunciation rules and audio sanitization algorithms
* Fallback circuit breaker design for API quota limits
* LocalStorage schemas and data persistence rules

---

## 6. License & Acknowledgements

* **Design:** Styled with Google Stitch Material 3 design tokens.
* **Fonts:** `Noto Serif JP` and `Plus Jakarta Sans` via Google Fonts.
* **AI Engine:** Google Gemini API.
* **License:** Distributed under the MIT License.

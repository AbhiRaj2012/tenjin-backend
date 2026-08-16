# 🎌 Ai2Teach_Japanese (Tenjin)

A real-time, multimodal AI language tutor designed to make conversational Japanese practice immersive and interactive. Instead of just memorizing flashcards, Tenjin allows users to practice real-world roleplay scenarios (like ordering at a Konbini or navigating Tokyo) with an adaptive AI agent.

**🔗 [Live Demo](https://tenjin-a1059.web.app)**

---

## ✨ Features

*   **Real-Time Conversational AI:** Low-latency WebSocket architecture for instant, back-and-forth chatting in Japanese.
*   **Multimodal Feedback:** Powered by the Gemma API and neural EdgeTTS to deliver instant responses featuring Kanji, Romaji, English translations, and localized audio.
*   **Gamified Progression:** A responsive XP and leveling system complete with dynamic mastery assessments and an activity matrix.
*   **Auto-Vocabulary Extraction:** Automatically parses new words introduced during roleplay chats and generates study flashcards.
*   **Persistent Architecture:** Utilizes localized state management and NoSQL tracking to anchor user progress, daily streaks, and test scores to the browser.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), CSS3, Firebase Hosting
*   **Backend:** Node.js, Express, WebSockets, Google Cloud Run
*   **AI & Audio:** Google Generative AI (Gemma 4), Node-Edge-TTS
*   **Storage:** LocalStorage (Client), JSON NoSQL (Server)

---

## 🚀 Local Setup & Installation

To run this project locally on your machine, follow these steps:

### Prerequisites
*   Node.js installed
*   A Google Gemini API Key

### Installation

1. Clone the repository:

2. Install dependencies:
   ```bash
    npm install
3. Set up environment variables:
Create a .env file in the root directory and add your API key:
   ```bash
   GEMMA_API_KEY=your_gemini_api_key_here
   PORT=8000

4. Start the application:
You will need two terminal windows.
   ```bash
    Terminal 1 (Backend):
    npm run start
    Terminal 2 (Frontend):
    npm run dev
Open your browser and navigate to http://localhost:5173 (or the port Vite assigns).

---

## 🙏 Special Thanks
A huge shoutout to WawaSensei for generously providing the incredible 3D avatar models used in this project!
* Youtube: https://www.youtube.com/@WawaSensei
* Github: https://github.com/wass08/
---

Note: This project is currently an early Minimum Viable Product (MVP). Feedback and contributions are always welcome!

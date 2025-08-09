# AI Savjetnik

AI Savjetnik is a Vite + React + TypeScript frontend with an Express backend.

## Getting Started

Ensure you have Node.js and npm installed.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
cd backend && npm install && cd ..

# Start the development servers
npm run dev        # frontend
npm run dev:server # backend
```

These commands install dependencies and start both the frontend and backend in development mode.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Troubleshooting voice features

If audio transcription or text-to-speech is not working, verify that the required
OpenAI environment variables are present:

- `OPENAI_API_KEY` – API key for all OpenAI requests.
- `OPENAI_REALTIME_MODEL` – model name for Realtime WebRTC sessions.
- `OPENAI_CHAT_MODEL` – model used for text responses.
- `OPENAI_TTS_MODEL` – model used for text‑to‑speech.
- `OPENAI_STT_MODEL` – model used for speech‑to‑text.
Set `DISABLE_STT=1` in `.env` to disable streaming speech recognition during development.
Make sure your browser or device has granted microphone permission. If problems
persist, check the terminal running `npm run dev:server` for speech‑to‑text
errors.


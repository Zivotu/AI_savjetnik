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
environment variables are present:

- `ELEVENLABS_API_KEY` – API key used when connecting to ElevenLabs.
- `ELEVENLABS_VOICE_ID` – voice identifier for text‑to‑speech.
- `VITE_ELEVEN_AGENT_ID` – agent identifier for ElevenLabs WebRTC voice.
- `TTS_PROVIDER` – choose `elevenlabs` (default) or `hume`.
- `STT_PROVIDER` – choose `elevenlabs` (default) or `hume`.
- `HUME_API_KEY` and `HUME_SECRET_KEY` – needed when using Hume services.

Free ElevenLabs accounts do not support streaming speech recognition. If you just
need text chat, create a `.env` file and set `DISABLE_STT=1` before starting the
backend.

Make sure your browser or device has granted microphone permission. If problems
persist, check the terminal running `npm run dev:server` for speech‑to‑text
errors.


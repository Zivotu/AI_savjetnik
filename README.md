# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c600193c-90f4-4fef-a688-fd6e111235a6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c600193c-90f4-4fef-a688-fd6e111235a6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Install backend dependencies (e.g., `ws`)
cd backend
npm i
cd ..

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

# Step 5: Start the backend API server in a separate terminal.
npm run dev:server
```

To disable the speech-to-text proxy (helpful when using the free ElevenLabs plan), create a `.env` file and set `DISABLE_STT=1` before starting the backend.


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c600193c-90f4-4fef-a688-fd6e111235a6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Troubleshooting voice features

If audio transcription or text-to-speech is not working, verify that the required
environment variables are present:

- `ELEVENLABS_API_KEY` – API key used when connecting to ElevenLabs.
- `ELEVENLABS_VOICE_ID` – voice identifier for text‑to‑speech.
- `TTS_PROVIDER` – choose `elevenlabs` (default) or `hume`.
- `STT_PROVIDER` – choose `elevenlabs` (default) or `hume`.
- `HUME_API_KEY` and `HUME_SECRET_KEY` – needed when using Hume services.

Free ElevenLabs accounts do not support streaming speech recognition. If you just
need text chat, create a `.env` file and set `DISABLE_STT=1` before starting the
backend.

Make sure your browser or device has granted microphone permission. If problems
persist, check the terminal running `npm run dev:server` for speech‑to‑text
errors.

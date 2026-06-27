<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b5f8cc4a-0ba9-44f9-9a19-c6335ff1ad78

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your Gemini API key:
   `cp .env.example .env.local`
3. Run the app:
   `npm run dev`

> You can also start the app with `npm start`.

If port `3000` is already in use, Vite will automatically choose the next available port.

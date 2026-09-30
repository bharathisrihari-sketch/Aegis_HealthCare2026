# AegisHealth India — Health Command & Supply Chain Platform

AI-driven health supply chain platform for Primary Healthcare Centres (PHCs) in India. Built with React 19, TypeScript, Vite, Tailwind CSS, IndexedDB PWA offline store, and Google GenAI (Gemini) SDK.

## Deployment & Production Server Setup

When deploying to serverless container hosts (e.g., Google Cloud Run, Render, AWS App Runner):

1. **Build Step**:
   ```bash
   npm run build
   ```
   This compiles the Vite client bundle into `dist/` and builds the Node.js Express server into `dist-server/server.js` using `esbuild`.

2. **Production Dependency Install Step (CRITICAL)**:
   ```bash
   npm install --omit=dev
   ```
   *Note*: `esbuild server.ts --bundle --packages=external` keeps node_modules external. The hosting container **must** run `npm install --omit=dev` (or equivalent production install) before starting the server, or the server will fail with missing module errors.

3. **Start Command**:
   ```bash
   npm start
   ```
   The Express server listens on `0.0.0.0` using `process.env.PORT` (defaults to 3000).

## Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for live AI Copilot features.
- `PORT`: (Optional) Dynamic port for Cloud Run container health checks.

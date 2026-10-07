# Payroll frontend

React, TypeScript, MUI, and Vite. See the [root README](../README.md) for setup and Vercel deployment.

Copy `.env.example` to `.env` and set `VITE_API_URL`. After dependency installation:

```sh
npm run build
npm run preview -- --port 3001 --strictPort
```

Run the API separately, or use `npm start` at the repository root to build/start both. Preview serves the built frontend locally; Vercel serves production static files.


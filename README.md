# Mock Interview Agent

A mock interview platform built with Vite, React, and a small Node server. This repository contains the frontend and backend needed to run the app locally or deploy it to a hosting service.

View the app in AI Studio: https://ai.studio/apps/fee68cdd-a162-413f-a76c-06847bc8f19f

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy and update environment variables:

   ```bash
   cp .env.example .env.local
   # then set GEMINI_API_KEY in .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Notes

- Keep secrets such as `GEMINI_API_KEY` out of version control.
- See `server/` for backend helpers and `src/` for the frontend React app.


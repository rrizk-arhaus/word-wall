# Word Wall

People open the site on their phones and send one word. A separate screen at `/display` shows every word live, sized by how many people sent it.

- `/` — submit screen (share this link or a QR code to it)
- `/display` — live results for the projector
- `/postcard` — postcard form: the moment, what it taught us, keep or change
- `/postcards` — presenter screen: draws 4 random postcards to walk through
- `/postcards/export` — every postcard as a printable playbook; opens the print dialog so you can save it as a PDF
- `/lesson` — one-field form: one lesson to carry into go-live
- `/api/lessons` — GET all lessons, POST `{ "lesson": "..." }`, DELETE `{ "key": "<ADMIN_KEY>" }` to clear
- `/api/words` — GET results, POST `{ "word": "..." }`
- `/api/reset` — POST `{ "key": "<ADMIN_KEY>" }` to clear (the Clear button on /display does this)

## Deploy on Vercel

1. Unzip, then either drag the folder into a new Vercel project import, or run `npx vercel` inside it.
2. In the project, open **Storage → Create → Upstash (Redis)** and connect it. Vercel adds the `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars automatically.
3. Optional env vars:
   - `NEXT_PUBLIC_PROMPT` — the question shown on both screens (default: "Describe today in one word.")
   - `NEXT_PUBLIC_EVENT_NAME` — heading on the postcard pages (default: "Align & Elevate")
   - `NEXT_PUBLIC_PLAYBOOK_TITLE` — title on the PDF cover (default: "Keystone playbook")
   - `ADMIN_KEY` — enables the Clear buttons on /display and /postcards
4. Redeploy after adding env vars.

Without Redis the app falls back to in-memory storage. That's fine for `npm run dev`, but on Vercel separate serverless instances won't share words, and /display shows a warning.

## Presenter controls (/postcards)

Draw 4 picks postcards that haven't been shown yet this session (it reuses shown ones only if fewer than 4 new ones are left). Use the arrow keys or space to move between them, then Draw 4 more. The count updates every few seconds as new postcards come in.

## Run locally

```
npm install
npm run dev
```

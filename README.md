# Thulani

A conversational virtual assistant prototype for Matla Life. It answers general product questions, offers a human handoff, and avoids collecting sensitive personal details.

## Run

Node.js 18+ is required. From this folder, run `npm start` and open <http://localhost:3000>.

For AI responses, put `ANTHROPIC_API_KEY` and `ANTHROPIC_WORKSPACE_ID` in a local `.env` file or server environment. The default model is `claude-haiku-4-5-20251001`. Without both values, Thulani uses a guided response mode. The key stays on the server and `.env` is ignored by Git.

The demo handoff opens a visitor-approved WhatsApp or email draft to LuliDigital's published contacts. It never sends automatically, saves a lead, or forwards the chat transcript. The form labels the destination clearly and requires consent. To replace the temporary demo destinations, set `DEMO_WHATSAPP_NUMBER` (international digits) and `DEMO_EMAIL` on the server, then update the form's demo wording and the agent instructions for the real recipient. Matla Life's published number and email remain available for direct contact.

## Before publishing

The requested address was `maltalife.co.za`; the publicly indexed company site is [matlalife.co.za](https://www.matlalife.co.za/). Confirm the intended domain and brand ownership before embedding this on a live site. Review product statements and waiting periods with Matla Life: its public funeral page contains conflicting waiting period details. This prototype does not access policies, generate quotes, submit claims, or save leads.

The public demo is deployed at <https://maltalifebot.vercel.app/> from `Fiker-dev/Maltalifebot`. The `vercel.json` file serves the site from `public/`, while `api/chat.js` and `api/greeting.js` run as server functions. Vercel holds `ANTHROPIC_API_KEY` and `ANTHROPIC_WORKSPACE_ID` as server environment variables. Never commit `.env`. The app limits requests per function instance, but a public demo can still incur AI usage costs; keep the link limited to intended reviewers.

# Thulani

A conversational virtual assistant prototype for Matla Life. It answers general product questions, offers a human handoff, and avoids collecting sensitive personal details.

## Run

Node.js 18+ is required. From this folder, run `npm start` and open <http://localhost:3000>.

For AI responses, put `ANTHROPIC_API_KEY` and `ANTHROPIC_WORKSPACE_ID` in a local `.env` file or server environment. The default model is `claude-haiku-4-5-20251001`. Without both values, Thulani uses a guided response mode. The key stays on the server and `.env` is ignored by Git.

After hours, Thulani offers an email handoff to the address published on Matla Life's contact page. Set `MATLA_WHATSAPP_NUMBER` to Matla Life's verified WhatsApp number in international digits (for example, `27...`) to enable a WhatsApp handoff button. The chat does not send messages automatically or forward the conversation transcript.

## Before publishing

The requested address was `maltalife.co.za`; the publicly indexed company site is [matlalife.co.za](https://www.matlalife.co.za/). Confirm the intended domain and brand ownership before embedding this on a live site. Review product statements and waiting periods with Matla Life: its public funeral page contains conflicting waiting period details. This prototype does not access policies, generate quotes, submit claims, or save leads.

The local `localhost:3000` URL works only on this computer. For a shareable demo on Vercel, import the `Fiker-dev/Maltalifebot` repository as a new project. The `vercel.json` file serves the site from `public/`, while `api/chat.js` and `api/greeting.js` run as server functions. In Vercel's project settings, add `ANTHROPIC_API_KEY` and `ANTHROPIC_WORKSPACE_ID` as server environment variables for Production (and Preview if needed), then redeploy. Never commit `.env`. The app limits requests per function instance, but a public demo can still incur AI usage costs; keep the link limited to intended reviewers.

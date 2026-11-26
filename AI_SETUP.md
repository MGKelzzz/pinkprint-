# PinkPrint AI setup (private backend)

The Android app now has a real AI chat interface. To protect your API key, it calls a small authenticated backend; the key is never placed in the APK. Until you deploy and configure this backend, the app correctly shows **AI connection not set up yet** rather than pretending to be connected.

## Deploy with Cloudflare Workers

1. Create a Cloudflare account and install Wrangler on a computer.
2. From the repository root, create a Worker project (or use the Cloudflare dashboard) and deploy `server/worker.js` as the Worker entry file.
3. Set Worker secrets (never commit them):
   - `OPENAI_API_KEY`: your OpenAI API key
   - `PINKPRINT_ACCESS_TOKEN`: a long, random access token you generate for this private app
4. Optional Worker variable: `OPENAI_MODEL` (defaults to `gpt-4.1-mini`).
5. Deploy and copy the HTTPS Worker URL.

Example Wrangler commands from a Worker project:
```sh
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put PINKPRINT_ACCESS_TOKEN
npx wrangler deploy
```

Configure the app
-----------------

In PinkPrint, open **Coach → gear** and paste:
- Your deployed HTTPS Worker URL
- The same `PINKPRINT_ACCESS_TOKEN`

The app stores the endpoint locally and stores the access token using Android SecureStore. The Worker checks the token before forwarding messages to OpenAI. The backend does not save chat messages; requests are forwarded to the AI provider. Chat history is saved on the phone.

## Important privacy and cost notes

- Do not paste your OpenAI API key into PinkPrint or commit it to GitHub.
- The access token is a private-app gate, not a full user-account system. Keep it private and rotate it if exposed.
- The Worker URL is public; consider Cloudflare rate limiting / usage limits to prevent unexpected costs.
- Messages you send are transmitted to your Worker and OpenAI to generate a reply. Do not send information you do not want processed by those services.
- AI can be wrong. PinkPrint AI is a thinking and creativity companion, not a therapist or professional adviser.

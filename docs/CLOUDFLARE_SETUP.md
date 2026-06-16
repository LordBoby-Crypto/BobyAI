# Cloudflare Worker Setup for BobyAI Pass 3

## 1. Install tools

You need Node.js installed on your computer.

Then from the `worker` folder:

```bash
npm install
```

## 2. Log in to Cloudflare

```bash
npx wrangler login
```

## 3. Set private access code

Choose a private code only you know:

```bash
npx wrangler secret put BOBYAI_ACCESS_CODE
```

## 4. Set OpenAI API key

```bash
npx wrangler secret put OPENAI_API_KEY
```

Paste your OpenAI API key when asked.

## 5. Deploy

```bash
npx wrangler deploy
```

Cloudflare will give you a URL like:

```text
https://bobyai-api.YOURNAME.workers.dev
```

## 6. Connect iPhone app

Open BobyAI on GitHub Pages.

Go to Settings and enter:

- Backend endpoint: your Worker URL
- Private access code: the same code you set in Cloudflare

Tap **Test Backend**.

## Important

Do not put the OpenAI API key in GitHub Pages frontend files.

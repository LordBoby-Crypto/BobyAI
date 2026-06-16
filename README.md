# BobyAI

BobyAI is a private AI builder platform designed to generate applications, websites, scripts, games, GitHub Pages projects, and downloadable ZIP projects.

## Pass 2 status

This repo currently contains the BobyAI frontend shell.

Files:

- `index.html`
- `app.css`
- `app.js`
- `manifest.json`
- `docs/ROADMAP.md`
- `docs/SECURITY.md`
- `docs/PASSES.md`

This version is ready to host on GitHub Pages, but it does not connect to OpenAI yet. The secure backend comes in Pass 3.

## Hosting on GitHub Pages

1. Create a GitHub repo named `BobyAI`.
2. Upload these files to the root of the repo.
3. Go to **Settings > Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/ root`.
6. Open:

```text
https://lordboby-crypto.github.io/BobyAI/
```

## Security note

Do not put OpenAI API keys, GitHub tokens, or private secrets into `index.html`, `app.css`, or `app.js`.

Secrets will be stored in the backend later.

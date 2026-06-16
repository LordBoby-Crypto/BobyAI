# BobyAI Security Notes

## Rules

Never commit secrets to GitHub.

Do not put these in frontend files:

- OpenAI API key
- GitHub personal access token
- Cloudflare API token
- Private access code that matters long-term

## Correct secret location

Secrets belong in the backend host.

For the planned Cloudflare Worker:

- `OPENAI_API_KEY`
- `BOBYAI_ACCESS_CODE`
- `GITHUB_TOKEN` later

## MVP privacy

BobyAI is private-use only. The first backend security layer will be an access code checked by the Worker.

This is not full account authentication, but it prevents casual public use of the backend endpoint.

## Later security upgrades

- Real login
- Rate limits
- Request logs
- Project permissions
- Separate user/session tokens
- GitHub OAuth or fine-grained token flow

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-BobyAI-Code",
    "Access-Control-Max-Age": "86400"
  };
}

function json(data, status = 200, env = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders(env) }
  });
}

function requireAccess(request, env) {
  const expected = env.BOBYAI_ACCESS_CODE;
  if (!expected) return { ok: false, status: 500, error: "BOBYAI_ACCESS_CODE secret is not set." };
  const received = request.headers.get("X-BobyAI-Code") || "";
  if (received !== expected) return { ok: false, status: 401, error: "Invalid BobyAI access code." };
  return { ok: true };
}

function buildSystemPrompt() {
  return `You are BobyAI, a private AI builder for Zachariah.

Goal:
Generate useful project output for apps, websites, scripts, games, GitHub Pages projects, and ZIP-ready project structures.

Rules:
- Return practical, complete, working code when asked for code.
- Clearly label every file path.
- Do not include real API keys or secrets.
- Prefer GitHub Pages-compatible output for frontend projects.
- For now, return structured text. Later passes will split this into files automatically.`;
}

function buildUserPrompt(body) {
  return `Project name: ${body.projectName || "UntitledProject"}
Mode: ${body.mode}
Output type: ${body.outputType}
Requested files: ${(body.requestedFiles || []).join(", ")}
Options: ${JSON.stringify(body.options || {})}

User request:
${body.userRequest}

Return:
1. A short project summary.
2. A file tree.
3. Complete code/content for each file.
4. Setup instructions.
5. Any warnings or next-step upgrades.`;
}

async function callOpenAI(body, env) {
  if (!env.OPENAI_API_KEY) {
    return {
      provider: "mock",
      message: "OPENAI_API_KEY is not set yet. Backend access works, but OpenAI is not connected.",
      receivedRequest: body
    };
  }

  const model = env.OPENAI_MODEL || "gpt-5-mini";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: buildSystemPrompt(),
      input: buildUserPrompt(body),
      text: { verbosity: "medium" }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      provider: "openai",
      error: "OpenAI request failed.",
      status: response.status,
      details: data
    };
  }

  return {
    provider: "openai",
    model,
    outputText: data.output_text || "",
    raw: data
  };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(env) });

    const url = new URL(request.url);

    try {
      if (url.pathname === "/health" && request.method === "GET") {
        return json({
          ok: true,
          app: "BobyAI Worker",
          pass: 3,
          message: "Worker is online.",
          openaiConfigured: Boolean(env.OPENAI_API_KEY),
          accessCodeConfigured: Boolean(env.BOBYAI_ACCESS_CODE)
        }, 200, env);
      }

      if (url.pathname === "/generate" && request.method === "POST") {
        const auth = requireAccess(request, env);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status, env);

        const body = await request.json();

        if (!body.userRequest || typeof body.userRequest !== "string") {
          return json({ ok: false, error: "Missing userRequest." }, 400, env);
        }

        const result = await callOpenAI(body, env);

        if (result.error) return json({ ok: false, ...result }, 502, env);

        return json({
          ok: true,
          app: "BobyAI",
          pass: 3,
          result
        }, 200, env);
      }

      return json({ ok: false, error: "Not found." }, 404, env);
    } catch (error) {
      return json({ ok: false, error: error.message || "Worker error." }, 500, env);
    }
  }
};

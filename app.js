const STORAGE_KEY = "bobyai-pass3-settings-v1";

const MODES = {
  website: { title: "Single-Page Website Builder", desc: "Describe the website you want BobyAI to create.", pill: "Website Mode", outputType: "single_page_website", files: ["index.html"] },
  app: { title: "Multi-File Web App Builder", desc: "Describe the app, screens, features, and data it should save.", pill: "App Mode", outputType: "multi_file_web_app", files: ["index.html", "app.css", "app.js", "README.md"] },
  script: { title: "Script Builder", desc: "Describe the script, language, inputs, outputs, and what it should automate.", pill: "Script Mode", outputType: "script_project", files: ["script", "README.md"] },
  pages: { title: "GitHub Pages Project Builder", desc: "Describe a project that should be ready to upload to GitHub Pages.", pill: "GitHub Pages Mode", outputType: "github_pages_project", files: ["index.html", "app.css", "app.js", "manifest.json", "README.md"] },
  zip: { title: "Downloadable ZIP Project Builder", desc: "Describe a full project BobyAI should generate as a ZIP download.", pill: "ZIP Project Mode", outputType: "zip_project", files: ["project files", "README.md"] }
};

let currentMode = "website";
const $ = id => document.getElementById(id);

function loadSettings() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function saveSettings(settings) { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
function endpoint(path) { return (loadSettings().apiEndpoint || "").replace(/\/$/, "") + path; }

function applySettings() {
  const s = loadSettings();
  $("apiEndpoint").value = s.apiEndpoint || "";
  $("accessCode").value = s.accessCode || "";
  setBackendStatus(s.apiEndpoint ? "waiting" : "bad", s.apiEndpoint ? "Backend endpoint saved" : "Backend not connected", s.apiEndpoint ? "Tap Test Backend" : "Add Worker URL in settings");
}

function setBackendStatus(type, title, sub) {
  const dot = $("backendDot");
  dot.className = "status-dot " + type;
  $("backendStatus").textContent = title;
  $("backendSub").textContent = sub;
}

function setMode(mode) {
  currentMode = mode;
  const info = MODES[mode];
  document.querySelectorAll(".mode-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));
  $("modeTitle").textContent = info.title;
  $("modeDesc").textContent = info.desc;
  $("modePill").textContent = info.pill;
}

function buildRequest() {
  const info = MODES[currentMode];
  const projectName = $("projectName").value.trim() || "UntitledProject";
  const prompt = $("promptInput").value.trim();
  if (!prompt) {
    alert("Describe what you want BobyAI to build first.");
    return null;
  }
  return {
    mode: currentMode,
    outputType: info.outputType,
    projectName,
    requestedFiles: info.files,
    options: {
      includeReadme: $("includeReadme").checked,
      mobileFirst: $("mobileFirst").checked,
      premiumDarkUi: $("darkMode").checked
    },
    userRequest: prompt
  };
}

function previewRequest() {
  const req = buildRequest();
  if (req) $("outputBox").textContent = JSON.stringify(req, null, 2);
}

async function testBackend() {
  const s = loadSettings();
  if (!s.apiEndpoint) return alert("Add your Cloudflare Worker URL in Settings first.");
  $("outputBox").textContent = "Testing backend...";
  try {
    const res = await fetch(endpoint("/health"));
    const data = await res.json();
    $("outputBox").textContent = JSON.stringify(data, null, 2);
    setBackendStatus(res.ok ? "ready" : "bad", res.ok ? "Backend online" : "Backend error", data.message || data.error || "Health check complete");
  } catch (e) {
    setBackendStatus("bad", "Backend unreachable", "Check Worker URL");
    $("outputBox").textContent = "Backend test failed:\n" + e.message;
  }
}

async function generate() {
  const s = loadSettings();
  const req = buildRequest();
  if (!req) return;
  if (!s.apiEndpoint) return alert("Add your Cloudflare Worker URL in Settings first.");
  if (!s.accessCode) return alert("Add your private access code in Settings first.");

  $("outputBox").textContent = "BobyAI backend is generating...";
  try {
    const res = await fetch(endpoint("/generate"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BobyAI-Code": s.accessCode
      },
      body: JSON.stringify(req)
    });
    const data = await res.json();
    $("outputBox").textContent = JSON.stringify(data, null, 2);
    setBackendStatus(res.ok ? "ready" : "bad", res.ok ? "Generation complete" : "Generation failed", data.error || "Response received");
  } catch (e) {
    setBackendStatus("bad", "Request failed", "Check Worker and CORS");
    $("outputBox").textContent = "Generate request failed:\n" + e.message;
  }
}

async function copyOutput() {
  const text = $("outputBox").textContent;
  try { await navigator.clipboard.writeText(text); alert("Copied."); }
  catch { prompt("Copy this:", text); }
}

function downloadOutput() {
  const text = $("outputBox").textContent;
  const name = ($("projectName").value.trim() || "bobyai-output").replace(/[^a-z0-9-_]/gi, "_");
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name + "_output.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

document.querySelectorAll(".mode-tab").forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
$("generateBtn").addEventListener("click", generate);
$("previewBtn").addEventListener("click", previewRequest);
$("testBackendBtn").addEventListener("click", testBackend);
$("downloadOutputBtn").addEventListener("click", downloadOutput);
$("copyBtn").addEventListener("click", copyOutput);
$("clearBtn").addEventListener("click", () => {
  $("projectName").value = ""; $("promptInput").value = ""; $("outputBox").textContent = "Cleared.";
});
$("settingsBtn").addEventListener("click", () => $("settingsDialog").showModal());
$("closeSettingsBtn").addEventListener("click", () => $("settingsDialog").close());
$("saveSettingsBtn").addEventListener("click", () => {
  saveSettings({ apiEndpoint: $("apiEndpoint").value.trim(), accessCode: $("accessCode").value });
  applySettings(); $("settingsDialog").close();
});
$("resetSettingsBtn").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY); applySettings(); });

applySettings();
setMode("website");

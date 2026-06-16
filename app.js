const STORAGE_KEY = "bobyai-pass2-settings-v1";

const MODES = {
  website: {
    title: "Single-Page Website Builder",
    desc: "Describe the website you want BobyAI to create.",
    pill: "Website Mode",
    outputType: "single_page_website",
    files: ["index.html"]
  },
  app: {
    title: "Multi-File Web App Builder",
    desc: "Describe the app, screens, features, and data it should save.",
    pill: "App Mode",
    outputType: "multi_file_web_app",
    files: ["index.html", "app.css", "app.js", "README.md"]
  },
  script: {
    title: "Script Builder",
    desc: "Describe the script, language, inputs, outputs, and what it should automate.",
    pill: "Script Mode",
    outputType: "script_project",
    files: ["script", "README.md"]
  },
  pages: {
    title: "GitHub Pages Project Builder",
    desc: "Describe a project that should be ready to upload to GitHub Pages.",
    pill: "GitHub Pages Mode",
    outputType: "github_pages_project",
    files: ["index.html", "app.css", "app.js", "manifest.json", "README.md"]
  },
  zip: {
    title: "Downloadable ZIP Project Builder",
    desc: "Describe a full project BobyAI should generate as a ZIP download.",
    pill: "ZIP Project Mode",
    outputType: "zip_project",
    files: ["project files", "README.md"]
  }
};

let currentMode = "website";
const $ = id => document.getElementById(id);

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function applySettings() {
  const settings = loadSettings();
  $("apiEndpoint").value = settings.apiEndpoint || "";
  $("accessCode").value = settings.accessCode || "";
  $("backendStatus").textContent = settings.apiEndpoint ? "Backend endpoint saved" : "Backend not connected";
}

function setMode(mode) {
  currentMode = mode;
  const info = MODES[mode];

  document.querySelectorAll(".mode-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });

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
    app: "BobyAI",
    pass: 2,
    mode: currentMode,
    outputType: info.outputType,
    projectName,
    requestedFiles: info.files,
    options: {
      includeReadme: $("includeReadme").checked,
      mobileFirst: $("mobileFirst").checked,
      premiumDarkUi: $("darkMode").checked
    },
    userRequest: prompt,
    instructions: [
      "Generate clean, complete, working project files.",
      "Prefer mobile-first design.",
      "Avoid placeholders unless the user explicitly asks for a template.",
      "Include where each file goes.",
      "Make generated code easy to host on GitHub Pages when relevant.",
      "Do not include secrets or API keys in frontend code."
    ],
    backendStatus: "Pass 3 will connect this request to the secure Cloudflare Worker backend."
  };
}

function generatePrompt() {
  const request = buildRequest();
  if (!request) return;
  $("outputBox").textContent = JSON.stringify(request, null, 2);
}

async function copyOutput() {
  const text = $("outputBox").textContent;
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied.");
  } catch {
    prompt("Copy this:", text);
  }
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadPrompt() {
  const text = $("outputBox").textContent;
  const name = ($("projectName").value.trim() || "bobyai-project").replace(/[^a-z0-9-_]/gi, "_");
  downloadTextFile(`${name}_build_request.json`, text);
}

function zipPlaceholder() {
  alert("ZIP generation comes in a later pass. Pass 2 only creates the BobyAI frontend shell.");
}

document.querySelectorAll(".mode-tab").forEach(tab => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

$("generateBtn").addEventListener("click", generatePrompt);
$("clearBtn").addEventListener("click", () => {
  $("projectName").value = "";
  $("promptInput").value = "";
  $("outputBox").textContent = "Choose a mode, describe a project, then tap Generate Project Prompt.";
});

$("copyBtn").addEventListener("click", copyOutput);
$("downloadPromptBtn").addEventListener("click", downloadPrompt);
$("fakeZipBtn").addEventListener("click", zipPlaceholder);

$("settingsBtn").addEventListener("click", () => $("settingsDialog").showModal());
$("closeSettingsBtn").addEventListener("click", () => $("settingsDialog").close());

$("saveSettingsBtn").addEventListener("click", () => {
  saveSettings({
    apiEndpoint: $("apiEndpoint").value.trim(),
    accessCode: $("accessCode").value
  });
  applySettings();
  $("settingsDialog").close();
});

$("resetSettingsBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  applySettings();
});

applySettings();
setMode("website");

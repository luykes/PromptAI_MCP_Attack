# PromptAI — MCP Attack & Defense Demo

A live, side-by-side demonstration of how an LLM agent can attack an MCP (Model Context Protocol) server — and how Prompt Security stops it in real time.

The left pane runs a **vulnerable** MCP server with zero guardrails. The right pane runs an identical server with **Prompt Security** enforcement. Watch the same 6 attacks succeed on the left while being blocked on the right.

---

## What This Demo Shows

| | Vulnerable Pane (left) | Protected Pane (right) |
|---|---|---|
| MCP Port | `:8787` | `:8788` |
| Prompt Security | ❌ Disabled | ✅ Enabled |
| Tool calls | Execute directly | Pre + post-scanned |
| Result | Attacker gets secrets | Blocked or sanitized |

The Python agent uses **Ollama (llama3.2)** to generate authentic attacker commentary, but tool execution is **fully scripted** — Ollama never decides what to call. This ensures consistent, reproducible demos.

---

## Attack Scenarios

| # | Scenario | Tools Used | What the Attack Does |
|---|----------|-----------|----------------------|
| 1 | Secret Exfiltration | `read_file` | Reads `.env` to steal API keys, DB passwords, AWS credentials |
| 2 | Internal System Probe | `read_file`, `search_docs` | Maps VPN config, SSH hosts, internal URLs |
| 3 | PII Data Export | `db_export` | Dumps customer CSV with SSNs, credit cards, emails |
| 4 | Unauthorized HTTP Fetch | `http_fetch` | Reaches external attacker-controlled URLs to exfiltrate data |
| 5 | Email Exfiltration | `read_file`, `db_export`, `send_email` | Collects credentials + PII and emails them to attacker |
| 6 | Shell Command Injection | `run_shell` | Runs `env`, `whoami`, `ls /etc` on the server |

---

## Architecture

```
Browser :5173 (React + Vite)
    │
    └── Express Backend :3001
            │
            ├── Spawn: Python Agent (mcp_agent.py)
            │       └── Ollama :11434  (llama3.2 — attacker commentary)
            │
            ├── MCP Raw Server :8787   SECURITY_ENABLED=false  ← vulnerable
            └── MCP Safe Server :8788  SECURITY_ENABLED=true   ← Prompt Security enforced
                    └── Prompt Security API (cloud — requires API key)
```

Real-time telemetry streams from backend → browser over **Server-Sent Events (SSE)**.

---

## Prerequisites

### All Platforms

| Tool | Min Version | Notes |
|------|------------|-------|
| Node.js | 18+ | JavaScript runtime for backend + MCP servers |
| npm | 9+ | Comes with Node.js |
| Python | 3.10+ | For the attack agent |
| Ollama | Latest | Local LLM runtime |
| llama3.2 model | — | ~2 GB download via `ollama pull llama3.2` |
| Prompt Security API key | Required for right-pane blocking — enter in the UI |

---

## Installation — macOS

### Step 1 — Install Node.js

**Option A: Official installer (easiest)**
1. Go to https://nodejs.org
2. Download the **LTS** version (18.x or higher)
3. Run the `.pkg` installer
4. Verify: open Terminal and run:
   ```bash
   node --version   # should print v18.x.x or higher
   npm --version    # should print 9.x.x or higher
   ```

**Option B: Homebrew**
```bash
# Install Homebrew first if you don't have it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install node
node --version
```

---

### Step 2 — Install Python 3.10+

macOS ships with Python 3 but it may be an older version. Check first:
```bash
python3 --version
```

If the version is below 3.10, install a newer one:

**Option A: Official installer**
1. Go to https://python.org/downloads
2. Download the latest **3.12.x macOS installer**
3. Run the `.pkg` file
4. Verify:
   ```bash
   python3 --version   # should print Python 3.10 or higher
   ```

**Option B: Homebrew**
```bash
brew install python@3.12
python3 --version
```

---

### Step 3 — Install Ollama

1. Go to https://ollama.com
2. Click **Download for Mac**
3. Open the downloaded `.zip`, drag **Ollama** to Applications
4. Launch Ollama from Applications — it will appear in the menu bar
5. Verify it's running:
   ```bash
   curl http://localhost:11434/api/tags
   ```
   You should see a JSON response (even if no models yet).

---

### Step 4 — Pull the llama3.2 model

```bash
ollama pull llama3.2
```

This downloads ~2 GB. Wait for it to complete. Verify:
```bash
ollama list
# Should show: llama3.2   ...
```

---

### Step 5 — Clone the repository

```bash
git clone https://github.com/luykes/PromptAI_MCP_Attack.git
cd PromptAI_MCP_Attack
```

---

### Step 6 — Install Node.js dependencies

```bash
npm run install:all
```

This installs dependencies for the root, backend, web frontend, and MCP server — all in one command.

---

### Step 7 — Set up the Python virtual environment

```bash
python3 -m venv agent/venv
agent/venv/bin/pip install -r agent/requirements.txt
```

Verify the packages installed correctly:
```bash
agent/venv/bin/python3 -c "import mcp, httpx; print('Python deps OK')"
```

---

### Step 8 — Start the demo

Make sure Ollama is running (it should be in your menu bar), then:

```bash
npm run dev
```

You will see 4 processes start in the terminal:
```
[MCP-RAW]  MCP server on :8787 — security DISABLED
[MCP-SAFE] MCP server on :8788 — security ENABLED
[BACKEND]  API server on :3001
[WEB]      Vite dev server on :5173
```

Open your browser: **http://localhost:5173**

---

## Installation — Windows

### Step 1 — Install Node.js

1. Go to https://nodejs.org
2. Download the **LTS Windows Installer (.msi)**
3. Run the installer — accept all defaults
4. Open **Command Prompt** or **PowerShell** and verify:
   ```cmd
   node --version
   npm --version
   ```

---

### Step 2 — Install Python 3.10+

1. Go to https://python.org/downloads
2. Download the latest **3.12.x Windows installer**
3. **IMPORTANT:** On the first screen, check ✅ **"Add Python to PATH"** before clicking Install
4. Click **Install Now**
5. Verify in Command Prompt:
   ```cmd
   python --version
   ```
   > On Windows the command is `python`, not `python3`

---

### Step 3 — Install Ollama

1. Go to https://ollama.com
2. Click **Download for Windows**
3. Run the installer
4. Ollama starts automatically and appears in the system tray
5. Verify it's running — open Command Prompt:
   ```cmd
   curl http://localhost:11434/api/tags
   ```

---

### Step 4 — Pull the llama3.2 model

```cmd
ollama pull llama3.2
```

Wait for the ~2 GB download to complete.

---

### Step 5 — Clone the repository

```cmd
git clone https://github.com/luykes/PromptAI_MCP_Attack.git
cd PromptAI_MCP_Attack
```

> If you don't have Git: download from https://git-scm.com/download/win

---

### Step 6 — Install Node.js dependencies

```cmd
npm run install:all
```

---

### Step 7 — Set up the Python virtual environment

```cmd
python -m venv agent\venv
agent\venv\Scripts\pip install -r agent\requirements.txt
```

Verify:
```cmd
agent\venv\Scripts\python -c "import mcp, httpx; print('Python deps OK')"
```

---

### Step 8 — Start the demo

```cmd
npm run dev
```

Open your browser: **http://localhost:5173**

> **Windows note:** If you see an error about `concurrently` not being found, run `npm install -g concurrently` first.

---

## Running the Demo

1. Open **http://localhost:5173**
2. The dashboard shows two side-by-side telemetry panes — **Vulnerable** (left) and **Protected** (right)
3. Click **⚙ Config** in the top bar → enter your Prompt Security API key → and Username you using in PromptAI → Save
4. Click **Launch All 6 Attacks**
5. Watch both panes in real time:
   - **Left:** Each attack executes — secrets, PII, and shell output are visible
   - **Right:** Each tool call is pre-scanned and blocked before execution, or the output is post-scanned and redacted

Each attack has a clearly labeled heading (`⚡ Secret Exfiltration`, etc.) and numbered turns so you can follow exactly what's happening.

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'httpx'"
The agent needs to use the venv Python, not system Python. This is handled automatically by the backend. If you see this, make sure you ran the venv setup step:
```bash
# macOS/Linux
agent/venv/bin/pip install -r agent/requirements.txt

# Windows
agent\venv\Scripts\pip install -r agent\requirements.txt
```

### "Is the MCP server running on port 8787?"
The MCP servers are started by `npm run dev`. If you see this error, either:
- `npm run dev` isn't running, or
- A port is already in use. Check: `lsof -i :8787` (Mac) or `netstat -ano | findstr 8787` (Windows)

### Ollama commentary is empty / "I can't fulfill this request"
Ollama (llama3.2) has built-in safety filters. If it refuses attacker-framing prompts, the commentary will be blank or a refusal — this is expected and the demo still works. The tool calls and results are what matter visually.

### npm run dev fails on Windows with 'concurrently' error
```cmd
npm install
npm run dev
```
Or install globally: `npm install -g concurrently cross-env`

### Port already in use
Stop any running instances first, then:
```bash
# macOS — kill processes on MCP ports
kill -9 $(lsof -ti:8787) 2>/dev/null
kill -9 $(lsof -ti:8788) 2>/dev/null
kill -9 $(lsof -ti:3001) 2>/dev/null
```

### Python venv not found (Windows path issues)
Make sure you're in the `PromptAI_MCP_Attack` directory and use backslashes:
```cmd
cd PromptAI_MCP_Attack
python -m venv agent\venv
agent\venv\Scripts\pip install -r agent\requirements.txt
```

---

## Project Structure

```
PromptAI_MCP_Attack/
├── package.json          # Root — npm run dev starts everything
├── .env.example          # Template (copy to .env for local overrides)
│
├── mcp-server/           # Node.js MCP server (6 vulnerable tools)
│   ├── server.js         # Express + MCP SDK, Prompt Security enforcement
│   └── assets/           # Mock sensitive data (ALL FAKE — safe to commit)
│       ├── .env          # Fake API keys / credentials
│       ├── customers.csv # Fake PII (names, SSNs, credit cards)
│       └── handbook.md   # Fake internal docs (VPN, SSH, passwords)
│
├── agent/                # Python attacker agent
│   ├── mcp_agent.py      # Scripted tool calls + Ollama commentary
│   ├── requirements.txt  # mcp, httpx, ollama
│   └── venv/             # Python virtual environment (gitignored)
│
├── backend/              # Express API bridge
│   ├── index.js          # Server entry point
│   └── routes/
│       ├── agent.js      # POST /api/agent/run — spawns Python agent
│       ├── telemetry.js  # GET /api/stream/:target — SSE log stream
│       └── config.js     # GET/POST /api/config — Prompt Security key
│
└── web/                  # React + Vite frontend
    └── src/
        ├── App.jsx
        └── components/
            ├── AttackPanel.jsx   # 6 scenario cards + launch button
            ├── TelemetryPane.jsx # SSE log display with color-coded levels
            └── ConfigPanel.jsx   # API key input
```

---

## Security Note

All data in `mcp-server/assets/` is **intentionally fake demo data**:
- `.env` — fictional API keys with `DEMO` placeholders
- `customers.csv` — fictional names/SSNs/cards, no real people
- `handbook.md` — fictional company "ACME Corp"

None of these are real credentials. The `run_shell` tool has a safety filter that blocks destructive commands (`rm`, `shutdown`, etc.) even in vulnerable mode.

Your real Prompt Security API key is stored in `backend/.runtime-config.json`, which is gitignored and never committed.

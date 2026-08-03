<div align="center">
  <img src="https://app.opvis.fun/logo.png" alt="O.P.V.I.S. Logo" width="200" style="border-radius: 16px; filter: drop-shadow(0 0 20px rgba(0, 243, 255, 0.6));" />
  <h1>O.P.V.I.S. Bridge CLI</h1>
  <p><strong>Operation Programmable Virtual Intelligence System — Local Bridge Agent</strong></p>
  <p>
    <a href="https://app.opvis.fun"><img src="https://img.shields.io/badge/OPVIS-Cloud_Matrix-00f3ff?style=for-the-badge&logo=cloudflare&logoColor=black" alt="OPVIS Cloud" /></a>
    <a href="https://npmjs.com/package/@opvis402/bridge"><img src="https://img.shields.io/badge/NPM-@opvis402%2Fbridge-ffb700?style=for-the-badge&logo=npm&logoColor=black" alt="NPM Package" /></a>
    <a href="https://github.com/opvis402/bridge"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>
  </p>
</div>

---

The **OPVIS Bridge CLI** (`@opvis402/bridge`) connects your local workstation (Windows, Linux, macOS) to the **O.P.V.I.S. Cloud Platform**. Features ultra-lightweight memory footprint (~15MB RAM), native desktop GUI popup authorizations, automated cross-platform app installations, problem-solving repair engine, and voice streaming text-to-speech interaction.

## 🚀 Quick Start (One-Click NPX)

Run directly without installation:

```bash
npx @opvis402/bridge connect --api-key YOUR_API_KEY
```

Or install globally:

```bash
npm install -g @opvis402/bridge
```

---

## ⚡ Complete Command Matrix

### 1. Connect Machine to OPVIS Cloud
Binds your local computer terminal to the OPVIS cloud matrix with interactive REPL shortcuts for install, repair, diagnose, and voice streaming:

```bash
npx @opvis402/bridge connect --api-key YOUR_API_KEY --endpoint https://app.opvis.fun --name "My-Workstation"
```

### 2. Auto-Install Applications (`opvis install`)
Installs applications automatically using native host package engines (`winget` on Windows, `brew` on macOS, `apt`/`dnf` on Linux) with dual-resolution exact ID and fuzzy search:

```bash
# Install Git, VS Code, Node.js, WhatsApp, VLC, Chrome, Python
npx @opvis402/bridge install whatsapp
npx @opvis402/bridge install git
npx @opvis402/bridge install vscode

# Auto-approve without interactive prompt:
npx @opvis402/bridge install node -y
```

### 3. Problem-Solving Repair Engine (`opvis repair` / `opvis fix`)
Autonomous troubleshooting engine that diagnoses binary paths, executable permissions, missing environment variables, and executes force package re-installation:

```bash
# Repair specific broken application
npx @opvis402/bridge repair node
npx @opvis402/bridge fix whatsapp

# System-wide repair check on all core developer tools:
npx @opvis402/bridge repair --yes
```

### 4. Voice Streaming & Speech Synthesis (`opvis voice` / `opvis talk`)
Continuous conversational stream session ("Ngobrol Saja") with real-time text-to-speech (TTS) voice summaries via native OS audio engines (Windows `SAPI.SpVoice` COM object, macOS `say`, Linux `espeak`):

```bash
# Continuous conversational voice stream
npx @opvis402/bridge voice

# Disable audio playback (text-only stream):
npx @opvis402/bridge voice --no-voice
```

### 5. System Health & Environment Scan (`opvis diagnose`)
Scans host CPU, memory, package managers, and audits health of developer tools (`node`, `git`, `python`, `powershell`, `vscode`, `docker`, `curl`, `ffmpeg`):

```bash
npx @opvis402/bridge diagnose
```

### 6. Chat with OPVIS AI Brain
Transmit direct queries to Cloudflare AI models from your CLI:

```bash
npx @opvis402/bridge chat "Write a high-performance TypeScript function for data hashing"
```

### 7. Open Applications & Web URLs
Remote spawner for local desktop applications or URLs:

```bash
# Launch Windows Notepad / Chrome / VS Code
npx @opvis402/bridge open notepad
npx @opvis402/bridge open chrome
npx @opvis402/bridge open https://app.opvis.fun
```

### 8. Check Telemetry Status
View active node ping, CPU, memory, and bridge status:

```bash
npx @opvis402/bridge status
```

---

## 🔔 Native Desktop GUI Approval Window

When running `opvis install` or `opvis repair`, OPVIS launches a clickable **Native Desktop GUI Confirmation Dialog Window** over all open applications:

- **[ Yes / Approve ]**: Authorizes immediate package installation / repair execution.
- **[ No / Reject ]**: Gracefully cancels operation.
- **`-y` / `--yes`**: Bypass interactive prompt for automated scripts or remote daemon jobs.

---

## ⚙️ Configuration

Configuration details are saved automatically in `~/.opvis/config.json`:

```json
{
  "api_key": "opvis_live_xxxxxxxx",
  "endpoint": "https://app.opvis.fun",
  "machine_name": "My-Workstation",
  "bridge_id": "bridge_1785675878865_rj0h3y"
}
```

---

## 🗑 Uninstall & Cleanup

To remove the global CLI package and clear local saved configurations:

```bash
# 1. Remove Global NPM Package
npm uninstall -g @opvis402/bridge

# 2. Clear Saved Local Config Cache (Optional)
# Windows PowerShell:
Remove-Item -Recurse -Force ~/.opvis

# Linux / macOS:
rm -rf ~/.opvis
```

---

## 🌐 Endpoints & Infrastructure

- **Web Command Center**: [https://app.opvis.fun](https://app.opvis.fun)
- **Landing Page**: [https://opvis.fun](https://opvis.fun)

---

<div align="center">
  <sub>Powered by O.P.V.I.S. Cloudflare Edge Workers & D1 Vector Engine</sub>
</div>

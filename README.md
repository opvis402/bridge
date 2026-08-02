<div align="center">
  <img src="https://app.opvis.fun/logo.png" alt="O.P.V.I.S. Logo" width="200" style="border-radius: 16px; filter: drop-shadow(0 0 20px rgba(0, 243, 255, 0.6));" />
  <h1>O.P.V.I.S. Bridge CLI</h1>
  <p><strong>Operation Programmable Virtual Intelligence System — Local Bridge Agent</strong></p>
  <p>
    <a href="https://app.opvis.fun"><img src="https://img.shields.io/badge/OPVIS-Cloud_Matrix-00f3ff?style=for-the-badge&logo=cloudflare&logoColor=black" alt="OPVIS Cloud" /></a>
    <a href="https://npmjs.com/package/@opvis402/bridge"><img src="https://img.shields.io/badge/NPM-@opvis402%2Fbridge-ffb700?style=for-the-badge&logo=npm&logoColor=black" alt="NPM Package" /></a>
    <a href="https://github.com/opvis402/bridge/actions"><img src="https://img.shields.io/github/actions/workflow/status/opvis402/bridge/publish.yml?style=for-the-badge&logo=github&label=CI&color=00ff88" alt="CI Status" /></a>
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>
</div>

---

The **OPVIS Bridge CLI** (`@opvis402/bridge`) connects your local workstation (Windows, Linux, macOS) to the **O.P.V.I.S. Cloud Platform**, enabling remote shell command execution, live terminal telemetry, AI brain chat streams, and global edge node synchronization.

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

## ⚡ Command Matrix

### 1. Connect Machine to OPVIS Cloud
Binds your local computer terminal to the OPVIS cloud matrix:

```bash
npx @opvis402/bridge connect --api-key YOUR_API_KEY --endpoint https://app.opvis.fun --name "My-Workstation"
```

### 2. Chat with OPVIS AI Brain
Transmit direct queries to Cloudflare AI models from your CLI:

```bash
npx @opvis402/bridge chat "Write a high-performance TypeScript function for data hashing"
```

With custom model selection:

```bash
npx @opvis402/bridge chat "Explain Kubernetes Pod architecture" --model @cf/deepseek-ai/deepseek-r1-distill-qwen-32b
```

### 3. Open Applications & Websites
Remote launcher for local utilities or URLs:

```bash
# Launch Windows Notepad / Linux gedit
npx @opvis402/bridge open notepad

# Launch Google Chrome
npx @opvis402/bridge open chrome

# Open web URL
npx @opvis402/bridge open https://app.opvis.fun
```

### 4. Check Telemetry Status
View active node ping, CPU, memory, and bridge status:

```bash
npx @opvis402/bridge status
```

### 5. Execute Styled Commands
Run local shell scripts with cyberpunk formatting:

```bash
npx @opvis402/bridge exec "npm run build"
```

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
- **Official Logo**: [https://app.opvis.fun/logo.png](https://app.opvis.fun/logo.png)

---

<div align="center">
  <sub>Powered by O.P.V.I.S. Cloudflare Edge Workers & D1 Vector Engine</sub>
</div>

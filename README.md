# DevSetup

DevSetup is a local, Electron-based manager for developer environments on Windows and macOS. Its first implementation provides real system discovery, reviewed package-manager installation plans, verified live execution, and a desktop dashboard.

## Run locally

```powershell
npm install
npm run dev
```

`npm run build` validates types, builds the renderer and compiles Electron. `npm run dist` creates platform installers through electron-builder.

## Current capabilities

- Secure Electron process separation: isolated renderer, no Node integration, narrow typed IPC, Zod validation, and no shell command execution.
- Real discovery of Node.js, PHP, Composer, Git, VS Code, GitHub Desktop, MySQL, and selected optional tools. It checks PATH and known OS locations.
- Controlled WinGet and Homebrew plans using catalogued package IDs. Dry Run is the default from the UI; live execution requires an explicit second action and verifies the installed package ID with its provider.
- A responsive dark desktop UI with dashboard, scanner, software library, and an installation queue that reports per-tool preparation, installation, verification, and failures in real time.

This baseline intentionally does not claim live service control, version-channel metadata, profile activation, or persistent SQLite history yet. See [ROADMAP](docs/ROADMAP.md).

## Documentation

The Spanish user guide is available in the application under **Documentación** and in [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md). Platform details are in [docs/MACOS.md](docs/MACOS.md) and [docs/WINDOWS.md](docs/WINDOWS.md).

## Safety

DevSetup never receives arbitrary commands or download URLs from the renderer. Installation plans are constructed only from the internal catalog. It does not bypass operating-system elevation prompts.

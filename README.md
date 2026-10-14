# DevSetup

DevSetup is a local, Electron-based manager for developer environments on Windows and macOS. Its first implementation provides real system discovery, a reviewed package-manager installation plan, dry-run execution, and a desktop dashboard.

## Run locally

```powershell
npm install
npm run dev
```

`npm run build` validates types, builds the renderer and compiles Electron. `npm run dist` creates platform installers through electron-builder.

## Current capabilities

- Secure Electron process separation: isolated renderer, no Node integration, narrow typed IPC, Zod validation, and no shell command execution.
- Real discovery of Node.js, PHP, Composer, Git, VS Code, GitHub Desktop, MySQL, and selected optional tools. It checks PATH and known OS locations.
- Controlled WinGet and Homebrew plans using catalogued package IDs. Dry Run is the default from the UI; live execution requires an explicit second action.
- A responsive dark desktop UI with dashboard, scanner, software library, and installation queue.

This baseline intentionally does not claim live service control, version-channel metadata, profile activation, or persistent SQLite history yet. See [ROADMAP](docs/ROADMAP.md).

## Documentation

The Spanish user guide is available in the application under **Documentación** and in [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md).

## Safety

DevSetup never receives arbitrary commands or download URLs from the renderer. Installation plans are constructed only from the internal catalog. It does not bypass operating-system elevation prompts.

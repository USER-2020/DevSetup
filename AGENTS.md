# DevSetup agent guide

- Keep the Electron main process, preload bridge, renderer, domain services, and OS adapters separate.
- `contextIsolation` must remain enabled and `nodeIntegration` disabled. Add IPC endpoints only after Zod validation and expose the smallest possible preload API.
- System commands must use `spawn`/`execFile` with `shell: false`, explicit allowlisted binaries, and arguments derived only from the trusted catalog.
- Do not perform software installation, update, service control, or destructive repair during tests. Prefer Dry Run.
- A provider may advertise only operations it actually implements for the current platform.
- Run `npm run typecheck`, `npm test`, and `npm run build` before handoff when dependencies are available.
- Releases need native CI validation for Windows x64, macOS x64, and macOS arm64. Signing credentials belong only in repository secrets.

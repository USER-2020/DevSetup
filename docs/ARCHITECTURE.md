# Architecture

The renderer is React/Vite and has no operating-system access. It calls a minimal preload API through `contextBridge`. Electron IPC validates inputs with Zod and delegates to domain services. `scanner.ts` and `planner.ts` are main-process services; `catalog.ts` is the controlled provider registry. This lets new Windows/macOS adapters be added without exposing commands to UI components.

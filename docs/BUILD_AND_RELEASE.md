# Build and release

Use `npm run dist` only after successful validation. The included workflows create Windows NSIS and macOS DMG artifacts. Configure signing and notarization with GitHub Actions secrets before public distribution; unsigned artifacts are development builds only.

## Release checklist

1. Run `npm run typecheck`, `npm test`, and `npm run build` from a clean install.
2. Review the Installation Queue on each target platform: a Dry Run must display **SIMULATED**; a completed LIVE job must display **VERIFIED** only after its provider check succeeds.
3. Validate release artifacts natively on Windows x64, macOS x64, and macOS arm64. Do not publish a tag until all three jobs pass.
4. Build the Windows NSIS installer and both macOS DMGs, then smoke-test launch, a system scan, a Dry Run, and the provider-unavailable path.
5. Sign the Windows installer and sign/notarize both macOS artifacts with credentials stored only in repository secrets.

The current release workflow packages Windows x64 and macOS arm64. Add a native macOS x64 job before the first public release so the required three-platform gate is enforced in CI.

# Build and release

Use `npm run dist` after successful validation. The included workflows create Windows NSIS and macOS DMG artifacts. Configure signing and notarization with GitHub Actions secrets before public distribution; unsigned artifacts are development builds only.

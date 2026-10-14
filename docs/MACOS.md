# macOS support

macOS detection uses `which` and standard Intel/Apple Silicon locations. When Homebrew is present, plans use formulas from the controlled catalog. Immediately before any plan runs, DevSetup verifies that `brew --version` succeeds; if it does not, the plan stops before invoking an installation command. Provisioning Homebrew itself needs its own user-reviewed flow and is not yet implemented.

For a live plan, each catalogued formula is installed one at a time. The Installation Queue reports preparation, installation, and verification for that formula. After a successful install command, DevSetup runs `brew list --versions <catalogued-package-id>`. A job is marked **VERIFIED** only if Homebrew returns successfully and reports that exact ID. A **CHECK REQUIRED** status means the install command ended but the package could not be confirmed; it must not be treated as an installed tool.

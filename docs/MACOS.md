# macOS support

macOS detection uses `which` and standard Intel/Apple Silicon locations. When Homebrew is present, plans use formulas from the controlled catalog. To support apps launched from Finder, DevSetup checks `/opt/homebrew/bin/brew` (Apple Silicon), `/usr/local/bin/brew` (Intel), and then `brew` on `PATH`. Immediately before any plan runs, it verifies that the resolved provider responds to `--version`; if it does not, the plan stops before invoking an installation command. Provisioning Homebrew itself needs its own user-reviewed flow and is not yet implemented.

For a live plan, each catalogued Homebrew item is installed one at a time. The Installation Queue reports preparation, installation, and verification for that item. Formulae are verified with `brew list --versions <catalogued-package-id>` and macOS apps installed as casks are verified with `brew list --cask <catalogued-package-id>`. A job is marked **VERIFIED** only if the appropriate Homebrew query succeeds. A **CHECK REQUIRED** status means the install command ended but the package could not be confirmed; it must not be treated as an installed tool.

## Cambiar versión de PHP

Version Manager can prepare reviewed plans for PHP 8.1, 8.2, 8.3, 8.4, and 8.5. For an alternate version, its Dry Run contains `brew install php@<version>` followed by `brew link --overwrite --force php@<version>`; PHP 8.5 uses the current `php` formula. The second action changes the default `php` command for the user, so it is only performed in a LIVE plan after explicit confirmation. DevSetup then checks that the linked Homebrew `php` reports the selected version; otherwise it reports **CHECK REQUIRED**.

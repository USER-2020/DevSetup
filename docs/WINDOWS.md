# Windows support

Windows detection uses `where.exe` plus known install locations. Installation plans target exact WinGet IDs and use WinGet's documented agreement flags. Immediately before a plan runs, DevSetup verifies that `winget --version` succeeds; if it does not, the plan stops before invoking an installer. The application cannot guarantee all third-party installers are fully unattended; elevation and legal prompts remain visible when required.

For a live plan, each catalogued package is installed one at a time and the Installation Queue shows its preparation, installation, and verification stages. After a successful command, DevSetup runs `winget list --id <catalogued-package-id> --exact`. A job is **VERIFIED** only when WinGet succeeds and reports that exact ID. If that confirmation is absent, the job is marked **CHECK REQUIRED**, not installed.

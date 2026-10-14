# Installation engine

The planner maps selected tool IDs to audited WinGet or Homebrew package IDs. It produces a reviewable plan and labels operations that can need elevation. The executor runs one plan item at a time with `shell: false`, captures bounded output, and persists in-memory job state for the current session.

A Dry Run is always labeled as a simulation and never reported as an installation. The explicit follow-up action creates a LIVE plan. Before it starts, the executor verifies the provider with `brew --version` or `winget --version`. It emits narrowly scoped progress updates for each job: `preparing`, `installing`, `verifying`, and a final status. The preload bridge exposes those updates only as installation-job data; the renderer cannot submit a command through this channel.

After a live command succeeds, the executor verifies the catalogued ID with `brew list --versions <package-id>` on macOS or `winget list --id <package-id> --exact` on Windows. A job is reported as installed and verified only when the provider succeeds and its output includes that exact ID; otherwise it requires manual review. A future persistence adapter must recover interrupted work as `interrupted`, never replay destructive work automatically.

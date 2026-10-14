# Installation engine

The planner maps selected tool IDs to audited WinGet or Homebrew package IDs. It produces a reviewable plan and labels operations that can need elevation. The executor runs one plan item at a time with `shell: false`, captures bounded output, and persists in-memory job state for the current session. A future persistence adapter must recover interrupted work as `interrupted`, never replay destructive work automatically.

# Security

The BrowserWindow has context isolation enabled, Node integration disabled, web security enabled, and uses a narrow preload bridge. IPC inputs are schema-validated. Process spawning never uses a shell and receives only catalogued binary names and arguments. The renderer cannot supply an executable path, a download URL, or arbitrary arguments. DevSetup does not store administrator passwords and never suppresses OS permission prompts.

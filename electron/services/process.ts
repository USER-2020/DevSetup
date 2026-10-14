import { spawn } from 'node:child_process';

export interface CommandResult { code: number | null; stdout: string; stderr: string; }
/** Executes a pre-authorised binary with explicit arguments; shell is intentionally disabled. */
export function run(binary: string, args: string[], timeoutMs = 12_000): Promise<CommandResult> {
  return new Promise((resolve) => {
    let stdout = ''; let stderr = ''; let settled = false;
    const finish = (result: CommandResult) => { if (!settled) { settled = true; clearTimeout(timer); resolve(result); } };
    let child;
    let timer: NodeJS.Timeout | undefined;
    try {
      child = spawn(binary, args, { shell: false, windowsHide: true });
    } catch (error) {
      resolve({ code: null, stdout, stderr: error instanceof Error ? error.message : 'Unable to start process' });
      return;
    }
    timer = setTimeout(() => { child.kill(); finish({ code: null, stdout, stderr: `${stderr}\nTimed out` }); }, timeoutMs);
    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
    child.on('error', (error) => finish({ code: null, stdout, stderr: error.message }));
    child.on('close', (code) => finish({ code, stdout, stderr }));
  });
}

import { access, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { shell } from 'electron';
import { recordActivity } from './activity-log';

const exists = async (candidate: string) => access(candidate).then(() => true).catch(() => false);
async function assertDirectory(target: string): Promise<void> { if (!(await stat(target).catch(() => undefined))?.isDirectory()) throw new Error('La carpeta guardada del proyecto ya no existe.'); }
async function assertEnvFile(target: string): Promise<void> { if (path.basename(target) !== '.env' || !(await stat(target).catch(() => undefined))?.isFile()) throw new Error('El archivo .env guardado no está disponible.'); }
async function vscodeExecutable(): Promise<string | undefined> {
  const candidates = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code', 'Code.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft VS Code', 'Code.exe'),
    'C:\\Program Files\\Microsoft VS Code\\Code.exe'
  ].filter((candidate): candidate is string => Boolean(candidate));
  for (const candidate of candidates) if (await exists(candidate)) return candidate;
  return undefined;
}
async function openWithCode(target: string): Promise<void> {
  const executable = await vscodeExecutable();
  if (!executable) throw new Error('No se encontró Visual Studio Code en una ubicación compatible.');
  await new Promise<void>((resolve, reject) => {
    try {
      const child = spawn(executable, [target], { detached: true, shell: false, stdio: 'ignore', windowsHide: true });
      child.once('error', reject); child.once('spawn', () => { child.unref(); resolve(); });
    } catch (error) { reject(error); }
  });
}
export async function openProjectInCode(projectPath: string): Promise<void> {
  await assertDirectory(projectPath); await openWithCode(projectPath);
  await recordActivity({ category: 'environment', status: 'info', title: 'Proyecto abierto en Visual Studio Code', detail: 'Se abrió la carpeta guardada del proyecto.' });
}
export async function openEnvFile(envFilePath: string): Promise<void> {
  await assertEnvFile(envFilePath);
  const code = await vscodeExecutable();
  if (code) { await openWithCode(envFilePath); await recordActivity({ category: 'environment', status: 'info', title: 'Archivo .env abierto', detail: 'Se abrió la referencia local del archivo .env.' }); return; }
  const error = await shell.openPath(envFilePath);
  if (error) throw new Error('No se pudo abrir el archivo .env.');
  await recordActivity({ category: 'environment', status: 'info', title: 'Archivo .env abierto', detail: 'Se abrió la referencia local del archivo .env.' });
}

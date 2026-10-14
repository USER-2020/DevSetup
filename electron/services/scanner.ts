import { access, statfs } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { catalog, type ToolDefinition } from './catalog';
import { resolvePackageProvider, run } from './process';
import type { DetectedInstallation, ScanResult, ToolRecord } from '../../packages/shared/types';

const exists = async (candidate: string) => access(candidate).then(() => true).catch(() => false);
const version = (output: string) => output.split(/\r?\n/).find(Boolean)?.trim().slice(0, 140);

async function detectExecutable(definition: ToolDefinition): Promise<DetectedInstallation[]> {
  const records: DetectedInstallation[] = [];
  if (definition.executable) {
    const command = process.platform === 'win32' ? 'where.exe' : 'which';
    const lookup = await run(command, [definition.executable]);
    const paths = lookup.code === 0 ? lookup.stdout.split(/\r?\n/).filter(Boolean).slice(0, 5) : [];
    for (const found of paths) {
      const result = await run(found, definition.versionArgs ?? ['--version']);
      records.push({ path: found, version: version(result.stdout || result.stderr), source: 'path' });
    }
  }
  const known = process.platform === 'win32' ? definition.windowsPaths : process.platform === 'darwin' ? definition.macPaths : [];
  for (const candidate of known ?? []) {
    if (records.some((record) => record.path.toLowerCase() === candidate.toLowerCase()) || !(await exists(candidate))) continue;
    const result = definition.executable && !candidate.endsWith('.app') ? await run(candidate, definition.versionArgs ?? ['--version']) : { stdout: '', stderr: '' };
    records.push({ path: candidate, version: version(result.stdout || result.stderr), source: 'known-path' });
  }
  return records;
}

export async function scanSystem(): Promise<ScanResult> {
  const provider = process.platform === 'win32' ? 'winget' : process.platform === 'darwin' ? 'brew' : undefined;
  const packageManagers = provider && await resolvePackageProvider(provider) ? [provider] : [];
  const root = process.platform === 'win32' ? path.parse(process.cwd()).root : '/';
  const disk = await statfs(root).catch(() => undefined);
  const tools: ToolRecord[] = await Promise.all(catalog.map(async (definition) => {
    const supported = Boolean(process.platform === 'win32' ? definition.wingetId : process.platform === 'darwin' ? definition.brewFormula : false);
    try {
      const installations = await detectExecutable(definition);
      return {
        id: definition.id, name: definition.name, category: definition.category,
        status: installations.length > 1 ? 'multiple-versions' : installations.length ? 'installed' : supported ? 'missing' : 'unsupported',
        installations, installSupported: supported,
        detail: installations.length ? `${installations.length} instalación${installations.length === 1 ? '' : 'es'} detectada${installations.length === 1 ? '' : 's'}` : supported ? 'No se encontró después de comprobar PATH y ubicaciones conocidas' : 'No hay un proveedor de paquetes compatible en esta plataforma'
      };
    } catch (error) {
      return { id: definition.id, name: definition.name, category: definition.category, status: 'needs-verification', installations: [], installSupported: false, detail: 'No se pudo verificar esta herramienta durante el análisis.' };
    }
  }));
  const platform = process.platform === 'win32' || process.platform === 'darwin' ? process.platform : 'linux';
  return { system: { platform, release: os.release(), architecture: os.arch(), hostname: os.hostname(), user: os.userInfo().username, totalMemoryGb: Math.round(os.totalmem() / 1024 ** 3 * 10) / 10, freeDiskGb: disk ? Math.round((disk.bavail * disk.bsize) / 1024 ** 3 * 10) / 10 : undefined, packageManagers, scannedAt: new Date().toISOString() }, tools };
}

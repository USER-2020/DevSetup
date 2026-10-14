import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';
import type { EnvironmentProfile, ToolId } from '../../packages/shared/types';
import { recordActivity } from './activity-log';
import { getSettings } from './settings';

const vaultPath = () => path.join(app.getPath('userData'), 'environment-vault.json');
async function readVault(): Promise<EnvironmentProfile[]> {
  try {
    const content = await readFile(vaultPath(), 'utf8');
    const parsed: unknown = JSON.parse(content);
    return Array.isArray(parsed) ? parsed as EnvironmentProfile[] : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw new Error('No se pudo leer la bóveda local de entornos.');
  }
}
async function writeVault(profiles: EnvironmentProfile[]): Promise<void> {
  const target = vaultPath(); const temporary = `${target}.tmp`;
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(temporary, JSON.stringify(profiles, null, 2), { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, target);
}
export const listEnvironments = () => readVault();
export async function saveEnvironment(input: Omit<EnvironmentProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnvironmentProfile> {
  const profiles = await readVault(); const now = new Date().toISOString();
  const profile: EnvironmentProfile = { ...input, id: randomUUID(), toolIds: [...new Set(input.toolIds)] as ToolId[], createdAt: now, updatedAt: now };
  profiles.unshift(profile); await writeVault(profiles);
  const settings = await getSettings();
  await recordActivity({ category: 'environment', status: 'success', title: 'Entorno local guardado', detail: settings.includeProjectNamesInActivity ? `Se guardó el perfil ${profile.name}.` : 'Se guardó un perfil local.' });
  return profile;
}
export async function removeEnvironment(id: string): Promise<void> {
  await writeVault((await readVault()).filter((profile) => profile.id !== id));
  await recordActivity({ category: 'environment', status: 'info', title: 'Entorno local eliminado', detail: 'Se eliminó un perfil guardado en este equipo.' });
}

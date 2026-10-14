import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';
import type { ActivityHistory, AppSettings } from '../../packages/shared/types';

export const defaultSettings: AppSettings = { scanOnLaunch: true, notificationDuration: 'normal', activityHistory: 'standard', includeProjectNamesInActivity: true };
const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');

function isSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as AppSettings;
  return typeof settings.scanOnLaunch === 'boolean' && ['short', 'normal', 'long'].includes(settings.notificationDuration) && ['compact', 'standard', 'extended'].includes(settings.activityHistory) && typeof settings.includeProjectNamesInActivity === 'boolean';
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const content = await readFile(settingsPath(), 'utf8');
    const saved: unknown = JSON.parse(content);
    return isSettings(saved) ? { ...defaultSettings, ...saved } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const target = settingsPath();
  const temporary = `${target}.tmp`;
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(temporary, JSON.stringify(settings, null, 2), { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, target);
  return settings;
}

export const activityLimit = (history: ActivityHistory): number => ({ compact: 100, standard: 300, extended: 1000 })[history];

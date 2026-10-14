import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';
import type { ActivityCategory, ActivityRecord, ActivityStatus } from '../../packages/shared/types';
import { activityLimit, getSettings } from './settings';

const logPath = () => path.join(app.getPath('userData'), 'activity-log.json');
let writeQueue: Promise<void> = Promise.resolve();

async function readLog(limit: number): Promise<ActivityRecord[]> {
  try {
    const content = await readFile(logPath(), 'utf8');
    const entries: unknown = JSON.parse(content);
    return Array.isArray(entries) ? entries.filter((entry): entry is ActivityRecord => Boolean(entry) && typeof entry === 'object' && typeof (entry as ActivityRecord).id === 'string' && typeof (entry as ActivityRecord).timestamp === 'string' && typeof (entry as ActivityRecord).title === 'string').slice(0, limit) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    return [];
  }
}

async function writeLog(entries: ActivityRecord[]): Promise<void> {
  const target = logPath();
  const temporary = `${target}.tmp`;
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(temporary, JSON.stringify(entries, null, 2), { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, target);
}

export async function listActivity(): Promise<ActivityRecord[]> { const settings = await getSettings(); return readLog(activityLimit(settings.activityHistory)); }

export function recordActivity(input: { category: ActivityCategory; status: ActivityStatus; title: string; detail: string }): Promise<void> {
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    try {
      const settings = await getSettings();
      const maximumEntries = activityLimit(settings.activityHistory);
      const entries = await readLog(maximumEntries);
      entries.unshift({ id: randomUUID(), timestamp: new Date().toISOString(), ...input });
      await writeLog(entries.slice(0, maximumEntries));
    } catch {
      // An audit-log write must never interrupt the operation being recorded.
    }
  });
  return writeQueue;
}

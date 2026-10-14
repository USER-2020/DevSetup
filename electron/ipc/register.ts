import { dialog, ipcMain } from 'electron';
import path from 'node:path';
import { z } from 'zod';
import { scanSystem } from '../services/scanner';
import { executePlan, listJobs, preparePhpVersionPlan, preparePlan } from '../services/planner';
import { phpVersions, toolIds, type AppSettings, type PhpVersion } from '../../packages/shared/types';
import { listEnvironments, removeEnvironment, saveEnvironment } from '../services/environment-vault';
import { openEnvFile, openProjectInCode } from '../services/project-actions';
import { listActivity, recordActivity } from '../services/activity-log';
import { getSettings, saveSettings } from '../services/settings';

const prepareSchema = z.object({ toolIds: z.array(z.enum(toolIds)).min(1).max(toolIds.length), dryRun: z.boolean() });
const environmentSchema = z.object({ name: z.string().min(1).max(80), projectPath: z.string().min(1).max(500), envFilePath: z.string().max(500).optional(), description: z.string().max(300).optional(), toolIds: z.array(z.enum(toolIds)).max(toolIds.length) });
const settingsSchema = z.object({ scanOnLaunch: z.boolean(), notificationDuration: z.enum(['short', 'normal', 'long']), activityHistory: z.enum(['compact', 'standard', 'extended']), includeProjectNamesInActivity: z.boolean() });
const parseOrThrow = <T>(schema: { parse(value: unknown): T }, data: unknown, message: string): T => {
  try { return schema.parse(data); } catch { throw new Error(message); }
};
export function registerIpc(): void {
  ipcMain.handle('system:scan', async () => {
    try {
      const scan = await scanSystem();
      const detected = scan.tools.filter((tool) => tool.installations.length > 0).length;
      await recordActivity({ category: 'system', status: 'success', title: 'Análisis del sistema completado', detail: `Se detectaron ${detected} herramientas de ${scan.tools.length} revisadas.` });
      return scan;
    } catch (error) {
      await recordActivity({ category: 'system', status: 'error', title: 'Error durante el análisis del sistema', detail: 'No se pudo completar el análisis de las herramientas locales.' });
      throw error;
    }
  });
  ipcMain.handle('installations:prepare', (_event, data: unknown) => { const input = parseOrThrow(prepareSchema, data, 'Selecciona al menos una herramienta para crear el plan de instalación.') as { toolIds: typeof toolIds[number][]; dryRun: boolean }; return preparePlan(input.toolIds, input.dryRun); });
  ipcMain.handle('installations:prepare-php-version', (_event, data: unknown) => { const input = parseOrThrow(z.object({ version: z.enum(phpVersions), dryRun: z.boolean() }), data, 'La versión de PHP seleccionada no es compatible.') as { version: PhpVersion; dryRun: boolean }; return preparePhpVersionPlan(input.version, input.dryRun); });
  ipcMain.handle('installations:execute', (event, planId: unknown) => executePlan(parseOrThrow(z.string().uuid(), planId, 'El plan de instalación no es válido.'), (progress) => event.sender.send('installations:progress', progress)));
  ipcMain.handle('installations:list', () => listJobs());
  ipcMain.handle('activities:list', () => listActivity());
  ipcMain.handle('settings:get', () => getSettings());
  ipcMain.handle('settings:save', (_event, data: unknown) => saveSettings(parseOrThrow(settingsSchema, data, 'La configuración no es válida.') as AppSettings));
  ipcMain.handle('environments:list', () => listEnvironments());
  ipcMain.handle('environments:choose-project-folder', async () => {
    const result = await dialog.showOpenDialog({ title: 'Choose project folder', properties: ['openDirectory', 'createDirectory'] });
    return result.canceled ? null : result.filePaths[0] ?? null;
  });
  ipcMain.handle('environments:choose-env-file', async () => {
    const result = await dialog.showOpenDialog({ title: 'Choose .env file', properties: ['openFile'], filters: [{ name: 'Environment file', extensions: ['env'] }, { name: 'All files', extensions: ['*'] }] });
    if (result.canceled || !result.filePaths[0]) return null;
    if (path.basename(result.filePaths[0]) !== '.env') throw new Error('Selecciona un archivo llamado .env.');
    return result.filePaths[0];
  });
  ipcMain.handle('environments:open-project-in-code', (_event, projectPath: unknown) => openProjectInCode(parseOrThrow(z.string().min(1).max(500), projectPath, 'La ruta del proyecto no es válida.')));
  ipcMain.handle('environments:open-env-file', (_event, envFilePath: unknown) => openEnvFile(parseOrThrow(z.string().min(1).max(500), envFilePath, 'La ruta del archivo .env no es válida.')));
  ipcMain.handle('environments:save', (_event, data: unknown) => saveEnvironment(parseOrThrow(environmentSchema, data, 'Revisa el nombre y las rutas del entorno antes de guardarlo.') as { name: string; projectPath: string; envFilePath?: string; description?: string; toolIds: typeof toolIds[number][] }));
  ipcMain.handle('environments:remove', (_event, id: unknown) => removeEnvironment(parseOrThrow(z.string().uuid(), id, 'El entorno que intentas eliminar no es válido.')));
}

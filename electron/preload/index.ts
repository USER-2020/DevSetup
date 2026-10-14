import { contextBridge, ipcRenderer } from 'electron';
import type { DevSetupApi, ToolId } from '../../packages/shared/types';

const api: DevSetupApi = {
  system: { scan: () => ipcRenderer.invoke('system:scan') },
  installations: {
    prepare: (toolIds: ToolId[], dryRun: boolean) => ipcRenderer.invoke('installations:prepare', { toolIds, dryRun }),
    execute: (planId: string) => ipcRenderer.invoke('installations:execute', planId),
    list: () => ipcRenderer.invoke('installations:list')
  },
  activities: { list: () => ipcRenderer.invoke('activities:list') },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings) => ipcRenderer.invoke('settings:save', settings)
  },
  environments: {
    list: () => ipcRenderer.invoke('environments:list'),
    chooseProjectFolder: () => ipcRenderer.invoke('environments:choose-project-folder'),
    chooseEnvFile: () => ipcRenderer.invoke('environments:choose-env-file'),
    openProjectInCode: (projectPath) => ipcRenderer.invoke('environments:open-project-in-code', projectPath),
    openEnvFile: (envFilePath) => ipcRenderer.invoke('environments:open-env-file', envFilePath),
    save: (profile) => ipcRenderer.invoke('environments:save', profile),
    remove: (id) => ipcRenderer.invoke('environments:remove', id)
  }
};
contextBridge.exposeInMainWorld('devsetup', api);

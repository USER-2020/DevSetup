import { create } from 'zustand';
import type { InstallJob, InstallPlan, ScanResult, ToolId } from '../../packages/shared/types';

interface State { scan?: ScanResult; loading: boolean; error?: string; selected: ToolId[]; plan?: InstallPlan; jobs: InstallJob[]; scanSystem(): Promise<void>; clearError(): void; toggle(tool: ToolId): void; prepare(dryRun: boolean): Promise<void>; execute(): Promise<void>; }
export const useDevSetupStore = create<State>((set, get) => ({
  loading: false, selected: [], jobs: [],
  clearError() { set({ error: undefined }); },
  async scanSystem() { set({ loading: true, error: undefined }); try { set({ scan: await window.devsetup.system.scan() }); } catch { set({ error: 'No se pudo analizar el sistema. Inténtalo de nuevo.' }); } finally { set({ loading: false }); } },
  toggle(tool) { set({ selected: get().selected.includes(tool) ? get().selected.filter((id) => id !== tool) : [...get().selected, tool] }); },
  async prepare(dryRun) { if (!get().selected.length) { set({ error: 'Selecciona al menos una herramienta en la Biblioteca de software antes de crear el plan.' }); return; } try { set({ plan: await window.devsetup.installations.prepare(get().selected, dryRun), error: undefined }); } catch { set({ error: 'No se pudo crear el plan de instalación. Inténtalo de nuevo.' }); } },
  async execute() { const plan = get().plan; if (!plan) return; set({ loading: true }); try { set({ jobs: await window.devsetup.installations.execute(plan.id) }); await get().scanSystem(); } catch { set({ error: 'No se pudo ejecutar el plan de instalación. Revisa el estado de las herramientas e inténtalo de nuevo.' }); } finally { set({ loading: false }); } }
}));

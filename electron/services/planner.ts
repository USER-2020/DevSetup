import { randomUUID } from 'node:crypto';
import { catalog } from './catalog';
import type { InstallJob, InstallPlan, ToolId } from '../../packages/shared/types';
import { run } from './process';
import { recordActivity } from './activity-log';

const plans = new Map<string, InstallPlan>();
const jobs: InstallJob[] = [];
export function preparePlan(ids: ToolId[], dryRun: boolean): InstallPlan {
  const provider: 'winget' | 'brew' = process.platform === 'win32' ? 'winget' : 'brew';
  const items = ids.flatMap((id) => {
    const tool = catalog.find((candidate) => candidate.id === id);
    const packageId = process.platform === 'win32' ? tool?.wingetId : tool?.brewFormula;
    if (!tool || !packageId) return [];
    return [{ toolId: id, name: tool.name, provider, command: provider, args: process.platform === 'win32' ? ['install', '--id', packageId, '--exact', '--accept-source-agreements', '--accept-package-agreements'] : ['install', packageId], requiresElevation: id === 'mysql-server' || id === 'docker' }];
  });
  const plan = { id: randomUUID(), createdAt: new Date().toISOString(), dryRun, items, warnings: ['Revisa este plan antes de ejecutarlo. Las solicitudes administrativas las realiza el sistema operativo y nunca se omiten.', ...(items.some((item) => item.requiresElevation) ? ['Algunas herramientas seleccionadas pueden requerir aprobación de administrador.'] : [])] } satisfies InstallPlan;
  plans.set(plan.id, plan);
  void recordActivity({ category: 'installation', status: 'info', title: 'Plan de instalación preparado', detail: `Se preparó una simulación para ${items.length} herramienta${items.length === 1 ? '' : 's'}.` });
  return plan;
}
export async function executePlan(planId: string): Promise<InstallJob[]> {
  const plan = plans.get(planId); if (!plan) throw new Error('No se encontró el plan de instalación.');
  const created: InstallJob[] = [];
  for (const item of plan.items) {
    const job: InstallJob = { id: randomUUID(), planId, toolId: item.toolId, status: 'preparing', stage: plan.dryRun ? 'Dry run: no changes will be made' : 'Starting package provider', startedAt: new Date().toISOString(), output: [`$ ${item.command} ${item.args.join(' ')}`] };
    jobs.unshift(job); created.push(job);
    if (plan.dryRun) { job.status = 'completed'; job.stage = 'Plan validated'; job.finishedAt = new Date().toISOString(); continue; }
    job.status = 'installing'; job.stage = `Running ${item.provider}`;
    const result = await run(item.command, item.args, 20 * 60_000);
    job.output.push(...(result.stdout + '\n' + result.stderr).split(/\r?\n/).filter(Boolean).slice(-250));
    if (result.code !== 0) { job.status = 'failed'; job.stage = 'Package provider failed'; job.error = result.stderr || `Exit code ${result.code}`; job.finishedAt = new Date().toISOString(); continue; }
    job.status = 'verifying'; job.stage = 'Installation command completed; rescan to verify'; job.status = 'completed'; job.finishedAt = new Date().toISOString();
  }
  const failed = created.filter((job) => job.status === 'failed').length;
  await recordActivity({ category: 'installation', status: failed ? 'error' : 'success', title: failed ? 'Plan de instalación finalizado con errores' : 'Plan de instalación finalizado', detail: failed ? `${failed} herramienta${failed === 1 ? '' : 's'} no pudo completarse.` : `${created.length} herramienta${created.length === 1 ? '' : 's'} procesada${created.length === 1 ? '' : 's'}.` });
  return created;
}
export const listJobs = () => jobs;

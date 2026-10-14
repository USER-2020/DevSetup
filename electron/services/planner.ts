import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { catalog } from './catalog';
import type { InstallJob, InstallPlan, InstallPlanItem, InstallProgressEvent, PhpVersion, ToolId } from '../../packages/shared/types';
import { resolvePackageProvider, run } from './process';
import { recordActivity } from './activity-log';

const plans = new Map<string, InstallPlan>();
const jobs: InstallJob[] = [];

function packageProvider(platform: NodeJS.Platform): 'winget' | 'brew' | undefined {
  if (platform === 'win32') return 'winget';
  if (platform === 'darwin') return 'brew';
  return undefined;
}

export function preparePlan(ids: ToolId[], dryRun: boolean, platform: NodeJS.Platform = process.platform): InstallPlan {
  const provider = packageProvider(platform);
  const items = ids.flatMap((id) => {
    const tool = catalog.find((candidate) => candidate.id === id);
    const packageId = platform === 'win32' ? tool?.wingetId : tool?.brewFormula;
    if (!tool || !packageId || !provider) return [];
    const packageKind = tool.brewKind ?? 'formula';
    return [{ toolId: id, name: tool.name, provider, packageId, packageKind: provider === 'brew' ? packageKind : undefined, command: provider, args: platform === 'win32' ? ['install', '--id', packageId, '--exact', '--accept-source-agreements', '--accept-package-agreements'] : ['install', ...(packageKind === 'cask' ? ['--cask'] : []), packageId], requiresElevation: id === 'mysql-server' || id === 'docker' }];
  });
  const plan = { id: randomUUID(), createdAt: new Date().toISOString(), dryRun, kind: 'installation', items, warnings: [
    'Revisa este plan antes de ejecutarlo. Las solicitudes administrativas las realiza el sistema operativo y nunca se omiten.',
    ...(provider === 'brew' ? ['Homebrew se comprobará antes de ejecutar las instalaciones. Si no está disponible, el plan no realizará cambios.'] : []),
    ...(!provider ? ['Esta plataforma no tiene un proveedor de paquetes compatible.'] : []),
    ...(items.some((item) => item.requiresElevation) ? ['Algunas herramientas seleccionadas pueden requerir aprobación de administrador.'] : [])
  ] } satisfies InstallPlan;
  plans.set(plan.id, plan);
  void recordActivity({ category: 'installation', status: 'info', title: 'Plan de instalación preparado', detail: `Se preparó ${dryRun ? 'una simulación' : 'un plan de ejecución'} para ${items.length} herramienta${items.length === 1 ? '' : 's'}.` });
  return plan;
}

/** A controlled macOS PHP switch: install a catalogued version then make it the linked `php`. */
export function preparePhpVersionPlan(version: PhpVersion, dryRun: boolean, platform: NodeJS.Platform = process.platform): InstallPlan {
  const formula = version === '8.5' ? 'php' : `php@${version}`;
  const supported = platform === 'darwin';
  const items: InstallPlanItem[] = supported ? [
    { toolId: 'php', name: `Install PHP ${version}`, version, provider: 'brew', packageId: formula, command: 'brew', args: ['install', formula], requiresElevation: false },
    { toolId: 'php', name: `Activate PHP ${version}`, version, provider: 'brew', packageId: formula, command: 'brew', args: ['link', '--overwrite', '--force', formula], requiresElevation: false, verification: 'active-php' }
  ] : [];
  const plan = { id: randomUUID(), createdAt: new Date().toISOString(), dryRun, kind: 'php-version', targetVersion: version, items, warnings: [
    `Revisa el plan antes de ejecutarlo. PHP ${version} pasará a ser el comando php activo para tu usuario.`,
    'Homebrew se comprobará antes de ejecutar las instalaciones. Si no está disponible, el plan no realizará cambios.',
    ...(!supported ? ['El cambio de versión de PHP actualmente solo está disponible en macOS con Homebrew.'] : [])
  ] } satisfies InstallPlan;
  plans.set(plan.id, plan);
  void recordActivity({ category: 'installation', status: 'info', title: 'Plan de versión de PHP preparado', detail: `Se preparó ${dryRun ? 'una simulación' : 'un plan de ejecución'} para PHP ${version}.` });
  return plan;
}

async function verifyInstallation(item: InstallPlanItem, binary: string): Promise<{ verified: boolean; output: string }> {
  if (item.verification === 'active-php') {
    const activePhp = path.join(path.dirname(binary), 'php');
    const result = await run(activePhp, ['--version']);
    const output = (result.stdout || result.stderr).trim();
    return { verified: result.code === 0 && output.startsWith(`PHP ${item.version}.`), output };
  }
  const args = item.provider === 'brew'
    ? item.packageKind === 'cask' ? ['list', '--cask', item.packageId] : ['list', '--versions', item.packageId]
    : ['list', '--id', item.packageId, '--exact'];
  const result = await run(binary, args);
  const output = (result.stdout || result.stderr).trim();
  return { verified: result.code === 0 && (item.packageKind === 'cask' || output.includes(item.packageId)), output };
}

export async function executePlan(planId: string, onProgress?: (event: InstallProgressEvent) => void): Promise<InstallJob[]> {
  const plan = plans.get(planId); if (!plan) throw new Error('No se encontró el plan de instalación.');
  const providers = [...new Set(plan.items.map((item) => item.provider))];
  const providerPaths = new Map<string, string>();
  for (const provider of providers) {
    onProgress?.({ kind: 'provider', provider, status: 'checking' });
    const binary = await resolvePackageProvider(provider);
    if (!binary) {
      onProgress?.({ kind: 'provider', provider, status: 'unavailable' });
      const displayName = provider === 'brew' ? 'Homebrew' : 'WinGet';
      const error = `${displayName} no está disponible. Instálalo y vuelve a analizar el sistema antes de ejecutar el plan.`;
      await recordActivity({ category: 'installation', status: 'error', title: 'Proveedor de paquetes no disponible', detail: error });
      throw new Error(error);
    }
    providerPaths.set(provider, binary);
    onProgress?.({ kind: 'provider', provider, status: 'available' });
  }
  const created: InstallJob[] = [];
  for (const item of plan.items) {
    const job: InstallJob = { id: randomUUID(), planId, toolId: item.toolId, status: 'preparing', stage: plan.dryRun ? 'Dry run: no changes will be made' : 'Starting package provider', startedAt: new Date().toISOString(), output: [`$ ${item.command} ${item.args.join(' ')}`] };
    const notify = () => onProgress?.({ kind: 'job', job: { ...job, output: [...job.output] } });
    jobs.unshift(job); created.push(job);
    notify();
    if (plan.dryRun) { job.status = 'completed'; job.stage = 'Simulation completed — nothing was installed'; job.finishedAt = new Date().toISOString(); notify(); continue; }
    job.status = 'installing'; job.stage = `Running ${item.provider}`; notify();
    const result = await run(providerPaths.get(item.provider)!, item.args, 20 * 60_000);
    job.output.push(...(result.stdout + '\n' + result.stderr).split(/\r?\n/).filter(Boolean).slice(-250));
    if (result.code !== 0) { job.status = 'failed'; job.stage = 'Package provider failed'; job.error = result.stderr || `Exit code ${result.code}`; job.finishedAt = new Date().toISOString(); notify(); continue; }
    job.status = 'verifying'; job.stage = 'Verifying installed package'; notify();
    const verification = await verifyInstallation(item, providerPaths.get(item.provider)!);
    if (!verification.verified) {
      job.status = 'requires_action';
      job.stage = 'Installation command completed, but package was not verified';
      job.error = `No se pudo confirmar ${item.name} con ${item.provider}. Revisa la salida del proveedor y ejecuta un análisis del sistema.`;
      if (verification.output) job.output.push(`Verification: ${verification.output}`);
      job.finishedAt = new Date().toISOString();
      notify();
      continue;
    }
    if (verification.output) job.output.push(`Verified: ${verification.output}`);
    job.status = 'completed'; job.stage = 'Installed and verified'; job.finishedAt = new Date().toISOString(); notify();
  }
  const failed = created.filter((job) => job.status === 'failed' || job.status === 'requires_action').length;
  await recordActivity({ category: 'installation', status: failed ? 'error' : 'success', title: failed ? 'Plan de instalación finalizado con errores' : 'Plan de instalación finalizado', detail: failed ? `${failed} herramienta${failed === 1 ? '' : 's'} no pudo completarse o verificarse.` : `${created.length} herramienta${created.length === 1 ? '' : 's'} instalada${created.length === 1 ? '' : 's'} y verificada${created.length === 1 ? '' : 's'}.` });
  return created;
}
export const listJobs = () => jobs;

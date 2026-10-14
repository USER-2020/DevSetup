export type ToolStatus = 'installed' | 'missing' | 'multiple-versions' | 'misconfigured' | 'needs-verification' | 'unsupported' | 'outdated';
export type JobStatus = 'queued' | 'preparing' | 'installing' | 'verifying' | 'completed' | 'failed' | 'cancelled' | 'requires_action';

export interface DetectedInstallation { version?: string; path: string; source: 'path' | 'known-path' | 'package-manager'; }
export interface ToolRecord {
  id: ToolId; name: string; category: string; status: ToolStatus;
  installations: DetectedInstallation[]; recommendedVersion?: string; installSupported: boolean;
  detail: string;
}
export interface SystemInfo { platform: 'win32' | 'darwin' | 'linux'; release: string; architecture: string; hostname: string; user: string; totalMemoryGb: number; freeDiskGb?: number; packageManagers: string[]; scannedAt: string; }
export interface ScanResult { system: SystemInfo; tools: ToolRecord[]; }
export interface InstallPlanItem { toolId: ToolId; name: string; version?: string; provider: 'winget' | 'brew'; packageId: string; command: string; args: string[]; requiresElevation: boolean; }
export interface InstallPlan { id: string; createdAt: string; dryRun: boolean; items: InstallPlanItem[]; warnings: string[]; }
export interface InstallJob { id: string; planId: string; toolId: ToolId; status: JobStatus; stage: string; startedAt?: string; finishedAt?: string; output: string[]; error?: string; }
export interface EnvironmentProfile { id: string; name: string; projectPath: string; envFilePath?: string; description?: string; toolIds: ToolId[]; createdAt: string; updatedAt: string; }
export type ActivityCategory = 'system' | 'installation' | 'environment';
export type ActivityStatus = 'info' | 'success' | 'warning' | 'error';
export interface ActivityRecord { id: string; timestamp: string; category: ActivityCategory; status: ActivityStatus; title: string; detail: string; }
export type NotificationDuration = 'short' | 'normal' | 'long';
export type ActivityHistory = 'compact' | 'standard' | 'extended';
export interface AppSettings { scanOnLaunch: boolean; notificationDuration: NotificationDuration; activityHistory: ActivityHistory; includeProjectNamesInActivity: boolean; }
export const toolIds = ['node', 'php', 'composer', 'git', 'vscode', 'github-desktop', 'mysql-server', 'mysql-workbench', 'npm', 'yarn', 'pnpm', 'docker', 'python', 'postgresql', 'dbeaver', 'windows-terminal'] as const;
export type ToolId = typeof toolIds[number];
export interface DevSetupApi {
  system: { scan(): Promise<ScanResult> };
  installations: { prepare(toolIds: ToolId[], dryRun: boolean): Promise<InstallPlan>; execute(planId: string): Promise<InstallJob[]>; list(): Promise<InstallJob[]>; onProgress(listener: (job: InstallJob) => void): () => void };
  activities: { list(): Promise<ActivityRecord[]> };
  settings: { get(): Promise<AppSettings>; save(settings: AppSettings): Promise<AppSettings> };
  environments: { list(): Promise<EnvironmentProfile[]>; chooseProjectFolder(): Promise<string | null>; chooseEnvFile(): Promise<string | null>; openProjectInCode(projectPath: string): Promise<void>; openEnvFile(envFilePath: string): Promise<void>; save(profile: Omit<EnvironmentProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnvironmentProfile>; remove(id: string): Promise<void> };
}

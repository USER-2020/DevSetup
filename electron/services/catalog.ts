import type { ToolId } from '../../packages/shared/types';

export interface ToolDefinition { id: ToolId; name: string; category: string; executable?: string; versionArgs?: string[]; windowsPaths?: string[]; macPaths?: string[]; wingetId?: string; brewFormula?: string; brewKind?: 'formula' | 'cask'; }
export const catalog: ToolDefinition[] = [
  { id: 'node', name: 'Node.js', category: 'Runtime', executable: 'node', versionArgs: ['--version'], windowsPaths: ['C:/Program Files/nodejs/node.exe'], macPaths: ['/usr/local/bin/node', '/opt/homebrew/bin/node'], wingetId: 'OpenJS.NodeJS.LTS', brewFormula: 'node' },
  { id: 'php', name: 'PHP', category: 'Runtime', executable: 'php', versionArgs: ['--version'], windowsPaths: ['C:/php/php.exe'], macPaths: ['/usr/local/bin/php', '/opt/homebrew/bin/php'], wingetId: 'PHP.PHP', brewFormula: 'php' },
  { id: 'composer', name: 'Composer', category: 'Dependencies', executable: 'composer', versionArgs: ['--version'], windowsPaths: ['C:/ProgramData/ComposerSetup/bin/composer.bat'], macPaths: ['/usr/local/bin/composer', '/opt/homebrew/bin/composer'], wingetId: 'Composer.Composer', brewFormula: 'composer' },
  { id: 'git', name: 'Git', category: 'Development', executable: 'git', versionArgs: ['--version'], windowsPaths: ['C:/Program Files/Git/cmd/git.exe'], macPaths: ['/usr/bin/git', '/opt/homebrew/bin/git'], wingetId: 'Git.Git', brewFormula: 'git' },
  { id: 'vscode', name: 'Visual Studio Code', category: 'Development', executable: 'code', versionArgs: ['--version'], windowsPaths: ['C:/Program Files/Microsoft VS Code/bin/code.cmd'], macPaths: ['/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'], wingetId: 'Microsoft.VisualStudioCode', brewFormula: 'visual-studio-code', brewKind: 'cask' },
  { id: 'github-desktop', name: 'GitHub Desktop', category: 'Development', windowsPaths: ['C:/Program Files/GitHub Desktop/GitHubDesktop.exe'], macPaths: ['/Applications/GitHub Desktop.app'], wingetId: 'GitHub.GitHubDesktop', brewFormula: 'github', brewKind: 'cask' },
  { id: 'mysql-server', name: 'MySQL Server', category: 'Database', executable: 'mysql', versionArgs: ['--version'], windowsPaths: ['C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe'], macPaths: ['/usr/local/mysql/bin/mysql', '/opt/homebrew/bin/mysql'], wingetId: 'Oracle.MySQL', brewFormula: 'mysql' },
  { id: 'mysql-workbench', name: 'MySQL Workbench', category: 'Database', windowsPaths: ['C:/Program Files/MySQL/MySQL Workbench 8.0 CE/MySQLWorkbench.exe'], macPaths: ['/Applications/MySQLWorkbench.app'], wingetId: 'Oracle.MySQLWorkbench', brewFormula: 'mysqlworkbench', brewKind: 'cask' },
  { id: 'npm', name: 'npm', category: 'Dependencies', executable: 'npm', versionArgs: ['--version'] },
  { id: 'yarn', name: 'Yarn', category: 'Dependencies', executable: 'yarn', versionArgs: ['--version'], wingetId: 'Yarn.Yarn', brewFormula: 'yarn' },
  { id: 'pnpm', name: 'pnpm', category: 'Dependencies', executable: 'pnpm', versionArgs: ['--version'], wingetId: 'pnpm.pnpm', brewFormula: 'pnpm' },
  { id: 'docker', name: 'Docker Desktop', category: 'Optional', executable: 'docker', versionArgs: ['--version'], wingetId: 'Docker.DockerDesktop', brewFormula: 'docker', brewKind: 'cask' },
  { id: 'python', name: 'Python', category: 'Optional', executable: 'python', versionArgs: ['--version'], wingetId: 'Python.Python.3.13', brewFormula: 'python' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Optional', executable: 'psql', versionArgs: ['--version'], wingetId: 'PostgreSQL.PostgreSQL', brewFormula: 'postgresql@16' },
  { id: 'dbeaver', name: 'DBeaver', category: 'Optional', wingetId: 'dbeaver.dbeaver', brewFormula: 'dbeaver-community', brewKind: 'cask' },
  { id: 'windows-terminal', name: 'Windows Terminal', category: 'Optional', executable: 'wt', versionArgs: ['--version'], wingetId: 'Microsoft.WindowsTerminal' }
];

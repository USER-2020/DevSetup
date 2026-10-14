import { describe, expect, it } from 'vitest';
import { preparePhpVersionPlan, preparePlan } from '../electron/services/planner';

describe('installation planner', () => {
  it('only builds commands from the controlled catalog', () => {
    const plan = preparePlan(['node', 'git'], true, 'darwin');
    expect(plan.dryRun).toBe(true);
    expect(plan.items).toHaveLength(2);
    for (const item of plan.items) {
      expect(['winget', 'brew']).toContain(item.command);
      expect(item.packageId).toMatch(/^[A-Za-z0-9.@_-]+$/);
      expect(item.args.some((arg) => arg.includes(';') || arg.includes('&&'))).toBe(false);
    }
  });

  it('prepares a reviewed PHP version installation and activation plan for macOS', () => {
    const plan = preparePhpVersionPlan('8.2', true, 'darwin');
    expect(plan.kind).toBe('php-version');
    expect(plan.items).toHaveLength(2);
    expect(plan.items.map((item) => item.args)).toEqual([
      ['install', 'php@8.2'],
      ['link', '--overwrite', '--force', 'php@8.2']
    ]);
    expect(plan.items[1].verification).toBe('active-php');
  });

  it('uses the current PHP formula when switching to PHP 8.5', () => {
    const plan = preparePhpVersionPlan('8.5', true, 'darwin');
    expect(plan.items.map((item) => item.args)).toEqual([
      ['install', 'php'],
      ['link', '--overwrite', '--force', 'php']
    ]);
  });

  it('uses the cask operation for macOS desktop applications', () => {
    const plan = preparePlan(['vscode', 'github-desktop'], true, 'darwin');
    expect(plan.items.map((item) => item.args)).toEqual([
      ['install', '--cask', 'visual-studio-code'],
      ['install', '--cask', 'github']
    ]);
    expect(plan.items.every((item) => item.packageKind === 'cask')).toBe(true);
  });
});

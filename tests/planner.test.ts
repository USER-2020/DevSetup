import { describe, expect, it } from 'vitest';
import { preparePlan } from '../electron/services/planner';

describe('installation planner', () => {
  it('only builds commands from the controlled catalog', () => {
    const plan = preparePlan(['node', 'git'], true);
    expect(plan.dryRun).toBe(true);
    expect(plan.items).toHaveLength(2);
    for (const item of plan.items) {
      expect(['winget', 'brew']).toContain(item.command);
      expect(item.packageId).toMatch(/^[A-Za-z0-9.@_-]+$/);
      expect(item.args.some((arg) => arg.includes(';') || arg.includes('&&'))).toBe(false);
    }
  });
});

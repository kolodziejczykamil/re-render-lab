import { describe, it, expect } from 'vitest';
import { simulateRenders } from '../simulator';
import type { ComponentAnalysis, ScenarioEvent } from '../../types';

describe('simulateRenders', () => {
  const baseAnalysis: ComponentAnalysis = {
    hasInlineArrowFunctions: false,
    hasInlineObjectLiterals: false,
    hasUseEffectWithoutDeps: false,
    hasUseEffectWithDeps: false,
    useEffectDeps: [],
    hasReactMemo: false,
    stateHooksCount: 0,
    stateHookNames: [],
    isValid: true,
  };

  describe('initial render', () => {
    it('should always include initial render', () => {
      const events = simulateRenders(baseAnalysis, []);
      expect(events.length).toBe(1);
      expect(events[0].type).toBe('initial');
      expect(events[0].avoidable).toBe(false);
      expect(events[0].duration).toBe(0);
    });

    it('should have correct initial render reason', () => {
      const events = simulateRenders(baseAnalysis, []);
      expect(events[0].reason).toBe('Component first mounted to DOM');
    });
  });

  describe('prop change', () => {
    it('should trigger render on prop change', () => {
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'prop', key: 'name' },
      ];
      const events = simulateRenders(baseAnalysis, scenarios);
      expect(events.length).toBe(2);
      expect(events[1].type).toBe('prop');
      expect(events[1].avoidable).toBe(false);
      expect(events[1].reason).toContain('props.name changed');
    });

    it('should handle prop change without key', () => {
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'prop' },
      ];
      const events = simulateRenders(baseAnalysis, scenarios);
      expect(events[1].type).toBe('prop');
      expect(events[1].reason).toContain('props.unknown changed');
    });
  });

  describe('state change', () => {
    it('should trigger render on state change', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        stateHooksCount: 1,
        stateHookNames: ['count'],
      };
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'state', key: 'count' },
      ];
      const events = simulateRenders(analysis, scenarios);
      expect(events.length).toBe(2);
      expect(events[1].type).toBe('state');
      expect(events[1].avoidable).toBe(false);
      expect(events[1].reason).toContain('count updated via setState');
    });

    it('should use first state hook name if key not provided', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        stateHooksCount: 1,
        stateHookNames: ['value'],
      };
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'state' },
      ];
      const events = simulateRenders(analysis, scenarios);
      expect(events[1].reason).toContain('value updated via setState');
    });
  });

  describe('parent re-render', () => {
    it('should trigger avoidable render when NOT memoized', () => {
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'parent' },
      ];
      const events = simulateRenders(baseAnalysis, scenarios);
      expect(events.length).toBe(2);
      expect(events[1].type).toBe('parent');
      expect(events[1].avoidable).toBe(true);
      expect(events[1].reason).toContain('unnecessarily (component not memoized)');
    });

    it('should NOT trigger render when memoized', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasReactMemo: true,
      };
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'parent' },
      ];
      const events = simulateRenders(analysis, scenarios);
      // Only initial render, parent re-render is skipped
      expect(events.length).toBe(1);
    });

    it('should mark as avoidable when inline functions/objects present', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasInlineArrowFunctions: true,
      };
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'parent' },
      ];
      const events = simulateRenders(analysis, scenarios);
      expect(events[1].avoidable).toBe(true);
      expect(events[1].reason).toContain('inline functions/objects detected');
    });
  });

  describe('effect execution', () => {
    it('should trigger avoidable render when useEffect has no deps', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasUseEffectWithoutDeps: true,
      };
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'effect' },
      ];
      const events = simulateRenders(analysis, scenarios);
      expect(events.length).toBe(2);
      expect(events[1].type).toBe('effect');
      expect(events[1].avoidable).toBe(true);
      expect(events[1].reason).toContain('(missing dependency array)');
    });

    it('should trigger non-avoidable render when useEffect has deps', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasUseEffectWithDeps: true,
      };
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'effect' },
      ];
      const events = simulateRenders(analysis, scenarios);
      expect(events[1].type).toBe('effect');
      expect(events[1].avoidable).toBe(false);
    });
  });

  describe('multiple scenarios', () => {
    it('should handle multiple events in sequence', () => {
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'prop', key: 'name' },
        { id: '2', type: 'state', key: 'count' },
        { id: '3', type: 'parent' },
      ];
      const events = simulateRenders(baseAnalysis, scenarios);
      expect(events.length).toBe(4); // initial + 3 events
      expect(events[1].type).toBe('prop');
      expect(events[2].type).toBe('state');
      expect(events[3].type).toBe('parent');
    });

    it('should have increasing timestamps', () => {
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'prop', key: 'name' },
        { id: '2', type: 'state', key: 'count' },
      ];
      const events = simulateRenders(baseAnalysis, scenarios);
      expect(events[0].timestamp).toBeLessThan(events[1].timestamp);
      expect(events[1].timestamp).toBeLessThan(events[2].timestamp);
    });
  });

  describe('deterministic output', () => {
    it('should produce same results for same input', () => {
      const scenarios: ScenarioEvent[] = [
        { id: '1', type: 'prop', key: 'name' },
        { id: '2', type: 'state', key: 'count' },
      ];
      const events1 = simulateRenders(baseAnalysis, scenarios);
      const events2 = simulateRenders(baseAnalysis, scenarios);
      
      expect(events1.length).toBe(events2.length);
      events1.forEach((event, index) => {
        expect(event.id).toBe(events2[index].id);
        expect(event.type).toBe(events2[index].type);
        expect(event.avoidable).toBe(events2[index].avoidable);
        expect(event.duration).toBe(events2[index].duration);
        expect(event.reason).toBe(events2[index].reason);
      });
    });
  });
});

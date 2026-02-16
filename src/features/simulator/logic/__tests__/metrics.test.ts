import { describe, it, expect } from 'vitest';
import { calculatePerformanceMetrics } from '../metrics';
import type { RenderEvent, ComponentAnalysis } from '../../types';

describe('calculatePerformanceMetrics', () => {
  describe('empty render events', () => {
    it('should return zero metrics for empty array', () => {
      const metrics = calculatePerformanceMetrics([]);
      expect(metrics.totalRenders).toBe(0);
      expect(metrics.avoidableRenders).toBe(0);
      expect(metrics.avgDuration).toBe(0);
      expect(metrics.optimizationScore).toBe(100);
    });
  });

  describe('basic metrics', () => {
    it('should count total renders correctly', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'prop', avoidable: false, duration: 100, reason: 'Prop change', timestamp: 100 },
        { id: 3, type: 'state', avoidable: false, duration: 120, reason: 'State change', timestamp: 200 },
      ];
      const metrics = calculatePerformanceMetrics(events);
      expect(metrics.totalRenders).toBe(3);
    });

    it('should count avoidable renders correctly', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 100 },
        { id: 3, type: 'parent', avoidable: true, duration: 120, reason: 'Parent re-render', timestamp: 200 },
      ];
      const metrics = calculatePerformanceMetrics(events);
      expect(metrics.avoidableRenders).toBe(2);
    });

    it('should calculate average duration correctly', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'prop', avoidable: false, duration: 100, reason: 'Prop change', timestamp: 100 },
        { id: 3, type: 'state', avoidable: false, duration: 200, reason: 'State change', timestamp: 200 },
      ];
      const metrics = calculatePerformanceMetrics(events);
      expect(metrics.avgDuration).toBe(100); // (0 + 100 + 200) / 3 = 100
    });
  });

  describe('optimization score', () => {
    it('should return 100 for perfect component', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'prop', avoidable: false, duration: 50, reason: 'Prop change', timestamp: 100 },
      ];
      const analysis: ComponentAnalysis = {
        hasInlineArrowFunctions: false,
        hasInlineObjectLiterals: false,
        hasInlineArrayLiterals: false,
        hasUseEffectWithoutDeps: false,
        hasUseEffectWithDeps: false,
        useEffectDeps: [],
        hasReactMemo: false,
        stateHooksCount: 0,
        stateHookNames: [],
        hasPropsDestructuring: false,
        isValid: true,
      };
      const metrics = calculatePerformanceMetrics(events, analysis);
      expect(metrics.optimizationScore).toBe(100);
    });

    it('should decrease score by 15 per avoidable render', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 100 },
      ];
      const analysis: ComponentAnalysis = {
        hasInlineArrowFunctions: false,
        hasInlineObjectLiterals: false,
        hasInlineArrayLiterals: false,
        hasUseEffectWithoutDeps: false,
        hasUseEffectWithDeps: false,
        useEffectDeps: [],
        hasReactMemo: false,
        stateHooksCount: 0,
        stateHookNames: [],
        hasPropsDestructuring: false,
        isValid: true,
      };
      const metrics = calculatePerformanceMetrics(events, analysis);
      // 100 - (1 * 15) = 85
      expect(metrics.optimizationScore).toBe(85);
    });

    it('should decrease score by 10 for inline arrow functions', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
      ];
      const analysis: ComponentAnalysis = {
        hasInlineArrowFunctions: true,
        hasInlineObjectLiterals: false,
        hasInlineArrayLiterals: false,
        hasUseEffectWithoutDeps: false,
        hasUseEffectWithDeps: false,
        useEffectDeps: [],
        hasReactMemo: false,
        stateHooksCount: 0,
        stateHookNames: [],
        isValid: true,
      };
      const metrics = calculatePerformanceMetrics(events, analysis);
      // 100 - 10 = 90
      expect(metrics.optimizationScore).toBe(90);
    });

    it('should decrease score by 10 for inline object literals', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
      ];
      const analysis: ComponentAnalysis = {
        hasInlineArrowFunctions: false,
        hasInlineObjectLiterals: true,
        hasInlineArrayLiterals: false,
        hasUseEffectWithoutDeps: false,
        hasUseEffectWithDeps: false,
        useEffectDeps: [],
        hasReactMemo: false,
        stateHooksCount: 0,
        stateHookNames: [],
        isValid: true,
      };
      const metrics = calculatePerformanceMetrics(events, analysis);
      // 100 - 10 = 90
      expect(metrics.optimizationScore).toBe(90);
    });

    it('should decrease score by 15 for useEffect without deps', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
      ];
      const analysis: ComponentAnalysis = {
        hasInlineArrowFunctions: false,
        hasInlineObjectLiterals: false,
        hasInlineArrayLiterals: false,
        hasUseEffectWithoutDeps: true,
        hasUseEffectWithDeps: false,
        useEffectDeps: [],
        hasReactMemo: false,
        stateHooksCount: 0,
        stateHookNames: [],
        isValid: true,
      };
      const metrics = calculatePerformanceMetrics(events, analysis);
      // 100 - 15 = 85
      expect(metrics.optimizationScore).toBe(85);
    });

    it('should combine all penalties', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 100 },
      ];
      const analysis: ComponentAnalysis = {
        hasInlineArrowFunctions: true,
        hasInlineObjectLiterals: true,
        hasInlineArrayLiterals: false,
        hasUseEffectWithoutDeps: true,
        hasUseEffectWithDeps: false,
        useEffectDeps: [],
        hasReactMemo: false,
        stateHooksCount: 0,
        stateHookNames: [],
        isValid: true,
      };
      const metrics = calculatePerformanceMetrics(events, analysis);
      // 100 - (1 * 15) - 10 - 10 - 15 = 50
      expect(metrics.optimizationScore).toBe(50);
    });

    it('should clamp score between 0 and 100', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 100 },
        { id: 3, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 200 },
        { id: 4, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 300 },
        { id: 5, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 400 },
        { id: 6, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 500 },
        { id: 7, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 600 },
      ];
      const analysis: ComponentAnalysis = {
        hasInlineArrowFunctions: true,
        hasInlineObjectLiterals: true,
        hasInlineArrayLiterals: false,
        hasUseEffectWithoutDeps: true,
        hasUseEffectWithDeps: false,
        useEffectDeps: [],
        hasReactMemo: false,
        stateHooksCount: 0,
        stateHookNames: [],
        isValid: true,
      };
      const metrics = calculatePerformanceMetrics(events, analysis);
      // Would be negative, but clamped to 0
      expect(metrics.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(metrics.optimizationScore).toBeLessThanOrEqual(100);
    });
  });

  describe('deterministic output', () => {
    it('should produce same results for same input', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 100 },
      ];
      const metrics1 = calculatePerformanceMetrics(events);
      const metrics2 = calculatePerformanceMetrics(events);
      
      expect(metrics1.totalRenders).toBe(metrics2.totalRenders);
      expect(metrics1.avoidableRenders).toBe(metrics2.avoidableRenders);
      expect(metrics1.avgDuration).toBe(metrics2.avgDuration);
      expect(metrics1.optimizationScore).toBe(metrics2.optimizationScore);
    });
  });
});

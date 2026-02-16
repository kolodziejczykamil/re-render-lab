import { describe, it, expect } from 'vitest';
import { calculatePerformanceMetrics } from '../metrics';
import type { RenderEvent } from '../../types';

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
      const metrics = calculatePerformanceMetrics(events);
      expect(metrics.optimizationScore).toBe(100);
    });

    it('should decrease score for avoidable renders', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 100 },
        { id: 3, type: 'parent', avoidable: true, duration: 100, reason: 'Parent re-render', timestamp: 200 },
      ];
      const metrics = calculatePerformanceMetrics(events);
      // 2/3 avoidable = 66.7% ratio, so score should be reduced
      expect(metrics.optimizationScore).toBeLessThan(100);
    });

    it('should decrease score for slow renders', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'prop', avoidable: false, duration: 300, reason: 'Prop change', timestamp: 100 },
      ];
      const metrics = calculatePerformanceMetrics(events);
      // avgDuration = 150ms, but one render is 300ms, so score should be reduced
      expect(metrics.optimizationScore).toBeLessThan(100);
    });

    it('should add bonus for memoized parent renders', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'parent', avoidable: false, duration: 100, reason: 'Parent re-render (memoized)', timestamp: 100 },
      ];
      const metrics = calculatePerformanceMetrics(events);
      // Should have bonus for proper memoization
      expect(metrics.optimizationScore).toBeGreaterThan(100);
      expect(metrics.optimizationScore).toBeLessThanOrEqual(105);
    });

    it('should clamp score between 0 and 100', () => {
      const events: RenderEvent[] = [
        { id: 1, type: 'initial', avoidable: false, duration: 0, reason: 'Mount', timestamp: 0 },
        { id: 2, type: 'parent', avoidable: true, duration: 1000, reason: 'Parent re-render', timestamp: 100 },
        { id: 3, type: 'parent', avoidable: true, duration: 1000, reason: 'Parent re-render', timestamp: 200 },
        { id: 4, type: 'parent', avoidable: true, duration: 1000, reason: 'Parent re-render', timestamp: 300 },
        { id: 5, type: 'parent', avoidable: true, duration: 1000, reason: 'Parent re-render', timestamp: 400 },
      ];
      const metrics = calculatePerformanceMetrics(events);
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

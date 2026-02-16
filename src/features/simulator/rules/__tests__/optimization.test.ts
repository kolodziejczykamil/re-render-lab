import { describe, it, expect } from 'vitest';
import { generateOptimizationSuggestions } from '../optimization';
import type { ComponentAnalysis, RenderEvent } from '../../types';

describe('generateOptimizationSuggestions', () => {
  const baseAnalysis: ComponentAnalysis = {
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

  const baseRenderEvents: RenderEvent[] = [
    {
      id: 1,
      type: 'initial',
      avoidable: false,
      duration: 0,
      reason: 'Component first mounted to DOM',
      timestamp: 0,
    },
  ];

  describe('React.memo suggestion', () => {
    it('should suggest React.memo when missing and parent re-renders exist', () => {
      const renderEvents: RenderEvent[] = [
        ...baseRenderEvents,
        {
          id: 2,
          type: 'parent',
          avoidable: true,
          duration: 100,
          reason: 'Parent component re-rendered unnecessarily',
          timestamp: 100,
        },
      ];
      const suggestions = generateOptimizationSuggestions(baseAnalysis, renderEvents);
      
      const memo = suggestions.find((s) => s.title.includes('React.memo'));
      expect(memo).toBeDefined();
      expect(memo?.impact).toBe('High');
    });

    it('should NOT suggest React.memo when already memoized', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasReactMemo: true,
      };
      const renderEvents: RenderEvent[] = [
        ...baseRenderEvents,
        {
          id: 2,
          type: 'parent',
          avoidable: false,
          duration: 100,
          reason: 'Parent component re-rendered',
          timestamp: 100,
        },
      ];
      const suggestions = generateOptimizationSuggestions(analysis, renderEvents);
      
      const memo = suggestions.find((s) => s.title.includes('React.memo'));
      expect(memo).toBeUndefined();
    });

    it('should NOT suggest React.memo when no parent re-renders', () => {
      const renderEvents: RenderEvent[] = [
        ...baseRenderEvents,
        {
          id: 2,
          type: 'prop',
          avoidable: false,
          duration: 100,
          reason: 'props.name changed',
          timestamp: 100,
        },
      ];
      const suggestions = generateOptimizationSuggestions(baseAnalysis, renderEvents);
      
      const memo = suggestions.find((s) => s.title.includes('React.memo'));
      expect(memo).toBeUndefined();
    });
  });

  describe('useCallback suggestion', () => {
    it('should suggest useCallback when inline arrow functions detected', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasInlineArrowFunctions: true,
      };
      const suggestions = generateOptimizationSuggestions(analysis, baseRenderEvents);
      
      const callback = suggestions.find((s) => s.title.includes('useCallback'));
      expect(callback).toBeDefined();
      expect(callback?.impact).toBe('Medium');
    });

    it('should NOT suggest useCallback when no inline functions', () => {
      const suggestions = generateOptimizationSuggestions(baseAnalysis, baseRenderEvents);
      
      const callback = suggestions.find((s) => s.title.includes('useCallback'));
      expect(callback).toBeUndefined();
    });
  });

  describe('useMemo suggestion', () => {
    it('should suggest avoiding inline objects when detected', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasInlineObjectLiterals: true,
      };
      const suggestions = generateOptimizationSuggestions(analysis, baseRenderEvents);
      
      const memo = suggestions.find((s) => s.title.includes('inline object'));
      expect(memo).toBeDefined();
      expect(memo?.impact).toBe('Medium');
    });

    it('should NOT suggest useMemo when no inline objects', () => {
      const suggestions = generateOptimizationSuggestions(baseAnalysis, baseRenderEvents);
      
      const memo = suggestions.find((s) => s.title.includes('inline object'));
      expect(memo).toBeUndefined();
    });
  });

  describe('component splitting suggestion', () => {
    it('should suggest splitting when multiple state hooks', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        stateHooksCount: 3,
      };
      const suggestions = generateOptimizationSuggestions(analysis, baseRenderEvents);
      
      const splitting = suggestions.find((s) => s.title.includes('splitting'));
      expect(splitting).toBeDefined();
      expect(splitting?.impact).toBe('High');
    });

    it('should suggest splitting when multiple avoidable renders', () => {
      const renderEvents: RenderEvent[] = [
        ...baseRenderEvents,
        {
          id: 2,
          type: 'parent',
          avoidable: true,
          duration: 100,
          reason: 'Parent re-render',
          timestamp: 100,
        },
        {
          id: 3,
          type: 'parent',
          avoidable: true,
          duration: 150,
          reason: 'Parent re-render',
          timestamp: 200,
        },
      ];
      const suggestions = generateOptimizationSuggestions(baseAnalysis, renderEvents);
      
      const splitting = suggestions.find((s) => s.title.includes('splitting'));
      expect(splitting).toBeDefined();
    });

    it('should NOT suggest splitting when component is simple', () => {
      const suggestions = generateOptimizationSuggestions(baseAnalysis, baseRenderEvents);
      
      const splitting = suggestions.find((s) => s.title.includes('splitting'));
      expect(splitting).toBeUndefined();
    });
  });

  describe('useEffect dependencies suggestion', () => {
    it('should suggest fixing useEffect when no dependency array', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasUseEffectWithoutDeps: true,
      };
      const suggestions = generateOptimizationSuggestions(analysis, baseRenderEvents);
      
      const effect = suggestions.find((s) => s.title.includes('useEffect'));
      expect(effect).toBeDefined();
      expect(effect?.impact).toBe('Medium');
    });

    it('should NOT suggest useEffect fix when properly configured', () => {
      const suggestions = generateOptimizationSuggestions(baseAnalysis, baseRenderEvents);
      
      const effect = suggestions.find((s) => s.title.includes('useEffect'));
      expect(effect).toBeUndefined();
    });
  });

  describe('multiple suggestions', () => {
    it('should generate multiple suggestions when multiple issues exist', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasInlineArrowFunctions: true,
        hasInlineObjectLiterals: true,
        hasUseEffectWithoutDeps: true,
        stateHooksCount: 3,
      };
      const renderEvents: RenderEvent[] = [
        ...baseRenderEvents,
        {
          id: 2,
          type: 'parent',
          avoidable: true,
          duration: 100,
          reason: 'Parent re-render',
          timestamp: 100,
        },
      ];
      const suggestions = generateOptimizationSuggestions(analysis, renderEvents);
      
      expect(suggestions.length).toBeGreaterThan(3);
    });
  });

  describe('no suggestions for optimized component', () => {
    it('should return empty array for fully optimized component', () => {
      const analysis: ComponentAnalysis = {
        ...baseAnalysis,
        hasReactMemo: true,
      };
      const renderEvents: RenderEvent[] = [
        ...baseRenderEvents,
        {
          id: 2,
          type: 'prop',
          avoidable: false,
          duration: 100,
          reason: 'props.name changed',
          timestamp: 100,
        },
      ];
      const suggestions = generateOptimizationSuggestions(analysis, renderEvents);
      
      expect(suggestions.length).toBe(0);
    });
  });
});

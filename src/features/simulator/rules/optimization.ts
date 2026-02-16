import type { ComponentAnalysis, OptimizationSuggestion, RenderEvent } from '../types';

export function generateOptimizationSuggestions(
  analysis: ComponentAnalysis,
  renderEvents: RenderEvent[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  let suggestionId = 1;

  // Count avoidable renders
  const avoidableRenders = renderEvents.filter((e) => e.avoidable).length;
  const parentRenders = renderEvents.filter((e) => e.type === 'parent').length;

  // Suggestion 1: React.memo
  if (!analysis.hasReactMemo && parentRenders > 0) {
    suggestions.push({
      id: suggestionId++,
      title: 'Wrap with React.memo()',
      description: 'Prevent re-renders when props haven\'t changed. Especially useful for this component since parent re-renders trigger unnecessary updates.',
      impact: 'High',
      recommendation: 'Wrap your component export with React.memo()',
      keywords: ['React.memo', 'memoization'],
    });
  }

  // Suggestion 2: useCallback for handlers
  if (analysis.hasInlineArrowFunctions) {
    suggestions.push({
      id: suggestionId++,
      title: 'Use useCallback for handlers',
      description: 'Memoize handler functions to prevent creating new function references on every render, which can cause child components to re-render.',
      impact: 'Medium',
      recommendation: 'Wrap event handlers with useCallback()',
      keywords: ['useCallback', 'memoization'],
    });
  }

  // Suggestion 3: Avoid inline object creation
  if (analysis.hasInlineObjectLiterals) {
    suggestions.push({
      id: suggestionId++,
      title: 'Avoid inline object creation',
      description: 'Creating objects or arrays inline in props causes new references each render. Move them outside component or use useMemo.',
      impact: 'Medium',
      recommendation: 'Move inline objects/arrays outside component or use useMemo()',
      keywords: ['useMemo', 'inline objects'],
    });
  }

  // Suggestion 4: Component splitting
  if (analysis.stateHooksCount > 2 || avoidableRenders > 1) {
    suggestions.push({
      id: suggestionId++,
      title: 'Consider component splitting',
      description: 'Break down into smaller components to isolate state changes and reduce the render scope when updates occur.',
      impact: 'High',
      recommendation: 'Split component into smaller, focused components',
      keywords: ['Architecture', 'component splitting'],
    });
  }

  // Suggestion 5: useEffect dependencies
  if (analysis.hasUseEffectWithoutDeps) {
    suggestions.push({
      id: suggestionId++,
      title: 'Refine useEffect dependencies',
      description: 'useEffect without dependency array runs on every render. Add proper dependencies or empty array if effect should run once.',
      impact: 'Medium',
      recommendation: 'Add dependency array to useEffect hooks',
      keywords: ['useEffect', 'dependencies'],
    });
  }

  return suggestions;
}

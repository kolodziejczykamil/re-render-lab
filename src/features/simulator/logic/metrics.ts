import type { ComponentAnalysis, PerformanceMetrics, RenderEvent } from '../types';

export function calculatePerformanceMetrics(
  renderEvents: RenderEvent[],
  analysis?: ComponentAnalysis
): PerformanceMetrics {
  const totalRenders = renderEvents.length;
  const avoidableRenders = renderEvents.filter((e) => e.avoidable).length;
  
  const totalDuration = renderEvents.reduce((sum, event) => sum + event.duration, 0);
  const avgDuration = totalRenders > 0 ? Math.round(totalDuration / totalRenders) : 0;

  // New scoring formula: Start at 100, deduct penalties
  let score = 100;
  
  if (totalRenders > 0) {
    // Deduct 15 points per avoidable render
    score -= avoidableRenders * 15;
    
    // Deduct 10 points per inline arrow function in JSX
    if (analysis?.hasInlineArrowFunctions) {
      score -= 10;
    }
    
    // Deduct 10 points per inline object in JSX
    if (analysis?.hasInlineObjectLiterals) {
      score -= 10;
    }
    
    // Deduct 15 points if useEffect missing deps
    if (analysis?.hasUseEffectWithoutDeps) {
      score -= 15;
    }
  }

  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return {
    totalRenders,
    avoidableRenders,
    avgDuration,
    optimizationScore: score,
  };
}

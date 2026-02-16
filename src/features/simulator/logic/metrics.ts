import type { PerformanceMetrics, RenderEvent } from '../types';

export function calculatePerformanceMetrics(renderEvents: RenderEvent[]): PerformanceMetrics {
  const totalRenders = renderEvents.length;
  const avoidableRenders = renderEvents.filter((e) => e.avoidable).length;
  
  const totalDuration = renderEvents.reduce((sum, event) => sum + event.duration, 0);
  const avgDuration = totalRenders > 0 ? Math.round(totalDuration / totalRenders) : 0;

  // Calculate optimization score (0-100)
  // Base score: 100
  // Deduct points for avoidable renders
  // Deduct points for high average duration
  let score = 100;
  
  if (totalRenders > 0) {
    const avoidableRatio = avoidableRenders / totalRenders;
    score -= Math.round(avoidableRatio * 40); // Up to 40 points for avoidable renders
    
    // Deduct points for slow renders (over 200ms is considered slow)
    if (avgDuration > 200) {
      score -= Math.round((avgDuration - 200) / 10); // 1 point per 10ms over 200ms
    }
    
    // Bonus for memoization (if no avoidable parent renders)
    const parentRenders = renderEvents.filter((e) => e.type === 'parent' && !e.avoidable);
    if (parentRenders.length > 0) {
      score += 5; // Small bonus for proper memoization
    }
  }

  score = Math.max(0, Math.min(100, score)); // Clamp between 0 and 100

  return {
    totalRenders,
    avoidableRenders,
    avgDuration,
    optimizationScore: score,
  };
}

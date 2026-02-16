'use client';

import React from 'react';
import { Card } from '../ui/Card';
import type { PerformanceMetrics } from '@/features/simulator/types';

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
}

export function PerformanceMetricsComponent({ metrics }: PerformanceMetricsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const avoidablePercentage =
    metrics.totalRenders > 0
      ? Math.round((metrics.avoidableRenders / metrics.totalRenders) * 100)
      : 0;

  return (
    <Card title="Performance Metrics">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Total Renders</div>
          <div className="text-2xl font-bold text-white mb-1">{metrics.totalRenders}</div>
          {avoidablePercentage > 0 && (
            <div className="text-xs text-yellow-400 flex items-center gap-1">
              <span>↑</span>
              <span>{avoidablePercentage}% avoidable</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Avg Render Time</div>
          <div className="text-2xl font-bold text-white mb-1">{metrics.avgDuration}ms</div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <span>✓</span>
            <span>{metrics.avgDuration < 200 ? 'Within target' : 'Slow'}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Wasted Renders</div>
          <div className="text-2xl font-bold text-white mb-1">{metrics.avoidableRenders}</div>
          {metrics.avoidableRenders > 0 ? (
            <div className="text-xs text-yellow-400 flex items-center gap-1">
              <span>⚠</span>
              <span>Needs attention</span>
            </div>
          ) : (
            <div className="text-xs text-green-400 flex items-center gap-1">
              <span>✓</span>
              <span>None</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Optimization Score</div>
          <div className={`text-2xl font-bold mb-1 ${getScoreColor(metrics.optimizationScore)}`}>
            {metrics.optimizationScore}/100
          </div>
          <div className="text-xs text-blue-400 flex items-center gap-1">
            <span>ℹ</span>
            <span>{getScoreLabel(metrics.optimizationScore)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

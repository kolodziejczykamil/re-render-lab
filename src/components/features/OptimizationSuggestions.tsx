'use client';

import React from 'react';
import { Card } from '../ui/Card';
import type { OptimizationSuggestion } from '@/features/simulator/types';

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
}

export function OptimizationSuggestions({ suggestions }: OptimizationSuggestionsProps) {
  const getImpactColor = (impact: OptimizationSuggestion['impact']) => {
    switch (impact) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card title="Optimization Suggestions">
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No optimization suggestions available
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white">{suggestion.id}. {suggestion.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs border ${getImpactColor(suggestion.impact)}`}
                >
                  Impact: {suggestion.impact}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{suggestion.description}</p>
              <p className="text-xs text-slate-400 mb-2">
                <strong>Recommendation:</strong> {suggestion.recommendation}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestion.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

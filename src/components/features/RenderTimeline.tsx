'use client';

import React from 'react';
import { Card } from '../ui/Card';
import type { RenderEvent } from '@/features/simulator/types';

interface RenderTimelineProps {
  events: RenderEvent[];
  highlightAvoidable: boolean;
}

export function RenderTimeline({ events, highlightAvoidable }: RenderTimelineProps) {
  const getEventIcon = (type: RenderEvent['type'], avoidable: boolean) => {
    if (type === 'initial') return '✓';
    if (avoidable) return '⚠';
    if (type === 'parent') return '✗';
    return '✓';
  };

  const getEventColor = (type: RenderEvent['type'], avoidable: boolean) => {
    if (type === 'initial') return 'text-green-400';
    if (avoidable) return 'text-yellow-400';
    if (type === 'parent') return 'text-red-400';
    return 'text-green-400';
  };

  const getStatusLabel = (type: RenderEvent['type'], avoidable: boolean) => {
    if (type === 'initial') return 'Expected';
    if (avoidable) return 'Avoidable';
    if (type === 'parent') return 'Performance Issue';
    return 'Expected';
  };

  const getStatusColor = (type: RenderEvent['type'], avoidable: boolean) => {
    if (type === 'initial') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (avoidable) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (type === 'parent') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getEventDescription = (event: RenderEvent) => {
    if (event.type === 'initial') {
      return 'Component first mounted to DOM.';
    }
    if (event.type === 'prop') {
      return `props.${Object.keys(event.props || {})[0] || 'unknown'} changed`;
    }
    if (event.type === 'state') {
      return `${Object.keys(event.state || {})[0] || 'state'} updated via setState`;
    }
    if (event.type === 'parent') {
      return 'Parent component re-rendered unnecessarily';
    }
    return 'useEffect executed';
  };

  return (
    <Card
      title="Render Timeline"
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">{events.length} renders</span>
          <button 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Refresh timeline"
          >
            🔄
          </button>
        </div>
      }
    >
      <div className="space-y-4" role="log" aria-live="polite" aria-label="Render timeline">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-500 transition-colors">
            Run simulation to see render timeline
          </div>
        ) : (
          events.map((event) => {
            const shouldHighlight = highlightAvoidable && event.avoidable;
            return (
              <div
                key={event.id}
                className={`p-4 rounded-lg border transition-colors ${
                  shouldHighlight
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600'
                }`}
                role="article"
                aria-label={`Render event ${event.id}: ${event.reason}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`text-2xl ${getEventColor(event.type, event.avoidable)}`}
                  >
                    {getEventIcon(event.type, event.avoidable)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white transition-colors">
                        Render #{event.id} - {event.type === 'initial' ? 'Initial Mount' : event.type === 'prop' ? 'Prop Change' : event.type === 'state' ? 'State Update' : event.type === 'parent' ? 'Parent Re-render' : 'Effect Execution'}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                          event.type,
                          event.avoidable
                        )}`}
                      >
                        {getStatusLabel(event.type, event.avoidable)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{getEventDescription(event)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                      {event.timestamp}ms • Duration: {event.duration}ms
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

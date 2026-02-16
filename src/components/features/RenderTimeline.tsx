'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { RenderEvent } from '@/features/simulator/types';

interface RenderTimelineProps {
  events: RenderEvent[];
  highlightAvoidable: boolean;
  onCopyReport?: () => void;
  onExportJSON?: () => void;
}

export function RenderTimeline({ 
  events, 
  highlightAvoidable,
  onCopyReport,
  onExportJSON,
}: RenderTimelineProps) {
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());
  const previousEventsLengthRef = React.useRef(events.length);

  // Highlight new renders with animation
  useEffect(() => {
    if (events.length > previousEventsLengthRef.current) {
      const newEvents = events.slice(previousEventsLengthRef.current);
      const newIds = new Set(newEvents.map((e) => e.id));
      setHighlightedIds(newIds);
      
      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedIds(new Set());
      }, 2000);
    }
    previousEventsLengthRef.current = events.length;
  }, [events]);

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

  const getTooltipText = (type: RenderEvent['type'], avoidable: boolean) => {
    if (type === 'initial') return 'Initial render when component mounts. This is expected and necessary.';
    if (avoidable) return 'This render could be avoided with proper optimization (React.memo, useCallback, useMemo).';
    if (type === 'parent') return 'Performance issue: Parent re-render triggered unnecessary child re-render.';
    return 'Expected render due to prop or state change.';
  };

  const handleCopyReport = () => {
    const report = events.map((e) => ({
      id: e.id,
      type: e.type,
      avoidable: e.avoidable,
      reason: e.reason,
      duration: e.duration,
      timestamp: e.timestamp,
    })).join('\n');
    
    navigator.clipboard.writeText(report);
    onCopyReport?.();
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(events, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'render-report.json';
    a.click();
    URL.revokeObjectURL(url);
    onExportJSON?.();
  };

  return (
    <Card
      title="Render Timeline"
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">{events.length} renders</span>
          {events.length > 0 && (
            <>
              <button 
                onClick={handleCopyReport}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Copy report"
                title="Copy report to clipboard"
              >
                📋
              </button>
              <button 
                onClick={handleExportJSON}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Export JSON"
                title="Export as JSON"
              >
                💾
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-4" role="log" aria-live="polite" aria-label="Render timeline">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">⚛️</div>
            <p className="text-slate-600 dark:text-slate-500 transition-colors mb-2">
              No render events yet
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-600 transition-colors">
              Add scenarios and run simulation to see render timeline
            </p>
          </div>
        ) : (
          events.map((event) => {
            const shouldHighlight = highlightAvoidable && event.avoidable;
            const isNewlyAdded = highlightedIds.has(event.id);
            return (
              <div
                key={event.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  isNewlyAdded
                    ? 'animate-pulse ring-2 ring-indigo-500'
                    : ''
                } ${
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
                    title={getTooltipText(event.type, event.avoidable)}
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
                        title={getTooltipText(event.type, event.avoidable)}
                      >
                        {getStatusLabel(event.type, event.avoidable)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{event.reason}</p>
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

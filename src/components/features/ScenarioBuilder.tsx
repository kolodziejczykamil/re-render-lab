'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import type { ScenarioEvent } from '@/features/simulator/types';

interface ScenarioBuilderProps {
  scenarios: ScenarioEvent[];
  onAdd: (type?: ScenarioEvent['type']) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ScenarioEvent>) => void;
  onReset: () => void;
}

export function ScenarioBuilder({
  scenarios,
  onAdd,
  onRemove,
  onUpdate,
  onReset,
}: ScenarioBuilderProps) {
  const eventTypeOptions = [
    { value: 'prop', label: 'Prop change' },
    { value: 'state', label: 'State change' },
    { value: 'parent', label: 'Parent re-render' },
    { value: 'effect', label: 'Effect execution' },
  ];

  return (
    <Card
      title="Scenario Builder"
      headerActions={
        <Button onClick={() => onAdd('prop')} size="sm">
          + Add Change
        </Button>
      }
    >
      <div className="space-y-3">
        {scenarios.map((scenario, index) => (
          <div
            key={scenario.id}
            className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium transition-colors">
              {index + 1}
            </div>
            <Select
              options={eventTypeOptions}
              value={scenario.type}
              onChange={(e) =>
                onUpdate(scenario.id, { type: e.target.value as ScenarioEvent['type'] })
              }
              className="flex-1"
            />
            {(scenario.type === 'prop' || scenario.type === 'state') && (
              <Input
                type="text"
                placeholder={scenario.type === 'prop' ? 'prop name' : 'state name'}
                value={scenario.key || ''}
                onChange={(e) => onUpdate(scenario.id, { key: e.target.value })}
                className="flex-1"
              />
            )}
            {scenario.type === 'parent' && (
              <Input
                type="text"
                placeholder="Optional label"
                value={scenario.label || ''}
                onChange={(e) => onUpdate(scenario.id, { label: e.target.value })}
                className="flex-1"
              />
            )}
            <button
              onClick={() => onRemove(scenario.id)}
              className="text-red-400 hover:text-red-300 transition-colors p-2"
              aria-label="Remove scenario"
            >
              🗑️
            </button>
          </div>
        ))}
        {scenarios.length === 0 && (
          <div className="text-center py-8 text-slate-600 dark:text-slate-500 transition-colors">
            No scenarios configured. Click &quot;+ Add Change&quot; to add one.
          </div>
        )}
      </div>

      {scenarios.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
            {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} configured
          </span>
          <button
            onClick={onReset}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            aria-label="Reset all scenarios"
          >
            Reset all
          </button>
        </div>
      )}
    </Card>
  );
}

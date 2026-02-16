'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import type { SimulationSettings } from '@/features/simulator/types';

interface SimulationSettingsProps {
  settings: SimulationSettings;
  onChange: (settings: Partial<SimulationSettings>) => void;
}

export function SimulationSettingsComponent({
  settings,
  onChange,
}: SimulationSettingsProps) {
  const speedOptions = [
    { value: 'slow', label: 'Slow' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Fast' },
  ];

  return (
    <Card title="Simulation Settings">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Animation Speed</label>
          <Select
            options={speedOptions}
            value={settings.animationSpeed}
            onChange={(e) => onChange({ animationSpeed: e.target.value as SimulationSettings['animationSpeed'] })}
            className="w-full"
          />
        </div>
        <Toggle
          checked={settings.showConsoleLogs}
          onChange={(checked) => onChange({ showConsoleLogs: checked })}
          label="Show Console Logs"
        />
        <Toggle
          checked={settings.highlightAvoidableRenders}
          onChange={(checked) => onChange({ highlightAvoidableRenders: checked })}
          label="Highlight Wasted Renders"
        />
      </div>
    </Card>
  );
}

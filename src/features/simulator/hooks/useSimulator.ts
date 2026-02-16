'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { analyzeComponent } from '../logic/analyzer';
import { simulateRenders } from '../logic/simulator';
import { generateOptimizationSuggestions } from '../rules/optimization';
import { calculatePerformanceMetrics } from '../logic/metrics';
import type { ComponentAnalysis, RenderEvent, ScenarioEvent, OptimizationSuggestion, PerformanceMetrics, SimulationSettings } from '../types';

const defaultCode = `import React, { useState } from 'react';

function UserCard({ name, age }) {
  const [count, setCount] = useState(0);

  // This will cause re-render
  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div onClick={handleClick}>
      {name} - {age} - Clicks: {count}
    </div>
  );
}`;

export function useSimulator() {
  const [code, setCode] = useState<string>(defaultCode);
  const [scenarios, setScenarios] = useState<ScenarioEvent[]>([]);
  const [settings, setSettings] = useState<SimulationSettings>({
    animationSpeed: 'normal',
    highlightAvoidableRenders: true,
    showConsoleLogs: true,
  });
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedCode, setDebouncedCode] = useState<string>(defaultCode);

  // Debounce code analysis to avoid re-renders on every keystroke
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedCode(newCode);
    }, 300);
  }, []);

  const analysis = useMemo(() => analyzeComponent(debouncedCode), [debouncedCode]);

  const renderEvents = useMemo(() => {
    if (!analysis.isValid || scenarios.length === 0) {
      return [];
    }
    return simulateRenders(analysis, scenarios);
  }, [analysis, scenarios]);

  const suggestions = useMemo(() => {
    if (renderEvents.length === 0) {
      return [];
    }
    return generateOptimizationSuggestions(analysis, renderEvents);
  }, [analysis, renderEvents]);

  const metrics = useMemo(() => {
    if (renderEvents.length === 0) {
      return {
        totalRenders: 0,
        avoidableRenders: 0,
        avgDuration: 0,
        optimizationScore: 100,
      };
    }
    return calculatePerformanceMetrics(renderEvents);
  }, [renderEvents]);

  const addScenario = useCallback((type: ScenarioEvent['type'], key?: string, label?: string) => {
    const newScenario: ScenarioEvent = {
      id: `scenario-${Date.now()}-${Math.random()}`,
      type,
      key,
      label,
    };
    setScenarios((prev) => [...prev, newScenario]);
  }, []);

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateScenario = useCallback((id: string, updates: Partial<ScenarioEvent>) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const reorderScenarios = useCallback((fromIndex: number, toIndex: number) => {
    setScenarios((prev) => {
      const newScenarios = [...prev];
      const [moved] = newScenarios.splice(fromIndex, 1);
      newScenarios.splice(toIndex, 0, moved);
      return newScenarios;
    });
  }, []);

  const resetScenarios = useCallback(() => {
    setScenarios([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SimulationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    code,
    setCode: handleCodeChange,
    analysis,
    scenarios,
    addScenario,
    removeScenario,
    updateScenario,
    reorderScenarios,
    resetScenarios,
    renderEvents,
    suggestions,
    metrics,
    settings,
    updateSettings,
  };
}

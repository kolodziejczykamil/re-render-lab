'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { analyzeComponent } from '../logic/analyzer';
import { simulateRenders } from '../logic/simulator';
import { generateOptimizationSuggestions } from '../rules/optimization';
import { calculatePerformanceMetrics } from '../logic/metrics';
import { loadSimulationFromUrl, getShareableUrl, type ShareableSimulation } from '../lib/urlEncoding';
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
  const [isSimulating, setIsSimulating] = useState(false);
  const [settings, setSettings] = useState<SimulationSettings>({
    animationSpeed: 'normal',
    highlightAvoidableRenders: true,
    showConsoleLogs: true,
  });
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedCode, setDebouncedCode] = useState<string>(defaultCode);

  // Load simulation from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loaded = loadSimulationFromUrl();
      if (loaded) {
        setCode(loaded.code);
        setDebouncedCode(loaded.code);
        if (loaded.scenarios.length > 0) {
          setScenarios(loaded.scenarios.map((s, i) => ({
            id: `scenario-${i}-${Date.now()}`,
            type: s.type as ScenarioEvent['type'],
            key: s.key,
            label: s.label,
          })));
        }
      }
    }
  }, []);

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
    return calculatePerformanceMetrics(renderEvents, analysis);
  }, [renderEvents, analysis]);

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

  const simulate = useCallback(async () => {
    if (!analysis.isValid || scenarios.length === 0) {
      return;
    }
    
    setIsSimulating(true);
    
    // Simulate 250ms processing delay
    await new Promise((resolve) => setTimeout(resolve, 250));
    
    setIsSimulating(false);
  }, [analysis.isValid, scenarios.length]);

  const getShareUrl = useCallback(() => {
    const shareable: ShareableSimulation = {
      code,
      scenarios: scenarios.map((s) => ({
        type: s.type,
        key: s.key,
        label: s.label,
      })),
    };
    return getShareableUrl(shareable);
  }, [code, scenarios]);

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
    isSimulating,
    simulate,
    getShareUrl,
  };
}

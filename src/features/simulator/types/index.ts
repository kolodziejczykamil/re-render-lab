export type ScenarioEventType = 'prop' | 'state' | 'parent' | 'effect';

export interface ScenarioEvent {
  id: string;
  type: ScenarioEventType;
  key?: string;
  label?: string;
}

export type RenderEventType = 'initial' | 'prop' | 'state' | 'parent' | 'effect';

export interface RenderEvent {
  id: number;
  type: RenderEventType;
  avoidable: boolean;
  duration: number;
  reason: string;
  timestamp: number;
  props?: Record<string, unknown>;
  state?: Record<string, unknown>;
}

export interface ComponentAnalysis {
  hasInlineArrowFunctions: boolean;
  hasInlineObjectLiterals: boolean;
  hasInlineArrayLiterals: boolean;
  hasUseEffectWithoutDeps: boolean;
  hasUseEffectWithDeps: boolean;
  useEffectDeps: string[];
  hasReactMemo: boolean;
  stateHooksCount: number;
  stateHookNames: string[];
  componentName?: string;
  hasPropsDestructuring: boolean;
  isValid: boolean;
  validationError?: string;
}

export type OptimizationImpact = 'Low' | 'Medium' | 'High';

export interface OptimizationSuggestion {
  id: number;
  title: string;
  description: string;
  impact: OptimizationImpact;
  recommendation: string;
  keywords: string[];
}

export interface PerformanceMetrics {
  totalRenders: number;
  avoidableRenders: number;
  avgDuration: number;
  optimizationScore: number;
}

export interface SimulationSettings {
  animationSpeed: 'slow' | 'normal' | 'fast';
  highlightAvoidableRenders: boolean;
  showConsoleLogs: boolean;
}

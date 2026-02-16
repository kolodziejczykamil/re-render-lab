'use client';

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ComponentCodeEditor } from '@/components/features/ComponentCodeEditor';
import { ScenarioBuilder } from '@/components/features/ScenarioBuilder';
import { SimulationSettingsComponent } from '@/components/features/SimulationSettings';
import { RenderTimeline } from '@/components/features/RenderTimeline';
import { OptimizationSuggestions } from '@/components/features/OptimizationSuggestions';
import { PerformanceMetricsComponent } from '@/components/features/PerformanceMetrics';
import { useSimulator } from '@/features/simulator/hooks/useSimulator';

export default function Home() {
  const simulator = useSimulator();

  const handleSimulate = () => {
    if (!simulator.analysis.isValid) {
      return;
    }
    if (simulator.scenarios.length === 0) {
      // Auto-add initial render scenario if none exist
      simulator.addScenario('prop', 'name', 'Initial prop change');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ComponentCodeEditor
              code={simulator.code}
              onChange={simulator.setCode}
              isValid={simulator.analysis.isValid}
              validationError={simulator.analysis.validationError}
              onSimulate={handleSimulate}
            />
            <ScenarioBuilder
              scenarios={simulator.scenarios}
              onAdd={(type) => simulator.addScenario(type || 'prop')}
              onRemove={simulator.removeScenario}
              onUpdate={simulator.updateScenario}
              onReset={simulator.resetScenarios}
            />
            <SimulationSettingsComponent
              settings={simulator.settings}
              onChange={simulator.updateSettings}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <RenderTimeline
              events={simulator.renderEvents}
              highlightAvoidable={simulator.settings.highlightAvoidableRenders}
            />
            <OptimizationSuggestions suggestions={simulator.suggestions} />
            <PerformanceMetricsComponent metrics={simulator.metrics} />
          </div>
        </div>
      </main>
      
      {/* SEO Content Section */}
      <section className="container mx-auto px-6 py-12 max-w-4xl">
        <article>
          <h2 className="text-3xl font-bold text-white mb-6">Why React Components Re-render</h2>
          <p className="text-slate-300 mb-4">
            React components re-render when their state or props change, or when their parent component re-renders. 
            Understanding when and why re-renders occur is crucial for building performant React applications.
          </p>
          <p className="text-slate-300 mb-8">
            Common causes of re-renders include state updates, prop changes, parent re-renders, and context updates. 
            While some re-renders are necessary and expected, others can be avoided through proper optimization techniques.
          </p>

          <h2 className="text-3xl font-bold text-white mb-6 mt-12">How This Simulator Works</h2>
          <p className="text-slate-300 mb-4">
            This React Re-render Simulator uses static code analysis and rule-based heuristics to simulate component 
            re-renders. It analyzes your component code to detect patterns like inline functions, inline objects, 
            missing memoization, and improper useEffect dependencies.
          </p>
          <p className="text-slate-300 mb-4">
            The simulator is not a real React runtime—it uses deterministic rules to predict when re-renders would 
            occur based on your code structure and the scenarios you configure. This makes it a powerful learning and 
            optimization tool.
          </p>
          <p className="text-slate-300 mb-8">
            By visualizing render events and receiving optimization suggestions, you can learn React performance best 
            practices and identify potential issues before they impact your application.
          </p>

          <h2 className="text-3xl font-bold text-white mb-6 mt-12">Common React Performance Mistakes</h2>
          <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8">
            <li>Creating inline arrow functions in JSX props, causing child components to re-render unnecessarily</li>
            <li>Creating inline object or array literals in props, creating new references on every render</li>
            <li>Not using React.memo for components that receive stable props but re-render due to parent updates</li>
            <li>Missing dependency arrays in useEffect hooks, causing effects to run on every render</li>
            <li>Over-using state hooks in a single component, causing unnecessary re-renders of unrelated UI</li>
            <li>Not using useCallback or useMemo for expensive computations or function references</li>
          </ul>

          <h2 className="text-3xl font-bold text-white mb-6 mt-12">Frequently Asked Questions</h2>
          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Is this a real React runtime?</h3>
              <p className="text-slate-300">
                No, this simulator uses static analysis and rule-based heuristics to predict re-renders. 
                It&apos;s designed for learning and optimization, not for running actual React code.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">How accurate are the simulations?</h3>
              <p className="text-slate-300">
                The simulations are based on well-established React patterns and best practices. While they provide 
                accurate predictions for common scenarios, actual React behavior may vary in edge cases.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Can I use this in production?</h3>
              <p className="text-slate-300">
                This tool is designed for development and learning purposes. Use it to understand React re-render 
                patterns and optimize your components before deploying to production.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">What makes a render &quot;avoidable&quot;?</h3>
              <p className="text-slate-300">
                A render is considered avoidable if it could be prevented through optimization techniques like 
                React.memo, useCallback, useMemo, or proper dependency management in useEffect hooks.
              </p>
            </div>
          </div>
        </article>
      </section>

      <Footer />
    </div>
  );
}

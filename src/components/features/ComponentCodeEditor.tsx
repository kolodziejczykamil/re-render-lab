'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ComponentCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  isValid: boolean;
  validationError?: string;
  onSimulate: () => void;
  hasScenarios: boolean;
  isSimulating?: boolean;
}

export function ComponentCodeEditor({
  code,
  onChange,
  isValid,
  validationError,
  onSimulate,
  hasScenarios,
  isSimulating = false,
}: ComponentCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut: Ctrl/Cmd + Enter to simulate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isValid && hasScenarios && !isSimulating) {
          onSimulate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isValid, hasScenarios, isSimulating, onSimulate]);

  return (
    <Card title="</> Component Code">
      <div className="mb-4">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 transition-colors" aria-label="File name">UserCard.jsx</div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm p-4 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
          placeholder="Enter your React component code here..."
          aria-label="Component code editor"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 transition-colors">Valid React Component</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-600 dark:text-red-400 transition-colors">{validationError || 'Invalid component'}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
          </span>
          <Button 
            onClick={onSimulate} 
            size="lg" 
            aria-label="Run simulation"
            disabled={!isValid || !hasScenarios || isSimulating}
          >
            <span className="flex items-center gap-2">
              {isSimulating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>Simulate Re-renders</span>
                </>
              )}
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

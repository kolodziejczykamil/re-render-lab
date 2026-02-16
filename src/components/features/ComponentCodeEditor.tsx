'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ComponentCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  isValid: boolean;
  validationError?: string;
  onSimulate: () => void;
}

export function ComponentCodeEditor({
  code,
  onChange,
  isValid,
  validationError,
  onSimulate,
}: ComponentCodeEditorProps) {
  return (
    <Card title="</> Component Code">
      <div className="mb-4">
        <div className="text-sm text-slate-400 mb-2" aria-label="File name">UserCard.jsx</div>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 bg-slate-900 text-slate-100 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Enter your React component code here..."
          aria-label="Component code editor"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-400">Valid React Component</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-400">{validationError || 'Invalid component'}</span>
            </>
          )}
        </div>
        <Button onClick={onSimulate} size="lg" aria-label="Run simulation">
          <span className="flex items-center gap-2">
            <span>▶</span>
            <span>Simulate Re-renders</span>
          </span>
        </Button>
      </div>
    </Card>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';

export function Header() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check system preference or localStorage
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored ? stored === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newIsDark = !prev;
      
      // Update DOM immediately
      const html = document.documentElement;
      if (newIsDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      
      // Save to localStorage
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      
      return newIsDark;
    });
  }, []);

  if (!mounted) {
    return (
      <header className="border-b border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚛️</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">React Re-render Simulator</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">Visualize component lifecycle</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚛️</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">React Re-render Simulator</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                  Built for React developers
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                Visualize and optimize React component re-renders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
              type="button"
            >
              {isDark ? '🌙' : '☀️'}
            </button>
            <a
              href="https://github.com/kamilkolodziejczyk/re-render-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="View on GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

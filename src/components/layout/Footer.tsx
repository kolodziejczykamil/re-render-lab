import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900 mt-auto">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div>© 2024 React Re-render Simulator. Built for developers.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Examples</a>
            <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

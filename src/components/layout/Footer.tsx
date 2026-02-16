import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 mt-auto transition-colors">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400 transition-colors">
          <div className="flex items-center gap-4">
            <div>© {currentYear} Kamil Kołodziejczyk</div>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>v1.0.0</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>MIT License</span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/kamilkolodziejczyk/re-render-lab" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="View on GitHub"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

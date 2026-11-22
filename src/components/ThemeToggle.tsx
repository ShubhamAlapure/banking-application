'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Determine current active mode
    const checkDark = () => {
      const stored = localStorage.getItem('color-scheme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const active = stored === 'dark' || (!stored && prefersDark);
      setIsDark(active);
      if (active) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    checkDark();

    // Listen to storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'color-scheme') {
        const stored = e.newValue;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const active = stored === 'dark' || (!stored && prefersDark);
        setIsDark(active);
        if (active) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Listen to system preference changes when no explicit override is pinned
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMedia = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('color-scheme')) {
        setIsDark(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    mql.addEventListener('change', handleMedia);

    return () => {
      window.removeEventListener('storage', handleStorage);
      mql.removeEventListener('change', handleMedia);
    };
  }, []);

  const toggleTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentIsDark = document.documentElement.classList.contains('dark');
    const targetDark = !currentIsDark;

    // In accordance with modern-web-guidance dark-mode-toggle standard:
    // If target differs from system preference, store literally ('dark' or 'light').
    // If target matches system preference, remove stored key to restore native system sync.
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (targetDark !== prefersDark) {
      const val = targetDark ? 'dark' : 'light';
      try {
        localStorage.setItem('color-scheme', val);
      } catch {}
      if (meta) meta.setAttribute('content', val);
    } else {
      try {
        localStorage.removeItem('color-scheme');
      } catch {}
      if (meta) meta.setAttribute('content', 'light dark');
    }

    if (targetDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  };

  if (!mounted) {
    // Avoid hydration mismatch by rendering placeholder structure
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-slate-400 opacity-60 ${
          compact ? 'w-9 h-9' : 'px-3 py-1.5 h-9'
        } ${className}`}
        aria-hidden="true"
      >
        <Moon className="w-4 h-4" />
        {!compact && <span className="ml-1.5 text-xs font-bold">Theme</span>}
      </div>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isDark
            ? 'bg-slate-800/95 border-slate-700 text-amber-400 hover:bg-slate-700 hover:border-slate-600 shadow-2xs'
            : 'bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200/90 hover:border-slate-300 shadow-2xs'
        } ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative inline-flex items-center gap-2.5 px-3 py-1.5 h-9 rounded-xl border transition-all cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isDark
          ? 'bg-slate-800/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600 shadow-2xs shadow-black/40'
          : 'bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200/80 hover:border-slate-300 shadow-2xs'
      } ${className}`}
    >
      <div className="flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>

      <span className="text-xs font-bold tracking-tight">
        {isDark ? 'Light' : 'Dark'}
      </span>

      {/* Modern pill indicator switch */}
      <div
        className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
          isDark ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-white shadow-xs transition-transform" />
      </div>
    </button>
  );
}

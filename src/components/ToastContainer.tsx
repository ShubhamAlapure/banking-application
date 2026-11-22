'use client';

import React from 'react';
import { useDemo } from '@/context/DemoContext';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useDemo();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              isError
                ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                : isSuccess
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                : isWarning
                ? 'bg-amber-50/95 border-amber-200 text-amber-900'
                : 'bg-indigo-50/95 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {!isError && !isSuccess && !isWarning && <Info className="w-5 h-5 text-indigo-600" />}
            </div>

            <div className="flex-1 text-sm">
              <p className="font-semibold">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs opacity-90">{toast.message}</p>}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

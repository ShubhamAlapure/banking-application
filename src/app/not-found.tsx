'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-500 mb-6">
          The requested banking resource or page could not be located.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

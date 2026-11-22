'use client';

import React, { useState } from 'react';
import { useDemo } from '@/context/DemoContext';
import { MessageSquare, X, Copy, Check, Trash2, Smartphone, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function SimulatedSmsInbox() {
  const { smsList, isSmsOpen, setIsSmsOpen, clearSmsList } = useDemo();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsSmsOpen(!isSmsOpen)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 border border-slate-700 text-sm font-medium"
        aria-label="Open simulated SMS inbox"
      >
        <div className="relative">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          {smsList.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          )}
        </div>
        <span>Simulated SMS Inbox</span>
        {smsList.length > 0 && (
          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold">
            {smsList.length}
          </span>
        )}
      </button>

      {/* Floating SMS Drawer / Panel */}
      {isSmsOpen && (
        <div className="fixed bottom-16 left-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Simulated SMS Inbox</h3>
                <p className="text-[11px] text-slate-400">Offline Demo Environment</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {smsList.length > 0 && (
                <button
                  type="button"
                  onClick={clearSmsList}
                  title="Clear messages"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSmsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                aria-label="Close SMS inbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mandatory Simulation Warning Notice */}
          <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200 flex items-center gap-2 text-amber-800 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Simulated OTP – no SMS is sent (Works offline)</span>
          </div>

          {/* Messages Feed */}
          <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-3 bg-slate-50/70">
            {smsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No simulated SMS received yet.</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Initiate a fund transfer to receive a simulated OTP here.
                </p>
              </div>
            ) : (
              smsList.map((sms) => (
                <div
                  key={sms.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 transition-all hover:border-indigo-300"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-800 tracking-wider">
                      {sms.sender || 'VK-DEMOBANK'}
                    </span>
                    <span>{sms.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Your One-Time Password for transaction{' '}
                    <span className="font-medium text-slate-900">{sms.referenceNo || 'TXN'}</span>{' '}
                    {sms.amount ? `of ${formatCurrency(sms.amount)}` : ''} is:
                  </p>

                  <div className="my-2.5 p-2 bg-indigo-50/80 rounded-lg border border-indigo-100 flex items-center justify-between">
                    <span className="text-xl font-mono font-bold tracking-widest text-indigo-700">
                      {sms.otp}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(sms.id, sms.otp)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      {copiedId === sms.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy OTP</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Valid for 5 minutes. Do not share this OTP with anyone.
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

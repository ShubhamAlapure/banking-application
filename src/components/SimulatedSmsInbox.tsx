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
      {/* Floating Trigger Button: Clean, High-End Light Card */}
      <button
        type="button"
        onClick={() => setIsSmsOpen(!isSmsOpen)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-slate-800 shadow-xl hover:shadow-2xl border border-slate-200/90 hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-xs font-bold group"
        aria-label="Open simulated SMS inbox"
      >
        <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <Smartphone className="w-3.5 h-3.5" />
          {smsList.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          )}
        </div>
        <span className="text-slate-700 group-hover:text-slate-900">Simulated SMS Inbox</span>
        {smsList.length > 0 ? (
          <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold shadow-xs">
            {smsList.length} NEW
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-normal">Offline</span>
        )}
      </button>

      {/* Floating SMS Drawer / Panel: Premium Light Fintech Card */}
      {isSmsOpen && (
        <div className="fixed bottom-20 left-5 z-40 w-96 max-w-[calc(100vw-2.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 leading-tight">
                  Simulated SMS Inbox
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Self-Contained Offline Simulation</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {smsList.length > 0 && (
                <button
                  type="button"
                  onClick={clearSmsList}
                  title="Clear messages"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSmsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Close SMS inbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mandatory Simulation Warning Notice */}
          <div className="bg-amber-50/90 px-4 py-2 border-b border-amber-200/70 flex items-center gap-2 text-amber-900 text-[11px] font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Simulated OTP – no SMS is sent (Works offline)</span>
          </div>

          {/* Messages Feed */}
          <div className="p-3.5 overflow-y-auto flex-1 flex flex-col gap-3 bg-slate-50/50">
            {smsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2.5 text-slate-300">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-600">Inbox is empty</p>
                <p className="mt-1 text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Initiate a fund transfer to receive simulated OTP messages here.
                </p>
              </div>
            ) : (
              smsList.map((sms) => (
                <div
                  key={sms.id}
                  className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span className="font-bold text-slate-800 tracking-wider">
                      {sms.sender || 'VK-APEXBANK'}
                    </span>
                    <span className="font-mono">{sms.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Your One-Time Password for transaction{' '}
                    <span className="font-mono font-bold text-slate-900">{sms.referenceNo || 'TXN'}</span>{' '}
                    {sms.amount ? `of ${formatCurrency(sms.amount)}` : ''} is:
                  </p>

                  <div className="my-2.5 p-2.5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <span className="text-2xl font-mono font-black tracking-widest text-indigo-700">
                      {sms.otp}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(sms.id, sms.otp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
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

                  <p className="text-[10px] text-slate-400 font-medium">
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

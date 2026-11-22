'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SimulatedSms {
  id: string;
  sender: string;
  otp: string;
  amount?: number;
  recipient?: string;
  timestamp: Date;
  referenceNo?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface DemoContextType {
  smsList: SimulatedSms[];
  addSimulatedSms: (sms: Omit<SimulatedSms, 'id' | 'timestamp'>) => void;
  clearSmsList: () => void;
  isSmsOpen: boolean;
  setIsSmsOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  latestOtp: string | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [smsList, setSmsList] = useState<SimulatedSms[]>([]);
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [latestOtp, setLatestOtp] = useState<string | null>(null);

  const addSimulatedSms = (sms: Omit<SimulatedSms, 'id' | 'timestamp'>) => {
    const newSms: SimulatedSms = {
      ...sms,
      id: 'sms-' + Date.now(),
      timestamp: new Date(),
    };
    setSmsList((prev) => [newSms, ...prev]);
    setLatestOtp(sms.otp);
    setIsSmsOpen(true); // Automatically slide open SMS drawer when OTP arrives!
    
    addToast({
      type: 'info',
      title: 'Simulated SMS Received',
      message: `OTP: ${sms.otp} (Simulated - no actual SMS sent)`,
    });
  };

  const clearSmsList = () => {
    setSmsList([]);
    setLatestOtp(null);
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <DemoContext.Provider
      value={{
        smsList,
        addSimulatedSms,
        clearSmsList,
        isSmsOpen,
        setIsSmsOpen,
        toasts,
        addToast,
        removeToast,
        latestOtp,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

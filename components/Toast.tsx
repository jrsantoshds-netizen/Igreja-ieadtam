'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'ok' | 'err' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'ok') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-[18px] right-[18px] z-[9999] flex flex-col gap-[7px]">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`
              px-[18px] py-[12px] rounded-lg text-white text-[13px] font-semibold 
              shadow-[0_6px_24px_rgba(0,0,0,0.18)] flex items-center gap-[8px] animate-in slide-in-from-right fade-in duration-300
              ${t.type === 'ok' ? 'bg-[var(--color-success)]' : t.type === 'err' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-info)]'}
            `}
          >
            {t.type === 'ok' && <CheckCircle size={16} />}
            {t.type === 'err' && <AlertCircle size={16} />}
            {t.type === 'info' && <Info size={16} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be within Provider');
  return ctx;
}

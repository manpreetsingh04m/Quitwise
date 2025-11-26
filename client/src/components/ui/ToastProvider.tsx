import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastInternal extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const getId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = getId();
      const toast: ToastInternal = {
        id,
        ...options,
        type: options.type || 'info',
        duration: options.duration ?? 4000,
      };
      setToasts((current) => [...current, toast]);

      setTimeout(() => removeToast(id), toast.duration);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-[320px] rounded-xl border bg-white/95 p-4 shadow-lg backdrop-blur ${
              toast.type === 'success'
                ? 'border-green-100'
                : toast.type === 'error'
                ? 'border-red-100'
                : 'border-blue-100'
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                toast.type === 'success'
                  ? 'text-green-700'
                  : toast.type === 'error'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}
            >
              {toast.title}
            </p>
            {toast.description && (
              <p className="mt-1 text-xs text-gray-600">{toast.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};


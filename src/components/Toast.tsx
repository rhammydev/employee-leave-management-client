import { createContext, useState, type ReactNode } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function push(type: ToastType, message: string) {
    const id = Date.now();
    setToasts(current => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id));
    }, 4000);
  }

  function remove(id: number) {
    setToasts(current => current.filter(toast => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={{ success: message => push('success', message), error: message => push('error', message) }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm
              ${toast.type === 'success'
                ? 'border-green-100 bg-green-50/95 text-green-800'
                : 'border-red-100 bg-red-50/95 text-red-800'
              }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <XCircle size={18} className="mt-0.5 shrink-0" />
            )}
            <p className="flex-1 text-sm leading-5">{toast.message}</p>
            <button
              onClick={() => remove(toast.id)}
              className="mt-0.5 shrink-0 rounded-lg p-1 text-current/60 hover:bg-black/5 hover:text-current"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

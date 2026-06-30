import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { NotificationContext, ToastMessage, ToastType } from '../contexts/NotificationContext';
import { DSToastItem } from '../components/design-system/DSDialog';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const triggerToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast: ToastMessage = { id, type, message, duration };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ toasts, triggerToast, removeToast }}>
      {children}
      {/* Toast queue overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <DSToastItem
                id={toast.id}
                type={toast.type}
                message={toast.message}
                onClose={removeToast}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

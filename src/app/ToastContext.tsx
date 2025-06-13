// ToastContext.tsx
import { IonToast } from '@ionic/react';
import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext<any>(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<{ message: string, open: boolean }>({ message: '', open: false });

  const showToast = (message: string) => setToast({ message, open: true });
  const closeToast = () => setToast({ ...toast, open: false });

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <IonToast
        isOpen={toast.open}
        message={toast.message}
        onDidDismiss={closeToast}
        duration={3000}
        position="top"
      />
    </ToastContext.Provider>
  );
};
import { createContext, useContext } from 'react';

export const ToastContext = createContext({
  show: (msg, type) => {},
});

export function useToast() {
  return useContext(ToastContext);
}

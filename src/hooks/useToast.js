import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  }, []);

  return { toast, showToast };
}; 
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications((current) => [...current, { id, type, message }]);
    window.setTimeout(() => removeNotification(id), 4000);
  }, [removeNotification]);

  const notifySuccess = useCallback((message) => notify('success', message), [notify]);
  const notifyError = useCallback((message) => notify('error', message), [notify]);
  const notifyWarning = useCallback((message) => notify('warning', message), [notify]);
  const notifyInfo = useCallback((message) => notify('info', message), [notify]);

  const value = useMemo(
    () => ({
      notifications,
      removeNotification,
      notifySuccess,
      notifyError,
      notifyWarning,
      notifyInfo
    }),
    [notifications, removeNotification, notifySuccess, notifyError, notifyWarning, notifyInfo]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }

  return context;
}

// Made with Bob

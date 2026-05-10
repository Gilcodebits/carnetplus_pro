import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  lu: number;
  created_at: string;
  patient_id?: number;
  rdv_id?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await notificationAPI.getAll(user.id);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshNotifications();
    // Poll for notifications every 10 seconds
    const interval = setInterval(refreshNotifications, 10000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = async (id: number) => {
    if (!user?.id) return;
    await notificationAPI.markRead(id, user.id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: 1 } : n));
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    await notificationAPI.markAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, lu: 1 })));
  };

  const deleteNotification = async (id: number) => {
    if (!user?.id) return;
    await notificationAPI.delete(id, user.id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteAll = async () => {
    if (!user?.id) return;
    await notificationAPI.deleteAll(user.id);
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, refreshNotifications,
      markAsRead, markAllAsRead, deleteNotification, deleteAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};

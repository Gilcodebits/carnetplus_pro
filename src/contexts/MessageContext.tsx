import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { messagesAPI } from '../services/api';

interface MessageContextType {
  unreadMessagesCount: number;
  refreshMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const refreshMessages = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await messagesAPI.list();
      const count = data.filter((m: any) => 
        Number(m.lu) === 0 && Number(m.destinataire_id) === Number(user.id)
      ).length;
      setUnreadMessagesCount(count);
    } catch (err) {
      console.error("Error fetching messages count:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [refreshMessages]);

  return (
    <MessageContext.Provider value={{ unreadMessagesCount, refreshMessages }}>
      {children}
    </MessageContext.Provider>
  );
}

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) throw new Error("useMessages must be used within a MessageProvider");
  return context;
};

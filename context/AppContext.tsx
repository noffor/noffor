// context/AppContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { UserLocation, Notification } from '@/types';
import { getCountryByCode } from '@/lib/utils';

interface AppContextType {
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (notification: Partial<Notification>) => void;
  currentCountry: any;
  setCurrentCountry: (country: any) => void;
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, initialCountry = 'qa' }: { children: ReactNode; initialCountry?: string }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentCountry, setCurrentCountry] = useState(getCountryByCode(initialCountry));
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Location denied')
      );
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notification: Partial<Notification>) => {
    const newNotification = {
      id: Date.now().toString(),
      user_id: notification.user_id || '',
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'info',
      is_read: false,
      created_at: new Date().toISOString(),
    } as Notification;
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  };

  return (
    <AppContext.Provider value={{
      userLocation, setUserLocation,
      notifications, unreadCount, markAsRead, clearNotifications, addNotification,
      currentCountry, setCurrentCountry,
      isOnline
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
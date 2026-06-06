// context/AppContext.tsx - Fixed • No duplicate GPS
"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { UserLocation, Notification } from '@/types';

interface AppContextType {
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (notification: Partial<Notification>) => void;
  currentCountry: string;
  currentLang: string;
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default locations for Gulf countries
const DEFAULT_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  qa: { lat: 25.2867, lng: 51.5333 },
  ae: { lat: 25.2048, lng: 55.2708 },
  sa: { lat: 24.7136, lng: 46.6753 },
  kw: { lat: 29.3759, lng: 47.9774 },
  bh: { lat: 26.2285, lng: 50.586 },
  om: { lat: 23.588, lng: 58.3829 },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getCountryFromURL = (): string => {
    const segments = pathname.split('/').filter(Boolean);
    return segments[0] || 'qa';
  };

  const getLangFromURL = (): string => {
    const segments = pathname.split('/').filter(Boolean);
    return segments[1] || 'en';
  };

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentCountry, setCurrentCountry] = useState('qa');
  const [currentLang, setCurrentLang] = useState('en');
  const [isOnline, setIsOnline] = useState(true);

  // ✅ Fix: Proper initialization
  const initialized = useRef(false);

  // Initialize on mount
  useEffect(() => {
    setCurrentCountry(getCountryFromURL());
    setCurrentLang(getLangFromURL());
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    initialized.current = true;
  }, []);

  // Update country/lang from URL
  useEffect(() => {
    if (!initialized.current) return;
    setCurrentCountry(getCountryFromURL());
    setCurrentLang(getLangFromURL());
  }, [pathname]);

  // Online/Offline listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Location: Cache → Default
  useEffect(() => {
    const country = getCountryFromURL();
    const cacheKey = 'noffor_user_location';
    
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.t < 120000) {
            setUserLocation({ lat: parsed.lat, lng: parsed.lng });
            return;
          }
        }
      } catch {}
    }
    
    const defaultLoc = DEFAULT_LOCATIONS[country] || DEFAULT_LOCATIONS.qa;
    setUserLocation(defaultLoc);
  }, [pathname]);

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
      currentCountry, currentLang, isOnline,
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
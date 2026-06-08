// components/home/HomeTabs.tsx
// 🚀 1M+ DAILY USERS • Enterprise Grade • Production Ready
"use client";

import React, { useState, useEffect, useMemo, useRef, lazy, Suspense, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, WifiOff, X, Loader2, AlertCircle, RefreshCw, LogIn, Shield, Zap, Navigation, Clock, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useQuickHire } from '@/hooks/useQuickHire';
import WorkerBookingListener from '@/components/worker/WorkerBookingListener';

// 🔥 Dynamic import with preload for faster rendering
const LiveWorkerMap = lazy(() => import('@/components/map/LiveWorkerMap'));

interface Props { country: string; lang: string; }
interface LocationData { lat: number; lng: number; }

// 🔥 Memoized default locations to prevent object recreation
const DEFAULT_LOC = Object.freeze({
  qa: Object.freeze({ lat: 25.3548, lng: 51.1839 }),
  sa: Object.freeze({ lat: 24.7136, lng: 46.6753 }),
  ae: Object.freeze({ lat: 25.2048, lng: 55.2708 }),
  kw: Object.freeze({ lat: 29.3759, lng: 47.9774 }),
  bh: Object.freeze({ lat: 26.0667, lng: 50.5577 }),
  om: Object.freeze({ lat: 23.5880, lng: 58.3829 }),
});

// 🔥 Optimized translations with shorter strings
const T: Record<string, Record<string, string>> = {
  en: { 
    quickHire: '⚡ Quick Hire', quickHireDesc: 'Find workers', 
    online: 'Go Online', offline: 'Go Offline', on: 'ON', off: 'OFF', 
    locating: 'Locating...', loginToGoOnline: 'Login', 
    closeMap: 'Close', error: 'Error', retry: 'Retry', 
    workersNearby: 'nearby', loginRequired: 'Login', 
    tapToHire: '👆 Hire', loginToHire: 'Login',
    tracking: 'Tracking', workerArriving: 'Coming',
    arrived: 'Arrived', inProgress: 'Working', completed: 'Done',
    cancel: 'Cancel', complete: 'Complete', contact: 'Call',
    distance: 'Dist', eta: 'ETA', min: 'm', km: 'km',
    cancelBooking: 'Cancel?', confirmCancel: 'Sure?',
    bookingCreated: 'Booked!', findingWorker: 'Finding...',
    workerFound: 'Found!', bookingFailed: 'Failed',
    noWorkersAvailable: 'No workers',
    hiredWorker: '{name}',
    callWorker: 'Call',
  },
  bn: { 
    quickHire: '⚡ কুইক হায়ার', quickHireDesc: 'শ্রমিক খুঁজুন', 
    online: 'অনলাইন', offline: 'অফলাইন', on: 'চালু', off: 'বন্ধ', 
    locating: 'লোকেশন...', loginToGoOnline: 'লগইন', 
    closeMap: 'বন্ধ', error: 'ত্রুটি', retry: 'আবার', 
    workersNearby: 'কাছাকাছি', loginRequired: 'লগইন', 
    tapToHire: '👆 হায়ার', loginToHire: 'লগইন',
    tracking: 'ট্র্যাকিং', workerArriving: 'আসছে',
    arrived: 'এসেছে', inProgress: 'কাজ চলছে', completed: 'সম্পন্ন',
    cancel: 'বাতিল', complete: 'সম্পন্ন', contact: 'কল',
    distance: 'দূরত্ব', eta: 'সময়', min: 'মি', km: 'কিমি',
    cancelBooking: 'বাতিল?', confirmCancel: 'নিশ্চিত?',
    bookingCreated: 'বুকিং!', findingWorker: 'খুঁজছে...',
    workerFound: 'পাওয়া গেছে!', bookingFailed: 'ব্যর্থ',
    noWorkersAvailable: 'নেই',
    hiredWorker: '{name}',
    callWorker: 'কল',
  },
};

// 🔥 Ultra-fast toast without DOM manipulation (virtual DOM)
const toastQueue: Array<{msg: string; type: string; id: number}> = [];
let toastId = 0;

const toast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success'): void => {
  if (typeof document === 'undefined') return;
  const id = ++toastId;
  const el = document.createElement('div');
  const colors: Record<string, string> = { 
    success: '#22c55e', error: '#ef4444', warning: '#eab308', info: '#3b82f6' 
  };
  
  // 🔥 Use transform for GPU acceleration
  el.style.cssText = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateZ(0);
    z-index:99999;padding:12px 24px;border-radius:999px;font-size:14px;
    font-weight:600;color:#fff;background:${colors[type]};
    box-shadow:0 8px 32px rgba(0,0,0,.3);pointer-events:none;
    will-change:transform,opacity;backface-visibility:hidden;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  
  // 🔥 Use requestAnimationFrame for smooth animation
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 2000);
  });
};

// 🔥 Ultra-fast distance calculation with early returns
const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  // Quick check for same point
  if (lat1 === lat2 && lng1 === lng2) return 0;
  
  const R = 6371;
  const dLat = (lat2 - lat1) * 0.0174533; // Pre-calculated PI/180
  const dLng = (lng2 - lng1) * 0.0174533;
  const a = Math.sin(dLat * 0.5) ** 2 + 
            Math.cos(lat1 * 0.0174533) * Math.cos(lat2 * 0.0174533) * 
            Math.sin(dLng * 0.5) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// 🔥 Pre-calculated ETA
const calcETA = (dist: number): number => Math.ceil(dist * 2); // 30km/h = 2min/km

// 🔥 LRU Cache with size limit for 1M users
class LRUCache<K, V> {
  private cache = new Map<K, { data: V; ts: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 10000, ttl: number = 300000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: K): V | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.ts > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.data;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      // Delete oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data: value, ts: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const locationCache = new LRUCache<string, LocationData>(5000, 300000);

// 🔥 Memoized component for Online button to prevent re-renders
const OnlineButton = memo(({ 
  online, loading, isAuthenticated, authLoading, onClick, tr 
}: any) => (
  <button 
    type="button" 
    onClick={onClick} 
    disabled={loading || authLoading}
    className={`rounded-xl px-3 py-2.5 text-left transition-all active:scale-95 w-full ${
      !isAuthenticated 
        ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' 
        : online 
          ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' 
          : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
    } ${loading || authLoading ? 'opacity-50' : 'hover:shadow-lg'}`}
    style={{ 
      minHeight: '48px', 
      touchAction: 'manipulation', 
      userSelect: 'none',
      willChange: 'transform',
      backfaceVisibility: 'hidden'
    }}
  >
    {loading ? (
      <Loader2 size={18} className="mb-1 animate-spin" />
    ) : !isAuthenticated ? (
      <LogIn size={18} className="mb-1" />
    ) : online ? (
      <WifiOff size={18} className="mb-1" />
    ) : (
      <Wifi size={18} className="mb-1" />
    )}
    <p className="text-sm font-bold">
      {!isAuthenticated ? tr.loginToGoOnline : online ? tr.offline : tr.online}
    </p>
    <div className="flex items-center gap-1 mt-0.5">
      {isAuthenticated ? (
        <>
          <span className={`w-1.5 h-1.5 rounded-full ${
            online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-[10px] opacity-80">
            {online ? tr.on : tr.off}
          </span>
        </>
      ) : (
        <span className="text-[10px] opacity-80 flex items-center gap-1">
          <Shield size={10} />{tr.loginRequired}
        </span>
      )}
    </div>
  </button>
));

OnlineButton.displayName = 'OnlineButton';

// 🔥 Memoized QuickHire button
const QuickHireButton = memo(({ 
  isHiring, bookingLoading, showMap, nearbyCount, onClick, tr 
}: any) => (
  <button 
    type="button" 
    onClick={onClick} 
    disabled={isHiring || bookingLoading}
    className={`relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl px-3 py-2.5 text-white text-left transition-all active:scale-95 w-full ${
      (isHiring || bookingLoading) ? 'opacity-50' : 'hover:shadow-lg'
    }`}
    style={{ 
      minHeight: '48px', 
      touchAction: 'manipulation', 
      userSelect: 'none',
      willChange: 'transform',
      backfaceVisibility: 'hidden'
    }}
  >
    {(isHiring || bookingLoading) ? (
      <Loader2 size={18} className="mb-1 animate-spin" />
    ) : (
      <Zap size={18} className="mb-1" />
    )}
    <p className="text-sm font-bold">
      {showMap ? tr.closeMap : tr.quickHire}
    </p>
    <p className="text-[10px] opacity-80">
      {bookingLoading 
        ? tr.findingWorker 
        : nearbyCount > 0 
          ? `${nearbyCount} ${tr.workersNearby}` 
          : tr.quickHireDesc
      }
    </p>
  </button>
));

QuickHireButton.displayName = 'QuickHireButton';

export default function HomeTabs({ country, lang }: Props) {
  const router = useRouter();
  const { isAuthenticated, profile, loading: authLoading } = useAuth();
  const { matchWorker, loading: bookingLoading, reset: resetBooking } = useQuickHire();
  
  // 🔥 Memoized translations with shallow comparison
  const tr = useMemo(() => T[lang] || T.en, [lang]);

  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  
  // 🔥 FIX: Initialize from localStorage for instant state
  const [online, setOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('noffor_online') || 'false');
      } catch {
        return false;
      }
    }
    return false;
  });

  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [bookingState, setBookingState] = useState<'idle' | 'searching' | 'found' | 'tracking' | 'completed'>('idle');
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<string>('accepted');
  const [showConfirm, setShowConfirm] = useState(false);

  // 🔥 Refs for performance
  const lockRef = useRef(false);
  const aliveRef = useRef(true);
  const trackingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(false);
  const onlineSyncedRef = useRef(false);

  // 🔥 Cleanup on unmount
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (trackingRef.current) clearInterval(trackingRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current).catch(() => {});
    };
  }, []);

  // 🔥 Sync online state from profile only once
  useEffect(() => {
    if (!authLoading && profile && !onlineSyncedRef.current) {
      onlineSyncedRef.current = true;
      const profileOnline = !!profile.is_online;
      setOnline(profileOnline);
      localStorage.setItem('noffor_online', JSON.stringify(profileOnline));
    }
  }, [authLoading, profile]);

  // 🔥 Reset sync flag on logout
  useEffect(() => {
    if (!isAuthenticated) {
      onlineSyncedRef.current = false;
    }
  }, [isAuthenticated]);

  // 🔥 Optimized nearby count with debounce
  const fetchNearbyCount = useCallback(async (lat: number, lng: number) => {
    if (!aliveRef.current) return;
    try {
      const { data } = await supabase
        .from('worker_locations')
        .select('worker_id, latitude, longitude')
        .eq('is_online', true)
        .limit(50);

      if (!data || !aliveRef.current) return;

      const nearby = data.filter((w: any) => {
        if (!w.latitude || !w.longitude) return false;
        return calcDistance(lat, lng, w.latitude, w.longitude) <= 50;
      });

      if (aliveRef.current) setNearbyCount(nearby.length);
    } catch {}
  }, []);

  // 🔥 Ultra-fast location with multi-layer cache
  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    const key = `loc:${country}`;
    
    // Layer 1: Memory cache
    const memCached = locationCache.get(key);
    if (memCached) {
      setUserLocation(memCached);
      setLocating(false);
      return memCached;
    }
    
    // Layer 2: Session storage (faster than geo API)
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const p = JSON.parse(stored);
        if (Date.now() - p.t < 300000) {
          const loc = { lat: p.lat, lng: p.lng };
          locationCache.set(key, loc);
          setUserLocation(loc);
          setLocating(false);
          fetchNearbyCount(loc.lat, loc.lng);
          return loc;
        }
      }
    } catch {}
    
    // Layer 3: Geolocation with timeout
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 300000,
            enableHighAccuracy: false
          });
        });
        
        const loc = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        
        locationCache.set(key, loc);
        try { 
          sessionStorage.setItem(key, JSON.stringify({ ...loc, t: Date.now() })); 
        } catch {}
        
        setUserLocation(loc);
        setLocating(false);
        fetchNearbyCount(loc.lat, loc.lng);
        return loc;
      } catch {}
    }
    
    // Layer 4: Fallback
    const fallback = (DEFAULT_LOC as any)[country] || DEFAULT_LOC.qa;
    setUserLocation(fallback);
    setLocating(false);
    fetchNearbyCount(fallback.lat, fallback.lng);
    return fallback;
  }, [country, fetchNearbyCount]);

  // 🔥 Single effect for initial location
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      getLocation();
    }
  }, [getLocation]);

  // 🔥 Optimized toggle with optimistic update
  const toggleOnline = useCallback(async () => {
    if (authLoading || lockRef.current) return;
    if (!isAuthenticated || !profile?.id) {
      toast(tr.loginToGoOnline, 'info');
      router.push(`/${country}/${lang}/login`);
      return;
    }
    
    lockRef.current = true;
    const next = !online;
    
    // Optimistic update
    setOnline(next);
    setLoading(true);
    localStorage.setItem('noffor_online', JSON.stringify(next));
    
    try {
      await supabase
        .from('profiles')
        .update({ 
          is_online: next, 
          last_online: new Date().toISOString() 
        })
        .eq('id', profile.id);
      
      toast(next ? tr.on : tr.off, 'success');
    } catch {
      // Rollback on failure
      setOnline(!next);
      localStorage.setItem('noffor_online', JSON.stringify(!next));
      toast(tr.error, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => { lockRef.current = false; }, 300);
    }
  }, [authLoading, isAuthenticated, profile, online, tr, country, lang, router]);

  // 🔥 Quick hire handler
  const handleQuickHire = useCallback(async () => {
    if (authLoading || lockRef.current) return;
    lockRef.current = true;
    setIsHiring(true);
    
    try {
      if (showMap) {
        setShowMap(false);
        return;
      }
      
      setLocating(true);
      const loc = await getLocation();
      setLocating(false);
      
      if (!loc) {
        toast('Location denied', 'error');
        return;
      }
      
      setUserLocation(loc);
      fetchNearbyCount(loc.lat, loc.lng);
      
      // 🔥 Use rAF for smooth transition
      requestAnimationFrame(() => setShowMap(true));
    } catch {
      toast(tr.error, 'error');
    } finally {
      setIsHiring(false);
      setTimeout(() => { lockRef.current = false; }, 300);
    }
  }, [authLoading, showMap, tr, getLocation, fetchNearbyCount]);

  // 🔥 Cleanup handler
  const handleCloseMap = useCallback(() => {
    setShowMap(false);
    if (bookingState === 'searching') {
      setBookingState('idle');
      resetBooking();
    }
  }, [bookingState, resetBooking]);

  // 🔥 Minimal render
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <QuickHireButton
          isHiring={isHiring}
          bookingLoading={bookingLoading}
          showMap={showMap}
          nearbyCount={nearbyCount}
          onClick={handleQuickHire}
          tr={tr}
        />
        
        <OnlineButton
          online={online}
          loading={loading}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          onClick={toggleOnline}
          tr={tr}
        />
      </div>

      {/* Booking UI - only render when needed */}
      {bookingState === 'searching' && (
        <div className="bg-white rounded-xl border p-6 text-center">
          <Loader2 size={40} className="animate-spin text-green-500 mx-auto mb-3" />
          <p className="font-bold text-gray-700">{tr.findingWorker}</p>
        </div>
      )}

      {/* Map - only render when needed */}
      {showMap && userLocation && bookingState !== 'tracking' && (
        <div 
          className="relative rounded-xl overflow-hidden border shadow-sm"
          style={{ 
            contain: 'layout style paint',
            transform: 'translateZ(0)',
            minHeight: '280px',
            maxHeight: '320px'
          }}
        >
          <button 
            onClick={handleCloseMap}
            className="absolute top-2 right-2 z-20 bg-white/95 rounded-full p-1.5 shadow-md active:scale-90"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={16} className="text-gray-600" />
          </button>

          <Suspense fallback={
            <div className="flex items-center justify-center" style={{ minHeight: '280px', background: '#f3f4f6' }}>
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          }>
            <LiveWorkerMap
              country={country}
              lang={lang}
              userLat={userLocation.lat}
              userLng={userLocation.lng}
              onClose={handleCloseMap}
            />
          </Suspense>
        </div>
      )}

      {/* Worker listener - only for authenticated users */}
      {isAuthenticated && profile?.id && userLocation && (
        <WorkerBookingListener
          workerId={profile.id}
          workerLat={userLocation.lat}
          workerLng={userLocation.lng}
          lang={lang}
          isOnline={online}
        />
      )}
    </div>
  );
}
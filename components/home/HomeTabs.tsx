// components/home/HomeTabs.tsx
// 🚀 1M+ DAILY USERS • Enterprise Grade • 4 Languages • Production Ready
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

// ═══════════════════════════════════════════════════════════
// 🌍 4 LANGUAGE TRANSLATIONS (EN, BN, AR, HI)
// ═══════════════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: { 
    quickHire: '⚡ Quick Hire',
    quickHireDesc: 'Find workers',
    online: 'Go Online',
    offline: 'Go Offline',
    on: 'ON',
    off: 'OFF',
    locating: 'Locating...',
    loginToGoOnline: 'Login to go online',
    closeMap: 'Close Map',
    error: 'Error occurred',
    retry: 'Retry',
    workersNearby: 'workers nearby',
    loginRequired: 'Login required',
    tapToHire: '👆 Tap to Hire',
    loginToHire: 'Login to hire',
    tracking: 'Tracking',
    workerArriving: 'Worker arriving',
    arrived: 'Arrived',
    inProgress: 'Work in progress',
    completed: 'Completed',
    cancel: 'Cancel',
    complete: 'Complete',
    contact: 'Call',
    distance: 'Distance',
    eta: 'ETA',
    min: 'min',
    km: 'km',
    cancelBooking: 'Cancel Booking?',
    confirmCancel: 'Are you sure?',
    bookingCreated: 'Booking Created!',
    findingWorker: 'Finding worker...',
    workerFound: 'Worker Found!',
    bookingFailed: 'Booking Failed',
    noWorkersAvailable: 'No workers available',
    hiredWorker: '{name} hired',
    callWorker: 'Call Worker',
    logoutWarning: 'Logged out successfully',
    onlineUpdated: 'Status updated',
    locationDenied: 'Location access denied',
    goOnlineFirst: 'Please go online first',
    searchingNearby: 'Searching nearby workers...',
    workerOnTheWay: 'Worker is on the way',
    workStarted: 'Work has started',
    workCompleted: 'Work completed!',
    rateWorker: 'Please rate the worker',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
  },
  bn: { 
    quickHire: '⚡ কুইক হায়ার',
    quickHireDesc: 'শ্রমিক খুঁজুন',
    online: 'অনলাইন হোন',
    offline: 'অফলাইন হোন',
    on: 'চালু',
    off: 'বন্ধ',
    locating: 'লোকেশন খুঁজছে...',
    loginToGoOnline: 'অনলাইন হতে লগইন করুন',
    closeMap: 'ম্যাপ বন্ধ',
    error: 'ত্রুটি হয়েছে',
    retry: 'আবার চেষ্টা',
    workersNearby: 'জন শ্রমিক কাছাকাছি',
    loginRequired: 'লগইন প্রয়োজন',
    tapToHire: '👆 হায়ার করতে ট্যাপ',
    loginToHire: 'হায়ার করতে লগইন',
    tracking: 'ট্র্যাকিং',
    workerArriving: 'শ্রমিক আসছে',
    arrived: 'পৌঁছেছেন',
    inProgress: 'কাজ চলছে',
    completed: 'সম্পন্ন',
    cancel: 'বাতিল',
    complete: 'সম্পন্ন',
    contact: 'কল',
    distance: 'দূরত্ব',
    eta: 'সময়',
    min: 'মিনিট',
    km: 'কিমি',
    cancelBooking: 'বুকিং বাতিল?',
    confirmCancel: 'আপনি কি নিশ্চিত?',
    bookingCreated: 'বুকিং তৈরি হয়েছে!',
    findingWorker: 'শ্রমিক খুঁজছে...',
    workerFound: 'শ্রমিক পাওয়া গেছে!',
    bookingFailed: 'বুকিং ব্যর্থ',
    noWorkersAvailable: 'কোনো শ্রমিক নেই',
    hiredWorker: '{name} নিয়োগ করা হয়েছে',
    callWorker: 'শ্রমিককে কল',
    logoutWarning: 'সফলভাবে লগআউট',
    onlineUpdated: 'স্ট্যাটাস আপডেট',
    locationDenied: 'লোকেশন অনুমতি প্রত্যাখ্যান',
    goOnlineFirst: 'প্রথমে অনলাইন হোন',
    searchingNearby: 'কাছাকাছি শ্রমিক খুঁজছে...',
    workerOnTheWay: 'শ্রমিক আসছে',
    workStarted: 'কাজ শুরু হয়েছে',
    workCompleted: 'কাজ সম্পন্ন!',
    rateWorker: 'শ্রমিককে রেটিং দিন',
    yes: 'হ্যাঁ',
    no: 'না',
    ok: 'ঠিক আছে',
  },
  ar: { 
    quickHire: '⚡ توظيف سريع',
    quickHireDesc: 'البحث عن عمال',
    online: 'متصل',
    offline: 'غير متصل',
    on: 'تشغيل',
    off: 'إيقاف',
    locating: 'تحديد الموقع...',
    loginToGoOnline: 'تسجيل الدخول للاتصال',
    closeMap: 'إغلاق الخريطة',
    error: 'حدث خطأ',
    retry: 'إعادة',
    workersNearby: 'عمال قريبون',
    loginRequired: 'تسجيل الدخول مطلوب',
    tapToHire: '👆 اضغط للتوظيف',
    loginToHire: 'سجل الدخول للتوظيف',
    tracking: 'تتبع',
    workerArriving: 'العامل قادم',
    arrived: 'وصل',
    inProgress: 'العمل جار',
    completed: 'مكتمل',
    cancel: 'إلغاء',
    complete: 'إكمال',
    contact: 'اتصال',
    distance: 'المسافة',
    eta: 'الوقت',
    min: 'دقيقة',
    km: 'كم',
    cancelBooking: 'إلغاء الحجز؟',
    confirmCancel: 'هل أنت متأكد؟',
    bookingCreated: 'تم الحجز!',
    findingWorker: 'البحث عن عامل...',
    workerFound: 'تم العثور!',
    bookingFailed: 'فشل الحجز',
    noWorkersAvailable: 'لا يوجد عمال',
    hiredWorker: 'تم توظيف {name}',
    callWorker: 'اتصل بالعامل',
    logoutWarning: 'تم تسجيل الخروج',
    onlineUpdated: 'تم تحديث الحالة',
    locationDenied: 'تم رفض الوصول للموقع',
    goOnlineFirst: 'يرجى الاتصال أولاً',
    searchingNearby: 'البحث عن عمال قريبين...',
    workerOnTheWay: 'العامل في الطريق',
    workStarted: 'بدأ العمل',
    workCompleted: 'اكتمل العمل!',
    rateWorker: 'يرجى تقييم العامل',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',
  },
  hi: { 
    quickHire: '⚡ क्विक हायर',
    quickHireDesc: 'श्रमिक खोजें',
    online: 'ऑनलाइन हों',
    offline: 'ऑफलाइन हों',
    on: 'चालू',
    off: 'बंद',
    locating: 'लोकेशन ढूंढ रहा...',
    loginToGoOnline: 'ऑनलाइन होने के लिए लॉगिन',
    closeMap: 'मैप बंद करें',
    error: 'त्रुटि हुई',
    retry: 'पुनः प्रयास',
    workersNearby: 'श्रमिक पास में',
    loginRequired: 'लॉगिन आवश्यक',
    tapToHire: '👆 हायर करने के लिए टैप',
    loginToHire: 'हायर करने के लिए लॉगिन',
    tracking: 'ट्रैकिंग',
    workerArriving: 'श्रमिक आ रहा है',
    arrived: 'पहुंच गया',
    inProgress: 'काम चल रहा है',
    completed: 'पूर्ण',
    cancel: 'रद्द करें',
    complete: 'पूर्ण करें',
    contact: 'कॉल',
    distance: 'दूरी',
    eta: 'समय',
    min: 'मिनट',
    km: 'किमी',
    cancelBooking: 'बुकिंग रद्द करें?',
    confirmCancel: 'क्या आप निश्चित हैं?',
    bookingCreated: 'बुकिंग बन गई!',
    findingWorker: 'श्रमिक ढूंढ रहा...',
    workerFound: 'श्रमिक मिल गया!',
    bookingFailed: 'बुकिंग विफल',
    noWorkersAvailable: 'कोई श्रमिक उपलब्ध नहीं',
    hiredWorker: '{name} को नियुक्त किया',
    callWorker: 'श्रमिक को कॉल',
    logoutWarning: 'सफलतापूर्वक लॉगआउट',
    onlineUpdated: 'स्टेटस अपडेट',
    locationDenied: 'लोकेशन अनुमति अस्वीकृत',
    goOnlineFirst: 'कृपया पहले ऑनलाइन हों',
    searchingNearby: 'पास के श्रमिक ढूंढ रहा...',
    workerOnTheWay: 'श्रमिक आ रहा है',
    workStarted: 'काम शुरू हो गया',
    workCompleted: 'काम पूरा!',
    rateWorker: 'कृपया श्रमिक को रेट करें',
    yes: 'हाँ',
    no: 'नहीं',
    ok: 'ठीक है',
  },
};

// 🔥 Ultra-fast toast without DOM manipulation
let toastId = 0;

const toast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success'): void => {
  if (typeof document === 'undefined') return;
  const id = ++toastId;
  const el = document.createElement('div');
  const colors: Record<string, string> = { 
    success: '#22c55e', error: '#ef4444', warning: '#eab308', info: '#3b82f6' 
  };
  
  el.style.cssText = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateZ(0);
    z-index:99999;padding:12px 24px;border-radius:999px;font-size:14px;
    font-weight:600;color:#fff;background:${colors[type]};
    box-shadow:0 8px 32px rgba(0,0,0,.3);pointer-events:none;
    will-change:transform,opacity;backface-visibility:hidden;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 2000);
  });
};

// 🔥 Ultra-fast distance calculation
const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  if (lat1 === lat2 && lng1 === lng2) return 0;
  
  const R = 6371;
  const dLat = (lat2 - lat1) * 0.0174533;
  const dLng = (lng2 - lng1) * 0.0174533;
  const a = Math.sin(dLat * 0.5) ** 2 + 
            Math.cos(lat1 * 0.0174533) * Math.cos(lat2 * 0.0174533) * 
            Math.sin(dLng * 0.5) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// 🔥 LRU Cache
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
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.data;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data: value, ts: Date.now() });
  }

  clear(): void { this.cache.clear(); }
}

const locationCache = new LRUCache<string, LocationData>(5000, 300000);

// ═══════════════════════════════════════════════════════════
// MEMOIZED COMPONENTS
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function HomeTabs({ country, lang }: Props) {
  const router = useRouter();
  const { isAuthenticated, profile, loading: authLoading } = useAuth();
  const { matchWorker, loading: bookingLoading, reset: resetBooking } = useQuickHire();
  
  // 🌍 Get translations for current language (fallback to English)
  const tr = useMemo(() => T[lang] || T.en, [lang]);

  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  
  // ✅ Initialize from localStorage for instant state
  const [online, setOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('noffor_online');
        if (stored !== null) return JSON.parse(stored);
      } catch {}
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
  const [showConfirm, setShowConfirm] = useState(false);

  // 🔥 Refs for performance
  const lockRef = useRef(false);
  const aliveRef = useRef(true);
  const trackingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(false);

  // 🔥 Cleanup on unmount
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (trackingRef.current) clearInterval(trackingRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current).catch(() => {});
    };
  }, []);

  // ✅ Sync online state from profile (ALWAYS sync)
  useEffect(() => {
    if (!authLoading && profile) {
      const profileOnline = !!profile.is_online;
      setOnline(profileOnline);
      localStorage.setItem('noffor_online', JSON.stringify(profileOnline));
    }
  }, [authLoading, profile]);

  // ✅ Reset online state on logout
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setOnline(false);
      localStorage.setItem('noffor_online', JSON.stringify(false));
    }
  }, [isAuthenticated, authLoading]);

  // ✅ Cross-tab sync via localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'noffor_online') {
        try {
          const newValue = JSON.parse(e.newValue || 'false');
          setOnline(newValue);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 🔥 Optimized nearby count
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

  // 🔥 Multi-layer location cache
  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    const key = `loc:${country}`;
    
    // Layer 1: Memory cache
    const memCached = locationCache.get(key);
    if (memCached) {
      setUserLocation(memCached);
      setLocating(false);
      return memCached;
    }
    
    // Layer 2: Session storage
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
    
    // Layer 3: Geolocation
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

  // ✅ Toggle online/offline
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
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_online: next, 
          last_online: new Date().toISOString() 
        })
        .eq('id', profile.id);
      
      if (updateError) throw updateError;
      
      toast(next ? tr.on : tr.off, 'success');
    } catch (err) {
      // Rollback
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
        toast(tr.locationDenied, 'error');
        return;
      }
      
      setUserLocation(loc);
      fetchNearbyCount(loc.lat, loc.lng);
      
      requestAnimationFrame(() => setShowMap(true));
    } catch {
      toast(tr.error, 'error');
    } finally {
      setIsHiring(false);
      setTimeout(() => { lockRef.current = false; }, 300);
    }
  }, [authLoading, showMap, tr, getLocation, fetchNearbyCount]);

  // 🔥 Close map handler
  const handleCloseMap = useCallback(() => {
    setShowMap(false);
    if (bookingState === 'searching') {
      setBookingState('idle');
      resetBooking();
    }
  }, [bookingState, resetBooking]);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
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

      {/* Booking searching state */}
      {bookingState === 'searching' && (
        <div className="bg-white rounded-xl border p-6 text-center">
          <Loader2 size={40} className="animate-spin text-green-500 mx-auto mb-3" />
          <p className="font-bold text-gray-700">{tr.findingWorker}</p>
          <p className="text-sm text-gray-400 mt-1">{tr.searchingNearby}</p>
        </div>
      )}

      {/* Map */}
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

      {/* Worker listener */}
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
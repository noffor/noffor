// components/home/HomeTabs.tsx
// 🚀 100% UBER-STYLE • Production Ready • All Fixed
"use client";

import React, { useState, useEffect, useMemo, useRef, lazy, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, WifiOff, X, Loader2, AlertCircle, RefreshCw, LogIn, Shield, Zap, Navigation, Clock, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useQuickHire } from '@/hooks/useQuickHire';
import WorkerBookingListener from '@/components/worker/WorkerBookingListener';

const LiveWorkerMap = lazy(() => import('@/components/map/LiveWorkerMap'));

interface Props { country: string; lang: string; }
interface LocationData { lat: number; lng: number; }

const DEFAULT_LOC: Record<string, LocationData> = {
  qa: { lat: 25.3548, lng: 51.1839 }, sa: { lat: 24.7136, lng: 46.6753 },
  ae: { lat: 25.2048, lng: 55.2708 }, kw: { lat: 29.3759, lng: 47.9774 },
  bh: { lat: 26.0667, lng: 50.5577 }, om: { lat: 23.5880, lng: 58.3829 },
};

const T: Record<string, Record<string, string>> = {
  en: { 
    quickHire: '⚡ Quick Hire', quickHireDesc: 'Find workers near you', 
    online: 'Go Online', offline: 'Go Offline', on: 'ON', off: 'OFF', 
    locating: 'Locating...', loginToGoOnline: 'Login to Go Online', 
    closeMap: 'Close', error: 'Error', retry: 'Retry', 
    workersNearby: 'workers nearby', loginRequired: 'Login required', 
    tapToHire: '👆 Tap to hire', loginToHire: 'Login',
    tracking: 'Live Tracking', workerArriving: 'Worker is coming',
    arrived: 'Worker Arrived', inProgress: 'In Progress', completed: 'Completed',
    cancel: 'Cancel', complete: 'Mark Complete', contact: 'Contact',
    distance: 'Distance', eta: 'ETA', min: 'min', km: 'km',
    cancelBooking: 'Cancel Booking', confirmCancel: 'Are you sure?',
    bookingCreated: 'Booking Created!', findingWorker: 'Finding nearest worker...',
    workerFound: 'Worker found!', bookingFailed: 'Booking failed',
    noWorkersAvailable: 'No workers available',
    hiredWorker: 'Hired: {name}',
    callWorker: 'Call Worker',
  },
  bn: { 
    quickHire: '⚡ কুইক হায়ার', quickHireDesc: 'আপনার কাছের শ্রমিক খুঁজুন', 
    online: 'অনলাইন হোন', offline: 'অফলাইন হোন', on: 'চালু', off: 'বন্ধ', 
    locating: 'লোকেশন নিচ্ছে...', loginToGoOnline: 'অনলাইন হতে লগইন করুন', 
    closeMap: 'বন্ধ', error: 'ত্রুটি', retry: 'আবার', 
    workersNearby: 'জন কাছাকাছি', loginRequired: 'লগইন প্রয়োজন', 
    tapToHire: '👆 হায়ার করতে ট্যাপ', loginToHire: 'লগইন',
    tracking: 'লাইভ ট্র্যাকিং', workerArriving: 'শ্রমিক আসছেন',
    arrived: 'শ্রমিক এসেছেন', inProgress: 'কাজ চলছে', completed: 'সম্পন্ন',
    cancel: 'বাতিল', complete: 'সম্পন্ন করুন', contact: 'যোগাযোগ',
    distance: 'দূরত্ব', eta: 'সময়', min: 'মিনিট', km: 'কিমি',
    cancelBooking: 'বুকিং বাতিল', confirmCancel: 'আপনি কি নিশ্চিত?',
    bookingCreated: 'বুকিং তৈরি হয়েছে!', findingWorker: 'নিকটতম শ্রমিক খোঁজা হচ্ছে...',
    workerFound: 'শ্রমিক পাওয়া গেছে!', bookingFailed: 'বুকিং ব্যর্থ',
    noWorkersAvailable: 'কোনো শ্রমিক পাওয়া যায়নি',
    hiredWorker: 'হায়ারকৃত: {name}',
    callWorker: 'শ্রমিককে কল করুন',
  },
  ar: { 
    quickHire: '⚡ توظيف سريع', quickHireDesc: 'ابحث عن عمال', 
    online: 'اتصل', offline: 'غير متصل', on: 'مفعل', off: 'معطل', 
    locating: 'تحديد...', loginToGoOnline: 'تسجيل الدخول', 
    closeMap: 'إغلاق', error: 'خطأ', retry: 'إعادة', 
    workersNearby: 'قريب', loginRequired: 'مطلوب', 
    tapToHire: '👆 اضغط للتوظيف', loginToHire: 'دخول',
    tracking: 'تتبع مباشر', workerArriving: 'العامل قادم',
    arrived: 'وصل العامل', inProgress: 'قيد التنفيذ', completed: 'مكتمل',
    cancel: 'إلغاء', complete: 'إكمال', contact: 'اتصال',
    distance: 'مسافة', eta: 'الوقت', min: 'دقيقة', km: 'كم',
    cancelBooking: 'إلغاء الحجز', confirmCancel: 'هل أنت متأكد؟',
    bookingCreated: 'تم إنشاء الحجز!', findingWorker: 'جاري البحث عن أقرب عامل...',
    workerFound: 'تم العثور على عامل!', bookingFailed: 'فشل الحجز',
    noWorkersAvailable: 'لا يوجد عمال متاحون',
    hiredWorker: 'تم التوظيف: {name}',
    callWorker: 'اتصل بالعامل',
  },
  hi: { 
    quickHire: '⚡ क्विक हायर', quickHireDesc: 'श्रमिक खोजें', 
    online: 'ऑनलाइन', offline: 'ऑफलाइन', on: 'चालू', off: 'बंद', 
    locating: 'स्थान...', loginToGoOnline: 'लॉगिन करें', 
    closeMap: 'बंद', error: 'त्रुटि', retry: 'पुनः', 
    workersNearby: 'पास', loginRequired: 'ज़रूरी', 
    tapToHire: '👆 हायर के लिए टैप', loginToHire: 'लॉगिन',
    tracking: 'लाइव ट्रैकिंग', workerArriving: 'श्रमिक आ रहे',
    arrived: 'श्रमिक आ गए', inProgress: 'प्रगति में', completed: 'पूर्ण',
    cancel: 'रद्द', complete: 'पूर्ण करें', contact: 'संपर्क',
    distance: 'दूरी', eta: 'समय', min: 'मिनट', km: 'किमी',
    cancelBooking: 'बुकिंग रद्द', confirmCancel: 'क्या आप सुनिश्चित हैं?',
    bookingCreated: 'बुकिंग बन गई!', findingWorker: 'नजदीकी श्रमिक ढूंढ रहे...',
    workerFound: 'श्रमिक मिल गया!', bookingFailed: 'बुकिंग विफल',
    noWorkersAvailable: 'कोई श्रमिक उपलब्ध नहीं',
    hiredWorker: 'हायर किया: {name}',
    callWorker: 'श्रमिक को कॉल करें',
  },
};

const toast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success'): void => {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  const colors: Record<string, string> = { success: '#22c55e', error: '#ef4444', warning: '#eab308', info: '#3b82f6' };
  el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;color:#fff;background:${colors[type]};box-shadow:0 8px 32px rgba(0,0,0,.3);pointer-events:none;animation:slideUp 0.3s ease;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3000);
};

const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const calcETA = (dist: number): number => Math.ceil((dist / 30) * 60);

const locationCache = new Map<string, { data: LocationData; ts: number }>();

export default function HomeTabs({ country, lang }: Props) {
  const router = useRouter();
  const { isAuthenticated, profile, loading: authLoading } = useAuth();
  const { matchWorker, booking, loading: bookingLoading, error: bookingError, reset: resetBooking } = useQuickHire();
  const tr = useMemo(() => T[lang] || T.en, [lang]);

  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCount, setNearbyCount] = useState(0);
  
  const [bookingState, setBookingState] = useState<'idle' | 'searching' | 'found' | 'tracking' | 'completed'>('idle');
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<any>(null);
  const [workerLocation, setWorkerLocation] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<string>('accepted');
  
  // ✅ Confirm dialog state
  const [showConfirm, setShowConfirm] = useState(false);

  const lockRef = useRef(false);
  const locationFetchedRef = useRef(false);
  const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bookingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const aliveRef = useRef(true);

  useEffect(() => { 
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  useEffect(() => { if (profile && isAuthenticated) setOnline(!!profile.is_online); }, [profile, isAuthenticated]);

  const fetchNearbyCount = useCallback(async (lat: number, lng: number) => {
    try {
      // ✅ Count only nearby workers (distance-based)
      const { data, error } = await supabase
        .from('worker_locations')
        .select('worker_id')
        .eq('is_online', true)
        .limit(50);

      if (error || !data) return;

      // Filter by distance (50km radius)
      const nearby = data.filter((w: any) => {
        if (!w.latitude || !w.longitude) return false;
        const dist = calcDistance(lat, lng, w.latitude, w.longitude);
        return dist <= 50;
      });

      setNearbyCount(nearby.length);
    } catch {}
  }, []);

  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    const key = `loc:${country}`;
    const cached = locationCache.get(key);
    if (cached && Date.now() - cached.ts < 300000) { 
      setUserLocation(cached.data); 
      setLocating(false);
      fetchNearbyCount(cached.data.lat, cached.data.lng);
      return cached.data; 
    }
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) { const p = JSON.parse(stored); if (Date.now() - p.t < 300000) { const loc = { lat: p.lat, lng: p.lng }; locationCache.set(key, { data: loc, ts: p.t }); setUserLocation(loc); setLocating(false); fetchNearbyCount(loc.lat, loc.lng); return loc; } }
    } catch {}
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => { navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }); });
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        locationCache.set(key, { data: loc, ts: Date.now() });
        try { sessionStorage.setItem(key, JSON.stringify({ ...loc, t: Date.now() })); } catch {}
        setUserLocation(loc); setLocating(false);
        fetchNearbyCount(loc.lat, loc.lng);
        return loc;
      } catch {}
    }
    const fallback = DEFAULT_LOC[country] || DEFAULT_LOC.qa;
    setUserLocation(fallback); setLocating(false);
    fetchNearbyCount(fallback.lat, fallback.lng);
    return fallback;
  }, [country, fetchNearbyCount]);

  useEffect(() => { if (!locationFetchedRef.current) { locationFetchedRef.current = true; getLocation(); } }, [getLocation]);

  const toggleOnline = useCallback(async () => {
    if (authLoading || lockRef.current) return;
    if (!isAuthenticated || !profile?.id) { toast(tr.loginToGoOnline, 'info'); router.push(`/${country}/${lang}/login`); return; }
    lockRef.current = true; const next = !online; setOnline(next); setLoading(true);
    try {
      localStorage.setItem('noffor_worker_online', JSON.stringify(next));
      await supabase.from('profiles').update({ is_online: next, last_online: new Date().toISOString() }).eq('id', profile.id);
      toast(next ? tr.on : tr.off, 'success');
    } catch { setOnline(!next); toast(tr.error, 'error'); }
    finally { setLoading(false); setTimeout(() => { lockRef.current = false; }, 500); }
  }, [authLoading, isAuthenticated, profile, online, tr, country, lang, router]);

  const handleQuickHire = useCallback(async () => {
    if (authLoading || lockRef.current) return;
    lockRef.current = true; setIsHiring(true);
    try {
      if (showMap) { setShowMap(false); return; }
      setLocating(true); const loc = await getLocation(); setLocating(false);
      if (!loc) { toast('Location denied', 'error'); return; }
      setUserLocation(loc);
      fetchNearbyCount(loc.lat, loc.lng);
      requestAnimationFrame(() => { setShowMap(true); });
    } catch { toast(tr.error, 'error'); }
    finally { setIsHiring(false); setTimeout(() => { lockRef.current = false; }, 500); }
  }, [authLoading, showMap, tr, getLocation, fetchNearbyCount]);

  const handleCloseMap = useCallback(() => { 
    setShowMap(false);
    if (bookingState === 'searching') {
      setBookingState('idle');
      resetBooking();
    }
  }, [bookingState, resetBooking]);

  const handleWorkerSelect = useCallback((worker: any) => {
    setSelectedWorkerForBooking(worker);
  }, []);

  const handleMapQuickHire = useCallback(async (worker: any) => {
    if (!isAuthenticated) { toast(tr.loginToHire, 'info'); router.push(`/${country}/${lang}/login`); return; }
    if (!userLocation || !profile?.id) return;

    setSelectedWorkerForBooking(worker);
    setBookingState('searching');
    setShowMap(false);
    toast(tr.findingWorker, 'info');

    try {
      const result = await matchWorker(
        userLocation.lat, userLocation.lng, country,
        profile.phone || profile.id, profile.name || 'Employer',
        worker?.profile?.category || 'all', worker?.price_estimate || 100
      );

      if (result) {
        setBookingData(result);
        setBookingState('tracking');
        setBookingStatus(result.status || 'accepted');
        toast(tr.workerFound.replace('{name}', result.worker?.profiles?.name || 'Worker'), 'success');
        startWorkerTracking(result.worker_id);
        listenBookingStatus(result.id);
      } else {
        setBookingState('idle');
        toast(tr.noWorkersAvailable, 'error');
      }
    } catch (err: any) {
      setBookingState('idle');
      toast(tr.bookingFailed, 'error');
    }
  }, [isAuthenticated, userLocation, profile, country, lang, router, tr, matchWorker]);

  const startWorkerTracking = useCallback((workerId: string) => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    const track = async () => {
      if (!aliveRef.current) return;
      try {
        const { data } = await supabase.from('worker_locations').select('latitude, longitude, is_online').eq('worker_id', workerId).single();
        if (data && aliveRef.current) setWorkerLocation(data);
      } catch {}
    };
    track();
    trackingIntervalRef.current = setInterval(track, 5000);
  }, []);

  // ✅ Fixed: Proper channel cleanup
  const listenBookingStatus = useCallback((bookingId: string) => {
    // Close previous channel
    if (bookingChannelRef.current) {
      supabase.removeChannel(bookingChannelRef.current).catch(() => {});
    }

    const channel = supabase
      .channel(`booking:${bookingId}:${Date.now()}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` }, 
        (payload: any) => {
          if (!aliveRef.current) return;
          const newStatus = payload.new.status;
          setBookingStatus(newStatus);
          if (newStatus === 'completed') { setBookingState('completed'); toast(tr.completed, 'success'); }
          else if (newStatus === 'cancelled') { setBookingState('idle'); toast(tr.cancelBooking, 'warning'); }
        }
      ).subscribe();

    bookingChannelRef.current = channel;
  }, [tr]);

  // ✅ Fixed: No window.confirm
  const updateBookingStatus = useCallback(async (status: string) => {
    if (!bookingData?.id) return;
    
    if (status === 'cancelled') {
      setShowConfirm(true);
      return;
    }

    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'completed') updates.completed_at = new Date().toISOString();
      await supabase.from('bookings').update(updates).eq('id', bookingData.id);
      setBookingStatus(status);
      if (status === 'completed') {
        setBookingState('idle');
        if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      }
    } catch (err) { console.error('Update error:', err); }
  }, [bookingData]);

  const confirmCancel = useCallback(async () => {
    setShowConfirm(false);
    if (!bookingData?.id) return;
    try {
      await supabase.from('bookings').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', bookingData.id);
      setBookingStatus('cancelled');
      setBookingState('idle');
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    } catch (err) { console.error('Cancel error:', err); }
  }, [bookingData]);

  // ✅ Cleanup
  useEffect(() => { 
    return () => { 
      aliveRef.current = false;
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current); 
      if (bookingChannelRef.current) supabase.removeChannel(bookingChannelRef.current).catch(() => {});
    }; 
  }, []);

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  if (error && !showMap) {
    return (
      <div className="bg-white rounded-xl p-4 text-center border">
        <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button onClick={() => { setError(null); getLocation(); }} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold">
          <RefreshCw size={14} className="inline mr-1" />{tr.retry}
        </button>
      </div>
    );
  }

  if (bookingState === 'tracking' && bookingData) {
    const worker = bookingData.worker;
    const dist = workerLocation && userLocation ? calcDistance(userLocation.lat, userLocation.lng, workerLocation.latitude, workerLocation.longitude) : bookingData.distance_km || 0;
    const eta = calcETA(dist);
    const statusStep = ['accepted', 'in_progress', 'completed'].indexOf(bookingStatus);

    return (
      <div className="space-y-3">
        <button onClick={handleQuickHire} disabled={isHiring}
          className="w-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl px-3 py-2.5 text-white text-left active:scale-95 transition hover:shadow-lg"
          style={{ minHeight: '48px', touchAction: 'manipulation', userSelect: 'none' }}>
          <Zap size={18} className="mb-1" />
          <p className="text-sm font-bold">{tr.quickHire}</p>
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4" style={{ transform: 'translateZ(0)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shrink-0">
              {worker?.profiles?.name?.[0] || 'W'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">{tr.hiredWorker.replace('{name}', worker?.profiles?.name || 'Worker')}</p>
              <p className="text-xs text-gray-500">{worker?.profiles?.category || 'General'}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600 text-sm">{bookingData.offered_amount || bookingData.total_amount} QAR</p>
              <p className="text-[10px] text-gray-400">#{bookingData.id?.slice(0, 8)}</p>
            </div>
          </div>

          {/* Status Steps */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 transition-all ${statusStep >= 0 ? 'bg-green-100 text-green-600 ring-2 ring-green-300' : 'bg-gray-100 text-gray-400'}`}><Navigation size={14} /></div>
              <p className={`text-[9px] ${statusStep >= 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>{tr.workerArriving}</p>
            </div>
            <div className={`flex-1 h-0.5 ${statusStep > 0 ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 transition-all ${statusStep >= 1 ? 'bg-green-100 text-green-600 ring-2 ring-green-300' : 'bg-gray-100 text-gray-400'}`}><CheckCircle size={14} /></div>
              <p className={`text-[9px] ${statusStep >= 1 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>{tr.inProgress}</p>
            </div>
            <div className={`flex-1 h-0.5 ${statusStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 transition-all ${statusStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}><CheckCircle size={14} /></div>
              <p className={`text-[9px] ${statusStep >= 2 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>{tr.completed}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 mb-3">
            <div className="flex justify-between text-sm"><span className="text-blue-700 flex items-center gap-1"><MapPin size={12} />{tr.distance}</span><span className="font-semibold text-blue-800">{dist} {tr.km}</span></div>
            <div className="flex justify-between text-sm mt-1"><span className="text-blue-700 flex items-center gap-1"><Clock size={12} />{tr.eta}</span><span className="font-semibold text-blue-800">~{eta} {tr.min}</span></div>
          </div>

          <div className="flex gap-2">
            {bookingStatus === 'accepted' && (
              <>
                <button onClick={() => updateBookingStatus('in_progress')} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 active:scale-[0.98] transition-all">{tr.arrived}</button>
                <button onClick={() => updateBookingStatus('cancelled')} className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm hover:bg-red-100 active:scale-90 transition-all"><XCircle size={16} /></button>
              </>
            )}
            {bookingStatus === 'in_progress' && (
              <button onClick={() => updateBookingStatus('completed')} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"><CheckCircle size={16} />{tr.complete}</button>
            )}
            {bookingData.contact_phone && (
              <a href={`tel:${bookingData.contact_phone}`} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-200 active:scale-95 transition-all no-underline"><Phone size={14} />{tr.callWorker}</a>
            )}
          </div>
        </div>

        {/* ✅ Inline Confirm Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowConfirm(false)}>
            <div className="bg-white rounded-2xl p-5 m-4 max-w-xs w-full shadow-xl" onClick={e => e.stopPropagation()}>
              <p className="text-sm font-medium text-gray-800 mb-4 text-center">{tr.confirmCancel}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200">No</button>
                <button onClick={confirmCancel} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Yes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={handleQuickHire} disabled={isHiring || bookingLoading}
          className={`relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl px-3 py-2.5 text-white text-left transition-all active:scale-95 w-full ${(isHiring || bookingLoading) ? 'opacity-50' : 'hover:shadow-lg'}`}
          style={{ minHeight: '48px', touchAction: 'manipulation', userSelect: 'none' }}>
          {(isHiring || bookingLoading) ? <Loader2 size={18} className="mb-1 animate-spin" /> : <Zap size={18} className="mb-1" />}
          <p className="text-sm font-bold">{showMap ? tr.closeMap : tr.quickHire}</p>
          <p className="text-[10px] opacity-80">{bookingLoading ? tr.findingWorker : nearbyCount > 0 ? `${nearbyCount} ${tr.workersNearby}` : tr.quickHireDesc}</p>
        </button>

        <button type="button" onClick={toggleOnline} disabled={loading || authLoading}
          className={`rounded-xl px-3 py-2.5 text-left transition-all active:scale-95 w-full ${!isAuthenticated ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' : online ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'} ${loading || authLoading ? 'opacity-50' : 'hover:shadow-lg'}`}
          style={{ minHeight: '48px', touchAction: 'manipulation', userSelect: 'none' }}>
          {loading ? <Loader2 size={18} className="mb-1 animate-spin" /> : !isAuthenticated ? <LogIn size={18} className="mb-1" /> : online ? <WifiOff size={18} className="mb-1" /> : <Wifi size={18} className="mb-1" />}
          <p className="text-sm font-bold">{!isAuthenticated ? tr.loginToGoOnline : online ? tr.offline : tr.online}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {isAuthenticated ? (
              <><span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} /><span className="text-[10px] opacity-80">{online ? tr.on : tr.off}</span></>
            ) : (
              <span className="text-[10px] opacity-80 flex items-center gap-1"><Shield size={10} />{tr.loginRequired}</span>
            )}
          </div>
        </button>
      </div>

      {bookingState === 'searching' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center animate-pulse">
          <Loader2 size={40} className="animate-spin text-green-500 mx-auto mb-3" />
          <p className="font-bold text-gray-700">{tr.findingWorker}</p>
          <p className="text-xs text-gray-400 mt-1">Searching for the nearest available worker...</p>
        </div>
      )}

      {showMap && userLocation && bookingState !== 'tracking' && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm"
          style={{ contain: 'layout style paint', transform: 'translateZ(0)', minHeight: '280px', maxHeight: '320px' }}>
          
          <button type="button" onClick={handleCloseMap}
            className="absolute top-2 right-2 z-20 bg-white/95 hover:bg-white rounded-full p-1.5 shadow-md transition active:scale-90"
            style={{ touchAction: 'manipulation', minHeight: '36px', minWidth: '36px' }}>
            <X size={16} className="text-gray-600" />
          </button>

          {!isAuthenticated && (
            <div className="absolute top-2 left-2 z-20">
              <button onClick={() => router.push(`/${country}/${lang}/login?redirect=/${country}/${lang}`)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold active:scale-95 transition shadow-md flex items-center gap-1 whitespace-nowrap"
                style={{ touchAction: 'manipulation' }}>
                <LogIn size={10} /> {tr.tapToHire}
              </button>
            </div>
          )}

          <Suspense fallback={<div className="flex items-center justify-center" style={{ minHeight: '280px', background: '#f3f4f6' }}><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
            <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng}
              onSelectWorker={handleWorkerSelect} onClose={handleCloseMap} onQuickHire={handleMapQuickHire} />
          </Suspense>
        </div>
      )}

      {locating && (
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <Loader2 size={20} className="animate-spin text-green-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500">{tr.locating}</p>
        </div>
      )}

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
// components/worker/LiveLocationTracker.tsx
"use client";
import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════
// স্ট্যাটিক ট্রান্সলেশন (Module-level)
// ═══════════════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: { locationError: 'Unable to get location', permissionDenied: 'Location permission denied', trackingActive: 'Live location tracking active', trackingOff: 'Location tracking off', newRequest: 'New Job Request', positionUnavailable: 'Position unavailable', timeout: 'Location request timed out', notificationBody: 'Job' },
  bn: { locationError: 'লোকেশন পাওয়া যাচ্ছে না', permissionDenied: 'লোকেশন অনুমতি অস্বীকার', trackingActive: 'লাইভ লোকেশন ট্র্যাকিং সক্রিয়', trackingOff: 'লোকেশন ট্র্যাকিং বন্ধ', newRequest: 'নতুন কাজের অনুরোধ', positionUnavailable: 'অবস্থান অনুপলব্ধ', timeout: 'লোকেশন টাইমআউট', notificationBody: 'কাজ' },
  ar: { locationError: 'تعذر الحصول على الموقع', permissionDenied: 'تم رفض إذن الموقع', trackingActive: 'تتبع الموقع نشط', trackingOff: 'تتبع الموقع متوقف', newRequest: 'طلب عمل جديد', positionUnavailable: 'الموقع غير متاح', timeout: 'انتهت مهلة الموقع', notificationBody: 'وظيفة' },
  hi: { locationError: 'लोकेशन नहीं मिल सकती', permissionDenied: 'लोकेशन अनुमति अस्वीकृत', trackingActive: 'लाइव ट्रैकिंग सक्रिय', trackingOff: 'ट्रैकिंग बंद', newRequest: 'नया कार्य अनुरोध', positionUnavailable: 'स्थान अनुपलब्ध', timeout: 'समय समाप्त', notificationBody: 'काम' },
};

// ═══════════════════════════════════════════════════════════
// কনফিগ — ✅ ফিক্সড: accuracy 500m, interval 10s
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  UPDATE_INTERVAL_MS: 10000,    // ১০ সেকেন্ড পর পর আপডেট
  MIN_ACCURACY_M: 500,          // ৫০০ মিটার পর্যন্ত একসেপ্ট
  MAX_RETRY: 3,
  RETRY_DELAY_MS: 2000,
  GPS_TIMEOUT_MS: 15000,        // ১৫ সেকেন্ড টাইমআউট
  GPS_MAX_AGE_MS: 30000,
  RECONNECT_DELAY_MS: 5000,
  START_DELAY_MS: 1000,
};

// ═══════════════════════════════════════════════════════════
// ইন্টারফেস
// ═══════════════════════════════════════════════════════════
interface Props {
  workerId: string;
  isOnline: boolean;
  lang: string;
}

// ═══════════════════════════════════════════════════════════
// নোটিফিকেশন সাউন্ড (Web Audio API - Module-level)
// ═══════════════════════════════════════════════════════════
function playBeepSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

// ═══════════════════════════════════════════════════════════
// ব্রাউজার নোটিফিকেশন
// ═══════════════════════════════════════════════════════════
async function showBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/logo192.png', tag: 'booking-request' });
  } else if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

// ═══════════════════════════════════════════════════════════
// মেইন LiveLocationTracker (Supersonic)
// ═══════════════════════════════════════════════════════════
export default function LiveLocationTracker({ workerId, isOnline, lang }: Props) {
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  
  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  const aliveRef = useRef(true);
  const trackingRef = useRef(false);

  const [error, setError] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════
  // Location Update (Throttled + Accuracy Filter)
  // ═══════════════════════════════════════════════════════
  const updateLocation = useCallback(async (lat: number, lng: number, accuracy: number) => {
    if (!aliveRef.current) return;

    try {
      const { error: e } = await supabase
        .from('worker_locations')
        .upsert({
          worker_id: workerId,
          latitude: lat,
          longitude: lng,
          accuracy,
          is_online: true,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'worker_id' });

      if (e) throw e;
      
      setError(null);
      retryCountRef.current = 0;
    } catch (err: any) {
      setError(err?.message || tr.locationError);

      if (retryCountRef.current < CONFIG.MAX_RETRY) {
        retryCountRef.current++;
        setTimeout(startTracking, CONFIG.RETRY_DELAY_MS);
      }
    }
  }, [workerId, tr]);

  // ═══════════════════════════════════════════════════════
  // Start Tracking — ✅ ফিক্সড: accuracy check 500m
  // ═══════════════════════════════════════════════════════
  const startTracking = useCallback(() => {
    if (!navigator.geolocation || !workerId || !aliveRef.current) return;
    if (trackingRef.current) return;
    trackingRef.current = true;

    // Permission check
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(r => {
        if (r.state === 'denied') {
          setError(tr.permissionDenied);
          trackingRef.current = false;
        }
      });
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < CONFIG.UPDATE_INTERVAL_MS) return;
        
        const { latitude, longitude, accuracy } = pos.coords;
        
        // ✅ ফিক্স: 500m পর্যন্ত accuracy accept করবে (আগে 100m ছিল)
        if (accuracy > CONFIG.MIN_ACCURACY_M) return;

        lastUpdateRef.current = now;
        updateLocation(latitude, longitude, accuracy);
      },
      (err) => {
        trackingRef.current = false;
        let msg = tr.locationError;
        if (err.code === 1) msg = tr.permissionDenied;
        else if (err.code === 2) msg = tr.positionUnavailable;
        else if (err.code === 3) msg = tr.timeout;
        setError(msg);

        // Retry on recoverable errors
        if (err.code === 2 || err.code === 3) {
          setTimeout(startTracking, CONFIG.RETRY_DELAY_MS);
        }
      },
      { enableHighAccuracy: true, maximumAge: CONFIG.GPS_MAX_AGE_MS, timeout: CONFIG.GPS_TIMEOUT_MS }
    );
  }, [workerId, tr, updateLocation]);

  // ═══════════════════════════════════════════════════════
  // Stop Tracking
  // ═══════════════════════════════════════════════════════
  const stopTracking = useCallback(async () => {
    trackingRef.current = false;
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (workerId && aliveRef.current) {
      try {
        await supabase.from('worker_locations').upsert({
          worker_id: workerId,
          is_online: false,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'worker_id' });
      } catch {}
    }
  }, [workerId]);

  // ═══════════════════════════════════════════════════════
  // Realtime Channel (Booking Notifications)
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!workerId) return;
    aliveRef.current = true;

    let ch: any = null;

    const setupChannel = () => {
      if (!aliveRef.current) return;
      if (ch) supabase.removeChannel(ch).catch(() => {});

      ch = supabase
        .channel(`loc:${workerId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'bookings',
          filter: `worker_id=eq.${workerId}`,
        }, async (payload: any) => {
          if (!aliveRef.current) return;
          const booking = payload.new;

          showBrowserNotification(
            `🔔 ${tr.newRequest}`,
            `${booking.job_title || tr.notificationBody} - ${booking.offered_amount || 0} QAR`
          );

          playBeepSound();

          supabase.from('notifications').insert({
            user_id: workerId,
            title: tr.newRequest,
            message: `${booking.job_title || 'Job'} - ${booking.offered_amount || 0} QAR`,
            type: 'booking_request',
            is_read: false,
            created_at: new Date().toISOString(),
            metadata: { booking_id: booking.id },
          }).then(() => {});
        })
        .subscribe((status: string) => {
          if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            setTimeout(setupChannel, CONFIG.RECONNECT_DELAY_MS);
          }
        });
    };

    const timer = setTimeout(setupChannel, CONFIG.START_DELAY_MS);

    return () => {
      clearTimeout(timer);
      aliveRef.current = false;
      if (ch) supabase.removeChannel(ch).catch(() => {});
    };
  }, [workerId, tr]);

  // ═══════════════════════════════════════════════════════
  // Online/Offline Toggle
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!workerId) return;

    if (isOnline) {
      const t = setTimeout(startTracking, CONFIG.START_DELAY_MS);
      
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      return () => clearTimeout(t);
    } else {
      stopTracking();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOnline, workerId, startTracking, stopTracking]);

  // ═══════════════════════════════════════════════════════
  // Cleanup on unmount
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    return () => {
      aliveRef.current = false;
      trackingRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(() => {});
      }
    };
  }, []);

  return null;
}
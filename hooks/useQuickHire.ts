// hooks/useQuickHire.ts - ✅ UBER-STYLE QUICK HIRE • FULLY FIXED
"use client";
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRealtime } from '@/hooks/useRealtime';

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  MAX_DISTANCE_KM: 50,
  MAX_WORKERS: 10,
  AVG_SPEED_KMPH: 30,
  RETRY_MAX: 2,
  EARTH_RADIUS_KM: 6371,
  STALE_WORKER_MINUTES: 5,
  REQUEST_TIMEOUT_MS: 8000,
} as const;

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface WorkerLocation {
  worker_id: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  last_seen: string;
  profiles?: {
    name: string;
    category: string;
    rating: number;
    phone: string;
    photo_url: string;
    expected_salary: number;
  };
  distance?: number;
  eta?: number;
}

interface QuickHireBooking {
  id: string;
  worker_id: string;
  employer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  distance_km: number;
  eta_minutes: number;
  offered_amount: number;
  worker?: WorkerLocation;
}

interface QuickHireResult {
  loading: boolean;
  error: string | null;
  booking: QuickHireBooking | null;
  matchWorker: (
    userLat: number,
    userLng: number,
    country: string,
    employerPhone: string,
    employerName?: string,
    category?: string,
    amount?: number
  ) => Promise<QuickHireBooking | null>;
  reset: () => void;
}

// ═══════════════════════════════════════════════════════════
// ইউটিলিটি (Pure Functions)
// ═══════════════════════════════════════════════════════════
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = CONFIG.EARTH_RADIUS_KM;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * 
            Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calcETA(distanceKm: number): number {
  return Math.ceil((distanceKm / CONFIG.AVG_SPEED_KMPH) * 60);
}

// ═══════════════════════════════════════════════════════════
// useQuickHire Hook
// ═══════════════════════════════════════════════════════════
export function useQuickHire(): QuickHireResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<QuickHireBooking | null>(null);
  
  const aliveRef = useRef(true);
  const retryRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentBookingRef = useRef<string | null>(null);

  // ক্লিনআপ
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ✅ Realtime listener
  useRealtime({
    table: 'bookings',
    event: 'UPDATE',
    filter: currentBookingRef.current 
      ? `id=eq.${currentBookingRef.current}` 
      : undefined,
    onEvent: (payload: any) => {
      if (!aliveRef.current || !currentBookingRef.current) return;
      
      const newStatus = payload.new?.status;
      if (newStatus && newStatus !== 'pending') {
        setBooking((prev) => prev ? { ...prev, status: newStatus } : null);
        
        if (newStatus === 'accepted') {
          setError(null);
        } else if (newStatus === 'rejected') {
          setError('Worker rejected the request. Try again.');
        }
      }
    },
    enabled: !!currentBookingRef.current,
  });

  const matchWorker = useCallback(async (
    userLat: number,
    userLng: number,
    country: string,
    employerPhone: string,
    employerName: string = 'Employer',
    category: string = 'all',
    amount: number = 100,
  ): Promise<QuickHireBooking | null> => {
    // ✅✅✅ Validation
    console.log('🔍 matchWorker called:', { userLat, userLng, employerPhone, employerName, category, amount });
    
    if (!employerPhone || employerPhone.trim() === '') {
      console.error('❌ Employer phone is empty!');
      setError('Phone number required');
      setLoading(false);
      return null;
    }

    // আগের রিকোয়েস্ট ক্যান্সেল
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setBooking(null);
    retryRef.current = 0;

    const attemptMatch = async (): Promise<QuickHireBooking | null> => {
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

      try {
        // ✅✅✅ Step 1: Fetch employer profile FIRST
        const { data: employer, error: employerError } = await supabase
          .from('profiles')
          .select('id, phone, name')
          .eq('phone', employerPhone)
          .single();

        if (employerError || !employer) {
          console.error('❌ Employer not found for phone:', employerPhone);
          if (aliveRef.current) {
            setError('Please complete your profile first');
            setLoading(false);
          }
          return null;
        }

        console.log('✅ Employer found:', employer);

        // ✅ Step 2: Fetch online workers
        const { data: workers, error: workerError } = await supabase
          .from('worker_locations')
          .select(`
            worker_id,
            latitude,
            longitude,
            is_online,
            last_seen,
            profiles:worker_id (
              name,
              category,
              rating,
              phone,
              photo_url,
              expected_salary
            )
          `)
          .eq('is_online', true)
          .gte('last_seen', new Date(Date.now() - CONFIG.STALE_WORKER_MINUTES * 60000).toISOString())
          .limit(CONFIG.MAX_WORKERS);

        clearTimeout(timeoutId);

        if (!aliveRef.current || controller.signal.aborted) return null;
        if (workerError) throw workerError;
        
        if (!workers || workers.length === 0) {
          if (aliveRef.current) {
            setError('No online workers found nearby');
            setLoading(false);
          }
          return null;
        }

        // ✅ Step 3: Calculate distances
        const withDistance = workers
          .map((w: any) => ({
            ...w,
            distance: calcDistance(userLat, userLng, w.latitude, w.longitude),
            eta: 0,
            profile: Array.isArray(w.profiles) ? w.profiles[0] : w.profiles || undefined,
          }))
          .filter((w: any) => w.distance <= CONFIG.MAX_DISTANCE_KM)
          .map((w: any) => ({ ...w, eta: calcETA(w.distance) }))
          .sort((a: any, b: any) => a.distance - b.distance);

        if (withDistance.length === 0) {
          if (aliveRef.current) {
            setError('No workers within 50km');
            setLoading(false);
          }
          return null;
        }

        const closest = withDistance[0];
        console.log('✅ Closest worker:', { 
          id: closest.worker_id, 
          name: closest.profile?.name, 
          distance: closest.distance,
          eta: closest.eta 
        });

        // ✅✅✅ Step 4: Create booking with REAL employer data
        const bookingData = {
          worker_id: closest.worker_id,
          employer_id: employer.id,                      // ✅ REAL UUID
          employer_phone: employerPhone,                 // ✅ REAL phone
          employer_name: employerName,                   // ✅ REAL name
          job_title: category !== 'all' ? `${category} - Quick Hire` : 'Quick Hire',
          job_description: 'Quick hire request',
          category: closest.profile?.category || 'General',
          offered_amount: amount,
          total_amount: amount,
          payment_type: 'fixed',
          payment_method: 'cash',
          location_text: `${userLat.toFixed(4)},${userLng.toFixed(4)}`,
          location_lat: userLat,
          location_lng: userLng,
          worker_lat: closest.latitude,
          worker_lon: closest.longitude,
          distance_km: closest.distance,
          eta_minutes: closest.eta,
          start_date: new Date().toISOString().split('T')[0],
          start_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          duration_days: 1,
          contact_phone: employerPhone,
          status: 'pending',
          special_instructions: 'Quick Hire - Auto Matched',
        };

        console.log('📦 Creating booking:', bookingData);

        const { data: newBooking, error: bookingError } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single();

        if (!aliveRef.current || controller.signal.aborted) return null;
        if (bookingError) {
          console.error('❌ Booking insert error:', bookingError);
          throw bookingError;
        }

        console.log('✅ Booking created:', newBooking);

        currentBookingRef.current = newBooking.id;
        
        // ✅ Step 5: Send notification to worker
        supabase
          .from('notifications')
          .insert({
            user_id: closest.worker_id,
            title: '🔔 New Quick Hire Request!',
            message: `${employerName} • ${closest.distance}km • ${closest.eta}min • ${amount} QAR`,
            type: 'quick_hire',
            is_read: false,
            metadata: { 
              booking_id: newBooking.id,
              employer_name: employerName,
              distance: closest.distance,
              amount: amount
            },
          })
          .then(({ error: notifError }) => {
            if (notifError) console.warn('Notification failed:', notifError);
            else console.log('✅ Notification sent to worker');
          });

        const result: QuickHireBooking = { ...newBooking, worker: closest };
        
        if (aliveRef.current) {
          setBooking(result);
          setLoading(false);
          retryRef.current = 0;
        }
        
        return result;

      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error('❌ matchWorker error:', err);
        
        if (err?.message === 'AbortError' || !aliveRef.current) {
          return null;
        }

        if (retryRef.current < CONFIG.RETRY_MAX) {
          retryRef.current++;
          console.log(`🔄 Retry ${retryRef.current}/${CONFIG.RETRY_MAX}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryRef.current));
          return attemptMatch();
        }

        if (aliveRef.current) {
          setError(err.message || 'Quick hire failed');
          setLoading(false);
        }
        return null;
      }
    };

    return attemptMatch();
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    currentBookingRef.current = null;
    setLoading(false);
    setError(null);
    setBooking(null);
    retryRef.current = 0;
  }, []);

  return { loading, error, booking, matchWorker, reset };
}
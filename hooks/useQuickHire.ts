// hooks/useQuickHire.ts
"use client";
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface QuickHireResult {
  loading: boolean;
  error: string | null;
  booking: any | null;
  matchWorker: (userLat: number, userLng: number, country: string, employerPhone: string) => Promise<void>;
}

export function useQuickHire(): QuickHireResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any | null>(null);

  const matchWorker = useCallback(async (
    userLat: number, userLng: number, country: string, employerPhone: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. কাছের online worker খুঁজো
      const { data: workers, error: workerError } = await supabase
        .from('worker_locations')
        .select('*, profiles:worker_id(name, category, rating, phone)')
        .eq('is_online', true)
        .limit(10);

      if (workerError) throw workerError;
      if (!workers || workers.length === 0) {
        setError('No online workers nearby');
        setLoading(false);
        return;
      }

      // 2. দূরত্ব calculate করে sort
      const withDistance = workers.map(w => ({
        ...w,
        distance: getDistance(userLat, userLng, w.latitude, w.longitude),
        eta: getETA(userLat, userLng, w.latitude, w.longitude)
      })).sort((a, b) => a.distance - b.distance);

      // 3. সবচেয়ে কাছের worker
      const closest = withDistance[0];

      // 4. Auto-create booking
      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          worker_id: closest.worker_id,
          employer_id: employerPhone,
          employer_phone: employerPhone,
          job_title: 'Quick Hire',
          category: closest.profiles?.category || 'General',
          offered_amount: 100,
          total_amount: 100,
          payment_type: 'fixed',
          payment_method: 'cash',
          location_text: `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`,
          location_lat: userLat,
          location_lng: userLng,
          worker_lat: closest.latitude,
          worker_lon: closest.longitude,
          distance_km: closest.distance,
          eta_minutes: closest.eta,
          start_date: new Date().toISOString().split('T')[0],
          start_time: new Date().toTimeString().split(' ')[0],
          duration_days: 1,
          contact_phone: employerPhone,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 5. Notify worker
      await supabase.from('notifications').insert({
        user_id: closest.worker_id,
        title: '🔔 New Quick Hire Request!',
        message: `Distance: ${closest.distance}km • ETA: ${closest.eta}min`,
        type: 'quick_hire',
        is_read: false
      });

      setBooking({ ...newBooking, worker: closest });
    } catch (err: any) {
      setError(err.message || 'Matching failed');
    }
    setLoading(false);
  }, []);

  return { loading, error, booking, matchWorker };
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function getETA(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return Math.ceil((getDistance(lat1, lon1, lat2, lon2) / 30) * 60);
}
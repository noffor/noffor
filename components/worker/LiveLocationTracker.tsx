// components/worker/LiveLocationTracker.tsx
"use client";
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  workerId: string;
  isOnline: boolean;
  lang: string;
}

export default function LiveLocationTracker({ workerId, isOnline, lang }: Props) {
  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || !workerId) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < 10000) return;
        lastUpdateRef.current = now;

        const { latitude, longitude } = position.coords;
        
        const { error } = await supabase
          .from('worker_locations')
          .upsert({
            worker_id: workerId,
            latitude,
            longitude,
            is_online: true,
            last_seen: new Date().toISOString()
          }, { onConflict: 'worker_id' });

        if (error) console.error('Location update error:', error.message);
      },
      (error) => console.error('GPS Error:', error.message),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
  }, [workerId]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (workerId) {
      supabase
        .from('worker_locations')
        .upsert({
          worker_id: workerId,
          is_online: false,
          last_seen: new Date().toISOString()
        }, { onConflict: 'worker_id' })
        .then(({ error }) => {
          if (error) console.error('Offline update error:', error.message);
        });
    }
  }, [workerId]);

  useEffect(() => {
    if (!workerId) return;

    const channel = supabase
      .channel('booking-requests-' + workerId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `worker_id=eq.${workerId}`
      }, (payload) => {
        const booking = payload.new;
        
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 New Job Request!', {
            body: `${booking.job_title} - ${booking.offered_amount} QAR`,
            icon: '/favicon.ico',
            tag: 'booking-request'
          });
        }
        
        supabase.from('notifications').insert({
          user_id: workerId,
          title: 'New Job Request',
          message: `${booking.job_title} - ${booking.offered_amount} QAR`,
          type: 'booking_request',
          is_read: false
        }).then(({ error }) => error && console.error('Notification error:', error.message));
      })
      .subscribe((status: string) => {
        console.log('Realtime channel:', status);
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerId]);

  useEffect(() => {
    if (isOnline) {
      startTracking();
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      stopTracking();
    }
    
    return () => stopTracking();
  }, [isOnline, startTracking, stopTracking]);

  return null;
}
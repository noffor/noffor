// components/worker/LiveLocationTracker.tsx
"use client";
import { useEffect, useRef, useCallback, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const t = (key: string) => {
    const texts: any = {
      en: { 
        locationError: 'Unable to get location', 
        permissionDenied: 'Location permission denied',
        trackingActive: 'Live location tracking active',
        trackingOff: 'Location tracking off'
      },
      bn: { 
        locationError: 'লোকেশন পাওয়া যাচ্ছে না', 
        permissionDenied: 'লোকেশন অনুমতি অস্বীকার করা হয়েছে',
        trackingActive: 'লাইভ লোকেশন ট্র্যাকিং সক্রিয়',
        trackingOff: 'লোকেশন ট্র্যাকিং বন্ধ'
      },
      ar: { 
        locationError: 'تعذر الحصول على الموقع', 
        permissionDenied: 'تم رفض إذن الموقع',
        trackingActive: 'تتبع الموقع المباشر نشط',
        trackingOff: 'تتبع الموقع متوقف'
      },
      hi: { 
        locationError: 'लोकेशन प्राप्त नहीं कर सकते', 
        permissionDenied: 'लोकेशन अनुमति अस्वीकृत',
        trackingActive: 'लाइव लोकेशन ट्रैकिंग सक्रिय',
        trackingOff: 'लोकेशन ट्रैकिंग बंद'
      },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  };

  // Start location tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation || !workerId) {
      console.error('Geolocation not supported or no worker ID');
      setError(t('locationError'));
      return;
    }

    // Request permission first
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') {
        setError(t('permissionDenied'));
        return;
      }
    });

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        
        // Throttle updates to every 15 seconds (not 10 to reduce API calls)
        if (now - lastUpdateRef.current < 15000) return;
        lastUpdateRef.current = now;

        const { latitude, longitude, accuracy } = position.coords;
        
        // Only update if accuracy is reasonable (better than 100m)
        if (accuracy > 100) {
          console.log('Location accuracy too low, skipping update');
          return;
        }
        
        try {
          const { error: upsertError } = await supabase
            .from('worker_locations')
            .upsert({
              worker_id: workerId,
              latitude,
              longitude,
              accuracy,
              is_online: true,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'worker_id',
              ignoreDuplicates: false
            });

          if (upsertError) {
            console.error('Location update error:', upsertError.message);
            setError(upsertError.message);
            
            // Retry logic
            if (retryCount < 3) {
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                startTracking();
              }, 2000);
            }
          } else {
            setError(null);
            setRetryCount(0);
          }
        } catch (err) {
          console.error('Upsert failed:', err);
        }
      },
      (error) => {
        console.error('GPS Error:', error.message);
        
        let errorMsg = t('locationError');
        if (error.code === 1) errorMsg = t('permissionDenied');
        else if (error.code === 2) errorMsg = 'Position unavailable';
        else if (error.code === 3) errorMsg = 'Location request timed out';
        
        setError(errorMsg);
        
        // Retry on timeout or unavailable
        if (error.code === 2 || error.code === 3) {
          setTimeout(() => {
            startTracking();
          }, 5000);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000
      }
    );
  }, [workerId, retryCount, t]);

  // Stop location tracking
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (workerId) {
      try {
        const { error: updateError } = await supabase
          .from('worker_locations')
          .upsert({
            worker_id: workerId,
            is_online: false,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'worker_id' 
          });

        if (updateError) {
          console.error('Offline update error:', updateError.message);
        }
      } catch (err) {
        console.error('Failed to update offline status:', err);
      }
    }
  }, [workerId]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio element dynamically
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==';
      
      // Fallback: try to play silence
      audio.volume = 0;
      audio.play().then(() => {
        audio.volume = 0.5;
        // Generate beep using Web Audio API if needed
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.frequency.value = 800;
            gain.gain.value = 0.5;
            oscillator.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
            oscillator.stop(ctx.currentTime + 0.5);
          }
        } catch (e) {
          console.log('Web Audio not supported');
        }
      }).catch(e => console.log('Audio play failed:', e));
    } catch (err) {
      console.log('Sound not available');
    }
  }, []);

  // Setup realtime channel for job requests
  useEffect(() => {
    if (!workerId) return;

    const channel = supabase
      .channel('booking-requests-' + workerId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `worker_id=eq.${workerId}`
      }, async (payload) => {
        const booking = payload.new;
        
        // Show browser notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('🔔 New Job Request!', {
              body: `${booking.job_title || 'Job'} - ${booking.offered_amount || 0} QAR`,
              icon: '/logo192.png',
              tag: 'booking-request'
            });
          } else if (Notification.permission !== 'denied') {
            await Notification.requestPermission();
          }
        }
        
        // Play notification sound
        playNotificationSound();
        
        // Save to database
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: workerId,
            title: 'New Job Request',
            message: `${booking.job_title || 'Job'} - ${booking.offered_amount || 0} QAR`,
            type: 'booking_request',
            is_read: false,
            created_at: new Date().toISOString(),
            metadata: { booking_id: booking.id }
          });

        if (notifError) {
          console.error('Notification save error:', notifError.message);
        }
      })
      .subscribe((status: string) => {
        console.log('Realtime channel status:', status);
        
        // Reconnect if error
        if (status === 'CHANNEL_ERROR') {
          setTimeout(() => {
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
            }
            // Reconnect logic
            const newChannel = supabase
              .channel('booking-requests-' + workerId)
              .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'bookings', 
                filter: `worker_id=eq.${workerId}` 
              }, () => {})
              .subscribe();
            channelRef.current = newChannel;
          }, 5000);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [workerId, playNotificationSound]);

  // Start/stop tracking based on online status
  useEffect(() => {
    if (isOnline && workerId) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        startTracking();
      }, 1000);
      
      // Request notification permission
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      return () => clearTimeout(timer);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Optional: Show console logs for debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (isOnline) {
        console.log(`📍 LiveLocationTracker: Online mode active for worker ${workerId}`);
        if (error) console.log(`📍 Error: ${error}`);
      } else {
        console.log(`📍 LiveLocationTracker: Offline mode for worker ${workerId}`);
      }
    }
  }, [isOnline, workerId, error]);

  return null;
}
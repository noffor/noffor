// components/worker/WorkerBookingListener.tsx
// ✅ Final Fixed Version
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import BookingRequestPopup from '@/components/booking/BookingRequestPopup';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Booking {
  id: string;
  worker_id: string;
  employer_id: string;
  employer_name: string;
  employer_phone?: string;
  contact_phone?: string;
  job_title: string;
  job_description?: string;
  category: string;
  offered_amount: number;
  total_amount: number;
  distance_km?: number;
  eta_minutes?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  location_text?: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
}

interface Props {
  workerId: string;
  workerLat: number;
  workerLng: number;
  lang: string;
  isOnline: boolean;
}

// ═══════════════════════════════════════════════════════════
// Audio System
// ═══════════════════════════════════════════════════════════
function playNotificationSound() {
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
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

// ═══════════════════════════════════════════════════════════
// WorkerBookingListener
// ═══════════════════════════════════════════════════════════
export default function WorkerBookingListener({ 
  workerId, 
  workerLat, 
  workerLng, 
  lang, 
  isOnline 
}: Props) {
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  
  // 🔒 মেমোরি লিক প্রটেকশন
  const aliveRef = useRef(true);
  const processedIdsRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ═══════ ACCEPT HANDLER ═══════
  const handleAccept = useCallback(async (bookingId: string) => {
    if (!aliveRef.current) return;
    
    try {
      // Update already done inside BookingRequestPopup
      // Just update local state
      if (aliveRef.current) {
        setPendingBooking((prev) => prev ? { ...prev, status: 'accepted' } : null);
      }
    } catch (err) {
      console.error('Accept error:', err);
    }
  }, []);

  // ═══════ REJECT HANDLER ═══════
  const handleReject = useCallback(async (bookingId: string) => {
    if (!aliveRef.current) return;
    
    try {
      if (aliveRef.current) {
        setPendingBooking(null);
      }
    } catch (err) {
      console.error('Reject error:', err);
    }
  }, []);

  // ═══════ CLOSE HANDLER ═══════
  const handleClose = useCallback(() => {
    setShowPopup(false);
    setPendingBooking(null);
  }, []);

  // ═══════ REALTIME LISTENER ═══════
  useEffect(() => {
    aliveRef.current = true;
    
    if (!workerId || !isOnline) return;

    const channel = supabase
      .channel(`worker-bookings:${workerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `worker_id=eq.${workerId}`,
        },
        (payload: any) => {
          if (!aliveRef.current) return;
          
          const newBooking = payload.new as Booking;
          
          // Duplicate protection
          if (processedIdsRef.current.has(newBooking.id)) return;
          processedIdsRef.current.add(newBooking.id);
          
          // Only show popup for pending bookings
          if (newBooking.status === 'pending') {
            setPendingBooking(newBooking);
            setShowPopup(true);
            playNotificationSound();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Worker listener ready:', workerId);
        }
      });

    channelRef.current = channel;

    return () => {
      aliveRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(console.error);
        channelRef.current = null;
      }
    };
  }, [workerId, isOnline]);

  // ═══════ RENDER ═══════
  if (!showPopup || !pendingBooking) return null;

  return (
    <BookingRequestPopup
      booking={pendingBooking}
      workerId={workerId}
      workerLat={workerLat}
      workerLng={workerLng}
      lang={lang}
      onAccept={handleAccept}
      onReject={handleReject}
      onClose={handleClose}
    />
  );
}
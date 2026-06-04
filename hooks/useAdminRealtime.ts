"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface RealtimeUpdate {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
}

export function useAdminRealtime() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [connected, setConnected] = useState(false);
  const aliveRef = useRef(true);
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    aliveRef.current = true;
    setConnected(true);

    const tables = ['profiles', 'bookings', 'bids', 'reviews', 'notifications', 'live_activities'];
    
    tables.forEach(table => {
      const channel = supabase
        .channel(`admin-${table}-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          if (aliveRef.current) {
            setUpdates(prev => [{
              table,
              event: payload.eventType as any,
              data: payload.new || payload.old,
              timestamp: new Date().toISOString(),
            }, ...prev.slice(0, 99)]);
          }
        })
        .subscribe((status) => {
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setConnected(false);
          else setConnected(true);
        });

      channelsRef.current.push(channel);
    });

    return () => {
      aliveRef.current = false;
      channelsRef.current.forEach(ch => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, []);

  const clearUpdates = useCallback(() => setUpdates([]), []);

  return { updates, connected, clearUpdates };
}
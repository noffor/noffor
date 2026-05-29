// hooks/useRealtime.ts
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onEvent: (payload: any) => void;
  enabled?: boolean;
}

export function useRealtime({ table, event = '*', filter, onEvent, enabled = true }: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let channel = supabase.channel(`realtime-${table}-${Date.now()}`);
    
    channel = channel.on(
      'postgres_changes',
      { event, schema: 'public', table, filter },
      (payload) => onEvent(payload)
    );

    channel.subscribe((status) => {
      console.log(`Realtime ${table} status:`, status);
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, event, filter, onEvent, enabled]);
}

export function useThrottledRealtime(options: UseRealtimeOptions, delay: number = 2000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef(false);

  const throttledOnEvent = useCallback((payload: any) => {
    if (timeoutRef.current) {
      pendingRef.current = true;
      return;
    }
    
    options.onEvent(payload);
    
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (pendingRef.current) {
        pendingRef.current = false;
        // Trigger again if there was a pending event
      }
    }, delay);
  }, [options.onEvent, delay]);

  useRealtime({ ...options, onEvent: throttledOnEvent });
}
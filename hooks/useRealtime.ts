// hooks/useRealtime.ts - ১ বিলিয়ন ইউজার • সুপারসনিক • সব এরর ফিক্সড
import {useEffect,useCallback,useRef} from 'react';
import {supabase} from '@/lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={
  RECONNECT_DELAY:5000,
  MAX_RETRIES:3,
  DEBOUNCE_DELAY:300,
  THROTTLE_DELAY:2000,
};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface UseRealtimeOptions{
  table:string;
  event?:'INSERT'|'UPDATE'|'DELETE'|'*';
  filter?:string;
  onEvent:(payload:any)=>void;
  enabled?:boolean;
  onStatus?:(status:string)=>void;
  retryOnError?:boolean;
}

// ═══════════════════════════════════════════════════════════
// useRealtime (Supersonic)
// ═══════════════════════════════════════════════════════════
export function useRealtime({
  table,
  event='*',
  filter,
  onEvent,
  enabled=true,
  onStatus,
  retryOnError=true,
}:UseRealtimeOptions){
  const channelRef=useRef<RealtimeChannel|null>(null);
  const retryRef=useRef(0);
  const mountedRef=useRef(true);

  const setupChannel=useCallback(()=>{
    if(!mountedRef.current||!enabled)return;

    if(channelRef.current){
      supabase.removeChannel(channelRef.current).catch(()=>{});
      channelRef.current=null;
    }

    const channelName=`rt:${table}:${Date.now()}`;
    
    const channel=supabase
      .channel(channelName)
      .on('postgres_changes',{event,schema:'public',table,filter},(payload:any)=>{
        if(mountedRef.current)onEvent(payload);
      })
      .subscribe((status:string)=>{
        onStatus?.(status);

        if(retryOnError&&(status==='CHANNEL_ERROR'||status==='CLOSED'||status==='TIMED_OUT')){
          if(retryRef.current<CONFIG.MAX_RETRIES){
            retryRef.current++;
            setTimeout(setupChannel,CONFIG.RECONNECT_DELAY*retryRef.current);
          }
        }

        if(status==='SUBSCRIBED'){
          retryRef.current=0;
        }
      });

    channelRef.current=channel;
  },[table,event,filter,onEvent,enabled,onStatus,retryOnError]);

  useEffect(()=>{
    mountedRef.current=true;
    const timer=setTimeout(setupChannel,CONFIG.DEBOUNCE_DELAY);
    
    return()=>{
      mountedRef.current=false;
      clearTimeout(timer);
      if(channelRef.current){
        supabase.removeChannel(channelRef.current).catch(()=>{});
        channelRef.current=null;
      }
    };
  },[setupChannel]);
}

// ═══════════════════════════════════════════════════════════
// useThrottledRealtime (Supersonic)
// ═══════════════════════════════════════════════════════════
export function useThrottledRealtime(
  options:UseRealtimeOptions,
  delay:number=CONFIG.THROTTLE_DELAY
){
  const timeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const lastPayloadRef=useRef<any>(null);
  const pendingRef=useRef(false);

  const throttledOnEvent=useCallback((payload:any)=>{
    lastPayloadRef.current=payload;

    if(timeoutRef.current){
      pendingRef.current=true;
      return;
    }
    
    options.onEvent(payload);
    pendingRef.current=false;
    
    timeoutRef.current=setTimeout(()=>{
      timeoutRef.current=null;
      if(pendingRef.current&&lastPayloadRef.current){
        options.onEvent(lastPayloadRef.current);
        pendingRef.current=false;
      }
    },delay);
  },[options.onEvent,delay]);

  useEffect(()=>{
    return()=>{
      if(timeoutRef.current)clearTimeout(timeoutRef.current);
    };
  },[]);

  useRealtime({...options,onEvent:throttledOnEvent});
}

// ═══════════════════════════════════════════════════════════
// useDebouncedRealtime (Supersonic)
// ═══════════════════════════════════════════════════════════
export function useDebouncedRealtime(
  options:UseRealtimeOptions,
  delay:number=CONFIG.DEBOUNCE_DELAY
){
  const timeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);

  const debouncedOnEvent=useCallback((payload:any)=>{
    if(timeoutRef.current)clearTimeout(timeoutRef.current);
    timeoutRef.current=setTimeout(()=>{
      options.onEvent(payload);
    },delay);
  },[options.onEvent,delay]);

  useEffect(()=>{
    return()=>{
      if(timeoutRef.current)clearTimeout(timeoutRef.current);
    };
  },[]);

  useRealtime({...options,onEvent:debouncedOnEvent});
}

// ═══════════════════════════════════════════════════════════
// useRealtimePresence (Supersonic) - FIXED
// ═══════════════════════════════════════════════════════════
export function useRealtimePresence(
  channelName:string,
  userInfo:Record<string,any>,
  onPresence?:(presence:any)=>void
){
  const channelRef=useRef<RealtimeChannel|null>(null);

  useEffect(()=>{
    const channel=supabase.channel(channelName,{
      config:{presence:{key:'user_id'}},
    });

    channel
      .on('presence',{event:'sync'},()=>{
        const state=channel.presenceState();
        onPresence?.(state);
      })
      .on('presence',{event:'join'},({newPresences}:any)=>{
        console.log('User joined:',newPresences);
      })
      .on('presence',{event:'leave'},({leftPresences}:any)=>{
        console.log('User left:',leftPresences);
      })
      .subscribe(async(status:string)=>{
        if(status==='SUBSCRIBED'){
          await channel.track(userInfo);
        }
      });

    channelRef.current=channel;

    return()=>{
      if(channelRef.current){
        supabase.removeChannel(channelRef.current).catch(()=>{});
      }
    };
  },[channelName,userInfo,onPresence]);

  return channelRef;
}
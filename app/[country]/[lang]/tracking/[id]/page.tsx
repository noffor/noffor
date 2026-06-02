// app/[country]/[lang]/tracking/[id]/page.tsx
"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef, startTransition } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Booking } from '@/types';
import { CheckCircle, Loader2, Clock, Truck, CheckCheck, AlertCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// স্ট্যাটিক ট্রান্সলেশন (Module-level - zero re-create)
// ═══════════════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: { 
    status: 'Booking Status', pending: 'Pending', accepted: 'Accepted', 
    completed: 'Completed', onWay: 'Worker is coming', finishWork: 'Finish Work', 
    completeBtn: 'Mark Complete', loading: 'Loading...', notFound: 'Booking not found',
    requestSent: 'Request sent', workDone: 'Work completed', error: 'Error loading',
    retry: 'Retry', realtime: 'Live tracking active',
  },
  bn: { 
    status: 'বুকিং স্ট্যাটাস', pending: 'অপেক্ষমান', accepted: 'গৃহীত', 
    completed: 'সম্পন্ন', onWay: 'শ্রমিক আসছে', finishWork: 'কাজ শেষ', 
    completeBtn: 'সম্পন্ন করুন', loading: 'লোড হচ্ছে...', notFound: 'বুকিং পাওয়া যায়নি',
    requestSent: 'অনুরোধ পাঠানো হয়েছে', workDone: 'কাজ সম্পন্ন', error: 'ত্রুটি',
    retry: 'আবার চেষ্টা', realtime: 'লাইভ ট্র্যাকিং সক্রিয়',
  },
  ar: { 
    status: 'حالة الحجز', pending: 'قيد الانتظار', accepted: 'مقبول', 
    completed: 'مكتمل', onWay: 'العامل قادم', finishWork: 'إنهاء', 
    completeBtn: 'تأكيد الإكمال', loading: 'جاري التحميل...', notFound: 'الحجز غير موجود',
    requestSent: 'تم الإرسال', workDone: 'انتهى العمل', error: 'خطأ',
    retry: 'إعادة', realtime: 'تتبع مباشر',
  },
  hi: { 
    status: 'बुकिंग स्थिति', pending: 'लंबित', accepted: 'स्वीकृत', 
    completed: 'पूर्ण', onWay: 'श्रमिक आ रहा है', finishWork: 'समाप्त करें', 
    completeBtn: 'पूर्ण करें', loading: 'लोड हो रहा...', notFound: 'बुकिंग नहीं मिली',
    requestSent: 'अनुरोध भेजा', workDone: 'काम पूरा', error: 'त्रुटि',
    retry: 'पुनः प्रयास', realtime: 'लाइव ट्रैकिंग',
  }
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  CACHE_TTL: 10000,
  RETRY_MAX: 2,
  REALTIME_DEBOUNCE: 500,
};

// ═══════════════════════════════════════════════════════════
// স্টেপ ইন্ডিকেটর (Memoized)
// ═══════════════════════════════════════════════════════════
const StepIndicator = React.memo(({ 
  step, active, completed, label, sublabel 
}: { 
  step: number; active: boolean; completed: boolean; label: string; sublabel: string;
}) => (
  <>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
        completed ? 'bg-green-100 text-green-600 scale-110' : 
        active ? 'bg-yellow-100 text-yellow-600 animate-pulse' : 
        'bg-gray-100 text-gray-400'
      }`}>
        {completed ? <CheckCircle size={20} /> : step}
      </div>
      <div>
        <p className={`font-semibold text-sm ${completed ? 'text-green-700' : active ? 'text-yellow-700' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className="text-xs text-gray-400">{sublabel}</p>
      </div>
    </div>
    <div className={`h-6 w-0.5 mx-5 transition-colors duration-300 ${completed ? 'bg-green-400' : 'bg-gray-200'}`} />
  </>
));
StepIndicator.displayName = 'StepIndicator';

// ═══════════════════════════════════════════════════════════
// স্কেলেটন লোডার
// ═══════════════════════════════════════════════════════════
const Skeleton = React.memo(() => (
  <div className="min-h-screen bg-gray-50 pb-20">
    <div className="h-14 bg-white border-b animate-pulse" />
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/2" />
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));
Skeleton.displayName = 'Skeleton';

// ═══════════════════════════════════════════════════════════
// এরর স্টেট
// ═══════════════════════════════════════════════════════════
const ErrorState = React.memo(({ msg, retry }: { msg: string; retry: () => void }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="h-14 bg-white border-b" />
    <div className="max-w-md mx-auto p-4 text-center">
      <AlertCircle size={48} className="text-red-400 mx-auto mb-3" />
      <p className="text-gray-600 mb-3">{msg}</p>
      <button onClick={retry} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all">
        {msg === 'Error loading' ? 'Retry' : msg}
      </button>
    </div>
  </div>
));
ErrorState.displayName = 'ErrorState';

// ═══════════════════════════════════════════════════════════
// মেইন ট্র্যাকিং পেজ (Supersonic)
// ═══════════════════════════════════════════════════════════
export default function TrackingPage() {
  const params = useParams();
  const country = (params.country as string) || 'qa';
  const lang = (params.lang as string) || 'en';
  const bookingId = (params.id as string) || '';
  
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);
  
  const alive = useRef(true);
  const channelRef = useRef<any>(null);
  const retryCount = useRef(0);

  // ═══════════════════════════════════════════════════════
  // Load Booking (Cache-first)
  // ═══════════════════════════════════════════════════════
  const loadBooking = useCallback(async (isRetry = false) => {
    if (!alive.current) return;
    if (!isRetry) setLoading(true);
    setError(false);

    try {
      // Session cache check
      const cKey = `track:${bookingId}`;
      if (!isRetry) {
        try {
          const cached = sessionStorage.getItem(cKey);
          if (cached) {
            const p = JSON.parse(cached);
            if (Date.now() - p.t < CONFIG.CACHE_TTL) {
              startTransition(() => { setBooking(p.d); setLoading(false); });
              return;
            }
          }
        } catch {}
      }

      const { data, error: e } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (e) throw e;
      if (!alive.current) return;

      if (data) {
        // Cache
        try { sessionStorage.setItem(cKey, JSON.stringify({ d: data, t: Date.now() })); } catch {}
        startTransition(() => { setBooking(data); setLoading(false); });
      } else {
        startTransition(() => { setBooking(null); setLoading(false); });
      }
      retryCount.current = 0;
    } catch (err) {
      if (!alive.current) return;
      
      if (retryCount.current < CONFIG.RETRY_MAX) {
        retryCount.current++;
        setTimeout(() => loadBooking(true), 1000 * retryCount.current);
      } else {
        startTransition(() => { setError(true); setLoading(false); });
      }
    }
  }, [bookingId]);

  // ═══════════════════════════════════════════════════════
  // Realtime (Debounced + Cleanup)
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    let ch: any = null;
    
    const setup = () => {
      if (!alive.current) return;
      
      // Clean previous
      if (ch) supabase.removeChannel(ch).catch(() => {});
      
      ch = supabase
        .channel(`track:${bookingId}`)
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` }, 
          (payload: any) => {
            if (!alive.current) return;
            startTransition(() => {
              setBooking(payload.new as Booking);
              setRealtimeActive(true);
              setTimeout(() => setRealtimeActive(false), 2000);
            });
            // Update cache
            try {
              sessionStorage.setItem(`track:${bookingId}`, JSON.stringify({ d: payload.new, t: Date.now() }));
            } catch {}
          }
        )
        .subscribe();
    };

    const timer = setTimeout(setup, 300);

    return () => {
      clearTimeout(timer);
      alive.current = false;
      if (ch) supabase.removeChannel(ch).catch(() => {});
    };
  }, [bookingId]);

  // ═══════════════════════════════════════════════════════
  // Initial Load
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    alive.current = true;
    loadBooking();
    return () => { alive.current = false; };
  }, [loadBooking]);

  // ═══════════════════════════════════════════════════════
  // Complete Work (Optimistic + Retry)
  // ═══════════════════════════════════════════════════════
  const completeWork = useCallback(async () => {
    if (!booking || updating) return;
    
    setUpdating(true);
    
    // Optimistic update
    const prev = { ...booking };
    const updated = { ...booking, status: 'completed', completed_at: new Date().toISOString() };
    startTransition(() => setBooking(updated as Booking));
    
    try {
      const { error: e } = await supabase
        .from('bookings')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', bookingId);
      
      if (e) throw e;
      
      // Cache update
      try {
        sessionStorage.setItem(`track:${bookingId}`, JSON.stringify({ d: updated, t: Date.now() }));
      } catch {}
      
    } catch (err) {
      // Revert
      startTransition(() => setBooking(prev as Booking));
      alert('Failed to complete. Please try again.');
    }
    
    setUpdating(false);
  }, [booking, bookingId, updating]);

  // ═══════════════════════════════════════════════════════
  // Status helpers
  // ═══════════════════════════════════════════════════════
  const isPending = booking?.status === 'pending';
  const isAccepted = booking?.status === 'accepted';
  const isCompleted = booking?.status === 'completed';

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════
  if (loading) return <Skeleton />;
  if (error) return <ErrorState msg={tr.error} retry={() => loadBooking(true)} />;
  if (!booking) return <ErrorState msg={tr.notFound} retry={() => loadBooking(true)} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20" style={{ contain: 'layout style paint' }}>
      <Header country={country} lang={lang} />
      
      <div className="max-w-md mx-auto p-4">
        {/* Realtime indicator */}
        {realtimeActive && (
          <div className="mb-3 px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-lg flex items-center gap-1.5 animate-fadeIn">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {tr.realtime}
          </div>
        )}
        
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">{tr.status}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPending ? 'bg-yellow-100 text-yellow-700' :
              isAccepted ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {isPending ? tr.pending : isAccepted ? tr.accepted : tr.completed}
            </span>
          </div>
          
          <div className="space-y-0">
            <StepIndicator step={1} active={isPending} completed={!isPending} label={tr.pending} sublabel={tr.requestSent} />
            <StepIndicator step={2} active={isAccepted} completed={isCompleted} label={tr.accepted} sublabel={isAccepted ? tr.onWay : ''} />
            <StepIndicator step={3} active={false} completed={isCompleted} label={tr.completed} sublabel={tr.workDone} />
          </div>
          
          {/* Complete Button */}
          {isAccepted && (
            <button 
              onClick={completeWork} 
              disabled={updating}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 active:scale-[0.98] transition-all will-change-transform"
            >
              {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {updating ? '...' : tr.completeBtn}
            </button>
          )}
        </div>
      </div>
      
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
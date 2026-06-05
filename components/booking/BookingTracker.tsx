// components/booking/BookingTracker.tsx - ১ বিলিয়ন ইউজার • CTO Approved
"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef, startTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Clock, MapPin, Phone, CheckCircle, XCircle, 
  Loader2, AlertCircle, RefreshCw, Navigation 
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: {
    tracking: 'Live Tracking', workerArriving: 'Worker is coming',
    arrived: 'Worker Arrived', inProgress: 'In Progress',
    completed: 'Completed', cancel: 'Cancel', complete: 'Mark Complete',
    contact: 'Contact', distance: 'Distance', eta: 'ETA',
    min: 'min', km: 'km', loading: 'Loading...', error: 'Failed to load',
    retry: 'Retry', cancelBooking: 'Cancel Booking',
    confirmCancel: 'Are you sure?', yes: 'Yes', no: 'No',
  },
  bn: {
    tracking: 'লাইভ ট্র্যাকিং', workerArriving: 'শ্রমিক আসছেন',
    arrived: 'শ্রমিক এসেছেন', inProgress: 'কাজ চলছে',
    completed: 'সম্পন্ন', cancel: 'বাতিল', complete: 'সম্পন্ন করুন',
    contact: 'যোগাযোগ', distance: 'দূরত্ব', eta: 'সময়',
    min: 'মিনিট', km: 'কিমি', loading: 'লোড হচ্ছে...', error: 'লোড ব্যর্থ',
    retry: 'আবার চেষ্টা', cancelBooking: 'বুকিং বাতিল',
    confirmCancel: 'আপনি কি নিশ্চিত?', yes: 'হ্যাঁ', no: 'না',
  },
  ar: {
    tracking: 'تتبع مباشر', workerArriving: 'العامل قادم',
    arrived: 'وصل العامل', inProgress: 'قيد التنفيذ',
    completed: 'مكتمل', cancel: 'إلغاء', complete: 'إكمال',
    contact: 'اتصال', distance: 'مسافة', eta: 'الوقت',
    min: 'دقيقة', km: 'كم', loading: 'جاري...', error: 'فشل',
    retry: 'إعادة', cancelBooking: 'إلغاء الحجز',
    confirmCancel: 'هل أنت متأكد؟', yes: 'نعم', no: 'لا',
  },
  hi: {
    tracking: 'लाइव ट्रैकिंग', workerArriving: 'श्रमिक आ रहे',
    arrived: 'श्रमिक आ गए', inProgress: 'प्रगति में',
    completed: 'पूर्ण', cancel: 'रद्द', complete: 'पूर्ण करें',
    contact: 'संपर्क', distance: 'दूरी', eta: 'समय',
    min: 'मिनट', km: 'किमी', loading: 'लोड...', error: 'विफल',
    retry: 'पुनः प्रयास', cancelBooking: 'बुकिंग रद्द',
    confirmCancel: 'क्या आप सुनिश्चित हैं?', yes: 'हाँ', no: 'नहीं',
  },
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  RETRY_MAX: 2,
  RETRY_DELAY: 1000,
  CACHE_TTL: 15000,
  AVG_SPEED_KMPH: 30,
};

// ═══════════════════════════════════════════════════════════
// Pure Utilities
// ═══════════════════════════════════════════════════════════
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * 
            Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calcETA(dist: number): number {
  return Math.ceil((dist / CONFIG.AVG_SPEED_KMPH) * 60);
}

// ═══════════════════════════════════════════════════════════
// StatusStep (Memoized)
// ═══════════════════════════════════════════════════════════
const StatusStep = React.memo(({ 
  icon: Icon, label, active, completed 
}: { 
  icon: any; label: string; active: boolean; completed: boolean 
}) => (
  <div className="flex-1 text-center">
    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 transition-all ${
      completed ? 'bg-green-600 text-white' : 
      active ? 'bg-green-100 text-green-600 ring-2 ring-green-300' : 
      'bg-gray-100 text-gray-400'
    }`}>
      <Icon size={16} />
    </div>
    <p className={`text-[10px] ${
      completed ? 'text-green-600 font-semibold' : 
      active ? 'text-green-500' : 'text-gray-400'
    }`}>
      {label}
    </p>
  </div>
));
StatusStep.displayName = 'StatusStep';

// ═══════════════════════════════════════════════════════════
// Confirm Dialog (Inline - SSR Safe)
// ═══════════════════════════════════════════════════════════
function ConfirmDialog({ 
  message, onConfirm, onCancel, yes, no 
}: { 
  message: string; onConfirm: () => void; onCancel: () => void;
  yes: string; no: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-5 m-4 max-w-xs w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <p className="text-sm font-medium text-gray-800 mb-4 text-center">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200">
            {no}
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">
            {yes}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface BookingData {
  id: string;
  status: 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  worker_id: string;
  employer_id: string;
  location_lat?: number;
  location_lng?: number;
  contact_phone?: string;
  employer_name?: string;
  worker_name?: string;
}

interface WorkerLocation {
  latitude: number;
  longitude: number;
  is_online: boolean;
  last_seen: string;
}

interface Props {
  bookingId: string;
  workerId: string;
  employerId: string;
  currentUserId: string;
  lang: string;
  onComplete?: () => void;
}

// ═══════════════════════════════════════════════════════════
// BookingTracker (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const BookingTracker = React.memo(({ 
  bookingId, workerId, employerId, currentUserId, lang, onComplete 
}: Props) => {
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [workerLocation, setWorkerLocation] = useState<WorkerLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // components/booking/BookingTracker.tsx
// 🔒 Refs section - React 19 Compatible
const aliveRef = useRef(true);
const retryCountRef = useRef(0);
const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
const onCompleteRef = useRef(onComplete);
  
  // Keep callback ref fresh
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const isEmployer = currentUserId === employerId;
  const statusStep = booking 
    ? ['accepted', 'in_progress', 'completed'].indexOf(booking.status) 
    : -1;

  // ═══════ Load Data (Stable reference) ═══════
  const loadData = useCallback(async () => {
    if (!aliveRef.current) return;
    
    startTransition(() => {
      setLoading(true);
      setError(false);
    });

    try {
      const [{ data: bookingData }, { data: locationData }] = await Promise.all([
        supabase.from('bookings').select('*').eq('id', bookingId).single(),
        supabase.from('worker_locations').select('*').eq('worker_id', workerId).single(),
      ]);

      if (!aliveRef.current) return;

      startTransition(() => {
        setBooking(bookingData as BookingData);
        setWorkerLocation(locationData as WorkerLocation);
        setLoading(false);
      });
      
      retryCountRef.current = 0;
    } catch (err) {
      if (!aliveRef.current) return;
      
      // ✅ Proper retry with delay
      if (retryCountRef.current < CONFIG.RETRY_MAX) {
        retryCountRef.current++;
        retryTimerRef.current = setTimeout(loadData, CONFIG.RETRY_DELAY * retryCountRef.current);
        return;
      }
      
      startTransition(() => {
        setError(true);
        setLoading(false);
      });
    }
  }, [bookingId, workerId]);

  // ═══════ Realtime ═══════
  useEffect(() => {
    aliveRef.current = true;
    retryCountRef.current = 0;
    
    loadData();

    // ✅ Unique channel name
    const channelName = `bt:${bookingId}:${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` },
        (payload: any) => {
          if (!aliveRef.current) return;
          startTransition(() => {
            setBooking(payload.new);
            if (payload.new.status === 'completed') {
              onCompleteRef.current?.();
            }
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'worker_locations', filter: `worker_id=eq.${workerId}` },
        (payload: any) => {
          if (aliveRef.current) {
            startTransition(() => setWorkerLocation(payload.new));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && aliveRef.current) {
          console.warn('Tracker channel error, reloading...');
          loadData();
        }
      });

    channelRef.current = channel;

    return () => {
      aliveRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      supabase.removeChannel(channel).catch(console.error);
    };
  }, [bookingId, workerId, loadData]);

  // ═══════ Update Status ═══════
  const updateStatus = useCallback(async (status: string) => {
    if (updating || !aliveRef.current) return;
    
    // ✅ Inline confirm instead of window.confirm
    if (status === 'cancelled') {
      setShowConfirm(true);
      return;
    }

    setUpdating(true);
    
    try {
      const updates: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (status === 'completed') updates.completed_at = new Date().toISOString();
      if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .eq('employer_id', employerId); // Extra safety

      if (updateError) throw updateError;
      
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      if (aliveRef.current) setUpdating(false);
    }
  }, [bookingId, employerId, updating]);

  const confirmCancel = useCallback(async () => {
    setShowConfirm(false);
    setUpdating(true);
    
    try {
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .eq('employer_id', employerId);
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      if (aliveRef.current) setUpdating(false);
    }
  }, [bookingId, employerId]);

  // ═══════ Distance/ETA ═══════
  const locationInfo = useMemo(() => {
    if (!workerLocation?.latitude || !booking?.location_lat) return null;
    const dist = calcDistance(
      booking.location_lat, 
      booking.location_lng || 0,
      workerLocation.latitude, 
      workerLocation.longitude
    );
    return { distance: dist, eta: calcETA(dist) };
  }, [workerLocation, booking]);

  // ═══════ Loading State ═══════
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-4 animate-pulse space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-20 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    );
  }

  // ═══════ Error State ═══════
  if (error) {
    return (
      <div className="bg-white rounded-2xl border p-4 text-center">
        <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-500 mb-2">{tr.error}</p>
        <button 
          onClick={loadData}
          className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} /> {tr.retry}
        </button>
      </div>
    );
  }

  if (!booking) return null;

  // ═══════ Main Render ═══════
  return (
    <>
      <div 
        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        style={{ contain: 'layout style paint', transform: 'translateZ(0)' }}
      >
        {/* Header */}
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
          <Navigation size={18} className="text-green-600" />
          {tr.tracking}
        </h3>

        {/* Status Steps */}
        <div className="flex items-center gap-2 mb-4">
          <StatusStep icon={Clock} label={tr.workerArriving} active={statusStep === 0} completed={statusStep > 0} />
          <div className={`flex-1 h-0.5 ${statusStep > 0 ? 'bg-green-500' : 'bg-gray-200'}`} />
          <StatusStep icon={CheckCircle} label={tr.inProgress} active={statusStep === 1} completed={statusStep > 1} />
          <div className={`flex-1 h-0.5 ${statusStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
          <StatusStep icon={CheckCircle} label={tr.completed} active={statusStep === 2} completed={statusStep > 2} />
        </div>

        {/* Location Info */}
        {locationInfo && (
          <div className="bg-blue-50 rounded-xl p-3 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 flex items-center gap-1">
                <MapPin size={12} /> {tr.distance}
              </span>
              <span className="font-semibold text-blue-800">
                {locationInfo.distance} {tr.km}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-blue-700 flex items-center gap-1">
                <Clock size={12} /> {tr.eta}
              </span>
              <span className="font-semibold text-blue-800">
                ~{locationInfo.eta} {tr.min}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isEmployer && booking.status === 'accepted' && (
            <>
              <button 
                onClick={() => updateStatus('in_progress')} 
                disabled={updating}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {tr.arrived}
              </button>
              <button 
                onClick={() => updateStatus('cancelled')} 
                disabled={updating}
                className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm hover:bg-red-100 active:scale-90 transition-all"
              >
                <XCircle size={16} />
              </button>
            </>
          )}
          
          {isEmployer && booking.status === 'in_progress' && (
            <button 
              onClick={() => updateStatus('completed')} 
              disabled={updating}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
              {updating ? '' : tr.complete}
            </button>
          )}
          
          {booking.contact_phone && (
            <a 
              href={`tel:${booking.contact_phone}`} 
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-200 active:scale-95 transition-all no-underline"
            >
              <Phone size={14} /> {tr.contact}
            </a>
          )}
        </div>
      </div>

      {/* ✅ Inline Confirm Dialog */}
      {showConfirm && (
        <ConfirmDialog
          message={tr.confirmCancel}
          yes={tr.yes}
          no={tr.no}
          onConfirm={confirmCancel}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
});

BookingTracker.displayName = 'BookingTracker';

export default BookingTracker;
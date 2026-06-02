// components/WorkerRequests.tsx
"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef, startTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Check, X, MessageCircle, DollarSign, MapPin, Clock, FileText, User, Briefcase } from 'lucide-react';
import { Booking } from '@/types';

// ═══════════════════════════════════════════════════════════
// স্ট্যাটিক ট্রান্সলেশন (Module-level)
// ═══════════════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: { title: 'Booking Requests', no_requests: 'No pending requests', accept: 'Accept', reject: 'Reject', negotiate: 'Negotiate', from: 'From', location: 'Location', amount: 'Amount', eta: 'ETA', distance: 'Distance', job: 'Job', new: 'NEW', instructions: 'Instructions', accepted_msg: 'Booking Accepted! Worker is on the way.', error: 'Failed to update', qar: 'QAR', km: 'km', min: 'min' },
  bn: { title: 'বুকিং রিকোয়েস্ট', no_requests: 'কোনো রিকোয়েস্ট নেই', accept: 'গ্রহণ করুন', reject: 'বাতিল করুন', negotiate: 'দরদাম', from: 'থেকে', location: 'অবস্থান', amount: 'টাকা', eta: 'সময়', distance: 'দূরত্ব', job: 'কাজ', new: 'নতুন', instructions: 'নির্দেশনা', accepted_msg: 'বুকিং গৃহীত! শ্রমিক আসছে।', error: 'আপডেট ব্যর্থ', qar: 'রিয়াল', km: 'কিমি', min: 'মিনিট' },
  ar: { title: 'طلبات الحجز', no_requests: 'لا توجد طلبات', accept: 'قبول', reject: 'رفض', negotiate: 'تفاوض', from: 'من', location: 'الموقع', amount: 'المبلغ', eta: 'الوقت', distance: 'المسافة', job: 'الوظيفة', new: 'جديد', instructions: 'تعليمات', accepted_msg: 'تم قبول الحجز! العامل في الطريق.', error: 'فشل التحديث', qar: 'ر.ق', km: 'كم', min: 'دقيقة' },
  hi: { title: 'बुकिंग अनुरोध', no_requests: 'कोई अनुरोध नहीं', accept: 'स्वीकार', reject: 'अस्वीकार', negotiate: 'बातचीत', from: 'से', location: 'स्थान', amount: 'राशि', eta: 'समय', distance: 'दूरी', job: 'काम', new: 'नया', instructions: 'निर्देश', accepted_msg: 'बुकिंग स्वीकृत! श्रमिक आ रहा है।', error: 'अपडेट विफल', qar: 'रियाल', km: 'किमी', min: 'मिनट' }
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  CACHE_TTL: 15000,
  REALTIME_DEBOUNCE: 500,
  RETRY_MAX: 2,
};

// ═══════════════════════════════════════════════════════════
// রিকোয়েস্ট কার্ড (Memoized)
// ═══════════════════════════════════════════════════════════
const RequestCard = React.memo(({ 
  req, tr, onAccept, onReject, onNegotiate, updating 
}: { 
  req: Booking; tr: Record<string, string>; 
  onAccept: (id: string) => void; onReject: (id: string) => void; 
  onNegotiate: (id: string) => void; updating: boolean;
}) => (
  <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl border-2 border-orange-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200 will-change-transform">
    <div className="flex flex-col sm:flex-row justify-between gap-3">
      {/* Info Section */}
      <div className="space-y-1.5 flex-1 min-w-0">
        {/* New Badge */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
          <span className="text-[10px] sm:text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
            {tr.new}
          </span>
        </div>

        {/* Employer Name */}
        <p className="font-semibold text-gray-800 text-sm sm:text-base flex items-center gap-1.5 truncate">
          <User size={14} className="text-orange-500 flex-shrink-0" />
          <span className="text-gray-500 text-xs font-normal">{tr.from}:</span> {req.employer_name}
        </p>

        {/* Job Title */}
        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5 truncate">
          <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-400 text-xs font-normal">{tr.job}:</span> {req.job_title}
        </p>

        {/* Location */}
        <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1 truncate">
          <MapPin size={10} className="flex-shrink-0" /> {req.location_text}
        </p>

        {/* Amount + Distance/ETA */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1 font-semibold text-green-700">
            <DollarSign size={10} /> {req.total_amount} {tr.qar}
          </span>
          {req.distance_km && (
            <span className="flex items-center gap-1 text-gray-500">
              <Clock size={10} /> {req.distance_km} {tr.km} • {req.eta_minutes} {tr.min}
            </span>
          )}
        </div>

        {/* Instructions */}
        {req.special_instructions && (
          <p className="text-[11px] text-gray-400 italic flex items-start gap-1">
            <FileText size={10} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{req.special_instructions}</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex sm:flex-col gap-2 flex-shrink-0">
        <button 
          onClick={() => onAccept(req.id)} 
          disabled={updating}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 hover:bg-green-700 disabled:opacity-50 active:scale-95 transition-all"
        >
          <Check size={14} /> {tr.accept}
        </button>
        <button 
          onClick={() => onReject(req.id)} 
          disabled={updating}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 hover:bg-red-600 disabled:opacity-50 active:scale-95 transition-all"
        >
          <X size={14} /> {tr.reject}
        </button>
        <button 
          onClick={() => onNegotiate(req.id)} 
          disabled={updating}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all"
        >
          <MessageCircle size={14} /> {tr.negotiate}
        </button>
      </div>
    </div>
  </div>
));
RequestCard.displayName = 'RequestCard';

// ═══════════════════════════════════════════════════════════
// স্কেলেটন
// ═══════════════════════════════════════════════════════════
const Skeleton = React.memo(() => (
  <div className="space-y-3">
    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
    {[1,2].map(i => (
      <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-16" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
));
Skeleton.displayName = 'Skeleton';

// ═══════════════════════════════════════════════════════════
// এম্পটি
// ═══════════════════════════════════════════════════════════
const EmptyState = React.memo(({ msg }: { msg: string }) => (
  <div className="text-center py-10 bg-white rounded-xl border">
    <Bell size={40} className="text-gray-200 mx-auto mb-3" />
    <p className="text-gray-400 text-sm">{msg}</p>
  </div>
));
EmptyState.displayName = 'EmptyState';

// ═══════════════════════════════════════════════════════════
// মেইন WorkerRequests (Supersonic)
// ═══════════════════════════════════════════════════════════
interface WorkerRequestsProps {
  workerId: string;
  lang: string;
  onRequestUpdate?: (request: Booking) => void;
}

export default function WorkerRequests({ workerId, lang, onRequestUpdate }: WorkerRequestsProps) {
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const alive = useRef(true);
  const channelRef = useRef<any>(null);

  // ═══════════════════════════════════════════════════════
  // Load Requests (Cache-first)
  // ═══════════════════════════════════════════════════════
  const loadRequests = useCallback(async () => {
    if (!alive.current) return;
    setLoading(true);

    try {
      const cKey = `wr:${workerId}`;
      try {
        const cached = sessionStorage.getItem(cKey);
        if (cached) {
          const p = JSON.parse(cached);
          if (Date.now() - p.t < CONFIG.CACHE_TTL) {
            startTransition(() => { setRequests(p.d); setLoading(false); });
            return;
          }
        }
      } catch {}

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('worker_id', workerId)
        .in('status', ['pending', 'negotiating'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!alive.current) return;

      const result = data || [];
      try { sessionStorage.setItem(cKey, JSON.stringify({ d: result, t: Date.now() })); } catch {}
      
      startTransition(() => { setRequests(result); setLoading(false); });
    } catch (err) {
      if (alive.current) startTransition(() => setLoading(false));
    }
  }, [workerId]);

  // ═══════════════════════════════════════════════════════
  // Realtime
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    let ch: any = null;
    
    const setup = () => {
      if (!alive.current) return;
      if (ch) supabase.removeChannel(ch).catch(() => {});
      
      ch = supabase
        .channel(`wr:${workerId}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'bookings', filter: `worker_id=eq.${workerId}` }, 
          (payload: any) => {
            if (!alive.current) return;
            startTransition(() => {
              setRequests(prev => [payload.new as Booking, ...prev]);
            });
            if (onRequestUpdate) onRequestUpdate(payload.new as Booking);
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
  }, [workerId, onRequestUpdate]);

  // ═══════════════════════════════════════════════════════
  // Initial Load
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    alive.current = true;
    loadRequests();
    return () => { alive.current = false; };
  }, [loadRequests]);

  // ═══════════════════════════════════════════════════════
  // Update Status (Optimistic + Retry)
  // ═══════════════════════════════════════════════════════
  const updateStatus = useCallback(async (bookingId: string, status: string) => {
    if (updating) return;
    setUpdating(true);

    // Optimistic: remove from list
    const prevList = [...requests];
    startTransition(() => setRequests(prev => prev.filter(r => r.id !== bookingId)));

    try {
      const updateData: any = { status };
      if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      // Clear cache
      try { sessionStorage.removeItem(`wr:${workerId}`); } catch {}

      if (status === 'accepted') {
        alert(tr.accepted_msg);
      }
    } catch (err) {
      // Revert
      startTransition(() => setRequests(prevList));
      alert(tr.error);
    }

    setUpdating(false);
  }, [requests, updating, workerId, tr]);

  // ═══════════════════════════════════════════════════════
  // Handlers (Memoized)
  // ═══════════════════════════════════════════════════════
  const handleAccept = useCallback((id: string) => updateStatus(id, 'accepted'), [updateStatus]);
  const handleReject = useCallback((id: string) => updateStatus(id, 'rejected'), [updateStatus]);
  const handleNegotiate = useCallback((id: string) => {
    const req = requests.find(r => r.id === id);
    if (req) {
      const newAmount = prompt('Enter negotiated amount (QAR):', String(req.total_amount || ''));
      if (newAmount && !isNaN(Number(newAmount))) {
        supabase.from('bookings').update({ 
          status: 'negotiating', 
          negotiated_amount: Number(newAmount) 
        }).eq('id', id).then(() => {
          startTransition(() => {
            setRequests(prev => prev.map(r => 
              r.id === id ? { ...r, status: 'negotiating', negotiated_amount: Number(newAmount) } : r
            ));
          });
        });
      }
    }
  }, [requests]);

  // ═══════════════════════════════════════════════════════
  // Memoized list
  // ═══════════════════════════════════════════════════════
  const requestList = useMemo(() => 
    requests.map(req => (
      <RequestCard 
        key={req.id} req={req} tr={tr} 
        onAccept={handleAccept} onReject={handleReject} 
        onNegotiate={handleNegotiate} updating={updating} 
      />
    )), 
    [requests, tr, handleAccept, handleReject, handleNegotiate, updating]
  );

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════
  if (loading) return <Skeleton />;
  if (requests.length === 0) return <EmptyState msg={tr.no_requests} />;

  return (
    <div className="space-y-2 sm:space-y-3" style={{ contain: 'layout style paint' }}>
      <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 select-none">
        <Bell size={18} className="text-orange-500" /> 
        {tr.title}
        <span className="text-sm text-gray-400 font-normal">({requests.length})</span>
      </h2>
      {requestList}
    </div>
  );
}
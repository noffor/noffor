// components/WorkerRequests.tsx
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Check, X, MessageCircle, DollarSign, MapPin, Clock } from 'lucide-react';
import { Booking } from '@/types';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: { title: 'Booking Requests', no_requests: 'No pending requests', accept: 'Accept', reject: 'Reject', negotiate: 'Negotiate', from: 'From', location: 'Location', amount: 'Amount', eta: 'ETA', distance: 'Distance', job: 'Job' },
  bn: { title: 'বুকিং রিকোয়েস্ট', no_requests: 'কোনো রিকোয়েস্ট নেই', accept: 'গ্রহণ করুন', reject: 'বাতিল করুন', negotiate: 'দরদাম করুন', from: 'থেকে', location: 'অবস্থান', amount: 'টাকা', eta: 'পৌঁছাতে সময়', distance: 'দূরত্ব', job: 'কাজ' },
  ar: { title: 'طلبات الحجز', no_requests: 'لا توجد طلبات معلقة', accept: 'قبول', reject: 'رفض', negotiate: 'تفاوض', from: 'من', location: 'الموقع', amount: 'المبلغ', eta: 'الوقت المتوقع', distance: 'المسافة', job: 'الوظيفة' },
  hi: { title: 'बुकिंग अनुरोध', no_requests: 'कोई अनुरोध नहीं', accept: 'स्वीकार करें', reject: 'अस्वीकार करें', negotiate: 'बातचीत करें', from: 'से', location: 'स्थान', amount: 'राशि', eta: 'अनुमानित समय', distance: 'दूरी', job: 'काम' }
};

interface WorkerRequestsProps {
  workerId: string;
  lang: string;
  onRequestUpdate?: (request: Booking) => void;
}

export default function WorkerRequests({ workerId, lang, onRequestUpdate }: WorkerRequestsProps) {
  const tr = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
    const channel = supabase
      .channel('worker-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings', filter: `worker_id=eq.${workerId}` }, (payload) => {
        setRequests(prev => [payload.new as Booking, ...prev]);
        if (onRequestUpdate) onRequestUpdate(payload.new as Booking);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workerId]);

  const loadRequests = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('worker_id', workerId).in('status', ['pending', 'negotiating']).order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  const updateStatus = async (bookingId: string, status: string, amount: number | null = null) => {
    await supabase.from('bookings').update({ status, negotiated_amount: amount, accepted_at: status === 'accepted' ? new Date().toISOString() : null }).eq('id', bookingId);
    setRequests(prev => prev.filter(r => r.id !== bookingId));
    if (status === 'accepted') alert('✅ Booking Accepted! Worker is on the way.');
  };

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-20 bg-gray-100 rounded-xl"></div></div>;
  if (requests.length === 0) return <div className="text-center py-8 bg-white rounded-xl border"><p className="text-gray-400">{tr.no_requests}</p></div>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold flex items-center gap-2"><Bell size={18} /> {tr.title} ({requests.length})</h2>
      {requests.map(req => (
        <div key={req.id} className="bg-gradient-to-r from-orange-50 to-white rounded-xl border-2 border-orange-200 p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">NEW</span></div>
              <p className="font-semibold text-gray-800"><strong>{tr.from}:</strong> {req.employer_name}</p>
              <p className="text-sm text-gray-600"><strong>{tr.job}:</strong> {req.job_title}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {req.location_text}</p>
              <div className="flex gap-3 text-xs"><span className="flex items-center gap-1"><DollarSign size={10} /> {req.total_amount} QAR</span>{req.distance_km && <span className="flex items-center gap-1"><Clock size={10} /> {req.distance_km} km • {req.eta_minutes} min</span>}</div>
              {req.special_instructions && <p className="text-xs text-gray-400 italic">📝 {req.special_instructions}</p>}
            </div>
            <div className="flex gap-2 flex-col"><button onClick={() => updateStatus(req.id, 'accepted')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"><Check size={14} /> {tr.accept}</button><button onClick={() => updateStatus(req.id, 'rejected')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"><X size={14} /> {tr.reject}</button><button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"><MessageCircle size={14} /> {tr.negotiate}</button></div>
          </div>
        </div>
      ))}
    </div>
  );
}
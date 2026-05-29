// app/[country]/[lang]/tracking/[id]/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Booking } from '@/types';
import { CheckCircle, Loader2 } from 'lucide-react';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: { status: 'Booking Status', pending: 'Pending', accepted: 'Accepted', completed: 'Completed', onWay: 'Worker is coming to you', finishWork: 'Finish Work', completeBtn: 'Mark as Complete' },
  bn: { status: 'বুকিং স্ট্যাটাস', pending: 'অপেক্ষমান', accepted: 'গৃহীত', completed: 'সম্পন্ন', onWay: 'শ্রমিক আপনার দিকে আসছে', finishWork: 'কাজ শেষ করুন', completeBtn: 'সম্পন্ন করুন' },
  ar: { status: 'حالة الحجز', pending: 'قيد الانتظار', accepted: 'مقبول', completed: 'مكتمل', onWay: 'العامل في طريقه إليك', finishWork: 'إنهاء العمل', completeBtn: 'وضع كمكتمل' },
  hi: { status: 'बुकिंग स्थिति', pending: 'लंबित', accepted: 'स्वीकृत', completed: 'पूर्ण', onWay: 'श्रमिक आपके पास आ रहा है', finishWork: 'कार्य समाप्त करें', completeBtn: 'पूर्ण चिह्नित करें' }
};

export default function TrackingPage() {
  const params = useParams();
  const country = params.country as string;
  const lang = params.lang as string;
  const bookingId = params.id as string;
  const tr = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBooking();
    
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` }, 
        (payload) => setBooking(payload.new as Booking)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  const loadBooking = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    setBooking(data);
    setLoading(false);
  };

  const completeWork = async () => {
    setUpdating(true);
    await supabase
      .from('bookings')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', bookingId);
    await loadBooking();
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header country={country} lang={lang} />
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header country={country} lang={lang} />
        <div className="p-4 text-center">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header country={country} lang={lang} />
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6">
          <h1 className="text-xl font-bold">{tr.status}</h1>
          
          <div className="space-y-4">
            {/* Step 1: Pending */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                {booking.status !== 'pending' ? <CheckCircle size={20} /> : '1'}
              </div>
              <div>
                <p className="font-medium">{tr.pending}</p>
                <p className="text-xs text-gray-500">Booking request sent</p>
              </div>
            </div>
            
            <div className={`h-8 w-0.5 bg-gray-200 mx-5 ${booking.status !== 'pending' ? 'bg-green-500' : ''}`}></div>
            
            {/* Step 2: Accepted */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {booking.status === 'accepted' ? <CheckCircle size={20} /> : '2'}
              </div>
              <div>
                <p className="font-medium">{tr.accepted}</p>
                {booking.status === 'accepted' && <p className="text-xs text-green-600">{tr.onWay}</p>}
              </div>
            </div>
            
            <div className={`h-8 w-0.5 bg-gray-200 mx-5 ${booking.status === 'completed' ? 'bg-green-500' : ''}`}></div>
            
            {/* Step 3: Completed */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {booking.status === 'completed' ? <CheckCircle size={20} /> : '3'}
              </div>
              <div>
                <p className="font-medium">{tr.completed}</p>
                <p className="text-xs text-gray-500">Work done</p>
              </div>
            </div>
          </div>
          
          {booking.status === 'accepted' && (
            <button 
              onClick={completeWork} 
              disabled={updating}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {tr.completeBtn}
            </button>
          )}
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
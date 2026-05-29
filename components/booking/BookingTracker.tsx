// components/booking/BookingTracker.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  bookingId: string;
  workerId: string;
  employerId: string;
  currentUserId: string;
  lang: string;
  onComplete?: () => void;
}

export default function BookingTracker({ bookingId, workerId, employerId, currentUserId, lang, onComplete }: Props) {
  const [booking, setBooking] = useState<any>(null);
  const [workerLocation, setWorkerLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const t = useCallback((key: string) => {
    const texts: any = {
      en: { 
        tracking: 'Live Tracking', workerArriving: 'Worker is on the way', arrived: 'Worker arrived',
        inProgress: 'Work in progress', completed: 'Completed', cancel: 'Cancel Booking',
        complete: 'Mark Complete', contact: 'Contact Worker', distance: 'Distance', eta: 'ETA'
      },
      bn: { 
        tracking: 'লাইভ ট্র্যাকিং', workerArriving: 'শ্রমিক আসছেন', arrived: 'শ্রমিক এসে গেছেন',
        inProgress: 'কাজ চলছে', completed: 'সম্পন্ন', cancel: 'বুকিং বাতিল',
        complete: 'সম্পন্ন করুন', contact: 'শ্রমিককে কল', distance: 'দূরত্ব', eta: 'সময়'
      },
      ar: { 
        tracking: 'تتبع مباشر', workerArriving: 'العامل في الطريق', arrived: 'وصل العامل',
        inProgress: 'العمل جاري', completed: 'مكتمل', cancel: 'إلغاء',
        complete: 'إكمال', contact: 'اتصل بالعامل', distance: 'المسافة', eta: 'الوقت'
      },
      hi: { 
        tracking: 'लाइव ट्रैकिंग', workerArriving: 'श्रमिक आ रहे हैं', arrived: 'श्रमिक आ गए',
        inProgress: 'काम जारी है', completed: 'पूरा हुआ', cancel: 'रद्द करें',
        complete: 'पूरा करें', contact: 'संपर्क', distance: 'दूरी', eta: 'समय'
      },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  }, [lang]);

  useEffect(() => {
    loadBooking();
    
    const channel = supabase
      .channel('booking-tracker-' + bookingId)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      }, (payload) => {
        setBooking(payload.new);
        if (payload.new.status === 'completed' && onComplete) {
          onComplete();
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'worker_locations',
        filter: `worker_id=eq.${workerId}`
      }, (payload) => {
        setWorkerLocation(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  const loadBooking = async () => {
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    const { data: locationData } = await supabase
      .from('worker_locations')
      .select('*')
      .eq('worker_id', workerId)
      .single();

    setBooking(bookingData);
    setWorkerLocation(locationData);
    setLoading(false);
  };

  const updateStatus = async (status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', bookingId);
  };

  if (loading) {
    return <div className="animate-pulse p-4 bg-white rounded-xl"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>;
  }

  if (!booking) return null;

  const isEmployer = currentUserId === employerId;
  const statusStep = ['accepted', 'in_progress', 'completed'].indexOf(booking.status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
        <MapPin size={18} className="text-green-600" />
        {t('tracking')}
      </h3>

      {/* Status Steps */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { key: 'accepted', label: t('workerArriving'), icon: Clock },
          { key: 'in_progress', label: t('inProgress'), icon: CheckCircle },
          { key: 'completed', label: t('completed'), icon: CheckCircle },
        ].map((step, i) => (
          <div key={step.key} className="flex-1 text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
              i <= statusStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              <step.icon size={14} />
            </div>
            <p className={`text-xs ${i <= statusStep ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>

      {/* Worker Location Info */}
      {workerLocation?.latitude && (
        <div className="bg-blue-50 rounded-xl p-3 mb-3 text-sm">
          <p className="text-blue-700">{t('distance')}: ... km</p>
          <p className="text-blue-700">{t('eta')}: ... min</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isEmployer && booking.status === 'accepted' && (
          <>
            <button onClick={() => updateStatus('in_progress')} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold">
              {t('arrived')}
            </button>
            <button onClick={() => updateStatus('cancelled')} className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm">
              <XCircle size={16} />
            </button>
          </>
        )}
        {isEmployer && booking.status === 'in_progress' && (
          <button onClick={() => updateStatus('completed')} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold">
            {t('complete')}
          </button>
        )}
        <a href={`tel:${booking.contact_phone}`} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm flex items-center gap-2">
          <Phone size={14} /> {t('contact')}
        </a>
      </div>
    </div>
  );
}
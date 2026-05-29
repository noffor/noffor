// components/booking/AutoBooking.tsx
import { supabase } from '@/lib/supabase';

interface BookingData {
  jobId: string;
  bidId: string;
  workerId: string;
  employerId: string;
  jobTitle: string;
  category: string;
  amount: number;
  employerPhone: string;
  location: string;
  lang: string;
}

export async function acceptBidAndCreateBooking(data: BookingData) {
  const { jobId, bidId, workerId, employerId, jobTitle, category, amount, employerPhone, location, lang } = data;

  // 1. Accept bid
  const { error: bidError } = await supabase
    .from('bids')
    .update({ status: 'accepted' })
    .eq('id', bidId);

  if (bidError) throw bidError;

  // 2. Reject other bids
  await supabase
    .from('bids')
    .update({ status: 'rejected' })
    .eq('job_id', jobId)
    .neq('id', bidId);

  // 3. Close job
  await supabase
    .from('job_posts')
    .update({ status: 'closed' })
    .eq('id', jobId);

  // 4. Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      job_id: jobId,
      worker_id: workerId,
      employer_id: employerId,
      worker_name: '',
      employer_name: '',
      job_title: jobTitle,
      job_description: '',
      category,
      offered_amount: amount,
      total_amount: amount,
      payment_type: 'fixed',
      payment_method: 'cash',
      location_text: location,
      contact_phone: employerPhone,
      start_date: new Date().toISOString().split('T')[0],
      start_time: new Date().toTimeString().split(' ')[0],
      duration_days: 1,
      status: 'accepted'
    })
    .select()
    .single();

  if (bookingError) throw bookingError;

  // 5. Notify worker
  await supabase.from('notifications').insert({
    user_id: workerId,
    title: lang === 'bn' ? 'অভিনন্দন! আপনি সিলেক্টেড' : 'Congratulations! You are selected',
    message: `${jobTitle} - ${amount} QAR`,
    type: 'booking_confirmed',
    is_read: false
  });

  // 6. Notify employer
  await supabase.from('notifications').insert({
    user_id: employerId,
    title: lang === 'bn' ? 'বুকিং কনফার্ম' : 'Booking Confirmed',
    message: `Booking #${booking.id.slice(0, 8)} confirmed`,
    type: 'booking_confirmed',
    is_read: false
  });

  return booking;
}

export async function completeBooking(bookingId: string, workerId: string, employerId: string) {
  // Update booking status
  await supabase.from('bookings').update({ 
    status: 'completed',
    completed_at: new Date().toISOString()
  }).eq('id', bookingId);

  // Log activity
  await supabase.from('live_activities').insert({
    profile_id: workerId,
    activity_type: 'job_completed',
    description: `Booking #${bookingId.slice(0,8)} completed`
  });

  await supabase.from('live_activities').insert({
    profile_id: employerId,
    activity_type: 'job_completed',
    description: `Booking #${bookingId.slice(0,8)} completed`
  });
}
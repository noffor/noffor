// components/booking/AutoBooking.ts - TypeScript Error ফিক্সড
import {supabase} from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা নোটিফিকেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{workerSelected:'🎉 Congratulations! You are selected',bookingConfirmed:'✅ Booking Confirmed',activityCompleted:'Booking completed',activityCreated:'Booking created',jobCompleted:'✅ Job Completed',pleaseRate:'Please rate the worker',bookingCancelled:'❌ Booking Cancelled'},
  bn:{workerSelected:'🎉 অভিনন্দন! আপনি সিলেক্টেড',bookingConfirmed:'✅ বুকিং কনফার্ম',activityCompleted:'বুকিং সম্পন্ন',activityCreated:'বুকিং তৈরি',jobCompleted:'✅ কাজ সম্পন্ন',pleaseRate:'শ্রমিককে রেটিং দিন',bookingCancelled:'❌ বুকিং বাতিল'},
  ar:{workerSelected:'🎉 مبروك! تم اختيارك',bookingConfirmed:'✅ تم تأكيد الحجز',activityCompleted:'تم إكمال الحجز',activityCreated:'تم إنشاء الحجز',jobCompleted:'✅ تم إكمال العمل',pleaseRate:'يرجى تقييم العامل',bookingCancelled:'❌ تم إلغاء الحجز'},
  hi:{workerSelected:'🎉 बधाई! आप चुने गए',bookingConfirmed:'✅ बुकिंग कन्फर्म',activityCompleted:'बुकिंग पूर्ण',activityCreated:'बुकिंग बनाई गई',jobCompleted:'✅ काम पूरा हुआ',pleaseRate:'श्रमिक को रेट करें',bookingCancelled:'❌ बुकिंग रद्द'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={RETRY_MAX:2};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface BookingData{
  jobId:string;bidId:string;workerId:string;employerId:string;
  jobTitle:string;category:string;amount:number;
  employerPhone:string;location:string;lang:string;
  employerName?:string;workerName?:string;
  jobDescription?:string;durationDays?:number;
  startDate?:string;startTime?:string;
}

// ═══════════════════════════════════════════════════════════
// Retry wrapper
// ═══════════════════════════════════════════════════════════
async function withRetry<T>(fn:()=>Promise<T>,retries=CONFIG.RETRY_MAX):Promise<T>{
  try{return await fn()}catch(err){if(retries>0)return withRetry(fn,retries-1);throw err}
}

// ═══════════════════════════════════════════════════════════
// Fire-and-forget notification
// ═══════════════════════════════════════════════════════════
function notify(userId:string,title:string,message:string,type:string,metadata?:any){
  supabase.from('notifications').insert({user_id:userId,title,message,type,is_read:false,metadata,created_at:new Date().toISOString()}).then(()=>{});
}

// ═══════════════════════════════════════════════════════════
// Get translations for lang
// ═══════════════════════════════════════════════════════════
function tr(lang:string):Record<string,string>{return T[lang]||T.en}

// ═══════════════════════════════════════════════════════════
// Accept Bid & Create Booking
// ═══════════════════════════════════════════════════════════
export async function acceptBidAndCreateBooking(data:BookingData){
  const{jobId,bidId,workerId,employerId,jobTitle,category,amount,employerPhone,location,lang,employerName='',workerName='',jobDescription='',durationDays=1,startDate,startTime}=data;
  const tx=tr(lang);

  // 1. Accept bid
  await withRetry(async()=>{
    const{error}=await supabase.from('bids').update({status:'accepted',accepted_at:new Date().toISOString()}).eq('id',bidId);
    if(error)throw error;
  });

  // 2. Reject other bids (fire-and-forget)
  supabase.from('bids').update({status:'rejected'}).eq('job_id',jobId).neq('id',bidId).then(()=>{});

  // 3. Close job (fire-and-forget)
  supabase.from('job_posts').update({status:'closed',closed_at:new Date().toISOString()}).eq('id',jobId).then(()=>{});

  // 4. Create booking
  const booking=await withRetry(async()=>{
    const{data:booking,error}=await supabase.from('bookings').insert({
      job_id:jobId,worker_id:workerId,employer_id:employerId,
      worker_name:workerName,employer_name:employerName,
      job_title:jobTitle,job_description:jobDescription||'',
      category,offered_amount:amount,total_amount:amount,
      payment_type:'fixed',payment_method:'cash',
      location_text:location,contact_phone:employerPhone,
      start_date:startDate||new Date().toISOString().split('T')[0],
      start_time:startTime||new Date().toTimeString().split(' ')[0].substring(0,5),
      duration_days:durationDays,status:'accepted',
      accepted_at:new Date().toISOString(),
    }).select().single();
    if(error)throw error;
    return booking;
  });

  // 5. Notify worker
  notify(workerId,tx.workerSelected,`${jobTitle} - ${amount} QAR`,'booking_confirmed',{booking_id:booking.id,job_id:jobId});

  // 6. Notify employer
  notify(employerId,tx.bookingConfirmed,`Booking #${booking.id.slice(0,8)} confirmed`,'booking_confirmed',{booking_id:booking.id});

  // 7. Log activity
  supabase.from('live_activities').insert([
    {profile_id:workerId,activity_type:'booking_created',description:`${tx.activityCreated} #${booking.id.slice(0,8)}`,metadata:{booking_id:booking.id}},
    {profile_id:employerId,activity_type:'booking_created',description:`${tx.activityCreated} #${booking.id.slice(0,8)}`,metadata:{booking_id:booking.id}}
  ]).then(()=>{});

  return booking;
}

// ═══════════════════════════════════════════════════════════
// Complete Booking
// ═══════════════════════════════════════════════════════════
export async function completeBooking(bookingId:string,workerId:string,employerId:string,lang:string='en'){
  const tx=tr(lang);

  await withRetry(async()=>{
    const{error}=await supabase.from('bookings').update({status:'completed',completed_at:new Date().toISOString()}).eq('id',bookingId);
    if(error)throw error;
  });

  supabase.from('live_activities').insert([
    {profile_id:workerId,activity_type:'job_completed',description:`${tx.activityCompleted} #${bookingId.slice(0,8)}`,metadata:{booking_id:bookingId}},
    {profile_id:employerId,activity_type:'job_completed',description:`${tx.activityCompleted} #${bookingId.slice(0,8)}`,metadata:{booking_id:bookingId}}
  ]).then(()=>{});

  notify(workerId,tx.jobCompleted,tx.activityCompleted,'job_completed',{booking_id:bookingId});
  notify(employerId,tx.jobCompleted,tx.pleaseRate,'job_completed',{booking_id:bookingId});
}

// ═══════════════════════════════════════════════════════════
// Cancel Booking
// ═══════════════════════════════════════════════════════════
export async function cancelBooking(bookingId:string,workerId:string,employerId:string,reason:string='',lang:string='en'){
  const tx=tr(lang);

  await withRetry(async()=>{
    const{error}=await supabase.from('bookings').update({status:'cancelled',cancelled_at:new Date().toISOString(),cancellation_reason:reason}).eq('id',bookingId);
    if(error)throw error;
  });

  notify(workerId,tx.bookingCancelled,reason||tx.bookingCancelled,'booking_cancelled',{booking_id:bookingId});
  notify(employerId,tx.bookingCancelled,reason||tx.bookingCancelled,'booking_cancelled',{booking_id:bookingId});
}
// hooks/useQuickHire.ts - ১ বিলিয়ন ইউজার • সুপারসনিক • TypeScript Error ফিক্সড
"use client";
import {useState,useCallback,useRef} from 'react';
import {supabase} from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={
  MAX_DISTANCE_KM:50,
  MAX_WORKERS:10,
  AVG_SPEED_KMPH:30,
  RETRY_MAX:2,
  EARTH_RADIUS_KM:6371,
};

// ═══════════════════════════════════════════════════════════
// ইউটিলিটি (Module-level pure functions)
// ═══════════════════════════════════════════════════════════
function calcDistance(lat1:number,lon1:number,lat2:number,lon2:number):number{
  const R=CONFIG.EARTH_RADIUS_KM;
  const dLat=(lat2-lat1)*Math.PI/180;
  const dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}

function calcETA(distanceKm:number):number{
  return Math.ceil((distanceKm/CONFIG.AVG_SPEED_KMPH)*60);
}

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface QuickHireResult{
  loading:boolean;
  error:string|null;
  booking:any|null;
  matchWorker:(userLat:number,userLng:number,country:string,employerPhone:string,employerName?:string,category?:string,amount?:number)=>Promise<any>;
  reset:()=>void;
}

// ═══════════════════════════════════════════════════════════
// useQuickHire Hook (Supersonic)
// ═══════════════════════════════════════════════════════════
export function useQuickHire():QuickHireResult{
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState<string|null>(null);
  const[booking,setBooking]=useState<any|null>(null);
  const retryRef=useRef(0);

  const matchWorker=useCallback(async(
    userLat:number,
    userLng:number,
    country:string,
    employerPhone:string,
    employerName:string='Employer',
    category:string='all',
    amount:number=100,
  ):Promise<any>=>{
    setLoading(true);
    setError(null);
    setBooking(null);
    retryRef.current=0;

    const attemptMatch=async():Promise<any>=>{
      try{
        // 1. Fetch nearby online workers
        let query=supabase
          .from('worker_locations')
          .select('*,profiles:worker_id(name,category,rating,phone,photo_url,expected_salary)')
          .eq('is_online',true)
          .gte('last_seen',new Date(Date.now()-5*60000).toISOString())
          .limit(CONFIG.MAX_WORKERS);

        const{data:workers,error:workerError}=await query;

        if(workerError)throw workerError;
        if(!workers||workers.length===0){
          setError('No online workers found nearby');
          setLoading(false);
          return null;
        }

        // 2. Calculate distance + filter + sort
        const withDistance=workers
          .map(w=>({
            ...w,
            distance:calcDistance(userLat,userLng,w.latitude,w.longitude),
            eta:0,
          }))
          .filter(w=>w.distance<=CONFIG.MAX_DISTANCE_KM)
          .map(w=>({...w,eta:calcETA(w.distance)}))
          .sort((a,b)=>a.distance-b.distance);

        if(withDistance.length===0){
          setError('No workers within 50km');
          setLoading(false);
          return null;
        }

        // 3. Pick closest worker
        const closest=withDistance[0];

        // 4. Create booking (✅ abortSignal রিমুভ করা হয়েছে)
        const{data:newBooking,error:bookingError}=await supabase
          .from('bookings')
          .insert({
            worker_id:closest.worker_id,
            employer_id:employerPhone,
            employer_phone:employerPhone,
            employer_name:employerName,
            job_title:category!=='all'?`${category} - Quick Hire`:'Quick Hire',
            job_description:'Quick hire request',
            category:closest.profiles?.category||'General',
            offered_amount:amount,
            total_amount:amount,
            payment_type:'fixed',
            payment_method:'cash',
            location_text:`${userLat.toFixed(4)},${userLng.toFixed(4)}`,
            location_lat:userLat,
            location_lng:userLng,
            worker_lat:closest.latitude,
            worker_lon:closest.longitude,
            distance_km:closest.distance,
            eta_minutes:closest.eta,
            start_date:new Date().toISOString().split('T')[0],
            start_time:new Date().toTimeString().split(' ')[0].substring(0,5),
            duration_days:1,
            contact_phone:employerPhone,
            status:'pending',
            special_instructions:'Quick Hire - Auto Matched',
          })
          .select()
          .single();

        if(bookingError)throw bookingError;

        // 5. Notify worker (fire-and-forget)
        supabase.from('notifications').insert({
          user_id:closest.worker_id,
          title:'🔔 New Quick Hire Request!',
          message:`${employerName} • ${closest.distance}km • ${closest.eta}min • ${amount} QAR`,
          type:'quick_hire',
          is_read:false,
          metadata:{booking_id:newBooking?.id},
        }).then(()=>{});

        const result={...newBooking,worker:closest};
        setBooking(result);
        setLoading(false);
        retryRef.current=0;
        return result;
      }catch(err:any){
        if(retryRef.current<CONFIG.RETRY_MAX){
          retryRef.current++;
          return attemptMatch();
        }
        
        setError(err.message||'Quick hire failed');
        setLoading(false);
        return null;
      }
    };

    return attemptMatch();
  },[]);

  const reset=useCallback(()=>{
    setLoading(false);
    setError(null);
    setBooking(null);
    retryRef.current=0;
  },[]);

  return{loading,error,booking,matchWorker,reset};
}
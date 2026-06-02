// components/booking/LiveTracker.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useEffect,useState,useRef,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {Navigation,Clock,MapPin,Loader2,AlertCircle} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{arriving:'Worker is arriving',eta:'ETA',min:'min',distance:'Distance',km:'km',tracking:'Live Tracking',noLocation:'Waiting for location...',error:'Tracking unavailable'},
  bn:{arriving:'শ্রমিক আসছেন',eta:'সময়',min:'মিনিট',distance:'দূরত্ব',km:'কিমি',tracking:'লাইভ ট্র্যাকিং',noLocation:'লোকেশনের জন্য অপেক্ষা...',error:'ট্র্যাকিং অনুপলব্ধ'},
  ar:{arriving:'العامل في الطريق',eta:'الوقت',min:'دقيقة',distance:'المسافة',km:'كم',tracking:'تتبع مباشر',noLocation:'في انتظار الموقع...',error:'التتبع غير متاح'},
  hi:{arriving:'श्रमिक आ रहे हैं',eta:'समय',min:'मिनट',distance:'दूरी',km:'किमी',tracking:'लाइव ट्रैकिंग',noLocation:'स्थान की प्रतीक्षा...',error:'ट्रैकिंग अनुपलब्ध'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={REFRESH_INTERVAL:5000,RETRY_MAX:3,AVG_SPEED_KMPH:30};

// ═══════════════════════════════════════════════════════════
// Distance Calculator (Module-level pure)
// ═══════════════════════════════════════════════════════════
function calcDistance(lat1:number,lon1:number,lat2:number,lon2:number):number{
  const R=6371;const dLat=(lat2-lat1)*Math.PI/180;const dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}

function calcETA(dist:number):number{return Math.ceil((dist/CONFIG.AVG_SPEED_KMPH)*60)}

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{bookingId:string;workerId:string;lang:string}

// ═══════════════════════════════════════════════════════════
// LiveTracker (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const LiveTracker=React.memo(({bookingId,workerId,lang}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[workerPos,setWorkerPos]=useState<{lat:number;lng:number}|null>(null);
  const[userPos,setUserPos]=useState<{lat:number;lng:number}|null>(null);
  const[distance,setDistance]=useState<number>(0);
  const[eta,setEta]=useState<number>(0);
  const[error,setError]=useState(false);
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const aliveRef=useRef(true);
  const retryRef=useRef(0);

  // Get user location
  useEffect(()=>{
    aliveRef.current=true;
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        pos=>{if(aliveRef.current)startTransition(()=>setUserPos({lat:pos.coords.latitude,lng:pos.coords.longitude}))},
        ()=>{}, // Silent fail
        {timeout:5000,maximumAge:60000}
      );
    }
    return()=>{aliveRef.current=false};
  },[]);

  // Track worker
  const trackWorker=useCallback(async()=>{
    if(!aliveRef.current)return;
    try{
      const{data,error:e}=await supabase.from('worker_locations').select('latitude,longitude').eq('worker_id',workerId).single();
      if(e)throw e;
      if(!aliveRef.current)return;

      if(data?.latitude){
        startTransition(()=>{
          const pos={lat:data.latitude,lng:data.longitude};
          setWorkerPos(pos);setError(false);
          if(userPos){const dist=calcDistance(userPos.lat,userPos.lng,pos.lat,pos.lng);setDistance(dist);setEta(calcETA(dist))}
        });
        retryRef.current=0;
      }
    }catch{
      if(retryRef.current<CONFIG.RETRY_MAX){retryRef.current++}else{startTransition(()=>setError(true))}
    }
  },[workerId,userPos]);

  useEffect(()=>{
    trackWorker();
    intervalRef.current=setInterval(trackWorker,CONFIG.REFRESH_INTERVAL);
    return()=>{if(intervalRef.current)clearInterval(intervalRef.current)};
  },[trackWorker]);

  return(
    <div className="bg-white rounded-xl p-3 border border-gray-100" style={{transform:'translateZ(0)'}}>
      <div className="flex items-center gap-2 mb-2">
        <Navigation size={16} className={`${error?'text-gray-400':'text-green-600 animate-pulse'}`}/>
        <p className="text-sm font-bold text-gray-800">{tr.tracking}</p>
      </div>

      {error?(
        <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{tr.error}</p>
      ):!workerPos?(
        <p className="text-xs text-gray-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/>{tr.noLocation}</p>
      ):(
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1"><MapPin size={12}/>{tr.distance}: <b className="text-gray-800">{distance}</b> {tr.km}</span>
          <span className="flex items-center gap-1 font-bold text-green-600"><Clock size={12}/>{tr.eta}: <b>{eta}</b> {tr.min}</span>
        </div>
      )}
    </div>
  );
});

LiveTracker.displayName='LiveTracker';

export default LiveTracker;
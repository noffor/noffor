// components/home/NearWorkersSection.tsx - ১ বিলিয়ন ইউজার • বেস্ট প্র্যাকটিস
"use client";
import React,{useState,useEffect,useCallback,useMemo,startTransition,lazy,Suspense} from 'react';
import {Worker,UserLocation} from '@/types';
import {Loader2,MapPin,AlertCircle,RefreshCw} from 'lucide-react';

const NearWorkers=lazy(()=>import('@/components/NearWorkers'));
const BookingForm=lazy(()=>import('@/components/BookingForm'));

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={
  LOCATION_CACHE_TTL:300000,  // 5 min cache
  GEOLOCATION_TIMEOUT:10000,  // 10s timeout
  RETRY_MAX:1,                // 1 retry only
  RETRY_DELAY:2000,           // 2s delay between retries
};

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{locating:'Getting your location...',locationDenied:'Location access denied',locationUnavailable:'Location unavailable',retry:'Try Again',enableLocation:'Please enable GPS to see nearby workers',noWorkers:'No workers nearby',enableGPS:'Enable GPS',locationFound:'Location found!'},
  bn:{locating:'আপনার লোকেশন নেওয়া হচ্ছে...',locationDenied:'লোকেশন অনুমতি প্রয়োজন',locationUnavailable:'লোকেশন পাওয়া যায়নি',retry:'আবার চেষ্টা',enableLocation:'কাছের শ্রমিক দেখতে GPS চালু করুন',noWorkers:'কাছাকাছি কোনো শ্রমিক নেই',enableGPS:'GPS চালু করুন',locationFound:'লোকেশন পাওয়া গেছে!'},
  ar:{locating:'جاري تحديد موقعك...',locationDenied:'تم رفض الوصول للموقع',locationUnavailable:'الموقع غير متاح',retry:'إعادة',enableLocation:'يرجى تشغيل GPS لرؤية العمال',noWorkers:'لا يوجد عمال قريبين',enableGPS:'تشغيل GPS',locationFound:'تم العثور على الموقع!'},
  hi:{locating:'आपका स्थान लिया जा रहा...',locationDenied:'स्थान अनुमति अस्वीकृत',locationUnavailable:'स्थान अनुपलब्ध',retry:'पुनः प्रयास',enableLocation:'पास के श्रमिक देखने के लिए GPS चालू करें',noWorkers:'पास में कोई श्रमिक नहीं',enableGPS:'GPS चालू करें',locationFound:'स्थान मिल गया!'},
};

// ═══════════════════════════════════════════════════════════
// লোকেশন ক্যাশে
// ═══════════════════════════════════════════════════════════
const locationCache=new Map<string,{data:UserLocation;timestamp:number}>();

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{country:string;lang:string}

// ═══════════════════════════════════════════════════════════
// NearWorkersSection (Best Practice • 1B Ready)
// ═══════════════════════════════════════════════════════════
const NearWorkersSection=React.memo(({country,lang}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[userLocation,setUserLocation]=useState<UserLocation|null>(null);
  const[selectedWorker,setSelectedWorker]=useState<Worker|null>(null);
  const[locating,setLocating]=useState(true);
  const[error,setError]=useState<string|null>(null);
  const[permissionDenied,setPermissionDenied]=useState(false);
  const retryRef=React.useRef(0);
  const aliveRef=React.useRef(true);
  const timeoutRef=React.useRef<ReturnType<typeof setTimeout>|null>(null);

  // ✅ Best Practice: Simple getCurrentPosition with Cache + 1 Retry
  const getLocation=useCallback(()=>{
    if(!aliveRef.current)return;
    const cacheKey=`loc:${country}`;

    // 1. Cache check
    const cached=locationCache.get(cacheKey);
    if(cached&&Date.now()-cached.timestamp<CONFIG.LOCATION_CACHE_TTL){
      startTransition(()=>{
        setUserLocation(cached.data);
        setLocating(false);
        setError(null);
        setPermissionDenied(false);
      });
      return;
    }

    // 2. Session cache
    try{
      const sc=sessionStorage.getItem(cacheKey);
      if(sc){
        const p=JSON.parse(sc);
        if(Date.now()-p.t<CONFIG.LOCATION_CACHE_TTL){
          const loc={lat:p.lat,lng:p.lng};
          locationCache.set(cacheKey,{data:loc,timestamp:p.t});
          startTransition(()=>{setUserLocation(loc);setLocating(false);setError(null)});
          return;
        }
      }
    }catch{}

    // 3. Geolocation - শুধু ১ বার request
    if(!navigator.geolocation){
      startTransition(()=>{setError(tr.locationUnavailable);setLocating(false)});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // ✅ Success
      (pos)=>{
        if(!aliveRef.current)return;
        const loc={lat:pos.coords.latitude,lng:pos.coords.longitude};
        // Cache
        locationCache.set(cacheKey,{data:loc,timestamp:Date.now()});
        try{sessionStorage.setItem(cacheKey,JSON.stringify({...loc,t:Date.now()}))}catch{}
        startTransition(()=>{
          setUserLocation(loc);
          setLocating(false);
          setError(null);
          setPermissionDenied(false);
        });
        retryRef.current=0;
      },
      // ✅ Error - শুধু ১ বার retry
      (err)=>{
        if(!aliveRef.current)return;
        console.log('GPS Error:',err.code);
        
        if(err.code===1){
          // Permission denied - retry না, শুধু message
          startTransition(()=>{
            setPermissionDenied(true);
            setError(tr.locationDenied);
            setLocating(false);
          });
        }else if(retryRef.current<CONFIG.RETRY_MAX){
          // Position unavailable / Timeout - ১ বার retry
          retryRef.current++;
          timeoutRef.current=setTimeout(getLocation,CONFIG.RETRY_DELAY);
        }else{
          startTransition(()=>{
            setError(tr.locationUnavailable);
            setLocating(false);
          });
        }
      },
      {
        enableHighAccuracy:true,
        timeout:CONFIG.GEOLOCATION_TIMEOUT,
        maximumAge:CONFIG.LOCATION_CACHE_TTL,
      }
    );
  },[country,tr]);

  useEffect(()=>{
    aliveRef.current=true;
    getLocation();
    return()=>{
      aliveRef.current=false;
      if(timeoutRef.current)clearTimeout(timeoutRef.current);
    };
  },[getLocation]);

  // ✅ Retry handler - ইউজার manually retry করতে পারে
  const handleRetry=useCallback(()=>{
    retryRef.current=0;
    startTransition(()=>{
      setLocating(true);
      setError(null);
      setPermissionDenied(false);
    });
    getLocation();
  },[getLocation]);

  // ✅ GPS Enable - আবার permission request
  const handleEnableGPS=useCallback(()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        ()=>{handleRetry()},  // Success = retry
        ()=>{},               // Still denied = do nothing
        {timeout:5000}
      );
    }
    handleRetry();
  },[handleRetry]);

  const handleBook=useCallback((worker:Worker)=>startTransition(()=>setSelectedWorker(worker)),[]);
  const handleClose=useCallback(()=>startTransition(()=>setSelectedWorker(null)),[]);

  // Loading
  if(locating)return(
    <div className="bg-white rounded-xl border p-6 flex flex-col items-center justify-center gap-3 animate-fade-in">
      <Loader2 size={24} className="animate-spin text-orange-500"/>
      <p className="text-sm text-gray-500">{tr.locating}</p>
    </div>
  );

  // Error / Permission Denied
  if(permissionDenied||error)return(
    <div className="bg-white rounded-xl border p-6 flex flex-col items-center justify-center gap-3 text-center animate-fade-in">
      <AlertCircle size={32} className="text-red-400"/>
      <p className="text-sm text-red-500">{error}</p>
      <p className="text-xs text-gray-400">{tr.enableLocation}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={handleRetry} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center gap-2">
          <RefreshCw size={14}/>{tr.retry}
        </button>
        <button onClick={handleEnableGPS} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center gap-2">
          <MapPin size={14}/>{tr.enableGPS}
        </button>
      </div>
    </div>
  );

  if(!userLocation)return null;

  return(
    <div style={{contain:'layout style paint'}}>
      <Suspense fallback={<div className="bg-white rounded-xl border p-4 animate-pulse h-48"/>}>
        <NearWorkers country={country} lang={lang} userLocation={userLocation} onBook={handleBook}/>
      </Suspense>
      {selectedWorker&&(
        <Suspense fallback={null}>
          <BookingForm worker={selectedWorker} isOpen={!!selectedWorker} onClose={handleClose} country={country} lang={lang}/>
        </Suspense>
      )}
    </div>
  );
});

NearWorkersSection.displayName='NearWorkersSection';

export default NearWorkersSection;
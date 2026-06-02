// app/[country]/[lang]/page.tsx - HeroBanner Lazy Load + FCP Optimized
"use client";
import React,{useState,useEffect,useCallback,useMemo,useRef,startTransition,lazy,Suspense} from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import CategoryGrid from '@/components/home/CategoryGrid';
import UnifiedList from '@/components/home/UnifiedList';
import HomeTabs from '@/components/home/HomeTabs';
import ErrorBoundary from '@/components/ErrorBoundary';
import {Crosshair,Wifi,WifiOff} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import {useParams} from 'next/navigation';

// ✅ Lazy Load Heavy Components
const HeroBanner = lazy(() => import('@/components/home/HeroBanner'));
const LiveWorkerMap = lazy(() => import('@/components/map/LiveWorkerMap'));

const CONFIG={
  ONLINE_CACHE_KEY:'noffor_worker_online',
  WORKER_CACHE_KEY:'noffor_worker',
  LOCATION_CACHE_TTL:300000,
  GEOLOCATION_TIMEOUT:5000,
};

const T:Record<string,Record<string,string>>={
  en:{quick:'Quick',hire:'Hire',online:'Online',offline:'Offline',hideMap:'Hide Map',login:'Login first'},
  bn:{quick:'কুইক',hire:'হায়ার',online:'অন',offline:'অফ',hideMap:'ম্যাপ লুকান',login:'লগইন করুন'},
  ar:{quick:'سريع',hire:'توظيف',online:'اتصال',offline:'فصل',hideMap:'إخفاء',login:'تسجيل الدخول'},
  hi:{quick:'क्विक',hire:'हायर',online:'ऑन',offline:'ऑफ',hideMap:'मैप छुपाएं',login:'लॉगिन करें'},
};

const OnlineToggle=React.memo(({online,onClick,lang}:{online:boolean;onClick:()=>void;lang:string})=>{
  const txt=T[lang]||T.en;
  return(
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${online?'bg-red-500 text-white':'bg-gray-600 text-white'}`}>
      {online?<WifiOff size={14}/>:<Wifi size={14}/>}{online?txt.offline:txt.online}
      <span className={`w-1.5 h-1.5 rounded-full ${online?'bg-green-300 animate-pulse':'bg-gray-400'}`}/>
    </button>
  );
});
OnlineToggle.displayName='OnlineToggle';

const MapToggle=React.memo(({showMap,onClick,lang}:{showMap:boolean;onClick:()=>void;lang:string})=>{
  const txt=T[lang]||T.en;
  return(
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${showMap?'bg-green-600 text-white':'bg-white text-gray-600 border hover:bg-gray-50'}`}>
      <Crosshair size={14}/>{showMap?txt.hideMap:`${txt.quick} ${txt.hire}`}
    </button>
  );
});
MapToggle.displayName='MapToggle';

const PCLayout=React.memo(({country,lang,showMap,userLocation,online,toggleMap,toggleOnline}:{
  country:string;lang:string;showMap:boolean;userLocation:{lat:number;lng:number}|null;
  online:boolean;toggleMap:()=>void;toggleOnline:()=>void;
})=>(
  <div className="hidden lg:block">
    <div className="flex items-center gap-2 mb-3">
      <MapToggle showMap={showMap} onClick={toggleMap} lang={lang}/>
      <OnlineToggle online={online} onClick={toggleOnline} lang={lang}/>
    </div>
    {showMap&&userLocation?(
      <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-xl"/>}>
        <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng}/>
      </Suspense>
    ):(
      <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-xl"/>}>
        <HeroBanner country={country} lang={lang}/>
      </Suspense>
    )}
    <div className="flex gap-4 mt-4">
      <div className="w-56 shrink-0"><Sidebar country={country} lang={lang}/></div>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl p-4 border mb-4"><UnifiedList type="labor" country={country} lang={lang}/></div>
        <div className="bg-white rounded-xl p-4 border"><UnifiedList type="employer" country={country} lang={lang}/></div>
      </div>
    </div>
  </div>
));
PCLayout.displayName='PCLayout';

const MobileLayout=React.memo(({country,lang}:{country:string;lang:string})=>(
  <div className="lg:hidden">
    <Suspense fallback={<div className="h-40 bg-gray-200 animate-pulse rounded-xl"/>}>
      <HeroBanner country={country} lang={lang}/>
    </Suspense>
    <div className="mt-3"><HomeTabs country={country} lang={lang}/></div>
    <div className="bg-white rounded-xl p-3 border mt-3"><CategoryGrid country={country} lang={lang}/></div>
    <div className="bg-white rounded-xl p-3 border mt-3"><UnifiedList type="labor" country={country} lang={lang}/></div>
    <div className="bg-white rounded-xl p-3 border mt-3"><UnifiedList type="employer" country={country} lang={lang}/></div>
  </div>
));
MobileLayout.displayName='MobileLayout';

function HomePage(){
  const params=useParams();
  const country=(params as any).country||'qa';
  const lang=(params as any).lang||'en';
  const[showMap,setShowMap]=useState(false);
  const[userLocation,setUserLocation]=useState<{lat:number;lng:number}|null>(null);
  const[online,setOnline]=useState(false);
  const[mounted,setMounted]=useState(false);
  const alive=useRef(true);

  useEffect(()=>{setMounted(true)},[]);

  useEffect(()=>{
    alive.current=true;
    try{const s=sessionStorage.getItem('on')||localStorage.getItem('on');if(s&&alive.current)startTransition(()=>setOnline(JSON.parse(s)))}catch{}
    try{const c=sessionStorage.getItem('loc');if(c){const p=JSON.parse(c);if(Date.now()-p.t<CONFIG.LOCATION_CACHE_TTL){startTransition(()=>setUserLocation({lat:p.lat,lng:p.lng}));return}}}catch{}
    if(typeof window!=='undefined'&&navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos)=>{if(!alive.current)return;const l={lat:pos.coords.latitude,lng:pos.coords.longitude};startTransition(()=>setUserLocation(l));try{sessionStorage.setItem('loc',JSON.stringify({...l,t:Date.now()}))}catch{}},()=>{},{timeout:CONFIG.GEOLOCATION_TIMEOUT,maximumAge:CONFIG.LOCATION_CACHE_TTL});
    }
    return()=>{alive.current=false};
  },[]);

  const toggleMap=useCallback(()=>startTransition(()=>setShowMap(p=>!p)),[]);
  const toggleOnline=useCallback(async()=>{
    const n=!online;
    startTransition(()=>setOnline(n));
    try{sessionStorage.setItem('on',JSON.stringify(n));localStorage.setItem('on',JSON.stringify(n))}catch{}
    try{
      const w=localStorage.getItem('worker');
      if(w){const p=JSON.parse(w);await supabase.from('profiles').update({is_online:n}).eq('id',p.id)}
      else{const txt=T[lang]||T.en;alert(txt.login);startTransition(()=>setOnline(false))}
    }catch{startTransition(()=>setOnline(!n))}
  },[online,lang]);

  const pcLayout=useMemo(()=><PCLayout country={country} lang={lang} showMap={showMap} userLocation={userLocation} online={online} toggleMap={toggleMap} toggleOnline={toggleOnline}/>,[country,lang,showMap,userLocation,online,toggleMap,toggleOnline]);
  const mobileLayout=useMemo(()=><MobileLayout country={country} lang={lang}/>,[country,lang]);

  if(!mounted) return <div className="min-h-screen bg-gray-50"/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header country={country} lang={lang}/>
      <main className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        {pcLayout}
        {mobileLayout}
      </main>
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}

export default function HomePageWithErrorBoundary(){
  return(
    <ErrorBoundary lang="en">
      <HomePage/>
    </ErrorBoundary>
  );
}
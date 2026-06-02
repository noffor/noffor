// components/map/LiveWorkerMap.tsx - সব Worker দেখানোর ফিক্স + Full Height
"use client";
import React,{useEffect,useRef,useState,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {Navigation,X,Loader2,MapPin,Clock,Star,Users,AlertCircle,RefreshCw} from 'lucide-react';

interface Worker{
  worker_id:string;
  latitude:number;
  longitude:number;
  is_online:boolean;
  last_seen:string;
  profiles?:{name:string;photo_url:string;category:string;rating:number;country:string};
  distance?:number;
  eta?:number;
}

interface Props{
  country:string;lang:string;
  userLat?:number;userLng?:number;
  onSelectWorker?:(worker:Worker)=>void;
}

const COUNTRY_CENTERS:Record<string,{lat:number;lng:number}>={
  qa:{lat:25.3548,lng:51.1839},sa:{lat:24.7136,lng:46.6753},ae:{lat:25.2048,lng:55.2708},
  kw:{lat:29.3759,lng:47.9774},bh:{lat:26.0667,lng:50.5577},om:{lat:23.5880,lng:58.3829},
};

function calcDistance(lat1:number,lon1:number,lat2:number,lon2:number):number{
  const R=6371;const dLat=(lat2-lat1)*Math.PI/180;const dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}
function calcETA(dist:number):number{return Math.ceil((dist/30)*60)}

const T:Record<string,Record<string,string>>={
  en:{nearWorkers:'Nearby Workers',noWorkers:'No online workers',loading:'Loading...',km:'km',eta:'ETA',min:'min',hire:'Hire Now',viewProfile:'View Profile',error:'Failed to load',retry:'Retry',allWorkers:'All Workers'},
  bn:{nearWorkers:'কাছের শ্রমিক',noWorkers:'কোনো অনলাইন শ্রমিক নেই',loading:'লোড হচ্ছে...',km:'কিমি',eta:'সময়',min:'মিনিট',hire:'হায়ার করুন',viewProfile:'প্রোফাইল',error:'লোড ব্যর্থ',retry:'আবার চেষ্টা',allWorkers:'সব শ্রমিক'},
  ar:{nearWorkers:'العمال القريبون',noWorkers:'لا يوجد عمال',loading:'جاري...',km:'كم',eta:'الوقت',min:'دقيقة',hire:'توظيف',viewProfile:'الملف',error:'فشل',retry:'إعادة',allWorkers:'جميع العمال'},
  hi:{nearWorkers:'पास के श्रमिक',noWorkers:'कोई नहीं',loading:'लोड...',km:'किमी',eta:'समय',min:'मिनट',hire:'हायर',viewProfile:'प्रोफाइल',error:'विफल',retry:'पुनः प्रयास',allWorkers:'सभी श्रमिक'},
};

let globalMap:any=null;
let globalMarkers:any[]=[];

export default function LiveWorkerMap({country,lang,userLat,userLng,onSelectWorker}:Props){
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[workers,setWorkers]=useState<Worker[]>([]);
  const[selected,setSelected]=useState<Worker|null>(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(false);
  const[mounted,setMounted]=useState(false);
  const mapRef=useRef<HTMLDivElement>(null);
  const LRef=useRef<any>(null);
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const aliveRef=useRef(true);

  useEffect(()=>{setMounted(true);aliveRef.current=true;return()=>{aliveRef.current=false}},[]);

  useEffect(()=>{
    if(!mounted||typeof window==='undefined'||!mapRef.current)return;
    if(globalMap){globalMap.remove();globalMap=null;globalMarkers=[]}
    import('leaflet').then(L=>{
      if(!mapRef.current||!aliveRef.current)return;
      LRef.current=L.default;
      if(!document.getElementById('leaflet-css')){
        const link=document.createElement('link');link.id='leaflet-css';link.rel='stylesheet';
        link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(link);
      }
      const center=COUNTRY_CENTERS[country]||COUNTRY_CENTERS.qa;
      const map=L.map(mapRef.current,{zoomControl:true,attributionControl:false}).setView([center.lat,center.lng],12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM',maxZoom:19}).addTo(map);
      if(userLat&&userLng){
        L.circleMarker([userLat,userLng],{radius:8,color:'#3B82F6',fillColor:'#3B82F6',fillOpacity:1,weight:3}).bindPopup('📍 You are here').addTo(map);
      }
      globalMap=map;loadWorkers();
    }).catch(()=>{if(aliveRef.current)setError(true);setLoading(false)});
    return()=>{if(intervalRef.current)clearInterval(intervalRef.current)};
  },[mounted]);

  useEffect(()=>{
    if(!globalMap||!mounted)return;
    const center=COUNTRY_CENTERS[country]||COUNTRY_CENTERS.qa;
    globalMap.setView([center.lat,center.lng],12);loadWorkers();
  },[country]);

  // ✅ সব worker দেখান - online + offline
  const loadWorkers=useCallback(async()=>{
    const map=globalMap;
    if(!map||!LRef.current||!aliveRef.current)return;
    try{
      // ✅ online + offline সব worker fetch
      const{data,error:e}=await supabase
        .from('worker_locations')
        .select('*,profiles:worker_id(name,photo_url,category,rating,country)')
        .limit(100); // ✅ সব worker, online filter নেই

      if(e)throw e;
      if(!aliveRef.current)return;

      const L=LRef.current;
      globalMarkers.forEach(mk=>map.removeLayer(mk));
      globalMarkers=[];

      const filtered=(data||[]).filter((w:any)=>!w.profiles?.country||w.profiles.country===country);
      
      const enriched=filtered.map((w:any)=>({
        ...w,
        distance:userLat?calcDistance(userLat,userLng||0,w.latitude,w.longitude):undefined,
        eta:userLat?calcETA(calcDistance(userLat,userLng||0,w.latitude,w.longitude)):undefined
      })).sort((a:any,b:any)=>(a.distance||999)-(b.distance||999));

      enriched.forEach((worker:any,i:number)=>{
        const isOnline=worker.is_online;
        const marker=L.circleMarker([worker.latitude,worker.longitude],{
          radius:i===0?10:7,
          color:'#fff',
          fillColor:isOnline?(i===0?'#22c55e':'#3b82f6'):'#9ca3af', // ✅ offline = gray
          fillOpacity:isOnline?1:0.5,
          weight:2
        }).addTo(map);

        const statusText=isOnline?'🟢 Online':'🔴 Offline';
        marker.bindPopup(`<b>${worker.profiles?.name||'Worker'}</b><br/>${worker.distance||'?'} km<br/>${statusText}`);
        marker.on('click',()=>{startTransition(()=>{setSelected(worker);onSelectWorker?.(worker)})});
        globalMarkers.push(marker);
      });

      startTransition(()=>{setWorkers(enriched);setLoading(false);setError(false)});
    }catch{if(aliveRef.current){startTransition(()=>setError(true));setLoading(false)}}
  },[userLat,userLng,country,onSelectWorker]);

  useEffect(()=>{
    if(!mounted)return;
    intervalRef.current=setInterval(loadWorkers,15000);
    return()=>{if(intervalRef.current)clearInterval(intervalRef.current)};
  },[loadWorkers,mounted]);

  if(!mounted)return <div className="bg-white rounded-2xl border h-64 animate-pulse"/>;

  // Loading State
  if(loading)return(
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-green-50 flex items-center gap-2"><Navigation size={16} className="text-blue-600"/><span className="text-sm font-bold text-gray-800">{tr.loading}</span></div>
      <div className="w-full h-64 lg:h-96 bg-gray-100 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-orange-500"/></div>
    </div>
  );

  // Error State
  if(error)return(
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-3 border-b bg-gradient-to-r from-red-50 to-orange-50 flex items-center gap-2"><AlertCircle size={16} className="text-red-500"/><span className="text-sm font-bold text-red-600">{tr.error}</span></div>
      <div className="w-full h-64 lg:h-96 bg-gray-100 flex flex-col items-center justify-center gap-3"><AlertCircle size={32} className="text-red-400"/><button onClick={loadWorkers} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center gap-2"><RefreshCw size={14}/>{tr.retry}</button></div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" style={{contain:'layout style paint'}}>
      {/* Header */}
      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-green-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
          <Navigation size={16} className="text-blue-600"/>
          {tr.allWorkers||tr.nearWorkers}
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{workers.length}</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/>Online</span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"/>Offline</span>
        </div>
      </div>

      {/* Map - Full Height */}
      <div ref={mapRef} className="w-full h-64 lg:h-96 relative bg-gray-100" style={{minHeight:'300px'}}/>

      {/* Selected Worker */}
      {selected&&(
        <div className="p-3 border-t bg-white animate-slide-up">
          <div className="flex items-start gap-3">
            <img src={selected.profiles?.photo_url||'/default-avatar.png'} className="w-10 h-10 rounded-full object-cover bg-gray-100" alt="" loading="lazy" onError={(e)=>{(e.target as HTMLImageElement).src='/default-avatar.png'}}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm truncate">{selected.profiles?.name}<span className={`ml-2 text-xs ${selected.is_online?'text-green-600':'text-gray-400'}`}>{selected.is_online?'🟢':'🔴'}</span></p>
                <button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
              </div>
              <p className="text-xs text-gray-500">{selected.profiles?.category}{selected.profiles?.rating?<span className="ml-1 text-yellow-500">⭐{selected.profiles.rating}</span>:null}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                {selected.distance&&<span className="flex items-center gap-1"><MapPin size={10}/>{selected.distance}{tr.km}</span>}
                {selected.eta&&<span className="text-green-600 font-medium flex items-center gap-1"><Clock size={10}/>{tr.eta}:{selected.eta}{tr.min}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 active:scale-[0.98] transition-all">{tr.hire}</button>
            <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 active:scale-[0.98] transition-all">{tr.viewProfile}</button>
          </div>
        </div>
      )}
    </div>
  );
}
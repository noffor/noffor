// components/home/OnlineToggle.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useEffect,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {Wifi,WifiOff,MapPin,MapPinOff,Loader2,AlertCircle,RefreshCw,Shield} from 'lucide-react';
import LiveLocationTracker from '@/components/worker/LiveLocationTracker';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{online:'You are Online',offline:'You are Offline',goOnline:'Go Online',goOffline:'Go Offline',accepting:'Accepting requests',notAccepting:'Not accepting requests',loginRequired:'Please login as a worker first',locationOn:'📍 Location sharing ON',locationOff:'📍 Location sharing OFF',trackingActive:'Live tracking active',available:'Available for work',enableLocation:'Enable location to go online',error:'Failed to update',retry:'Retry'},
  bn:{online:'আপনি অনলাইন',offline:'আপনি অফলাইন',goOnline:'অনলাইন হোন',goOffline:'অফলাইন হোন',accepting:'রিকোয়েস্ট গ্রহণ করছেন',notAccepting:'রিকোয়েস্ট বন্ধ',loginRequired:'শ্রমিক হিসাবে লগইন করুন',locationOn:'📍 লোকেশন শেয়ারিং চালু',locationOff:'📍 লোকেশন শেয়ারিং বন্ধ',trackingActive:'লাইভ ট্র্যাকিং সক্রিয়',available:'কাজের জন্য উপলব্ধ',enableLocation:'অনলাইন হতে লোকেশন চালু করুন',error:'আপডেট ব্যর্থ',retry:'আবার চেষ্টা'},
  ar:{online:'أنت متصل',offline:'أنت غير متصل',goOnline:'اتصل',goOffline:'افصل',accepting:'قبول الطلبات',notAccepting:'الطلبات متوقفة',loginRequired:'يرجى تسجيل الدخول كعامل',locationOn:'📍 مشاركة الموقع مفعلة',locationOff:'📍 مشاركة الموقع معطلة',trackingActive:'التتبع المباشر نشط',available:'متاح للعمل',enableLocation:'فعل الموقع للاتصال',error:'فشل التحديث',retry:'إعادة'},
  hi:{online:'आप ऑनलाइन हैं',offline:'आप ऑफलाइन हैं',goOnline:'ऑनलाइन हों',goOffline:'ऑफलाइन हों',accepting:'रिक्वेस्ट स्वीकार',notAccepting:'रिक्वेस्ट बंद',loginRequired:'श्रमिक के रूप में लॉगिन करें',locationOn:'📍 लोकेशन शेयरिंग चालू',locationOff:'📍 लोकेशन शेयरिंग बंद',trackingActive:'लाइव ट्रैकिंग सक्रिय',available:'काम के लिए उपलब्ध',enableLocation:'ऑनलाइन होने के लिए लोकेशन चालू करें',error:'अपडेट विफल',retry:'पुनः प्रयास'},
};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{profileId:string;initial:boolean;lang:string;onStatusChange?:(isOnline:boolean)=>void}

// ═══════════════════════════════════════════════════════════
// OnlineToggle (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const OnlineToggle=React.memo(({profileId,initial,lang,onStatusChange}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[online,setOnline]=useState(initial);
  const[loading,setLoading]=useState(false);
  const[locationEnabled,setLocationEnabled]=useState(false);
  const[error,setError]=useState<string|null>(null);

  // Check location permission
  useEffect(()=>{
    if(online&&navigator.permissions){
      navigator.permissions.query({name:'geolocation'}).then(result=>{
        startTransition(()=>setLocationEnabled(result.state==='granted'));
        result.onchange=()=>startTransition(()=>setLocationEnabled(result.state==='granted'));
      });
    }
  },[online]);

  const toggle=useCallback(async()=>{
    if(!profileId){alert(tr.loginRequired);return}
    
    startTransition(()=>{setLoading(true);setError(null)});
    const next=!online;

    // Location check when going online
    if(next&&navigator.geolocation){
      try{
        const permission=await navigator.permissions.query({name:'geolocation'});
        if(permission.state==='denied'){startTransition(()=>{setError(tr.enableLocation);setLoading(false)});return}
        if(permission.state==='prompt'){
          await new Promise<void>((resolve,reject)=>{navigator.geolocation.getCurrentPosition(()=>resolve(),()=>reject())});
        }
        startTransition(()=>setLocationEnabled(true));
      }catch{startTransition(()=>{setError(tr.enableLocation);setLoading(false)});return}
    }

    // Update Supabase
    const{error:updateError}=await supabase
      .from('profiles')
      .update({is_online:next,last_online:new Date().toISOString(),updated_at:new Date().toISOString()})
      .eq('id',profileId);

    if(updateError){startTransition(()=>{setError(updateError.message);setLoading(false)});return}

    // Success
    startTransition(()=>setOnline(next));
    localStorage.setItem('noffor_worker_online',JSON.stringify(next));
    
    const stored=localStorage.getItem('noffor_user');
    if(stored){const user=JSON.parse(stored);user.is_online=next;localStorage.setItem('noffor_user',JSON.stringify(user))}
    
    onStatusChange?.(next);
    window.dispatchEvent(new CustomEvent('worker-online-status',{detail:{online:next,workerId:profileId}}));
    startTransition(()=>setLoading(false));
  },[online,profileId,tr,onStatusChange]);

  return(
    <div style={{contain:'layout style paint'}}>
      <LiveLocationTracker workerId={profileId} isOnline={online} lang={lang}/>
      
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm w-full" style={{transform:'translateZ(0)'}}>
        {/* Error */}
        {error&&(
          <div className="mb-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl flex items-center justify-between">
            <span className="flex items-center gap-1.5"><AlertCircle size={12}/>{error}</span>
            <button onClick={toggle} className="text-red-600 underline">{tr.retry}</button>
          </div>
        )}

        {/* Status */}
        <div className={`text-center mb-3 py-4 rounded-xl transition-all ${online?'bg-green-50':'bg-gray-100'}`}>
          <div className="flex items-center justify-center gap-2">
            {online?(
              <div className="relative">
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-75"/>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"/>
                </span>
                <Wifi size={24} className="text-green-500"/>
              </div>
            ):<WifiOff size={24} className="text-gray-400"/>}
            <p className={`text-lg font-bold ${online?'text-green-600':'text-gray-400'}`}>{online?tr.online:tr.offline}</p>
          </div>
          <p className={`text-xs mt-1 ${online?'text-green-500':'text-gray-400'}`}>{online?tr.accepting:tr.notAccepting}</p>
          {online&&locationEnabled&&(
            <p className="text-[10px] text-blue-500 mt-1 flex items-center justify-center gap-1"><MapPin size={10}/>{tr.trackingActive}</p>
          )}
        </div>

        {/* Location Status */}
        {online&&(
          <div className="mb-3 flex items-center justify-center gap-1 text-[10px]">
            {locationEnabled?<span className="text-green-600 flex items-center gap-1"><MapPin size={10}/>{tr.locationOn}</span>:<span className="text-orange-600 flex items-center gap-1"><MapPinOff size={10}/>{tr.locationOff}</span>}
          </div>
        )}

        {/* Toggle Button */}
        <button onClick={toggle} disabled={loading}
          className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            online?'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200':'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}>
          {loading?<Loader2 size={18} className="animate-spin"/>:online?<><WifiOff size={18}/>{tr.goOffline}</>:<><Wifi size={18}/>{tr.goOnline}</>}
        </button>

        {/* Status Indicator */}
        {online&&(
          <div className="flex justify-center mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"/>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"/>
              </span>
              <Shield size={10}/>{tr.available}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

OnlineToggle.displayName='OnlineToggle';

export default OnlineToggle;
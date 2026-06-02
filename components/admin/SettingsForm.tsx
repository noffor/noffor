// components/admin/SettingsForm.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {Save,Loader2,CheckCircle,AlertCircle,RefreshCw} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{siteName:'Site Name',featuredPrice:'Featured Price (QAR)',bannerSlots:'Banner Slots',freeBannerMin:'Free Banner (min)',featuredHours:'Featured Hours',save:'Save Settings',saving:'Saving...',saved:'Settings saved!',error:'Failed to save',retry:'Retry',reset:'Reset',confirmReset:'Reset all settings?'},
  bn:{siteName:'সাইটের নাম',featuredPrice:'ফিচার্ড মূল্য (রিয়াল)',bannerSlots:'ব্যানার স্লট',freeBannerMin:'ফ্রি ব্যানার (মিনিট)',featuredHours:'ফিচার্ড ঘন্টা',save:'সেটিংস সেভ',saving:'সেভ হচ্ছে...',saved:'সেটিংস সেভ হয়েছে!',error:'সেভ করতে ব্যর্থ',retry:'আবার চেষ্টা',reset:'রিসেট',confirmReset:'সব সেটিংস রিসেট?'},
  ar:{siteName:'اسم الموقع',featuredPrice:'سعر التمييز (ريال)',bannerSlots:'فتحات البانر',freeBannerMin:'بانر مجاني (دقيقة)',featuredHours:'ساعات التمييز',save:'حفظ الإعدادات',saving:'جاري الحفظ...',saved:'تم الحفظ!',error:'فشل الحفظ',retry:'إعادة',reset:'إعادة ضبط',confirmReset:'إعادة ضبط الكل؟'},
  hi:{siteName:'साइट का नाम',featuredPrice:'फीचर्ड मूल्य (रियाल)',bannerSlots:'बैनर स्लॉट',freeBannerMin:'मुफ्त बैनर (मिनट)',featuredHours:'फीचर्ड घंटे',save:'सहेजें',saving:'सहेज रहे...',saved:'सहेज लिया!',error:'सहेजने में विफल',retry:'पुनः प्रयास',reset:'रीसेट',confirmReset:'सब रीसेट करें?'},
};

// ═══════════════════════════════════════════════════════════
// Settings Fields (Module-level static)
// ═══════════════════════════════════════════════════════════
const FIELDS=[
  {key:'siteName',type:'text'},
  {key:'featuredPrice',type:'number'},
  {key:'bannerSlots',type:'number'},
  {key:'freeBannerMinutes',type:'number'},
  {key:'featuredHours',type:'number'},
];

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{settings:any;lang?:string;onSave?:(settings:any)=>Promise<void>}

// ═══════════════════════════════════════════════════════════
// SettingsForm (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const SettingsForm=React.memo(({settings:initial,lang='en',onSave}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[s,setS]=useState(initial);
  const[status,setStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle');

  const handleChange=useCallback((key:string,value:string)=>{
    startTransition(()=>setS((prev:any)=>({...prev,[key]:value})));
  },[]);

  const handleSave=useCallback(async()=>{
    startTransition(()=>setStatus('saving'));
    try{
      if(onSave)await onSave(s);else await new Promise(r=>setTimeout(r,500));
      startTransition(()=>setStatus('saved'));
      setTimeout(()=>startTransition(()=>setStatus('idle')),2000);
    }catch{
      startTransition(()=>setStatus('error'));
    }
  },[s,onSave]);

  const handleReset=useCallback(()=>{
    if(confirm(tr.confirmReset))startTransition(()=>setS(initial));
  },[initial,tr]);

  return(
    <div className="bg-white rounded-xl p-4 border space-y-4" style={{contain:'layout style paint'}}>
      {/* Status Banner */}
      {status==='saved'&&(
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle size={14}/>{tr.saved}
        </div>
      )}
      {status==='error'&&(
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2"><AlertCircle size={14}/>{tr.error}</span>
          <button onClick={handleSave} className="text-red-700 underline text-xs flex items-center gap-1"><RefreshCw size={12}/>{tr.retry}</button>
        </div>
      )}

      {/* Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FIELDS.map(({key,type})=>(
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{tr[key as keyof typeof tr]||key}</label>
            <input 
              type={type}
              value={s[key]||''} 
              onChange={e=>handleChange(key,e.target.value)} 
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50 hover:bg-white"
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <button 
          onClick={handleSave} 
          disabled={status==='saving'}
          className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {status==='saving'?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>}
          {status==='saving'?tr.saving:tr.save}
        </button>
        <button 
          onClick={handleReset}
          className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 active:scale-95 transition-all"
        >
          {tr.reset}
        </button>
      </div>
    </div>
  );
});

SettingsForm.displayName='SettingsForm';

export default SettingsForm;
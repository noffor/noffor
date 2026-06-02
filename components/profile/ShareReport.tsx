// components/profile/ShareReport.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • useEffect ফিক্সড
"use client";
import React,{useState,useCallback,useMemo,startTransition,useEffect} from 'react';
import {Share2,Flag,X,Check,AlertCircle,Loader2} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{share:'Share Profile',report:'Report Profile',reason:'Select a reason',submit:'Submit Report',cancel:'Cancel',thanks:'Thank you for your report',copied:'Link copied!',copyFailed:'Copy failed. Try again.',spam:'Spam or misleading',fake:'Fake profile',inappropriate:'Inappropriate content',other:'Other',reporting:'Reporting...'},
  bn:{share:'প্রোফাইল শেয়ার',report:'প্রোফাইল রিপোর্ট',reason:'কারণ নির্বাচন করুন',submit:'রিপোর্ট জমা দিন',cancel:'বাতিল',thanks:'আপনার রিপোর্টের জন্য ধন্যবাদ',copied:'লিংক কপি হয়েছে!',copyFailed:'কপি ব্যর্থ। আবার চেষ্টা করুন।',spam:'স্প্যাম বা বিভ্রান্তিকর',fake:'নকল প্রোফাইল',inappropriate:'অনুপযুক্ত কন্টেন্ট',other:'অন্যান্য',reporting:'রিপোর্ট হচ্ছে...'},
  ar:{share:'مشاركة',report:'إبلاغ',reason:'اختر سبباً',submit:'إرسال',cancel:'إلغاء',thanks:'شكراً لتبليغك',copied:'تم النسخ!',copyFailed:'فشل النسخ. حاول مرة أخرى.',spam:'بريد مزعج',fake:'ملف وهمي',inappropriate:'محتوى غير لائق',other:'أخرى',reporting:'جاري...'},
  hi:{share:'शेयर करें',report:'रिपोर्ट',reason:'कारण चुनें',submit:'जमा करें',cancel:'रद्द करें',thanks:'रिपोर्ट के लिए धन्यवाद',copied:'लिंक कॉपी हो गया!',copyFailed:'कॉपी विफल। पुनः प्रयास करें।',spam:'स्पैम',fake:'नकली प्रोफाइल',inappropriate:'अनुपयुक्त',other:'अन्य',reporting:'जमा हो रहा...'},
};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{name:string;lang:string}

// ═══════════════════════════════════════════════════════════
// Toast Component (Memoized)
// ═══════════════════════════════════════════════════════════
const Toast=React.memo(({message,type,onClose}:{message:string;type:'success'|'error';onClose:()=>void})=>{
  useEffect(()=>{const t=setTimeout(onClose,2000);return()=>clearTimeout(t)},[onClose]);
  return(
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 animate-slide-up">
      {type==='success'?<Check size={16} className="text-green-400"/>:<AlertCircle size={16} className="text-red-400"/>}
      {message}
    </div>
  );
});
Toast.displayName='Toast';

// ═══════════════════════════════════════════════════════════
// ShareReport (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const ShareReport=React.memo(({name,lang}:Props)=>{
  const[showReport,setShowReport]=useState(false);
  const[reportReason,setReportReason]=useState('');
  const[submitted,setSubmitted]=useState(false);
  const[submitting,setSubmitting]=useState(false);
  const[toast,setToast]=useState<{message:string;type:'success'|'error'}|null>(null);
  
  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  // Share Profile
  const shareProfile=useCallback(async()=>{
    const url=window.location.href;
    if(navigator.share){try{await navigator.share({title:name,text:`Check out ${name}'s profile`,url});return}catch{}}
    try{await navigator.clipboard.writeText(url);startTransition(()=>setToast({message:tr.copied,type:'success'}));return}catch{}
    try{const ta=document.createElement('textarea');ta.value=url;ta.style.cssText='position:fixed;top:-9999px';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);startTransition(()=>setToast({message:tr.copied,type:'success'}))}catch{startTransition(()=>setToast({message:tr.copyFailed,type:'error'}))}
  },[name,tr]);

  // Submit Report
  const submitReport=useCallback(async()=>{
    if(!reportReason)return;
    startTransition(()=>setSubmitting(true));
    await new Promise(r=>setTimeout(r,1000));
    startTransition(()=>{setSubmitted(true);setSubmitting(false)});
    setTimeout(()=>{setShowReport(false);setReportReason('');setSubmitted(false)},1500);
  },[reportReason]);

  const handleCloseToast=useCallback(()=>setToast(null),[]);

  return(
    <>
      {toast&&<Toast message={toast.message} type={toast.type} onClose={handleCloseToast}/>}

      <div className="flex gap-3" style={{contain:'layout style paint'}}>
        <button onClick={shareProfile} className="flex-1 bg-green-50 text-green-600 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-100 active:scale-[0.98] transition-all border border-green-200">
          <Share2 size={16}/>{tr.share}
        </button>
        <button onClick={()=>setShowReport(true)} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-100 active:scale-[0.98] transition-all border border-red-200">
          <Flag size={16}/>{tr.report}
        </button>
      </div>

      {showReport&&(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setShowReport(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 animate-scale-in shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Flag size={18} className="text-red-500"/>{tr.report}</h3>
              <button onClick={()=>setShowReport(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-90"><X size={20} className="text-gray-400"/></button>
            </div>

            {!submitted?(
              <>
                <select value={reportReason} onChange={e=>startTransition(()=>setReportReason(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none bg-gray-50 cursor-pointer">
                  <option value="">{tr.reason}</option>
                  <option value="spam">🚫 {tr.spam}</option>
                  <option value="fake">👤 {tr.fake}</option>
                  <option value="inappropriate">⚠️ {tr.inappropriate}</option>
                  <option value="other">📋 {tr.other}</option>
                </select>
                <div className="flex gap-3">
                  <button onClick={submitReport} disabled={!reportReason||submitting} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    {submitting?<Loader2 size={16} className="animate-spin"/>:<Check size={16}/>}
                    {submitting?tr.reporting:tr.submit}
                  </button>
                  <button onClick={()=>setShowReport(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all">{tr.cancel}</button>
                </div>
              </>
            ):(
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><Check size={32} className="text-green-500"/></div>
                <p className="text-gray-700 font-medium">{tr.thanks}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

ShareReport.displayName='ShareReport';

export default ShareReport;
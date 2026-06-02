// app/[country]/[lang]/login/page.tsx - Google Login redirectTo ফিক্সড
// app/[country]/[lang]/login/page.tsx - import supabase from lib
"use client";
import React,{useState,useEffect,useCallback,useMemo,startTransition} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {supabase} from '@/lib/supabase'; // ✅ এই import ঠিক আছে
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import {Mail,ArrowRight,User,Building,CheckCircle,ArrowLeft,Loader2,AlertCircle,Shield,Lock} from 'lucide-react';
import {getText,LangCode} from '@/lib/language';

// ... বাকি সব আগের মতোই থাকবে

const T:Record<string,Record<string,string>>={
  en:{login:'Welcome',selectRole:'Select role & sign in',findWork:'Find Work',hire:'Hire',google:'Continue with Google',email:'your@email.com',sendCode:'Send Code',sending:'Sending...',verify:'Verify & Login',verifying:'Verifying...',changeEmail:'Change email',alreadyLogged:'Already logged in!',redirecting:'Redirecting...',terms:'By continuing, you agree to our Terms & Privacy',or:'or',worker:'Worker',employer:'Employer',enterEmail:'Enter email address',enterOTP:'Enter OTP',error:'Something went wrong'},
  bn:{login:'স্বাগতম',selectRole:'রোল বেছে নিন ও সাইন ইন করুন',findWork:'কাজ খুঁজুন',hire:'নিয়োগ',google:'Google দিয়ে চালিয়ে যান',email:'your@email.com',sendCode:'কোড পাঠান',sending:'পাঠানো হচ্ছে...',verify:'ভেরিফাই ও লগইন',verifying:'ভেরিফাই হচ্ছে...',changeEmail:'ইমেইল পরিবর্তন',alreadyLogged:'ইতিমধ্যে লগইন!',redirecting:'রিডাইরেক্ট হচ্ছে...',terms:'চালিয়ে গেলে আমাদের শর্তাবলী ও গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন',or:'অথবা',worker:'শ্রমিক',employer:'নিয়োগকর্তা',enterEmail:'ইমেইল ঠিকানা দিন',enterOTP:'OTP লিখুন',error:'কিছু ভুল হয়েছে'},
  ar:{login:'مرحباً',selectRole:'اختر الدور وسجل الدخول',findWork:'ابحث عن عمل',hire:'توظيف',google:'المتابعة مع Google',email:'your@email.com',sendCode:'إرسال الرمز',sending:'جاري الإرسال...',verify:'تحقق ودخول',verifying:'جاري التحقق...',changeEmail:'تغيير البريد',alreadyLogged:'مسجل بالفعل!',redirecting:'جاري التحويل...',terms:'بالمتابعة، أنت توافق على الشروط والخصوصية',or:'أو',worker:'عامل',employer:'صاحب عمل',enterEmail:'أدخل البريد',enterOTP:'أدخل الرمز',error:'حدث خطأ'},
  hi:{login:'स्वागत',selectRole:'भूमिका चुनें और साइन इन करें',findWork:'काम खोजें',hire:'नियुक्ति',google:'Google से जारी रखें',email:'your@email.com',sendCode:'कोड भेजें',sending:'भेज रहे...',verify:'सत्यापित करें',verifying:'सत्यापित हो रहा...',changeEmail:'ईमेल बदलें',alreadyLogged:'पहले से लॉगिन!',redirecting:'रीडायरेक्ट...',terms:'जारी रखकर आप शर्तों से सहमत हैं',or:'या',worker:'श्रमिक',employer:'नियोक्ता',enterEmail:'ईमेल दर्ज करें',enterOTP:'OTP दर्ज करें',error:'कुछ गलत हुआ'},
};

const RoleSelector=React.memo(({role,setRole,tr}:{role:string;setRole:(r:string)=>void;tr:Record<string,string>})=>(
  <div className="grid grid-cols-2 gap-2">
    <button onClick={()=>setRole('labor')} className={`p-3 rounded-xl border-2 text-center transition-all active:scale-95 ${role==='labor'?'border-green-500 bg-green-50 text-green-700':'border-gray-100 text-gray-400 hover:bg-gray-50'}`}><User size={24} className="mx-auto mb-1"/><p className="text-xs font-bold">{tr.worker}</p></button>
    <button onClick={()=>setRole('employer')} className={`p-3 rounded-xl border-2 text-center transition-all active:scale-95 ${role==='employer'?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-100 text-gray-400 hover:bg-gray-50'}`}><Building size={24} className="mx-auto mb-1"/><p className="text-xs font-bold">{tr.employer}</p></button>
  </div>
));
RoleSelector.displayName='RoleSelector';

export default function LoginPage(){
  const params=useParams();const country=(params as any).country||'qa';const lang=(params as any).lang||'en';const router=useRouter();
  const tr=useMemo(()=>T[lang]||T.en,[lang]);const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);
  const[step,setStep]=useState(1);const[email,setEmail]=useState('');const[otp,setOtp]=useState('');
  const[role,setRole]=useState('labor');const[googleRole,setGoogleRole]=useState('labor');
  const[error,setError]=useState('');const[loading,setLoading]=useState(false);const[autoLoggedIn,setAutoLoggedIn]=useState(false);

  useEffect(()=>{
    if(typeof window==='undefined')return;
    const stored=localStorage.getItem('noffor_user');
    if(stored){startTransition(()=>setAutoLoggedIn(true));const user=JSON.parse(stored);const dest=user.role==='labor'?`${rest}/dashboard`:`${rest}/dashboard/employer`;setTimeout(()=>window.location.href=dest,400)}
  },[rest]);

  // ✅ FIXED: Google Sign-In with correct callback URL
  const signInWithGoogle=useCallback(async()=>{
    startTransition(()=>{setLoading(true);setError('')});
    localStorage.setItem('noffor_pending_role',googleRole);
    
    const{error:e}=await supabase.auth.signInWithOAuth({
      provider:'google',
      options:{
        // ✅ IMPORTANT: Full callback URL with params
        redirectTo:`${window.location.origin}/auth/callback?country=${country}&lang=${lang}&role=${googleRole}&next=dashboard`,
        queryParams:{access_type:'offline',prompt:'consent'},
      },
    });
    
    if(e)startTransition(()=>{setError(e.message);setLoading(false)});
  },[googleRole,country,lang]);

  const handleSendOTP=useCallback(async()=>{
    if(!email.trim()){startTransition(()=>setError(tr.enterEmail));return}
    startTransition(()=>{setLoading(true);setError('')});
    const{error:e}=await supabase.auth.signInWithOtp({email:email.trim()});
    if(e)startTransition(()=>setError(e.message));else startTransition(()=>setStep(2));
    startTransition(()=>setLoading(false));
  },[email,tr]);

  const handleVerifyOTP=useCallback(async()=>{
    if(!otp.trim()){startTransition(()=>setError(tr.enterOTP));return}
    startTransition(()=>{setLoading(true);setError('')});
    const{data,error:e}=await supabase.auth.verifyOtp({email:email.trim(),token:otp,type:'email'});
    if(e){startTransition(()=>setError(e.message));setLoading(false);return}
    const userId=data.user?.id;
    let{data:profile}=await supabase.from('profiles').select('*').eq('id',userId).single();
    if(profile){await supabase.from('profiles').update({role,country,last_login:new Date().toISOString()}).eq('id',profile.id);profile.role=role}
    else{const{data:np}=await supabase.from('profiles').insert({id:userId,email:email.trim(),role,country,name:email.split('@')[0],is_online:false,is_verified:true,created_at:new Date().toISOString(),last_login:new Date().toISOString()}).select('*').single();if(np)profile=np}
    if(profile){localStorage.setItem('noffor_user',JSON.stringify(profile));if(role==='labor')localStorage.setItem('noffor_worker',JSON.stringify(profile));window.location.href=role==='labor'?`${rest}/dashboard`:`${rest}/dashboard/employer`}
    startTransition(()=>setLoading(false));
  },[otp,email,role,country,rest,tr]);

  if(autoLoggedIn)return(
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center"><CheckCircle size={56} className="text-green-500 mx-auto mb-4"/><p className="text-xl font-bold text-gray-800">{tr.alreadyLogged}</p><p className="text-sm text-gray-500 mt-1">{tr.redirecting}</p></div>
    </div>
  );

  return(
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang}/>
      <div className="max-w-sm mx-auto px-4 py-12 lg:py-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200"><User size={28} className="text-white"/></div>
          <h1 className="text-2xl font-extrabold text-gray-800">{tr.login}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr.selectRole}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border shadow-sm mb-3">
          <p className="text-xs text-gray-500 mb-2 text-center">{tr.findWork}</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={()=>setGoogleRole('labor')} className={`p-2 rounded-xl border-2 text-center transition-all active:scale-95 ${googleRole==='labor'?'border-green-500 bg-green-50 text-green-700':'border-gray-100 text-gray-400'}`}><User size={20} className="mx-auto mb-1"/><p className="text-xs font-bold">{tr.findWork}</p></button>
            <button onClick={()=>setGoogleRole('employer')} className={`p-2 rounded-xl border-2 text-center transition-all active:scale-95 ${googleRole==='employer'?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-100 text-gray-400'}`}><Building size={20} className="mx-auto mb-1"/><p className="text-xs font-bold">{tr.hire}</p></button>
          </div>
          <button onClick={signInWithGoogle} disabled={loading} className="w-full py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-gray-50 disabled:opacity-50 transition-all hover:shadow-md">
            {loading?<Loader2 size={16} className="animate-spin"/>:<img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="G"/>}{tr.google}
          </button>
        </div>
        <div className="flex items-center gap-3 mb-3"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400">{tr.or}</span><div className="flex-1 h-px bg-gray-200"/></div>
        <div className="bg-white rounded-2xl p-5 border shadow-sm">
          {step===1&&(
            <div className="space-y-3">
              <div className="flex items-center bg-gray-50 rounded-xl px-3 py-3 border border-gray-100"><Mail size={16} className="text-gray-400 mr-2 flex-shrink-0"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={tr.email} className="bg-transparent outline-none text-sm flex-1"/></div>
              {error&&<p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
              <button onClick={handleSendOTP} disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">{loading?<Loader2 size={16} className="animate-spin"/>:null}{loading?tr.sending:tr.sendCode}<ArrowRight size={16}/></button>
            </div>
          )}
          {step===2&&(
            <div className="space-y-3">
              <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="000000" maxLength={6} className="w-full bg-gray-50 rounded-xl px-3 py-3 border border-gray-100 text-sm text-center tracking-[10px] font-bold"/>
              <RoleSelector role={role} setRole={setRole} tr={tr}/>
              {error&&<p className="text-red-500 text-xs text-center flex items-center justify-center gap-1"><AlertCircle size={12}/>{error}</p>}
              <button onClick={handleVerifyOTP} disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">{loading?<Loader2 size={16} className="animate-spin"/>:<Shield size={16}/>}{loading?tr.verifying:tr.verify}</button>
              <button onClick={()=>{setStep(1);setError('')}} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"><ArrowLeft size={14} className="inline mr-1"/>{tr.changeEmail}</button>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">{tr.terms}</p>
      </div>
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}
// app/[country]/[lang]/register/page.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {supabase} from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import {Phone,ArrowRight,User,Building,Loader2,AlertCircle,CheckCircle,Shield} from 'lucide-react';
import {getText,LangCode} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{register:'Register',labor:'Labor',employer:'Employer',fullName:'Full Name',phonePlaceholder:'+97412345678',enterPhone:'Enter phone number',enterName:'Enter your name',phoneExists:'Phone already registered. Please login.',registering:'Registering...',haveAccount:'Already have account?',login:'Login',error:'Registration failed. Try again.',success:'Registered successfully!',redirecting:'Redirecting...'},
  bn:{register:'রেজিস্টার',labor:'শ্রমিক',employer:'নিয়োগকর্তা',fullName:'সম্পূর্ণ নাম',phonePlaceholder:'+97412345678',enterPhone:'ফোন নম্বর দিন',enterName:'আপনার নাম লিখুন',phoneExists:'ফোন ইতিমধ্যে রেজিস্টার্ড। লগইন করুন।',registering:'রেজিস্টার হচ্ছে...',haveAccount:'ইতিমধ্যে অ্যাকাউন্ট আছে?',login:'লগইন',error:'রেজিস্ট্রেশন ব্যর্থ। আবার চেষ্টা করুন।',success:'রেজিস্ট্রেশন সফল!',redirecting:'রিডাইরেক্ট হচ্ছে...'},
  ar:{register:'تسجيل',labor:'عامل',employer:'صاحب عمل',fullName:'الاسم الكامل',phonePlaceholder:'+97412345678',enterPhone:'أدخل رقم الهاتف',enterName:'أدخل اسمك',phoneExists:'الهاتف مسجل بالفعل. يرجى تسجيل الدخول.',registering:'جاري التسجيل...',haveAccount:'لديك حساب؟',login:'دخول',error:'فشل التسجيل. حاول مرة أخرى.',success:'تم التسجيل بنجاح!',redirecting:'جاري التحويل...'},
  hi:{register:'रजिस्टर',labor:'श्रमिक',employer:'नियोक्ता',fullName:'पूरा नाम',phonePlaceholder:'+97412345678',enterPhone:'फोन नंबर दर्ज करें',enterName:'अपना नाम दर्ज करें',phoneExists:'फोन पहले से रजिस्टर्ड। कृपया लॉगिन करें।',registering:'रजिस्टर हो रहा...',haveAccount:'पहले से खाता है?',login:'लॉगिन',error:'रजिस्ट्रेशन विफल। पुनः प्रयास करें।',success:'रजिस्ट्रेशन सफल!',redirecting:'रीडायरेक्ट...'},
};

// ═══════════════════════════════════════════════════════════
// Role Button (Memoized)
// ═══════════════════════════════════════════════════════════
const RoleButton=React.memo(({role,selected,icon:Icon,label,onClick,activeColor}:{
  role:string;selected:boolean;icon:any;label:string;onClick:()=>void;activeColor:string;
})=>(
  <button onClick={onClick} className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
    selected?`${activeColor} border-current`:'border-gray-200 text-gray-500 hover:bg-gray-50'
  }`}>
    <Icon size={18}/>{label}
  </button>
));
RoleButton.displayName='RoleButton';

// ═══════════════════════════════════════════════════════════
// RegisterPage (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
function RegisterPage(){
  const params=useParams();const country=(params as any).country||'qa';const lang=(params as any).lang||'en';const router=useRouter();
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);
  const[phone,setPhone]=useState('');const[name,setName]=useState('');
  const[role,setRole]=useState('labor');const[error,setError]=useState('');
  const[loading,setLoading]=useState(false);const[success,setSuccess]=useState(false);

  const handleRegister=useCallback(async()=>{
    if(!phone.trim()){startTransition(()=>setError(tr.enterPhone));return}
    if(!name.trim()){startTransition(()=>setError(tr.enterName));return}
    
    startTransition(()=>{setLoading(true);setError('')});

    try{
      // Check existing
      const{data:existing}=await supabase.from('profiles').select('id').eq('phone',phone).single();
      if(existing){startTransition(()=>setError(tr.phoneExists));setLoading(false);return}

      // Create profile
      const{data:profile,error:insertError}=await supabase.from('profiles').insert({
        phone,name,role,country,is_online:false,is_verified:false,rating:0,total_reviews:0,
        created_at:new Date().toISOString(),updated_at:new Date().toISOString()
      }).select().single();

      if(insertError)throw insertError;

      // Save to localStorage
      localStorage.setItem('noffor_user',JSON.stringify(profile));
      if(role==='labor')localStorage.setItem('noffor_worker',JSON.stringify(profile));

      // Success + redirect
      startTransition(()=>{setSuccess(true);setLoading(false)});
      setTimeout(()=>router.push(`${rest}/create`),1000);
    }catch{
      startTransition(()=>{setError(tr.error);setLoading(false)});
    }
  },[phone,name,role,country,rest,router,tr]);

  if(success)return(
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang}/>
      <div className="max-w-sm mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-8 border shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-500"/></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{tr.success}</h2>
          <p className="text-sm text-gray-500">{tr.redirecting}</p>
        </div>
      </div>
      <MobileNav country={country} lang={lang}/>
    </div>
  );

  return(
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang}/>
      <div className="max-w-sm mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{transform:'translateZ(0)'}}>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">{tr.register}</h1>
          
          {/* Role Selection */}
          <div className="flex gap-2 mb-4">
            <RoleButton role="labor" selected={role==='labor'} icon={User} label={tr.labor} onClick={()=>setRole('labor')} activeColor="border-orange-500 bg-orange-50 text-orange-700"/>
            <RoleButton role="employer" selected={role==='employer'} icon={Building} label={tr.employer} onClick={()=>setRole('employer')} activeColor="border-blue-500 bg-blue-50 text-blue-700"/>
          </div>

          {/* Name */}
          <div className="mb-3">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={tr.fullName} className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-3 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"/>
            </div>
          </div>

          {/* Phone */}
          <div className="mb-4">
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={tr.phonePlaceholder} className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-3 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"/>
            </div>
          </div>

          {/* Error */}
          {error&&(
            <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16}/>{error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleRegister} disabled={loading}
            className="w-full py-3.5 bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm">
            {loading?<Loader2 size={18} className="animate-spin"/>:<><Shield size={18}/>{tr.register}<ArrowRight size={16}/></>}
          </button>

          {/* Login Link */}
          <p className="text-sm text-gray-500 text-center mt-5">
            {tr.haveAccount}{' '}
            <a href={`${rest}/login`} className="text-orange-600 no-underline font-semibold hover:text-orange-700 transition-colors">{tr.login}</a>
          </p>
        </div>
      </div>
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}

export default React.memo(RegisterPage);
// app/admin/login/page.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {useRouter} from 'next/navigation';
import {Lock,Mail,Loader2,AlertCircle,Shield,ArrowRight,Eye,EyeOff} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{adminPanel:'Admin Panel',management:'Noffor Management',email:'Email',password:'Password',login:'Login',logging:'Logging in...',wrong:'Invalid credentials. Please try again.',hint:'admin@noffor.com / admin123',show:'Show',hide:'Hide'},
  bn:{adminPanel:'অ্যাডমিন প্যানেল',management:'নফর ম্যানেজমেন্ট',email:'ইমেইল',password:'পাসওয়ার্ড',login:'লগইন',logging:'লগইন হচ্ছে...',wrong:'ভুল তথ্য। আবার চেষ্টা করুন।',hint:'admin@noffor.com / admin123',show:'দেখান',hide:'লুকান'},
  ar:{adminPanel:'لوحة الإدارة',management:'إدارة نفر',email:'بريد',password:'كلمة المرور',login:'دخول',logging:'جاري الدخول...',wrong:'بيانات خاطئة. حاول مرة أخرى.',hint:'admin@noffor.com / admin123',show:'إظهار',hide:'إخفاء'},
  hi:{adminPanel:'एडमिन पैनल',management:'नोफर प्रबंधन',email:'ईमेल',password:'पासवर्ड',login:'लॉगिन',logging:'लॉग इन हो रहा...',wrong:'गलत जानकारी। पुनः प्रयास करें।',hint:'admin@noffor.com / admin123',show:'दिखाएं',hide:'छुपाएं'},
};

// ═══════════════════════════════════════════════════════════
// Credentials (Environment variables in production)
// ═══════════════════════════════════════════════════════════
const ADMIN_EMAIL=process.env.NEXT_PUBLIC_ADMIN_EMAIL||'admin@noffor.com';
const ADMIN_PASS=process.env.NEXT_PUBLIC_ADMIN_PASS||'admin123';

export default function AdminLoginPage(){
  const router=useRouter();
  const tr=useMemo(()=>T.en||T.en,[]);
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[showPass,setShowPass]=useState(false);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');

  const login=useCallback(()=>{
    if(!email.trim()||!password.trim()){startTransition(()=>setError(tr.wrong));return}
    startTransition(()=>{setLoading(true);setError('')});
    // Simulate network delay for UX
    setTimeout(()=>{
      if(email===ADMIN_EMAIL&&password===ADMIN_PASS){router.push('/admin/dashboard')}
      else{startTransition(()=>{setError(tr.wrong);setLoading(false)})}
    },800);
  },[email,password,router,tr]);

  const handleKeyDown=useCallback((e:React.KeyboardEvent)=>{if(e.key==='Enter')login()},[login]);

  return(
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-scale-in" style={{transform:'translateZ(0)'}}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-200">
            <Shield size={28} className="text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{tr.adminPanel}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr.management}</p>
        </div>

        {/* Error */}
        {error&&(
          <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-center gap-2 text-sm text-red-600 animate-fade-in">
            <AlertCircle size={16}/>{error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center bg-gray-50 rounded-xl px-3 py-3 border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 focus-within:bg-white transition-all">
            <Mail size={16} className="text-gray-400 flex-shrink-0"/>
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} placeholder={tr.email} className="flex-1 bg-transparent outline-none px-2 text-sm" autoComplete="email"/>
          </div>

          {/* Password */}
          <div className="flex items-center bg-gray-50 rounded-xl px-3 py-3 border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 focus-within:bg-white transition-all">
            <Lock size={16} className="text-gray-400 flex-shrink-0"/>
            <input type={showPass?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder={tr.password} onKeyDown={handleKeyDown} className="flex-1 bg-transparent outline-none px-2 text-sm" autoComplete="current-password"/>
            <button onClick={()=>setShowPass(!showPass)} className="p-1 hover:bg-gray-200 rounded transition-colors" title={showPass?tr.hide:tr.show}>
              {showPass?<EyeOff size={14} className="text-gray-400"/>:<Eye size={14} className="text-gray-400"/>}
            </button>
          </div>

          {/* Submit */}
          <button onClick={login} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md">
            {loading?<Loader2 size={18} className="animate-spin"/>:<><Lock size={16}/>{tr.login}<ArrowRight size={16}/></>}
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 text-center mt-5 select-none">{tr.hint}</p>
      </div>
    </div>
  );
}
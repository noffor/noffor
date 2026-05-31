// app/[country]/[lang]/login/page.tsx
// 🚀 সুপারসনিক • ১ বিলিয়ন • ৬ দেশ • Google + Email • FIXED • নো ক্র্যাশ
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Mail, ArrowRight, User, Building, CheckCircle, ArrowLeft } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function LoginPage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const router = useRouter();
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('labor');
  const [googleRole, setGoogleRole] = useState('labor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoggedIn, setAutoLoggedIn] = useState(false);

  // ✅ Auto-Login + Auth State Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Quick check localStorage
    const stored = localStorage.getItem('noffor_user');
    if (stored) {
      setAutoLoggedIn(true);
      const user = JSON.parse(stored);
      const dest = user.role === 'labor' ? `${rest}/dashboard` : `${rest}/dashboard/employer`;
      setTimeout(() => window.location.href = dest, 400);
      return;
    }

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const pendingRole = localStorage.getItem('noffor_pending_role') || 'labor';
        localStorage.removeItem('noffor_pending_role');
        
        // Wait for trigger
        await new Promise(r => setTimeout(r, 800));
        
        let { data: profile } = await supabase.from('profiles')
          .select('*').eq('id', session.user.id).single();
        
        // Fallback insert if trigger didn't work
        if (!profile) {
          const { data: newProfile } = await supabase.from('profiles').insert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            photo_url: session.user.user_metadata?.avatar_url || '',
            role: pendingRole,
            country,
            is_online: false,
            is_verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          }).select('*').single();
          
          if (newProfile) profile = newProfile;
        } else {
          // Update role
          await supabase.from('profiles').update({ 
            role: pendingRole, 
            last_login: new Date().toISOString() 
          }).eq('id', profile.id);
          profile.role = pendingRole;
        }
        
        if (profile) {
          localStorage.setItem('noffor_user', JSON.stringify(profile));
          if (profile.role === 'labor') localStorage.setItem('noffor_worker', JSON.stringify(profile));
          const dest = profile.role === 'labor' ? `${rest}/dashboard` : `${rest}/dashboard/employer`;
          window.location.href = dest;
        }
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ✅ Google Sign-In with Role
  const signInWithGoogle = async () => {
    setLoading(true);
    localStorage.setItem('noffor_pending_role', googleRole);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/qa/en/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  // ✅ Email OTP Send
  const handleSendOTP = async () => {
    if (!email.trim()) { setError('Enter email address'); return; }
    setLoading(true); setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: email.trim() });
    if (otpError) setError(otpError.message);
    else setStep(2);
    setLoading(false);
  };

  // ✅ Email OTP Verify + Profile Save
  const handleVerifyOTP = async () => {
    if (!otp.trim()) { setError('Enter OTP'); return; }
    setLoading(true); setError('');
    
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(), token: otp, type: 'email',
    });
    
    if (verifyError) { setError(verifyError.message); setLoading(false); return; }
    
    const userId = data.user?.id;
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    if (profile) {
      await supabase.from('profiles').update({ role, country, last_login: new Date().toISOString() }).eq('id', profile.id);
      profile.role = role;
    } else {
      const { data: newProfile } = await supabase.from('profiles').insert({
        id: userId, email: email.trim(), role, country,
        name: email.split('@')[0],
        is_online: false, is_verified: true,
        created_at: new Date().toISOString(), last_login: new Date().toISOString()
      }).select('*').single();
      if (newProfile) profile = newProfile;
    }
    
    if (profile) {
      localStorage.setItem('noffor_user', JSON.stringify(profile));
      if (role === 'labor') localStorage.setItem('noffor_worker', JSON.stringify(profile));
      const dest = role === 'labor' ? `${rest}/dashboard` : `${rest}/dashboard/employer`;
      window.location.href = dest;
    }
    setLoading(false);
  };

  if (autoLoggedIn) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <p className="text-xl font-bold text-gray-800">Already logged in!</p>
        <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-sm mx-auto px-4 py-12 lg:py-20">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
            <User size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">{t('login') || 'Welcome'}</h1>
          <p className="text-sm text-gray-500 mt-1">Select role & sign in</p>
        </div>

        {/* Google Sign-In with Role */}
        <div className="bg-white rounded-2xl p-5 border shadow-sm mb-3">
          <p className="text-xs text-gray-500 mb-2 text-center">I want to</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={() => setGoogleRole('labor')} 
              className={`p-2 rounded-xl border-2 text-center transition-all ${googleRole === 'labor' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-400'}`}>
              <User size={20} className="mx-auto mb-1" /><p className="text-xs font-bold">Find Work</p>
            </button>
            <button onClick={() => setGoogleRole('employer')} 
              className={`p-2 rounded-xl border-2 text-center transition-all ${googleRole === 'employer' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400'}`}>
              <Building size={20} className="mx-auto mb-1" /><p className="text-xs font-bold">Hire</p>
            </button>
          </div>
          <button onClick={signInWithGoogle} disabled={loading}
            className="w-full py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-gray-50 disabled:opacity-50 transition-all hover:shadow-md">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="G" />
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email OTP */}
        <div className="bg-white rounded-2xl p-5 border shadow-sm">
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
                <Mail size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="bg-transparent outline-none text-sm flex-1" />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button onClick={handleSendOTP} disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Code'} <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-3">
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} 
                className="w-full bg-gray-50 rounded-xl px-3 py-3 border border-gray-100 text-sm text-center tracking-[10px] font-bold" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setRole('labor')} className={`p-3 rounded-xl border-2 text-center ${role === 'labor' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-400'}`}>
                  <User size={24} className="mx-auto mb-1" /><p className="text-xs font-bold">{t('labor') || 'Worker'}</p>
                </button>
                <button onClick={() => setRole('employer')} className={`p-3 rounded-xl border-2 text-center ${role === 'employer' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400'}`}>
                  <Building size={24} className="mx-auto mb-1" /><p className="text-xs font-bold">{t('employer') || 'Employer'}</p>
                </button>
              </div>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <button onClick={handleVerifyOTP} disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-sm text-gray-400"><ArrowLeft size={14} className="inline mr-1" />Change email</button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">By continuing, you agree to our Terms & Privacy</p>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
// app/[country]/[lang]/login/page.tsx - FINAL FIXED
"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { CheckCircle, Loader2, User, Building, Globe, LogIn } from 'lucide-react';

const T: Record<string, Record<string, string>> = {
  en: {
    login: 'Welcome',
    selectRole: 'Choose your role & continue',
    findWork: 'Find Work',
    hire: 'Hire Workers',
    google: 'Continue with Google',
    alreadyLogged: 'Already logged in!',
    redirecting: 'Redirecting...',
    terms: 'By continuing, you agree to our Terms & Privacy',
    worker: 'Worker',
    employer: 'Employer',
    loginSuccess: 'Login successful!',
    redirectMessage: 'You will be redirected after login',
    error: 'Login failed. Please try again.',
    processing: 'Processing...',
  },
  bn: {
    login: 'স্বাগতম',
    selectRole: 'আপনার ভূমিকা চয়ন করুন ও চালিয়ে যান',
    findWork: 'কাজ খুঁজুন',
    hire: 'শ্রমিক নিয়োগ',
    google: 'Google দিয়ে চালিয়ে যান',
    alreadyLogged: 'ইতিমধ্যে লগইন!',
    redirecting: 'রিডাইরেক্ট হচ্ছে...',
    terms: 'চালিয়ে গেলে আমাদের শর্তাবলী ও গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন',
    worker: 'শ্রমিক',
    employer: 'নিয়োগকর্তা',
    loginSuccess: 'লগইন সফল!',
    redirectMessage: 'লগইনের পর আপনাকে রিডাইরেক্ট করা হবে',
    error: 'লগইন ব্যর্থ। আবার চেষ্টা করুন।',
    processing: 'প্রক্রিয়াকরণ...',
  },
  ar: {
    login: 'مرحباً',
    selectRole: 'اختر دورك واستمر',
    findWork: 'ابحث عن عمل',
    hire: 'توظيف عمال',
    google: 'المتابعة مع Google',
    alreadyLogged: 'مسجل بالفعل!',
    redirecting: 'جاري التحويل...',
    terms: 'بالمتابعة، أنت توافق على الشروط والخصوصية',
    worker: 'عامل',
    employer: 'صاحب عمل',
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    redirectMessage: 'سيتم تحويلك بعد تسجيل الدخول',
    error: 'فشل تسجيل الدخول. حاول مرة أخرى.',
    processing: 'معالجة...',
  },
  hi: {
    login: 'स्वागत',
    selectRole: 'अपनी भूमिका चुनें और जारी रखें',
    findWork: 'काम खोजें',
    hire: 'श्रमिक नियुक्त करें',
    google: 'Google से जारी रखें',
    alreadyLogged: 'पहले से लॉगिन!',
    redirecting: 'रीडायरेक्ट...',
    terms: 'जारी रखकर आप शर्तों से सहमत हैं',
    worker: 'श्रमिक',
    employer: 'नियोक्ता',
    loginSuccess: 'लॉगिन सफल!',
    redirectMessage: 'लॉगिन के बाद आपको रीडायरेक्ट किया जाएगा',
    error: 'लॉगिन विफल। पुनः प्रयास करें।',
    processing: 'प्रसंस्करण...',
  },
};

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const redirectTo = searchParams.get('redirect') || `/${country}/${lang}/dashboard`;

  const tr = useMemo(() => T[lang] || T.en, [lang]);

  const [role, setRole] = useState('labor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const hasRedirected = useRef(false);

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      setSuccess(true);
      const timer = setTimeout(() => {
        window.location.href = redirectTo; // ✅ Hard redirect for fresh state
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, isAuthenticated, redirectTo]);

  // ✅ Google Login
  const handleGoogleLogin = useCallback(async () => {
    if (loading || hasRedirected.current) return;
    
    setLoading(true);
    setError('');

    try {
      // ✅ Save role to localStorage for callback
      localStorage.setItem('noffor_pending_role', role);
      
      const callbackUrl = `${window.location.origin}/auth/callback?country=${country}&lang=${lang}&role=${role}&next=${encodeURIComponent(redirectTo)}`;
      
      console.log('🔑 Login redirect to:', callbackUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || tr.error);
      setLoading(false);
    }
  }, [country, lang, role, redirectTo, tr, loading]);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{tr.loginSuccess}</h2>
          <p className="text-gray-500">{tr.redirecting}</p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-md mx-auto px-4 py-12 lg:py-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-800">{tr.login}</h1>
          <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-2">
            <Globe size={14} />
            {country.toUpperCase()} / {lang.toUpperCase()}
          </p>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-600 mb-3 text-center">{tr.selectRole}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole('labor')}
              className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${
                role === 'labor'
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-100'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <User size={28} className="mx-auto mb-2" />
              <p className="text-sm font-bold">{tr.worker}</p>
              <p className="text-[10px] opacity-70 mt-1">{tr.findWork}</p>
            </button>
            <button
              onClick={() => setRole('employer')}
              className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${
                role === 'employer'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg shadow-blue-100'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Building size={28} className="mx-auto mb-2" />
              <p className="text-sm font-bold">{tr.employer}</p>
              <p className="text-[10px] opacity-70 mt-1">{tr.hire}</p>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
            ❌ {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 bg-white border-2 border-gray-200 rounded-xl text-base font-bold flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {tr.processing}
            </>
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {tr.google}
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-8">{tr.terms}</p>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
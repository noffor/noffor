// app/[country]/[lang]/login/page.tsx
"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Phone, ArrowRight, User, Building, ArrowLeft } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function LoginPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en'; const router = useRouter();
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;
  const [step, setStep] = useState(1); const [phone, setPhone] = useState(''); const [otp, setOtp] = useState('');
  const [role, setRole] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const handleSendOTP = () => {
    if (!phone.trim()) { setError('Enter phone number'); return; }
    setStep(2);
    setError('');
  };

  const handleLogin = async () => {
    if (!role) { setError('Select role'); return; }
    setLoading(true);
    
    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existing) {
      // Update role if changed
      if (existing.role !== role) {
        await supabase.from('profiles').update({ role }).eq('id', existing.id);
        existing.role = role;
      }
      
      // Save to localStorage
      localStorage.setItem('noffor_user', JSON.stringify(existing));
      if (role === 'labor') {
        localStorage.setItem('noffor_worker', JSON.stringify(existing));
      }
      
      // Redirect
      if (role === 'labor') router.push(`${rest}/dashboard`);
      else router.push(`${rest}/dashboard/employer`);
    } else {
      // New user - create profile
      const { data: profile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          phone,
          role,
          country,
          name: 'User' + phone.slice(-4),
          is_online: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!insertError && profile) {
        localStorage.setItem('noffor_user', JSON.stringify(profile));
        if (role === 'labor') {
          localStorage.setItem('noffor_worker', JSON.stringify(profile));
        }
        
        if (role === 'labor') router.push(`${rest}/dashboard`);
        else router.push(`${rest}/dashboard/employer`);
      } else {
        setError('Login failed. Try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-sm mx-auto px-4 py-8 lg:py-16">
        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">{t('login')}</h1>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center bg-gray-50 rounded-xl px-3 py-3 border"><Phone size={16} className="text-gray-400 mr-2" /><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+97412345678" className="bg-transparent outline-none text-sm flex-1" /></div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button onClick={handleSendOTP} className="w-full py-3 bg-orange-600 text-white rounded-xl text-sm font-medium">{t('sendOTP') || 'Send OTP'} <ArrowRight size={16} className="inline ml-2" /></button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" maxLength={6} className="w-full bg-gray-50 rounded-xl px-3 py-3 border text-sm text-center tracking-[8px] font-bold" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setRole('labor')} className={`p-4 rounded-xl border-2 text-center ${role === 'labor' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}><User size={28} className="mx-auto mb-1" /><p className="text-sm font-medium">{t('labor') || 'Labor'}</p></button>
                <button onClick={() => setRole('employer')} className={`p-4 rounded-xl border-2 text-center ${role === 'employer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}><Building size={28} className="mx-auto mb-1" /><p className="text-sm font-medium">{t('employer') || 'Employer'}</p></button>
              </div>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {loading ? 'Logging in...' : t('login')}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500"><ArrowLeft size={14} className="inline mr-1" />{t('back') || 'Back'}</button>
            </div>
          )}
          <p className="text-center text-sm text-gray-500 mt-4">{t('noAccount') || "Don't have account?"} <a href={`${rest}/register`} className="text-orange-600 no-underline">{t('register')}</a></p>
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
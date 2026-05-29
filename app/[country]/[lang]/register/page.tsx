// app/[country]/[lang]/register/page.tsx
"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Phone, ArrowRight, User, Building } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function RegisterPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en'; const router = useRouter();
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;
  const [phone, setPhone] = useState(''); const [name, setName] = useState('');
  const [role, setRole] = useState('labor'); const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phone.trim()) { setError(t('enterPhone') || 'Enter phone number'); return; }
    if (!name.trim()) { setError(t('enterName') || 'Enter your name'); return; }
    
    setLoading(true);
    setError('');

    // Check if phone already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existing) {
      setError(t('phoneExists') || 'Phone already registered. Please login.');
      setLoading(false);
      return;
    }

    // Create profile in Supabase
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        phone,
        name,
        role,
        country,
        is_online: false,
        is_verified: false,
        rating: 0,
        total_reviews: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      setError('Registration failed. Try again.');
      setLoading(false);
      return;
    }

    // Save to localStorage
    localStorage.setItem('noffor_user', JSON.stringify(profile));
    if (role === 'labor') {
      localStorage.setItem('noffor_worker', JSON.stringify(profile));
    }

    // Redirect to create profile or dashboard
    router.push(`${rest}/create`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-sm mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">{t('register')}</h1>
          
          {/* Role Selection */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRole('labor')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 ${
                role === 'labor' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500'
              }`}
            >
              <User size={18} className="inline mr-1" /> {t('labor') || 'Labor'}
            </button>
            <button
              onClick={() => setRole('employer')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 ${
                role === 'employer' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'
              }`}
            >
              <Building size={18} className="inline mr-1" /> {t('employer') || 'Employer'}
            </button>
          </div>

          {/* Name */}
          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('fullName') || 'Full Name'}
              className="w-full bg-gray-50 rounded-xl px-3 py-3 border text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Phone */}
          <div className="flex items-center bg-gray-50 rounded-xl px-3 py-3 border mb-4">
            <Phone size={16} className="text-gray-400 mr-2" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+97412345678"
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>

          {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-orange-700 transition-colors"
          >
            {loading ? 'Registering...' : t('register')}
            <ArrowRight size={16} className="inline ml-2" />
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            {t('haveAccount') || 'Already have account?'}{' '}
            <a href={`${rest}/login`} className="text-orange-600 no-underline font-medium">
              {t('login')}
            </a>
          </p>
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
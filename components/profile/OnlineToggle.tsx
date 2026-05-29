"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getText, LangCode } from '@/lib/language';

export default function OnlineToggle({ profileId, initial, lang = 'en' }: { profileId: string; initial: boolean; lang?: string }) {
  const [online, setOnline] = useState(initial);
  const t = (key: string) => getText(lang as LangCode, key);
  const toggle = async () => {
    const next = !online;
    await supabase.from('profiles').update({ is_online: next, last_online: new Date().toISOString() }).eq('id', profileId);
    setOnline(next);
  };
  return (
    <button onClick={toggle} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      {online ? t('online') : t('offline')}
    </button>
  );
}
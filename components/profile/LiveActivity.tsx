"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getText, LangCode } from '@/lib/language';

export default function LiveActivity({ profileId, lang = 'en' }: { profileId: string; lang?: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const t = (key: string) => getText(lang as LangCode, key);

  useEffect(() => {
    supabase.from('live_activities').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(5).then(({ data }) => setActivities(data || []));
  }, [profileId]);

  if (!activities.length) return <p className="text-gray-400 text-sm">{t('noActivity') || 'No recent activity'}</p>;

  return (
    <div className="space-y-2">
      {activities.map((a, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="w-2 h-2 mt-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700">{a.description}</p>
            <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
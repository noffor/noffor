"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function ReviewSection({ profileId, lang = 'en' }: { profileId: string; lang?: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const t = (key: string) => getText(lang as LangCode, key);
  
  useEffect(() => {
    supabase.from('reviews').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(10).then(({ data }) => setReviews(data || []));
  }, [profileId]);

  if (!reviews.length) return <p className="text-gray-400 text-sm">{t('noReviews') || 'No reviews yet'}</p>;
  
  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r.id} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= r.rating ? 'text-yellow-500' : 'text-gray-300'} fill={s <= r.rating ? '#EAB308' : 'none'} />)}</div>
            <span className="text-sm font-medium">{r.reviewer_name}</span>
          </div>
          <p className="text-sm text-gray-600">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
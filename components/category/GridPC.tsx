"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProfileCard from './ProfileCard';

const ITEMS_PER_PAGE = 5;

export default function GridPC({ profiles, country, lang, totalCount, categoryName }: { 
  profiles: any[]; country: string; lang: string; totalCount: number; categoryName: string;
}) {
  const [items, setItems] = useState(profiles);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const rest = `/${country}/${lang}`;
  const hasMore = items.length < totalCount;

  const loadMore = async () => {
    setLoading(true);
    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('category', categoryName)
      .eq('country', country)
      .range(from, to);
    
    if (data) {
      setItems(prev => [...prev, ...data]);
      setPage(prev => prev + 1);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="grid grid-cols-5 gap-3">
        {items.map(p => (
          <ProfileCard key={p.id} profile={p} href={`${rest}/profile/${p.id}`} lang={lang} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-4">
          <button onClick={loadMore} disabled={loading} className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
            {loading ? 'Loading...' : `Load More (${totalCount - items.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import LaborMap from '@/components/map/LaborMap';
import MapFilters from '@/components/map/MapFilters';
import { getText, LangCode } from '@/lib/language';

export default function MapPage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const t = (key: string) => getText(lang as LangCode, key);
  const searchParams = useSearchParams();
  const cat = searchParams.get('cat') || 'all';
  const dist = searchParams.get('dist') || 'all';
  const [labors, setLabors] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('is_online', true).limit(50).then(({ data }) => setLabors(data || []));
  }, [country]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">{t('map')}</h2>
          <span className="text-sm text-gray-500">{labors.length} {t('online')}</span>
        </div>
        <MapFilters country={country} lang={lang} category={cat} distance={dist} />
        <LaborMap country={country} labors={labors} lang={lang} />
      </div>
      
    </div>
  );
}
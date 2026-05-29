"use client";
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import SearchResult from '@/components/search/SearchResult';
import ImageSearch from '@/components/search/ImageSearch';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import { Search, Camera } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function SearchPage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const t = (key: string) => getText(lang as LangCode, key);
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [input, setInput] = useState(q);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (q) { setLoading(true); handleSearch(q); } }, [q]);

  const handleSearch = async (query: string) => {
    const isPhone = /^[0-9+\-\s()]+$/.test(query);
    let qr = supabase.from('profiles').select('*');
    if (isPhone) qr = qr.ilike('phone', `%${query.replace(/[\s\-()]/g, '')}%`);
    else qr = qr.ilike('name', `%${query}%`);
    const { data } = await qr.limit(20);
    setResults(data || []); setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-4xl mx-auto px-3 lg:px-4 py-3">
        {mode === 'text' ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-2 border">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch(input)} placeholder={t('searchPlaceholder')} className="flex-1 bg-transparent outline-none px-2 text-sm" />
              <button onClick={() => setMode('image')}><Camera size={18} className="text-gray-400" /></button>
            </div>
            <button onClick={() => handleSearch(input)} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm">{t('navSearch')}</button>
          </div>
        ) : (
          <div>
            <button onClick={() => setMode('text')} className="text-sm text-orange-600 mb-3 block">← {t('back')}</button>
            <ImageSearch />
          </div>
        )}
        {loading && <div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" /></div>}
        {!loading && q && results.length === 0 && <div className="text-center py-12 bg-white rounded-xl"><p className="text-gray-500">No results</p></div>}
        {!loading && results.length > 0 && (
          <div className="space-y-2">
            {results.map(p => <SearchResult key={p.id} profile={p} href={`/${country}/${lang}/profile/${p.id}`} />)}
          </div>
        )}
        {!q && <SearchSuggestions country={country} lang={lang} />}
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
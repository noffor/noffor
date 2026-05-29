"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function SearchBar({ country, lang }: { country: string; lang: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const t = (key: string) => getText(lang as LangCode, key);

  const handleSearch = () => {
    if (query.trim()) router.push(`/${country}/${lang}/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={t('searchPlaceholder')} className="flex-1 bg-transparent outline-none px-2 text-sm" />
      </div>
      <button onClick={handleSearch} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">{t('navSearch')}</button>
    </div>
  );
}
// components/layout/Header.tsx
import Link from 'next/link';
import { getCountry, getCityName, getAreaName } from '@/lib/countries';
import { getText, LangCode } from '@/lib/language';
import SearchBar from '@/components/home/SearchBar';
import { DollarSign } from 'lucide-react';

export default function Header({ country, lang }: { country: string; lang: string }) {
  const c = getCountry(country);
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  const countries = [
    { code: 'qa', flag: '🇶🇦', name: 'Qatar' },
    { code: 'sa', flag: '🇸🇦', name: 'Saudi' },
    { code: 'ae', flag: '🇦🇪', name: 'UAE' },
    { code: 'kw', flag: '🇰🇼', name: 'Kuwait' },
    { code: 'bh', flag: '🇧🇭', name: 'Bahrain' },
    { code: 'om', flag: '🇴🇲', name: 'Oman' },
  ];

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'ar', name: 'AR' },
    { code: 'bn', name: 'BN' },
    { code: 'hi', name: 'HI' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* PC Header - UNCHANGED */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        <Link href={`${rest}`} className="flex items-center gap-3 no-underline">
          <img src="/logo.svg" alt="Noffor" className="h-10" />
          <span className="text-xl font-bold text-gray-800">Noffor</span>
        </Link>
        <div className="flex items-center gap-2">
          <SearchBar country={country} lang={lang} />
          <Link href={`${rest}/map`} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 no-underline">{t('map')}</Link>
          <Link href={`${rest}/bid`} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 no-underline flex items-center gap-1">
            <DollarSign size={14} /> BID
          </Link>
          <Link href={`${rest}/dashboard`} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 no-underline">{t('dashboard')}</Link>
          <Link href={`${rest}/create`} className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700 no-underline">{t('create')}</Link>
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {['en','ar','bn','hi'].map(l => (
              <a key={l} href={`/${country}/${l}`} className={`px-2 py-1 rounded-md text-xs font-medium no-underline ${lang === l ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'}`}>{l.toUpperCase()}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Header - Simple */}
      <div className="lg:hidden px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <Link href={`${rest}`} className="flex items-center gap-2 no-underline flex-shrink-0">
            <img src="/logo.svg" alt="Noffor" className="h-7" />
          </Link>
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <select value={country} onChange={e => window.location.href = `/${e.target.value}/${lang}`}
              className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex-1 min-w-0">
              {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
            <select className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex-1 min-w-0">
              <option value="">{t('selectCity')}</option>
              {c.cities.map((city, i) => (
                <option key={i} value={city.en}>{getCityName(city, lang)}</option>
              ))}
            </select>
            <select className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex-1 min-w-0">
              <option value="">{t('selectArea')}</option>
              {(c.cities[0]?.areas || []).map((area, i) => (
                <option key={i} value={area.en}>{getAreaName(area, lang)}</option>
              ))}
            </select>
            <select value={lang} onChange={e => window.location.href = `/${country}/${e.target.value}`}
              className="px-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 flex-shrink-0">
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
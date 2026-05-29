// components/layout/Header.tsx
import Link from 'next/link';
import { getCountry } from '@/lib/countries';
import { getText, LangCode } from '@/lib/language';
import SearchBar from '@/components/home/SearchBar';
import MobileMenu from '@/components/layout/MobileMenu';
import { DollarSign } from 'lucide-react';

export default function Header({ country, lang }: { country: string; lang: string }) {
  const c = getCountry(country);
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* PC Header */}
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

      {/* Mobile Header */}
      <div className="lg:hidden px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <Link href={`${rest}`} className="flex items-center gap-2 no-underline flex-shrink-0">
            <img src="/logo.svg" alt="Noffor" className="h-7" />
          </Link>
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <select className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex-1 min-w-0" defaultValue={c.cities?.[0] || 'Doha'}>
              <option value="">{t('selectCity')}</option>
              {c.cities?.map((city: string) => (<option key={city} value={city}>{city}</option>))}
            </select>
            <select className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex-1 min-w-0" defaultValue="">
              <option value="">{t('selectArea')}</option>
              <option value="West Bay">West Bay</option>
              <option value="Industrial Area">Industrial Area</option>
              <option value="Al Sadd">Al Sadd</option>
              <option value="Najma">Najma</option>
            </select>
          </div>
          <MobileMenu country={country} lang={lang} />
        </div>
      </div>
    </header>
  );
}
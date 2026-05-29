"use client";
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Plus, Map, User, DollarSign } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function MobileNav({ country, lang }: { country: string; lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 pb-safe">
      <div className="flex items-center justify-around py-1.5">
        <button onClick={() => router.push(`${rest}`)} className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[44px]">
          <Home size={20} className={pathname === `${rest}` ? 'text-orange-600' : 'text-gray-400'} />
          <span className={`text-[10px] ${pathname === `${rest}` ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>{t('home')}</span>
        </button>
        <button onClick={() => router.push(`${rest}/search`)} className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[44px]">
          <Search size={20} className={pathname.includes('search') ? 'text-orange-600' : 'text-gray-400'} />
          <span className={`text-[10px] ${pathname.includes('search') ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>{t('navSearch')}</span>
        </button>
        <button onClick={() => router.push(`${rest}/create`)} className="flex flex-col items-center gap-0.5 px-3 py-2 bg-orange-600 rounded-full -mt-5 shadow-lg min-w-[44px]">
          <Plus size={24} className="text-white" />
          <span className="text-[10px] text-white font-medium">{t('create')}</span>
        </button>
        <button onClick={() => router.push(`${rest}/bid`)} className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[44px]">
          <DollarSign size={20} className={pathname.includes('bid') ? 'text-green-600' : 'text-gray-400'} />
          <span className={`text-[10px] ${pathname.includes('bid') ? 'text-green-600 font-medium' : 'text-gray-500'}`}>BID</span>
        </button>
        <button onClick={() => router.push(`${rest}/map`)} className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[44px]">
          <Map size={20} className={pathname.includes('map') ? 'text-orange-600' : 'text-gray-400'} />
          <span className={`text-[10px] ${pathname.includes('map') ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>{t('map')}</span>
        </button>
      </div>
    </div>
  );
}
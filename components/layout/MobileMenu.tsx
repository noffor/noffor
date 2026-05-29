"use client";
import { useState } from 'react';
import { Menu, X, Search, Globe, MapPin, User, Plus, Bell, HelpCircle, LogOut } from 'lucide-react';
import { countries } from '@/lib/countries';
import { getText, LangCode } from '@/lib/language';

export default function MobileMenu({ country, lang }: { country: string; lang: string }) {
  const [open, setOpen] = useState(false);
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
        <Menu size={24} className="text-gray-700" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          
          {/* Slide from Right */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-2xl animate-slide-left overflow-y-auto" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800">Menu</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={22} className="text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              
              {/* Country Select */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                  <Globe size={16} /> {t('selectCountry')}
                </label>
                <select 
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
                  value={country}
                  onChange={(e) => { window.location.href = `/${e.target.value}/${lang}`; }}
                >
                  {Object.entries(countries).map(([code, c]: any) => (
                    <option key={code} value={code}>{c.name} ({c.code.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              {/* Quick Links */}
              <div className="space-y-1.5">
                <a href={`${rest}/map`} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 no-underline hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <MapPin size={18} /> {t('map')}
                </a>
                <a href={`${rest}/dashboard`} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 no-underline hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <User size={18} /> {t('dashboard')}
                </a>
                <a href={`${rest}/create`} className="flex items-center gap-3 px-4 py-3 bg-orange-600 rounded-xl text-sm font-medium text-white no-underline hover:bg-orange-700 transition-colors justify-center">
                  <Plus size={18} /> {t('create')}
                </a>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* More Links */}
              <div className="space-y-1.5">
                <a href={`${rest}/login`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 no-underline hover:bg-gray-50 rounded-lg">
                  <User size={16} /> {t('login')}
                </a>
                <a href={`${rest}/help`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 no-underline hover:bg-gray-50 rounded-lg">
                  <HelpCircle size={16} /> Help
                </a>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Language */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                  <Globe size={16} /> Language
                </label>
                <div className="flex gap-2">
                  {['en','ar','bn','hi'].map(l => (
                    <a key={l} href={`/${country}/${l}`} className={`flex-1 py-2 rounded-lg text-xs font-medium text-center no-underline transition-colors ${lang === l ? 'bg-orange-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {l.toUpperCase()}
                    </a>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">Noffor v1.0.0</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
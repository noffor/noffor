// components/home/AreaSelector.tsx
"use client";
import { useState } from 'react';
import { getCountry, getCityName, getAreaName, type City, type Area } from '@/lib/countries';
import { getText, LangCode } from '@/lib/language';

export default function AreaSelector({ country, lang, onSelect }: { 
  country: string; 
  lang: string;
  onSelect?: (city: string, area: string) => void;
}) {
  const c = getCountry(country);
  const t = (key: string) => getText(lang as LangCode, key);
  
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityEn, setSelectedCityEn] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [areas, setAreas] = useState<Area[]>([]);
  
  const handleCityChange = (cityEn: string) => {
    const city = c.cities.find(city => city.en === cityEn);
    setSelectedCityEn(cityEn);
    setSelectedCity(getCityName(city!, lang));
    setAreas(city?.areas || []);
    setSelectedArea('');
    onSelect?.(cityEn, '');
  };
  
  const handleAreaChange = (areaEn: string) => {
    setSelectedArea(areaEn);
    onSelect?.(selectedCityEn, areaEn);
  };
  
  return (
    <div className="flex items-center gap-2 mb-3 bg-white p-2 lg:p-3 rounded-lg border">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{c.name}</span>
      
      {/* City Select - ভাষা অনুযায়ী নাম দেখাবে */}
      <select 
        className="px-2 py-1.5 bg-gray-50 border rounded-lg text-xs lg:text-sm flex-1"
        value={selectedCityEn}
        onChange={(e) => handleCityChange(e.target.value)}
      >
        <option value="">{t('selectCity')}</option>
        {c.cities.map((city, idx) => (
          <option key={idx} value={city.en}>
            {getCityName(city, lang)}
          </option>
        ))}
      </select>
      
      {/* Area Select - ভাষা অনুযায়ী নাম দেখাবে */}
      <select 
        className="px-2 py-1.5 bg-gray-50 border rounded-lg text-xs lg:text-sm flex-1"
        value={selectedArea}
        onChange={(e) => handleAreaChange(e.target.value)}
        disabled={!selectedCityEn}
      >
        <option value="">{t('selectArea')}</option>
        {areas.map((area, idx) => (
          <option key={idx} value={area.en}>
            {getAreaName(area, lang)}
          </option>
        ))}
      </select>
    </div>
  );
}
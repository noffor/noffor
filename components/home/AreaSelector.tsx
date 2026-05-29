import { getCountry } from '@/lib/countries';
import { getText, LangCode } from '@/lib/language';

export default function AreaSelector({ country, lang }: { country: string; lang: string }) {
  const c = getCountry(country);
  const t = (key: string) => getText(lang as LangCode, key);

  return (
    <div className="flex items-center gap-2 mb-3 bg-white p-2 lg:p-3 rounded-lg border">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{c.name}</span>
      <select className="px-2 py-1.5 bg-gray-50 border rounded-lg text-xs lg:text-sm flex-1">
        <option value="">{t('selectCity')}</option>
        {c.cities.map(city => <option key={city} value={city}>{city}</option>)}
      </select>
      <select className="px-2 py-1.5 bg-gray-50 border rounded-lg text-xs lg:text-sm flex-1">
        <option value="">{t('selectArea')}</option>
        <option value="area1">Area 1</option>
      </select>
    </div>
  );
}
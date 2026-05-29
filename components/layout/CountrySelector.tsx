import { countries } from '@/lib/countries';

export default function CountrySelector({ current, lang }: { current: string; lang: string }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
      {Object.values(countries).map(c => (
        <a key={c.code} href={`/${c.code}/${lang}`} className={`px-2 py-1 rounded-md text-xs font-medium no-underline ${current === c.code ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
          {c.code.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
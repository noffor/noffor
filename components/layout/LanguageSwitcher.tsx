export default function LanguageSwitcher({ country, current }: { country: string; current: string }) {
  const langs = ['en', 'ar', 'bn', 'hi'];
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {langs.map(l => (
        <a key={l} href={`/${country}/${l}`} className={`px-2 py-1 rounded-md text-xs font-medium no-underline ${current === l ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'}`}>
          {l.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
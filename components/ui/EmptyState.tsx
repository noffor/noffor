import { Search } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function EmptyState({ message, lang = 'en' }: { message?: string; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  return (
    <div className="text-center py-12 bg-white rounded-xl border">
      <Search size={40} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">{message || t('noResults') || 'No results found'}</p>
    </div>
  );
}
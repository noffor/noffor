import { Star, MessageCircle, Phone } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function MarkerPopup({ labor, href, lang = 'en' }: { labor: any; href: string; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);

  return (
    <div className="min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <img src={labor.photo_url || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
        <div>
          <p className="font-bold text-sm">{labor.name}</p>
          <p className="text-xs text-gray-500">{labor.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-1">
        <Star size={12} className="text-yellow-500" fill="#EAB308" />
        <span className="text-xs font-medium">{labor.rating}</span>
      </div>
      <p className="text-sm font-bold text-orange-600 mb-2">{labor.expected_salary} QAR</p>
      <div className="flex gap-1">
        <a href={`https://wa.me/${labor.phone}`} target="_blank" className="flex-1 py-1.5 bg-green-600 text-white rounded text-xs no-underline text-center"><MessageCircle size={12} className="inline" /></a>
        <a href={`tel:${labor.phone}`} className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs no-underline text-center"><Phone size={12} className="inline" /></a>
        <a href={href} className="flex-1 py-1.5 bg-orange-600 text-white rounded text-xs no-underline text-center">{t('viewProfile') || 'View'}</a>
      </div>
    </div>
  );
}
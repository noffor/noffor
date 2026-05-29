import { MessageCircle, Phone, Briefcase } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function StickyBar({ phone, lang = 'en' }: { phone: string; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl p-3 z-40 pb-safe">
      <div className="max-w-lg mx-auto flex gap-2">
        <a href={`https://wa.me/${phone}`} target="_blank" className="flex-1 bg-green-600 text-white py-3 rounded-xl text-center font-medium text-sm flex items-center justify-center gap-2 no-underline"><MessageCircle size={18} /> {t('whatsapp')}</a>
        <a href={`tel:${phone}`} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-center font-medium text-sm flex items-center justify-center gap-2 no-underline"><Phone size={18} /> {t('call')}</a>
        <button className="flex-1 bg-orange-600 text-white py-3 rounded-xl text-center font-medium text-sm flex items-center justify-center gap-2"><Briefcase size={18} /> {t('jobOffer')}</button>
      </div>
    </div>
  );
}
// components/profile/StickyBar.tsx
import { MessageCircle, Phone, Briefcase } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function StickyBar({ phone, lang = 'en' }: { phone: string; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  
  // ✅ Phone check
  if (!phone || phone === 'undefined') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl z-50 pb-safe">
      <div className="flex gap-2 p-2">
        <a href={`https://wa.me/${phone}`} target="_blank" 
          className="flex-1 bg-green-600 text-white py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-1 no-underline">
          <MessageCircle size={16} /> {t('whatsapp')}
        </a>
        <a href={`tel:${phone}`} 
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-1 no-underline">
          <Phone size={16} /> {t('call')}
        </a>
        <button 
          className="flex-1 bg-orange-600 text-white py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-1">
          <Briefcase size={16} /> {t('jobOffer')}
        </button>
      </div>
    </div>
  );
}
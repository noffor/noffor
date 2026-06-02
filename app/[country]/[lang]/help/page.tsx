// app/[country]/[lang]/help/page.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import HelpContent from '@/components/help/HelpContent';
import {HelpCircle} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা হেডার টেক্সট
// ═══════════════════════════════════════════════════════════
const T:Record<string,{title:string;subtitle:string}>={
  en:{title:'Help Center',subtitle:'How can we help you?'},
  bn:{title:'সাহায্য কেন্দ্র',subtitle:'আমরা কিভাবে সাহায্য করতে পারি?'},
  ar:{title:'مركز المساعدة',subtitle:'كيف يمكننا مساعدتك؟'},
  hi:{title:'सहायता केंद्र',subtitle:'हम आपकी कैसे मदद कर सकते हैं?'},
};

// ═══════════════════════════════════════════════════════════
// HelpPage (Server Component • 1B Ready)
// ═══════════════════════════════════════════════════════════
export default async function HelpPage({params}:{params:Promise<{country:string;lang:string}>}){
  const{country,lang}=await params;
  const content=T[lang]||T.en;

  return(
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang}/>
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 lg:py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <HelpCircle size={40} className="mx-auto mb-3 opacity-80"/>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">{content.title}</h1>
          <p className="text-sm opacity-90">{content.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto py-6">
        <HelpContent lang={lang}/>
      </div>

      <MobileNav country={country} lang={lang}/>
    </div>
  );
}
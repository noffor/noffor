// components/layout/Footer.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ফিক্সড
import React,{useMemo} from 'react';
import Link from 'next/link';
import {Globe,Shield,FileText,Mail,Phone,MessageCircle,ChevronRight,Heart,ExternalLink} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{
    tagline:'Gulf Labor Platform - Work & Workers in One Place',
    rights:'All rights reserved',
    quickLinks:'Quick Links',
    support:'Support',
    contactUs:'Contact Us',
    aboutUs:'About Us',
    privacyPolicy:'Privacy Policy',
    termsOfService:'Terms of Service',
    helpCenter:'Help Center',
    faq:'FAQ',
    feedback:'Feedback',
    becomeWorker:'Become a Worker',
    hireWorker:'Hire a Worker',
    ourMission:'Connecting skilled workers with employers across the Gulf region.',
    copyright:'© 2025 Noffor. All rights reserved.',
    gulfRegion:'Gulf Region',
    support247:'24/7 Support',
    secure:'Secure Platform',
    facebook:'Facebook',
    twitter:'Twitter',
    instagram:'Instagram',
    youtube:'YouTube',
  },
  bn:{
    tagline:'গালফ লেবার প্লাটফর্ম - কাজ ও শ্রমিক এক জায়গায়',
    rights:'সর্বস্বত্ব সংরক্ষিত',
    quickLinks:'গুরুত্বপূর্ণ লিংক',
    support:'সাপোর্ট',
    contactUs:'যোগাযোগ',
    aboutUs:'আমাদের সম্পর্কে',
    privacyPolicy:'গোপনীয়তা নীতি',
    termsOfService:'সেবার শর্তাবলী',
    helpCenter:'সাহায্য কেন্দ্র',
    faq:'প্রশ্নোত্তর',
    feedback:'মতামত',
    becomeWorker:'শ্রমিক হোন',
    hireWorker:'শ্রমিক নিয়োগ',
    ourMission:'গালফ অঞ্চলে দক্ষ শ্রমিক ও নিয়োগকর্তাদের সংযুক্ত করা।',
    copyright:'© ২০২৫ নফর। সর্বস্বত্ব সংরক্ষিত।',
    gulfRegion:'গালফ অঞ্চল',
    support247:'২৪/৭ সাপোর্ট',
    secure:'নিরাপদ প্লাটফর্ম',
    facebook:'ফেসবুক',
    twitter:'টুইটার',
    instagram:'ইনস্টাগ্রাম',
    youtube:'ইউটিউব',
  },
  ar:{
    tagline:'منصة العمالة الخليجية - العمل والعمال في مكان واحد',
    rights:'جميع الحقوق محفوظة',
    quickLinks:'روابط سريعة',
    support:'الدعم',
    contactUs:'اتصل بنا',
    aboutUs:'معلومات عنا',
    privacyPolicy:'سياسة الخصوصية',
    termsOfService:'شروط الخدمة',
    helpCenter:'مركز المساعدة',
    faq:'الأسئلة الشائعة',
    feedback:'تعليقات',
    becomeWorker:'كن عاملاً',
    hireWorker:'وظف عاملاً',
    ourMission:'ربط العمال المهرة بأصحاب العمل في جميع أنحاء منطقة الخليج.',
    copyright:'© ٢٠٢٥ نفر. جميع الحقوق محفوظة.',
    gulfRegion:'منطقة الخليج',
    support247:'دعم ٢٤/٧',
    secure:'منصة آمنة',
    facebook:'فيسبوك',
    twitter:'تويتر',
    instagram:'انستغرام',
    youtube:'يوتيوب',
  },
  hi:{
    tagline:'गल्फ लेबर प्लेटफॉर्म - काम और श्रमिक एक जगह',
    rights:'सर्वाधिकार सुरक्षित',
    quickLinks:'त्वरित लिंक',
    support:'सहायता',
    contactUs:'संपर्क करें',
    aboutUs:'हमारे बारे में',
    privacyPolicy:'गोपनीयता नीति',
    termsOfService:'सेवा की शर्तें',
    helpCenter:'सहायता केंद्र',
    faq:'सामान्य प्रश्न',
    feedback:'प्रतिक्रिया',
    becomeWorker:'श्रमिक बनें',
    hireWorker:'श्रमिक नियुक्त करें',
    ourMission:'गल्फ क्षेत्र में कुशल श्रमिकों और नियोक्ताओं को जोड़ना।',
    copyright:'© २०२५ नोफर। सर्वाधिकार सुरक्षित।',
    gulfRegion:'गल्फ क्षेत्र',
    support247:'२४/७ सहायता',
    secure:'सुरक्षित प्लेटफॉर्म',
    facebook:'फेसबुक',
    twitter:'ट्विटर',
    instagram:'इंस्टाग्राम',
    youtube:'यूट्यूब',
  },
};

// ═══════════════════════════════════════════════════════════
// সোশ্যাল লিংক (Lucide icons দিয়ে)
// ═══════════════════════════════════════════════════════════
const SOCIAL_LINKS=[
  {icon:Globe,href:'https://facebook.com/noffor',label:'facebook'},
  {icon:MessageCircle,href:'https://twitter.com/noffor',label:'twitter'},
  {icon:Heart,href:'https://instagram.com/noffor',label:'instagram'},
  {icon:ExternalLink,href:'https://youtube.com/@noffor',label:'youtube'},
];

// ═══════════════════════════════════════════════════════════
// Footer Link (Memoized)
// ═══════════════════════════════════════════════════════════
const FooterLink=React.memo(({href,children,external}:{href:string;children:React.ReactNode;external?:boolean})=>{
  const className="text-gray-400 hover:text-orange-600 transition-colors text-sm no-underline flex items-center gap-1.5";
  if(external){
    return<a href={href} target="_blank" rel="noopener noreferrer" className={className}><ChevronRight size={12}/>{children}</a>;
  }
  return<Link href={href} className={className}><ChevronRight size={12}/>{children}</Link>;
});
FooterLink.displayName='FooterLink';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{country?:string;lang?:string}

// ═══════════════════════════════════════════════════════════
// Footer (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const Footer=React.memo(({country='qa',lang='en'}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);

  return(
    <footer className="hidden lg:block bg-white border-t mt-8" style={{contain:'layout style paint'}}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          
          {/* Column 1: Brand */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              <span className="text-orange-600">N</span>offor
            </h3>
            <p className="text-sm text-gray-500 mb-4">{tr.ourMission}</p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(s=>(
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-all" title={tr[s.label as keyof typeof tr]||s.label}>
                  <s.icon size={14}/>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-1.5">
              <Shield size={14} className="text-orange-500"/>{tr.quickLinks}
            </h4>
            <div className="space-y-2">
              <FooterLink href={`${rest}/about`}>{tr.aboutUs}</FooterLink>
              <FooterLink href={`${rest}/become-worker`}>{tr.becomeWorker}</FooterLink>
              <FooterLink href={`${rest}/hire`}>{tr.hireWorker}</FooterLink>
              <FooterLink href={`${rest}/categories`}>Categories</FooterLink>
            </div>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-1.5">
              <Heart size={14} className="text-orange-500"/>{tr.support}
            </h4>
            <div className="space-y-2">
              <FooterLink href={`${rest}/help`}>{tr.helpCenter}</FooterLink>
              <FooterLink href={`${rest}/faq`}>{tr.faq}</FooterLink>
              <FooterLink href={`${rest}/feedback`}>{tr.feedback}</FooterLink>
              <FooterLink href={`${rest}/privacy`}>{tr.privacyPolicy}</FooterLink>
              <FooterLink href={`${rest}/terms`}>{tr.termsOfService}</FooterLink>
            </div>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-1.5">
              <Phone size={14} className="text-orange-500"/>{tr.contactUs}
            </h4>
            <div className="space-y-2">
              <a href="mailto:support@noffor.com" className="text-gray-400 hover:text-orange-600 transition-colors text-sm no-underline flex items-center gap-1.5">
                <Mail size={12}/>support@noffor.com
              </a>
              <a href="tel:+97412345678" className="text-gray-400 hover:text-orange-600 transition-colors text-sm no-underline flex items-center gap-1.5">
                <Phone size={12}/>+974 1234 5678
              </a>
              <a href="https://wa.me/97412345678" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors text-sm no-underline flex items-center gap-1.5">
                <MessageCircle size={12}/>WhatsApp
              </a>
              <span className="text-gray-400 text-sm flex items-center gap-1.5">
                <Globe size={12}/>{tr.tagline}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-400">
          <p>{tr.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">🌍 {tr.gulfRegion}</span>
            <span className="flex items-center gap-1">⚡ {tr.support247}</span>
            <span className="flex items-center gap-1">🔒 {tr.secure}</span>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName='Footer';

export default Footer;
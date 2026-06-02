// app/[country]/[lang]/privacy/page.tsx - TypeScript Error ফিক্সড
import React from 'react'; // ✅ React ইম্পোর্ট
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import {Shield,Lock,Eye,FileText,CheckCircle} from 'lucide-react';

const CONTENT:Record<string,{
  title:string;lastUpdated:string;
  sections:{title:string;icon:string;content:string}[];
}>={
  en:{
    title:'Privacy Policy',lastUpdated:'Last updated: June 2025',
    sections:[
      {title:'Data Collection',icon:'eye',content:'We collect only essential information: phone number, name, and profile details you provide.'},
      {title:'Data Usage',icon:'file',content:'Your phone number is used only for login verification and communication.'},
      {title:'Data Protection',icon:'lock',content:'Your data is stored securely using industry-standard encryption.'},
      {title:'Your Rights',icon:'check',content:'You can request to view, update, or delete your data at any time.'},
    ],
  },
  bn:{
    title:'গোপনীয়তা নীতি',lastUpdated:'সর্বশেষ আপডেট: জুন ২০২৫',
    sections:[
      {title:'ডাটা সংগ্রহ',icon:'eye',content:'আমরা শুধুমাত্র প্রয়োজনীয় তথ্য সংগ্রহ করি: ফোন নম্বর, নাম এবং প্রোফাইল বিবরণ।'},
      {title:'ডাটা ব্যবহার',icon:'file',content:'আপনার ফোন নম্বর শুধুমাত্র লগইন ভেরিফিকেশন এবং যোগাযোগের জন্য ব্যবহৃত হয়।'},
      {title:'ডাটা সুরক্ষা',icon:'lock',content:'আপনার ডাটা এনক্রিপশন ব্যবহার করে নিরাপদে সংরক্ষণ করা হয়।'},
      {title:'আপনার অধিকার',icon:'check',content:'আপনি যেকোনো সময় আপনার ডাটা দেখতে, আপডেট করতে বা মুছে ফেলতে অনুরোধ করতে পারেন।'},
    ],
  },
  ar:{
    title:'سياسة الخصوصية',lastUpdated:'آخر تحديث: يونيو ٢٠٢٥',
    sections:[
      {title:'جمع البيانات',icon:'eye',content:'نجمع فقط المعلومات الأساسية: رقم الهاتف والاسم وتفاصيل الملف الشخصي.'},
      {title:'استخدام البيانات',icon:'file',content:'يستخدم رقم هاتفك فقط للتحقق من تسجيل الدخول والتواصل.'},
      {title:'حماية البيانات',icon:'lock',content:'يتم تخزين بياناتك بشكل آمن باستخدام تشفير قياسي.'},
      {title:'حقوقك',icon:'check',content:'يمكنك طلب عرض بياناتك أو تحديثها أو حذفها في أي وقت.'},
    ],
  },
  hi:{
    title:'गोपनीयता नीति',lastUpdated:'अंतिम अपडेट: जून २०२५',
    sections:[
      {title:'डेटा संग्रह',icon:'eye',content:'हम केवल आवश्यक जानकारी एकत्र करते हैं: फोन नंबर, नाम और प्रोफाइल विवरण।'},
      {title:'डेटा उपयोग',icon:'file',content:'आपका फोन नंबर केवल लॉगिन सत्यापन और संचार के लिए उपयोग किया जाता है।'},
      {title:'डेटा सुरक्षा',icon:'lock',content:'आपका डेटा एन्क्रिप्शन का उपयोग करके सुरक्षित रूप से संग्रहीत किया जाता है।'},
      {title:'आपके अधिकार',icon:'check',content:'आप किसी भी समय अपना डेटा देखने, अपडेट करने या हटाने का अनुरोध कर सकते हैं।'},
    ],
  },
};

const ICONS:Record<string,any>={eye:Eye,file:FileText,lock:Lock,check:CheckCircle};

export default async function PrivacyPage({params}:{params:Promise<{country:string;lang:string}>}){
  const{country,lang}=await params;
  const content=CONTENT[lang]||CONTENT.en;

  return(
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang}/>
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><Shield size={32} className="text-blue-600"/></div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{content.title}</h1>
          <p className="text-xs text-gray-400">{content.lastUpdated}</p>
        </div>
        <div className="space-y-4">
          {content.sections.map((section,i)=>(
            <div key={i} className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {React.createElement(ICONS[section.icon]||FileText,{size:18,className:'text-blue-600'})}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base mb-1.5">{section.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Contact: <a href="mailto:support@noffor.com" className="text-blue-600 hover:text-blue-700 transition-colors">support@noffor.com</a></p>
        </div>
      </div>
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}
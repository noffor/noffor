// components/help/HelpContent.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import {HelpCircle,User,Briefcase,CreditCard,Phone,MessageCircle,Star,MapPin,Search,CheckCircle,ArrowRight} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা কন্টেন্ট (Module-level static)
// ═══════════════════════════════════════════════════════════
const CONTENT:Record<string,{
  title:string;
  forLabor:{title:string;steps:string[]};
  forEmployer:{title:string;steps:string[]};
  payment:{title:string;steps:string[]};
  contact:{title:string;email:string;phone:string};
  faq:{q:string;a:string}[];
}>={
  en:{
    title:'How to Use Noffor',
    forLabor:{
      title:'For Workers',
      steps:[
        'Create your profile from the + button',
        'Add your photo, skills, experience & expected salary',
        'Tap "Go Online" to appear on the map',
        'Receive job requests & accept bookings',
        'Complete work & earn money',
      ],
    },
    forEmployer:{
      title:'For Employers',
      steps:[
        'Post a job or browse workers from the home page',
        'Use filters to find the right worker',
        'Save favorites & contact workers via WhatsApp',
        'Send booking requests with job details',
        'Rate workers after job completion',
      ],
    },
    payment:{
      title:'Payment & Featured',
      steps:[
        'Feature your profile for 2 QAR/day',
        'Scan the QR code with Ooredoo/Vodafone',
        'Send the payment amount',
        'Your profile will be featured within 5 minutes',
        'Appear at the top of search results',
      ],
    },
    contact:{title:'Contact Us',email:'support@noffor.com',phone:'+974 1234 5678'},
    faq:[
      {q:'Is Noffor free?',a:'Yes! Basic profile and job posting are completely free. Featured profiles cost 2 QAR/day.'},
      {q:'How do I get hired?',a:'Create a complete profile, set yourself online, and employers will find you on the map.'},
      {q:'How do I pay?',a:'Scan the QR code in the app with Ooredoo/Vodafone mobile money.'},
    ],
  },
  bn:{
    title:'নফর কিভাবে ব্যবহার করবেন',
    forLabor:{
      title:'শ্রমিকদের জন্য',
      steps:[
        '+ বাটন থেকে প্রোফাইল তৈরি করুন',
        'ছবি, দক্ষতা, অভিজ্ঞতা ও প্রত্যাশিত বেতন যোগ করুন',
        '"অনলাইন হোন" ট্যাপ করে ম্যাপে উপস্থিত হোন',
        'জব রিকোয়েস্ট গ্রহণ করুন ও বুকিং নিন',
        'কাজ সম্পন্ন করে টাকা আয় করুন',
      ],
    },
    forEmployer:{
      title:'নিয়োগকর্তাদের জন্য',
      steps:[
        'হোম পেজ থেকে জব পোস্ট বা শ্রমিক খুঁজুন',
        'সঠিক শ্রমিক খুঁজতে ফিল্টার ব্যবহার করুন',
        'পছন্দের শ্রমিক সেভ করুন ও WhatsApp এ যোগাযোগ করুন',
        'কাজের বিবরণ সহ বুকিং রিকোয়েস্ট পাঠান',
        'কাজ শেষে শ্রমিককে রেটিং দিন',
      ],
    },
    payment:{
      title:'পেমেন্ট ও ফিচার্ড',
      steps:[
        '২ রিয়াল/দিনে প্রোফাইল ফিচার করুন',
        'Ooredoo/Vodafone দিয়ে QR কোড স্ক্যান করুন',
        'পেমেন্ট পাঠান',
        '৫ মিনিটের মধ্যে প্রোফাইল ফিচার্ড হবে',
        'সার্চ রেজাল্টের উপরে প্রদর্শিত হবে',
      ],
    },
    contact:{title:'যোগাযোগ',email:'support@noffor.com',phone:'+974 1234 5678'},
    faq:[
      {q:'নফর কি ফ্রি?',a:'হ্যাঁ! বেসিক প্রোফাইল ও জব পোস্ট সম্পূর্ণ ফ্রি। ফিচার্ড প্রোফাইলের জন্য ২ রিয়াল/দিন।'},
      {q:'কিভাবে নিয়োগ পাবো?',a:'সম্পূর্ণ প্রোফাইল তৈরি করে অনলাইনে থাকুন, নিয়োগকর্তারা ম্যাপে আপনাকে খুঁজে পাবেন।'},
      {q:'কিভাবে পেমেন্ট করবো?',a:'অ্যাপের QR কোড স্ক্যান করে Ooredoo/Vodafone মোবাইল মানি দিয়ে পেমেন্ট করুন।'},
    ],
  },
  ar:{
    title:'كيفية استخدام نفر',
    forLabor:{
      title:'للعمال',
      steps:[
        'أنشئ ملفك من زر +',
        'أضف صورتك ومهاراتك وخبرتك والراتب المتوقع',
        'انقر "اتصل الآن" للظهور على الخريطة',
        'استلم طلبات العمل واقبل الحجوزات',
        'أكمل العمل واكسب المال',
      ],
    },
    forEmployer:{
      title:'لأصحاب العمل',
      steps:[
        'انشر وظيفة أو تصفح العمال من الصفحة الرئيسية',
        'استخدم الفلاتر للعثور على العامل المناسب',
        'احفظ المفضلة واتصل بالعمال عبر واتساب',
        'أرسل طلبات الحجز مع تفاصيل العمل',
        'قيم العمال بعد إكمال العمل',
      ],
    },
    payment:{
      title:'الدفع والمميز',
      steps:[
        'ميز ملفك مقابل ٢ ريال/يوم',
        'امسح رمز QR باستخدام Ooredoo/Vodafone',
        'أرسل مبلغ الدفع',
        'سيتم تمييز ملفك في غضون ٥ دقائق',
        'ظهر في أعلى نتائج البحث',
      ],
    },
    contact:{title:'اتصل بنا',email:'support@noffor.com',phone:'+974 1234 5678'},
    faq:[
      {q:'هل نفر مجاني؟',a:'نعم! الملف الأساسي ونشر الوظائف مجاني تمامًا. الملفات المميزة بتكلفة ٢ ريال/يوم.'},
      {q:'كيف يتم توظيفي؟',a:'أنشئ ملفًا كاملاً وكن متصلاً، وسيجدك أصحاب العمل على الخريطة.'},
      {q:'كيف أدفع؟',a:'امسح رمز QR في التطبيق باستخدام Ooredoo/Vodafone.'},
    ],
  },
  hi:{
    title:'नोफर का उपयोग कैसे करें',
    forLabor:{
      title:'श्रमिकों के लिए',
      steps:[
        '+ बटन से प्रोफाइल बनाएं',
        'फोटो, कौशल, अनुभव और अपेक्षित वेतन जोड़ें',
        '"ऑनलाइन हों" टैप करके मैप पर दिखें',
        'जॉब रिक्वेस्ट प्राप्त करें और बुकिंग स्वीकार करें',
        'काम पूरा करें और पैसे कमाएं',
      ],
    },
    forEmployer:{
      title:'नियोक्ताओं के लिए',
      steps:[
        'होम पेज से जॉब पोस्ट करें या श्रमिक खोजें',
        'सही श्रमिक खोजने के लिए फिल्टर का उपयोग करें',
        'पसंदीदा सहेजें और WhatsApp पर संपर्क करें',
        'कार्य विवरण के साथ बुकिंग अनुरोध भेजें',
        'काम पूरा होने पर श्रमिकों को रेट करें',
      ],
    },
    payment:{
      title:'भुगतान और फीचर्ड',
      steps:[
        '२ रियाल/दिन पर प्रोफाइल फीचर करें',
        'Ooredoo/Vodafone से QR कोड स्कैन करें',
        'भुगतान राशि भेजें',
        '५ मिनट में प्रोफाइल फीचर्ड हो जाएगी',
        'खोज परिणामों में सबसे ऊपर दिखें',
      ],
    },
    contact:{title:'संपर्क',email:'support@noffor.com',phone:'+974 1234 5678'},
    faq:[
      {q:'क्या नोफर मुफ्त है?',a:'हाँ! बेसिक प्रोफाइल और जॉब पोस्टिंग पूरी तरह मुफ्त है। फीचर्ड प्रोफाइल के लिए २ रियाल/दिन।'},
      {q:'मुझे कैसे काम मिलेगा?',a:'पूरी प्रोफाइल बनाएं और ऑनलाइन रहें, नियोक्ता आपको मैप पर ढूंढ लेंगे।'},
      {q:'भुगतान कैसे करें?',a:'ऐप में QR कोड स्कैन करके Ooredoo/Vodafone मोबाइल मनी से भुगतान करें।'},
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// Step Item (Memoized)
// ═══════════════════════════════════════════════════════════
const StepItem=React.memo(({step,index}:{step:string;index:number})=>(
  <li className="flex items-start gap-2">
    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
      {index+1}
    </span>
    <span className="text-sm text-gray-600">{step}</span>
  </li>
));
StepItem.displayName='StepItem';

// ═══════════════════════════════════════════════════════════
// FAQ Item (Memoized)
// ═══════════════════════════════════════════════════════════
const FAQItem=React.memo(({faq,index}:{faq:{q:string;a:string};index:number})=>(
  <details className="group border border-gray-100 rounded-xl overflow-hidden" open={index===0}>
    <summary className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-sm text-gray-700 flex items-center justify-between select-none">
      {faq.q}
      <ArrowRight size={14} className="text-gray-400 group-open:rotate-90 transition-transform"/>
    </summary>
    <p className="px-4 py-3 text-sm text-gray-600 bg-white">{faq.a}</p>
  </details>
));
FAQItem.displayName='FAQItem';

// ═══════════════════════════════════════════════════════════
// Section Card (Memoized)
// ═══════════════════════════════════════════════════════════
const SectionCard=React.memo(({icon:Icon,title,children,gradient}:{
  icon:any;title:string;children:React.ReactNode;gradient:string;
})=>(
  <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{transform:'translateZ(0)'}}>
    <div className={`px-4 py-3 bg-gradient-to-r ${gradient} flex items-center gap-2 border-b`}>
      <Icon size={18} className="text-white"/>
      <h3 className="font-bold text-white text-sm">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
));
SectionCard.displayName='SectionCard';

// ═══════════════════════════════════════════════════════════
// HelpContent (Memoized)
// ═══════════════════════════════════════════════════════════
const HelpContent=React.memo(({lang='en'}:{lang?:string})=>{
  const content=useMemo(()=>CONTENT[lang]||CONTENT.en,[lang]);

  return(
    <div className="max-w-2xl mx-auto p-4 space-y-4" style={{contain:'layout style paint'}}>
      {/* Title */}
      <div className="text-center mb-2">
        <HelpCircle size={32} className="text-orange-500 mx-auto mb-2"/>
        <h2 className="text-xl font-bold text-gray-800">{content.title}</h2>
      </div>

      {/* For Labor */}
      <SectionCard icon={User} title={content.forLabor.title} gradient="from-blue-500 to-blue-600">
        <ul className="space-y-2">
          {content.forLabor.steps.map((step,i)=>(
            <StepItem key={i} step={step} index={i}/>
          ))}
        </ul>
      </SectionCard>

      {/* For Employer */}
      <SectionCard icon={Briefcase} title={content.forEmployer.title} gradient="from-green-500 to-green-600">
        <ul className="space-y-2">
          {content.forEmployer.steps.map((step,i)=>(
            <StepItem key={i} step={step} index={i}/>
          ))}
        </ul>
      </SectionCard>

      {/* Payment */}
      <SectionCard icon={CreditCard} title={content.payment.title} gradient="from-purple-500 to-purple-600">
        <ul className="space-y-2">
          {content.payment.steps.map((step,i)=>(
            <StepItem key={i} step={step} index={i}/>
          ))}
        </ul>
      </SectionCard>

      {/* FAQ */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center gap-2 border-b">
          <MessageCircle size={18} className="text-white"/>
          <h3 className="font-bold text-white text-sm">FAQ</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {content.faq.map((item,i)=>(
            <FAQItem key={i} faq={item} index={i}/>
          ))}
        </div>
      </div>

      {/* Contact */}
      <SectionCard icon={Phone} title={content.contact.title} gradient="from-gray-600 to-gray-700">
        <div className="space-y-2">
          <a href={`mailto:${content.contact.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 no-underline transition-colors">
            ✉️ {content.contact.email}
          </a>
          <a href={`tel:${content.contact.phone}`} className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 no-underline transition-colors">
            📞 {content.contact.phone}
          </a>
        </div>
      </SectionCard>
    </div>
  );
});

HelpContent.displayName='HelpContent';

export default HelpContent;
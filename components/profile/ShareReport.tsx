// components/profile/ShareReport.tsx
"use client";
import { useState, useEffect } from 'react';
import { Share2, Flag, X, Check, AlertCircle } from 'lucide-react';

interface Props {
  name: string;
  lang: string;
}

export default function ShareReport({ name, lang }: Props) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const t = (key: string) => {
    const texts: any = {
      en: { 
        share: 'Share Profile', 
        report: 'Report Profile', 
        reason: 'Select a reason',
        submit: 'Submit', 
        cancel: 'Cancel', 
        thanks: 'Thank you for your report', 
        copied: 'Link copied to clipboard!',
        copyFailed: 'Could not copy. Please copy URL manually',
        spam: 'Spam or misleading',
        fake: 'Fake profile',
        inappropriate: 'Inappropriate content',
        other: 'Other'
      },
      bn: { 
        share: 'প্রোফাইল শেয়ার করুন', 
        report: 'প্রোফাইল রিপোর্ট করুন', 
        reason: 'একটি কারণ নির্বাচন করুন',
        submit: 'জমা দিন', 
        cancel: 'বাতিল', 
        thanks: 'রিপোর্টের জন্য ধন্যবাদ', 
        copied: 'লিংক ক্লিপবোর্ডে কপি হয়েছে!',
        copyFailed: 'কপি করা যায়নি। ম্যানুয়ালি কপি করুন',
        spam: 'স্প্যাম বা বিভ্রান্তিকর',
        fake: 'নকল প্রোফাইল',
        inappropriate: 'অনুপযুক্ত কন্টেন্ট',
        other: 'অন্যান্য'
      },
      ar: { 
        share: 'مشاركة الملف الشخصي', 
        report: 'الإبلاغ عن الملف الشخصي', 
        reason: 'اختر سبباً',
        submit: 'إرسال', 
        cancel: 'إلغاء', 
        thanks: 'شكراً لتبليغك', 
        copied: 'تم نسخ الرابط إلى الحافظة!',
        copyFailed: 'لم يتم النسخ. يرجى نسخ الرابط يدوياً',
        spam: 'رسائل غير مرغوب فيها',
        fake: 'ملف شخصي مزيف',
        inappropriate: 'محتوى غير لائق',
        other: 'أخرى'
      },
      hi: { 
        share: 'प्रोफ़ाइल शेयर करें', 
        report: 'प्रोफ़ाइल रिपोर्ट करें', 
        reason: 'कारण चुनें',
        submit: 'सबमिट करें', 
        cancel: 'रद्द करें', 
        thanks: 'रिपोर्ट करने के लिए धन्यवाद', 
        copied: 'लिंक क्लिपबोर्ड पर कॉपी हो गया!',
        copyFailed: 'कॉपी नहीं हुआ। कृपया URL मैन्युअली कॉपी करें',
        spam: 'स्पैम या भ्रामक',
        fake: 'नकली प्रोफ़ाइल',
        inappropriate: 'अनुपयुक्त सामग्री',
        other: 'अन्य'
      },
    };
    return texts[lang]?.[key] || texts.en[key];
  };

  // ✅ FIXED: Always use clipboard for mobile (reliable)
  const shareProfile = async () => {
    const url = window.location.href;
    
    // Always use clipboard for mobile - it's more reliable
    // Native share API often fails or is not supported
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(url);
        setToastMessage(t('copied'));
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        return;
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
    
    // Fallback for old browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, url.length);
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        setToastMessage(t('copied'));
        setToastType('success');
      } else {
        setToastMessage(t('copyFailed'));
        setToastType('error');
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      setToastMessage(t('copyFailed'));
      setToastType('error');
    }
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const submitReport = async () => {
    if (!reportReason) return;
    setSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportReason('');
      setSubmitted(false);
    }, 1500);
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          {toastType === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toastMessage}
        </div>
      )}

      <div className="flex gap-3">
        <button 
          onClick={shareProfile} 
          className="flex-1 bg-green-50 text-green-600 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition active:scale-95"
        >
          <Share2 size={16} /> {t('share')}
        </button>
        <button 
          onClick={() => setShowReportModal(true)} 
          className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition active:scale-95"
        >
          <Flag size={16} /> {t('report')}
        </button>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{t('report')}</h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            {!submitted ? (
              <>
                <select 
                  value={reportReason} 
                  onChange={e => setReportReason(e.target.value)} 
                  className="w-full p-3 border rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">{t('reason')}</option>
                  <option value="spam">{t('spam')}</option>
                  <option value="fake">{t('fake')}</option>
                  <option value="inappropriate">{t('inappropriate')}</option>
                  <option value="other">{t('other')}</option>
                </select>
                <div className="flex gap-3">
                  <button 
                    onClick={submitReport} 
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition active:scale-95"
                  >
                    {t('submit')}
                  </button>
                  <button 
                    onClick={() => setShowReportModal(false)} 
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition active:scale-95"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Check size={40} className="text-green-500 mx-auto mb-2" />
                <p>{t('thanks')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
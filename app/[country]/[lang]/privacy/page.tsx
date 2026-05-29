import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

export default async function PrivacyPage({ params }: { params: Promise<{ country: string; lang: string }> }) {
  const { country, lang } = await params;
  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-2xl mx-auto p-4 text-sm text-gray-600">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
        <p>We do not share your personal data with third parties. Your phone number is used only for login verification.</p>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
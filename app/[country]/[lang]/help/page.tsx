import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import HelpContent from '@/components/help/HelpContent';

export default async function HelpPage({ params }: { params: Promise<{ country: string; lang: string }> }) {
  const { country, lang } = await params;
  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <HelpContent />
      <MobileNav country={country} lang={lang} />
    </div>
  );
}
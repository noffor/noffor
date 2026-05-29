import ChatWidget from '@/components/chat/ChatWidget';

export default async function LangLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ country: string; lang: string }>;
}) {
  const { lang } = await params;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} lang={lang} className="bg-gray-50 min-h-screen">
      {children}
      <ChatWidget lang={lang} />
    </div>
  );
}
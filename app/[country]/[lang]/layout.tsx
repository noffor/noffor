// app/[country]/[lang]/layout.tsx - Preconnect + Preload
import ChatWidget from '@/components/chat/ChatWidget';

export default async function LangLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ country: string; lang: string }>;
}) {
  const { lang } = await params;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} lang={lang} className="bg-gray-50 min-h-screen">
      {/* ✅ Preconnect Supabase */}
      <link rel="preconnect" href="https://pbytmyjsxbczhhbjlkea.supabase.co" />
      <link rel="dns-prefetch" href="https://pbytmyjsxbczhhbjlkea.supabase.co" />
      {/* ✅ Preload critical assets */}
      <link rel="preload" href="/logo.svg" as="image" />
      <link rel="preload" href="/default-avatar.png" as="image" />
      {children}
      <ChatWidget lang={lang} />
    </div>
  );
}
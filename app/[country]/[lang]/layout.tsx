// app/[country]/[lang]/layout.tsx - ChatWidget removed
export default async function LangLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ country: string; lang: string }>;
}) {
  const { lang } = await params;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} lang={lang} className="bg-gray-50 min-h-screen">
      <link rel="preconnect" href="https://pbytmyjsxbczhhbjlkea.supabase.co" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://pbytmyjsxbczhhbjlkea.supabase.co" />
      <link rel="preload" href="/logo.svg" as="image" />
      {children}
    </div>
  );
}
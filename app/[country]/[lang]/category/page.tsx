// app/[country]/[lang]/categories/page.tsx
import { redirect } from 'next/navigation';

export default function CategoriesPage({ 
  params 
}: { 
  params: { country: string; lang: string } 
}) {
  const { country, lang } = params;
  redirect(`/${country}/${lang}`);
}
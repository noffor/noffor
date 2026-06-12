import { redirect } from 'next/navigation';

export default function CategoriesPage({ 
  params 
}: { 
  params: { country: string; lang: string } 
}) {
  return redirect('/' + params.country + '/' + params.lang);
}
import { Star } from 'lucide-react';

export default function SearchResult({ profile, href }: { profile: any; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 p-3 bg-white rounded-xl border no-underline hover:shadow-md transition-all">
      <img src={profile.photo_url || '/default-avatar.png'} className="w-12 h-12 rounded-full object-cover" loading="lazy" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 text-sm truncate">{profile.name}</h4>
        <p className="text-xs text-gray-500">{profile.category}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Star size={12} className="text-yellow-500" fill="#EAB308" />
          <span className="text-xs font-medium">{profile.rating}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-orange-600">{profile.expected_salary}</p>
        {profile.is_online && <span className="text-[10px] text-green-600">Online</span>}
      </div>
    </a>
  );
}
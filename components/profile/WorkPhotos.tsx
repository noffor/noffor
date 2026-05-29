import { getText, LangCode } from '@/lib/language';

export default function WorkPhotos({ photos, lang = 'en' }: { photos: string[]; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  if (!photos?.length) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo, i) => (
        <img key={i} src={photo} alt={`${t('workPhotos')} ${i + 1}`} className="w-full h-24 lg:h-32 object-cover rounded-lg" loading="lazy" />
      ))}
    </div>
  );
}
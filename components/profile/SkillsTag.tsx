import { getText, LangCode } from '@/lib/language';

export default function SkillsTag({ skills, lang = 'en' }: { skills: string[]; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  if (!skills?.length) return <p className="text-gray-400 text-sm">{t('noSkills') || 'No skills listed'}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, i) => (
        <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200">{skill}</span>
      ))}
    </div>
  );
}
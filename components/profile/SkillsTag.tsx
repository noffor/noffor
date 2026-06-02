// components/profile/SkillsTag.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import {getText,LangCode,translateCategory} from '@/lib/language';
import {Award,Wrench} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{noSkills:'No skills listed',skills:'Skills'},
  bn:{noSkills:'কোনো দক্ষতা নেই',skills:'দক্ষতা'},
  ar:{noSkills:'لا توجد مهارات',skills:'مهارات'},
  hi:{noSkills:'कोई कौशल नहीं',skills:'कौशल'},
};

// ═══════════════════════════════════════════════════════════
// Skill Tag (Memoized)
// ═══════════════════════════════════════════════════════════
const SkillTag=React.memo(({skill,lang}:{skill:string;lang:string})=>{
  const displaySkill=useMemo(()=>translateCategory(skill,lang)||skill,[skill,lang]);
  return(
    <span className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-full text-sm font-medium border border-orange-200 hover:shadow-sm hover:scale-105 transition-all active:scale-95 flex items-center gap-1.5 select-none">
      <Wrench size={12} className="text-orange-400"/>
      {displaySkill}
    </span>
  );
});
SkillTag.displayName='SkillTag';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{skills:string[];lang?:string}

// ═══════════════════════════════════════════════════════════
// SkillsTag (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const SkillsTag=React.memo(({skills,lang='en'}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const t=useMemo(()=>(key:string)=>getText(lang as LangCode,key),[lang]);

  // Empty state
  if(!skills?.length)return(
    <div className="text-center py-6">
      <Award size={28} className="text-gray-200 mx-auto mb-2"/>
      <p className="text-gray-400 text-sm">{tr.noSkills}</p>
    </div>
  );

  return(
    <div className="flex flex-wrap gap-2" style={{contain:'layout style paint'}}>
      {skills.map((skill,i)=>(
        <SkillTag key={i} skill={skill} lang={lang}/>
      ))}
    </div>
  );
});

SkillsTag.displayName='SkillsTag';

export default SkillsTag;
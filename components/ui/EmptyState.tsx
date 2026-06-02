import React from 'react';
import { Search, FileX, Package, UserX } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// আইকন ম্যাপ
// ═══════════════════════════════════════════════════════════
const ICON_MAP = {
  search: Search,
  empty: FileX,
  package: Package,
  user: UserX,
} as const;

type IconType = keyof typeof ICON_MAP;

// ═══════════════════════════════════════════════════════════
// প্রপস
// ═══════════════════════════════════════════════════════════
interface EmptyStateProps {
  message?: string;
  lang?: string;
  icon?: IconType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ═══════════════════════════════════════════════════════════
// এম্পটি স্টেট (Memoized + 1B Ready)
// ═══════════════════════════════════════════════════════════
const EmptyState = React.memo(({ 
  message, 
  lang = 'en', 
  icon = 'search',
  action 
}: EmptyStateProps) => {
  const t = (key: string) => getText(lang as LangCode, key);
  const IconComponent = ICON_MAP[icon] || ICON_MAP.search;

  return (
    <div className="text-center py-10 sm:py-12 bg-white rounded-xl border select-none">
      <IconComponent size={36} className="text-gray-200 mx-auto mb-3" />
      <p className="text-sm text-gray-400">{message || t('noResults') || 'No results found'}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="mt-3 px-4 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
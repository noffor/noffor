import React from 'react';

// ═══════════════════════════════════════════════════════════
// কালার ম্যাপ (Module-level - zero re-create)
// ═══════════════════════════════════════════════════════════
const COLOR_MAP = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  teal: 'bg-teal-100 text-teal-700',
  gray: 'bg-gray-100 text-gray-700',
} as const;

type BadgeColor = keyof typeof COLOR_MAP;

interface BadgeProps {
  text: string;
  color?: BadgeColor;
}

// ═══════════════════════════════════════════════════════════
// ব্যাজ (Memoized - 1B Users Ready)
// ═══════════════════════════════════════════════════════════
const Badge = React.memo(({ text, color = 'green' }: BadgeProps) => {
  const colorClass = COLOR_MAP[color] || COLOR_MAP.green;

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} select-none`}>
      {text}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
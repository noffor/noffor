import React from 'react';

// ═══════════════════════════════════════════════════════════
// সাইজ ভ্যারিয়েন্টস
// ═══════════════════════════════════════════════════════════
const SIZE_MAP = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
} as const;

type SpinnerSize = keyof typeof SIZE_MAP;

// ═══════════════════════════════════════════════════════════
// প্রপস
// ═══════════════════════════════════════════════════════════
interface LoadingProps {
  size?: SpinnerSize;
  text?: string;
  fullScreen?: boolean;
}

// ═══════════════════════════════════════════════════════════
// লোডিং স্পিনার (Memoized + GPU Accelerated)
// ═══════════════════════════════════════════════════════════
const Loading = React.memo(({ size = 'md', text, fullScreen = false }: LoadingProps) => {
  const sizeClass = SIZE_MAP[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`${sizeClass} border-orange-200 border-t-orange-600 rounded-full animate-spin`}
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      />
      {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
});

Loading.displayName = 'Loading';

export default Loading;
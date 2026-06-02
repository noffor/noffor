import React from 'react';

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const DEFAULT_COUNT = 5;

// ═══════════════════════════════════════════════════════════
// স্কেলেটন কার্ড (Memoized + Variants)
// ═══════════════════════════════════════════════════════════
interface SkeletonCardProps {
  variant?: 'card' | 'list' | 'profile';
}

const SkeletonCard = React.memo(({ variant = 'card' }: SkeletonCardProps) => {
  // Card variant (default)
  if (variant === 'card') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="w-full h-36 sm:h-44 bg-gradient-to-br from-gray-200 to-gray-100" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-100 rounded w-10" />
          </div>
        </div>
      </div>
    );
  }

  // List variant
  if (variant === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 animate-pulse">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="flex gap-3">
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-12" />
            </div>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
        </div>
      </div>
    );
  }

  // Profile variant
  if (variant === 'profile') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mb-3" />
          <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
      </div>
    );
  }

  return null;
});

SkeletonCard.displayName = 'SkeletonCard';

// ═══════════════════════════════════════════════════════════
// স্কেলেটন গ্রিড (Memoized)
// ═══════════════════════════════════════════════════════════
interface SkeletonGridProps {
  count?: number;
  variant?: SkeletonCardProps['variant'];
  cols?: number;
  colsSm?: number;
  colsLg?: number;
}

const SkeletonGrid = React.memo(({ 
  count = DEFAULT_COUNT, 
  variant = 'card',
  cols = 3,
  colsSm,
  colsLg = 5,
}: SkeletonGridProps) => {
  const smCols = colsSm || cols;
  
  return (
    <div 
      className={`grid gap-2 sm:gap-3`}
      style={{ 
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        contain: 'layout style paint',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="hidden sm:block" style={{ display: i < smCols ? 'block' : undefined }}>
          <SkeletonCard variant={variant} />
        </div>
      ))}
      {/* Mobile: fewer items */}
      <style jsx>{`
        @media (min-width: 640px) {
          div { grid-template-columns: repeat(${smCols}, 1fr); }
        }
        @media (min-width: 1024px) {
          div { grid-template-columns: repeat(${colsLg}, 1fr); }
        }
      `}</style>
    </div>
  );
});

SkeletonGrid.displayName = 'SkeletonGrid';

// ═══════════════════════════════════════════════════════════
// স্কেলেটন টেক্সট (Memoized)
// ═══════════════════════════════════════════════════════════
const SkeletonText = React.memo(({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="h-3 bg-gray-200 rounded" 
        style={{ width: `${100 - (i * 15)}%` }}
      />
    ))}
  </div>
));

SkeletonText.displayName = 'SkeletonText';

export { SkeletonCard, SkeletonGrid, SkeletonText };
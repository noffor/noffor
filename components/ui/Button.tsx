import React from 'react';

// ═══════════════════════════════════════════════════════════
// ভ্যারিয়েন্ট ম্যাপ (Module-level)
// ═══════════════════════════════════════════════════════════
const VARIANT_MAP = {
  primary: 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  green: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  blue: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  red: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  white: 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-sm',
} as const;

type ButtonVariant = keyof typeof VARIANT_MAP;

// ═══════════════════════════════════════════════════════════
// সাইজ ম্যাপ
// ═══════════════════════════════════════════════════════════
const SIZE_MAP = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg min-h-[32px]',
  sm: 'px-3 py-2 text-sm rounded-lg min-h-[40px]',
  md: 'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-xl min-h-[52px]',
} as const;

type ButtonSize = keyof typeof SIZE_MAP;

// ═══════════════════════════════════════════════════════════
// প্রপস
// ═══════════════════════════════════════════════════════════
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

// ═══════════════════════════════════════════════════════════
// বাটন (Memoized + GPU + Accessibility)
// ═══════════════════════════════════════════════════════════
const Button = React.memo(({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  type = 'button',
}: ButtonProps) => {
  const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.primary;
  const sizeClass = SIZE_MAP[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClass} ${sizeClass}
        font-semibold transition-all inline-flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.97]'}
        select-none outline-none focus:ring-2 focus:ring-orange-500/30
        ${className}
      `}
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
export type { ButtonVariant, ButtonSize }; // ✅ সেমিকোলন যোগ করা হয়েছে
import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// সাইজ ভ্যারিয়েন্টস
// ═══════════════════════════════════════════════════════════
const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const;

type ModalSize = keyof typeof SIZE_MAP;

// ═══════════════════════════════════════════════════════════
// প্রপস
// ═══════════════════════════════════════════════════════════
interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: ModalSize;
  showClose?: boolean;
}

// ═══════════════════════════════════════════════════════════
// useScrollLock হুক
// ═══════════════════════════════════════════════════════════
function useScrollLock() {
  useEffect(() => {
    const scrollY = window.scrollY;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = original;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);
}

// ═══════════════════════════════════════════════════════════
// মোডাল (Memoized + Scroll Lock + GPU)
// ═══════════════════════════════════════════════════════════
const Modal = React.memo(({ 
  title, 
  children, 
  onClose, 
  size = 'sm',
  showClose = true 
}: ModalProps) => {
  useScrollLock();

  // Escape key handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Modal'}
    >
      <div 
        className={`bg-white rounded-2xl p-5 sm:p-6 w-full ${SIZE_MAP[size]} animate-scale-in shadow-xl`}
        onClick={(e) => e.stopPropagation()}
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between mb-4">
            {title && <h3 className="font-bold text-lg text-gray-800">{title}</h3>}
            {showClose && (
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors ml-auto"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-400" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
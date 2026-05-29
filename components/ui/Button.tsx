// components/ui/Button.tsx
export default function Button({ 
  children, onClick, variant = 'primary', className = '' 
}: { 
  children: React.ReactNode; onClick?: () => void; variant?: string; className?: string;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    green: 'bg-green-600 text-white hover:bg-green-700',
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
  };
  return (
    <button onClick={onClick} className={`px-4 py-2.5 rounded-lg font-medium text-sm min-h-[44px] transition-colors ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
export default function Badge({ text, color = 'green' }: { text: string; color?: string }) {
  const colors: Record<string, string> = { green: 'bg-green-100 text-green-700', red: 'bg-red-100 text-red-700', yellow: 'bg-yellow-100 text-yellow-700', blue: 'bg-blue-100 text-blue-700', orange: 'bg-orange-100 text-orange-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{text}</span>;
}
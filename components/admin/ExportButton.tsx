"use client";

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  filename: string;
  columns: string[];
  labels?: string[];
}

export default function ExportButton({ data, filename, columns, labels }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportCSV = () => {
    setExporting(true);
    const header = (labels || columns).join(',');
    const rows = data.map(row => columns.map(col => `"${row[col] || ''}"`).join(','));
    const csv = [header, ...rows].join('\n');
    downloadFile(csv, `${filename}.csv`, 'text/csv');
    setExporting(false);
    setShowMenu(false);
  };

  const exportJSON = () => {
    setExporting(true);
    downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
    setExporting(false);
    setShowMenu(false);
  };

  const downloadFile = (content: string, name: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button onClick={() => setShowMenu(!showMenu)} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
        {exporting ? <Loader size={12} className="animate-spin" /> : <Download size={12} />}
        Export
      </button>
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50 min-w-[140px]">
          <button onClick={exportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white">
            <FileSpreadsheet size={12} /> CSV
          </button>
          <button onClick={exportJSON} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white">
            <FileText size={12} /> JSON
          </button>
        </div>
      )}
    </div>
  );
}
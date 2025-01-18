import React from 'react';

interface ColumnSelectorProps {
  columnCount: number;
  onColumnChange: (columns: number) => void;
  availableColumns: number[];
}

export function ColumnSelector({ columnCount, onColumnChange, availableColumns }: ColumnSelectorProps) {
  return (
    <div className="flex items-center gap-4 bg-gray-900 rounded-lg p-2">
      <span className="text-sm text-gray-400">Columns:</span>
      <div className="flex gap-2">
        {availableColumns.map(cols => (
          <button
            key={cols}
            onClick={() => onColumnChange(cols)}
            className={`p-2 rounded-lg transition-colors ${
              columnCount === cols ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="flex gap-0.5">
              {Array(cols).fill(0).map((_, i) => (
                <div key={i} className="w-1 h-5 bg-current rounded-sm" />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
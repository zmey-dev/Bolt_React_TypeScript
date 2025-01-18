import React from 'react';
import { Tag, X } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Tag className="w-4 h-4" />
        <span>Filter by tag:</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectTag(null)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
            selectedTag === null 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          All Images
          {selectedTag !== null && (
            <X className="w-3 h-3" />
          )}
        </button>
        
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
              selectedTag === tag
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
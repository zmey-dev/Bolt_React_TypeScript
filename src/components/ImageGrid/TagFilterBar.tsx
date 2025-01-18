import React from 'react';
import { Tag } from 'lucide-react';

interface TagFilterBarProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagFilterBar({ tags, selectedTag, onSelectTag }: TagFilterBarProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex-1">
      <h2 className="text-lg font-medium mb-3">Tag Filter</h2>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Tag className="w-4 h-4" />
        <span>Select a tag to filter images:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectTag(null)}
          className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
            selectedTag === null 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          All Images
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
import React from "react";
import { Tag, Plus, X } from "lucide-react";

interface ImageTagsEditorProps {
  tags: string[];
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClose: () => void;
}

export function ImageTagsEditor({
  tags,
  selectedTags,
  onAddTag,
  onRemoveTag,
  onClose,
}: ImageTagsEditorProps) {
  const availableTags = tags.filter((tag) => !selectedTags.includes(tag));

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Edit Tags
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-purple-600/30 text-purple-300 px-2 py-1 rounded-lg text-sm"
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {availableTags.length > 0 && (
          <div className="border-t border-gray-800 pt-2">
            <div className="text-sm text-gray-400 mb-2">Available Tags:</div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onAddTag(tag)}
                  className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, X, Tag as TagIcon, Loader2 } from 'lucide-react';
import { createTag, deleteTag } from '../../lib/api/tags';
import { getTagColor } from '../../lib/utils/colors';

interface TagManagerProps {
  tags: string[];
  selectedGalleryType: string | null;
  selectedGalleryTypeId: string | null;
  onTagsChange: () => void;
}

export function TagManager({ 
  tags, 
  selectedGalleryType,
  selectedGalleryTypeId,
  onTagsChange 
}: TagManagerProps) {
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !selectedGalleryTypeId) return;

    setIsLoading(true);
    setError(null);

    try {
      await createTag(newTag.trim(), selectedGalleryTypeId);
      setNewTag('');
      onTagsChange();
    } catch (err) {
      setError('Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    if (!selectedGalleryTypeId || !confirm(`Are you sure you want to delete the tag "${tagName}"?`)) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteTag(tagName, selectedGalleryTypeId);
      onTagsChange();
    } catch (err) {
      setError('Failed to delete tag');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TagIcon className="w-5 h-5" />
        Manage Tags {selectedGalleryType ? `for ${selectedGalleryType}` : ''}
      </h2>

      {error && (
        <div className="mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateTag} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Enter new tag name..."
          className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm"
          disabled={!selectedGalleryTypeId}
        />
        <button
          type="submit"
          disabled={isLoading || !newTag.trim() || !selectedGalleryTypeId}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Tag
            </>
          )}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getTagColor(tag)}`}
          >
            {tag}
            <button
              onClick={() => handleDeleteTag(tag)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
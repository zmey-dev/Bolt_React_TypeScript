import React from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { getTagColor } from '../../lib/utils/colors';

interface ImageTagsEditorProps {
  tags: string[];
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClose: () => void;
}

export default function ImageTagsEditor({ 
  tags, 
  selectedTags, 
  onAddTag, 
  onRemoveTag,
  onClose
}: ImageTagsEditorProps) {
  // ... rest of the component code stays the same ...
}
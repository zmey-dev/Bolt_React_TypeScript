{/* Update the tag display in the image overlay */}
<div className="absolute bottom-2 left-2 right-24 flex flex-wrap gap-1">
  {selectedTags.map((tag) => (
    <span
      key={tag}
      className={`text-xs px-2 py-0.5 rounded ${getTagColor(tag)}`}
    >
      {tag}
    </span>
  ))}
</div>
import React from 'react';

interface ZoomedImageProps {
  img: any; // We need to accept all props from react-medium-zoom
}

export function ZoomedImage({ img }: ZoomedImageProps) {
  // Extract only the valid HTML attributes we want to pass to the img element
  const { src, alt, style, className, onLoad, onClick } = img;
  
  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={className}
      onLoad={onLoad}
      onClick={onClick}
    />
  );
}
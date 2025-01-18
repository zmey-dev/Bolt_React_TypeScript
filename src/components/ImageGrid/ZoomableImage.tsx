import React from 'react';
import { ZoomIn } from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import { Image } from '../../types';
import { ZoomedImage } from './ZoomedImage';

interface ZoomableImageProps {
  image: Image;
}

export function ZoomableImage({ image }: ZoomableImageProps) {
  return (
    <div className="relative">
      <Zoom ZoomContent={ZoomedImage}>
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-auto rounded-lg transform transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Zoom>
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <ZoomIn className="w-10 h-10 text-white opacity-75" />
      </div>
    </div>
  );
}
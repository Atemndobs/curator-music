'use client';

import { useState } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

interface ImageProps extends Omit<NextImageProps, 'onError'> {
  fallbackSrc?: string;
}

function Image({ 
  src, 
  fallbackSrc = '/images/default-album-art.png',
  alt,
  ...props 
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <NextImage
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      unoptimized={hasError} // Don't optimize fallback images
    />
  );
}

export { Image };
export default Image;
